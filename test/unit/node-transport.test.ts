/* global describe, it, before, after, beforeEach, afterEach */

import { EventEmitter } from 'events';
import { expect } from 'chai';
import { errors } from 'undici';
import sinon from 'sinon';
import nock from 'nock';

import { NodeTransport } from '../../src/transport/node-transport';
import { TransportMethod, TransportRequest } from '../../src/core/types/transport-request';
import { LoggerManager } from '../../src/core/components/logger-manager';
import { LogLevel } from '../../src/core/interfaces/logger';
import StatusCategory from '../../src/core/constants/categories';
import { PubNubAPIError } from '../../src/errors/pubnub-api-error';
import { PubNubFileInterface } from '../../src/core/types/file';
import PubNub from '../../src/node/index';

const ORIGIN = 'https://ps.pndsn.com';

/** Build a transport with a silent logger. */
const makeTransport = (keepAlive = false, keepAliveSettings?: { timeout?: number }) =>
  new NodeTransport(new LoggerManager('test', LogLevel.None, []), keepAlive, keepAliveSettings);

/** Wait for pending macrotasks (the deferred dispatcher release runs on one). */
const nextMacrotask = () => new Promise((resolve) => setTimeout(resolve, 5));

/** Internals used by the connection lifecycle tests. */
type TransportInternals = {
  keepAliveAgent?: { close: () => Promise<void> };
  sequentialAgent?: { close: () => Promise<void> };
  dispatcherForTransportRequest: (method: TransportMethod) => { close: () => Promise<void> };
  onClientConnected: (client: unknown, socket: unknown, multiplex: boolean) => void;
  idleConnectionTimeout: () => number;
};
const internals = (transport: NodeTransport) => transport as unknown as TransportInternals;

/** Minimal stand-in for an `undici` `Client`. */
const makeFakeClient = (size = 0) =>
  Object.assign(new EventEmitter(), { pipelining: 1, closed: false, destroyed: false, stats: { size } });

/** Minimal stand-in for a connected TLS socket. */
const makeFakeSocket = (alpnProtocol: string | false) => {
  const socket = Object.assign(new EventEmitter(), { alpnProtocol, destroyed: false });
  const destroy = sinon.spy((_error?: Error) => {
    socket.destroyed = true;
    socket.emit('close');
  });
  return Object.assign(socket, { destroy });
};

/** Build a minimal transport request. */
const makeRequest = (overrides: Partial<TransportRequest> = {}): TransportRequest => ({
  origin: ORIGIN,
  path: '/time/0',
  queryParameters: {},
  method: TransportMethod.GET,
  headers: {},
  timeout: 10,
  cancellable: false,
  compressible: false,
  identifier: 'id-1',
  ...overrides,
});

describe('NodeTransport (undici)', () => {
  before(() => nock.disableNetConnect());
  after(() => nock.enableNetConnect());
  afterEach(() => nock.cleanAll());

  it('parses a successful response, lowercasing header values and decoding the body', async () => {
    nock(ORIGIN).get('/time/0').reply(200, '[123]', { 'Content-Type': 'TEXT/Javascript; CHARSET=UTF-8' });

    const [promise] = makeTransport().makeSendable(makeRequest());
    const response = await promise;

    expect(response.status).to.equal(200);
    expect(response.url).to.equal(`${ORIGIN}/time/0`);
    // Header values are lower-cased (existing behaviour preserved from the node-fetch version).
    expect(response.headers['content-type']).to.equal('text/javascript; charset=utf-8');
    expect(new TextDecoder().decode(response.body)).to.equal('[123]');
  });

  it('treats an empty response body as undefined', async () => {
    nock(ORIGIN).get('/time/0').reply(204, '');

    const [promise] = makeTransport().makeSendable(makeRequest());
    const response = await promise;

    expect(response.status).to.equal(204);
    expect(response.body).to.equal(undefined);
  });

  it('throws a PubNubAPIError for HTTP >= 400', async () => {
    nock(ORIGIN).get('/time/0').reply(403, '{"message":"Forbidden"}', { 'Content-Type': 'application/json' });

    const [promise] = makeTransport().makeSendable(makeRequest());

    try {
      await promise;
      expect.fail('expected rejection');
    } catch (error) {
      expect(error).to.be.instanceOf(PubNubAPIError);
      expect((error as PubNubAPIError).category).to.equal(StatusCategory.PNAccessDeniedCategory);
    }
  });

  it('classifies a user cancellation as PNCancelledCategory with an AbortError', async () => {
    nock(ORIGIN).get('/time/0').delay(200).reply(200, '[1]');

    const [promise, controller] = makeTransport().makeSendable(makeRequest({ cancellable: true }));
    controller!.abort('user cancelled');

    try {
      await promise;
      expect.fail('expected rejection');
    } catch (error) {
      const apiError = error as PubNubAPIError;
      expect(apiError.category).to.equal(StatusCategory.PNCancelledCategory);
      expect((apiError.errorData as Error).name).to.equal('AbortError');
    }
  });

  it('classifies a timeout as PNTimeoutCategory', async () => {
    nock(ORIGIN).get('/time/0').delay(200).reply(200, '[1]');

    // 0.05s timeout against a 0.2s delayed response.
    const [promise] = makeTransport().makeSendable(makeRequest({ timeout: 0.05 }));

    try {
      await promise;
      expect.fail('expected rejection');
    } catch (error) {
      expect((error as PubNubAPIError).category).to.equal(StatusCategory.PNTimeoutCategory);
    }
  });

  it('maps a connection-level failure to PNNetworkIssuesCategory', async () => {
    // Hit a genuinely refused local port so undici surfaces a real ECONNREFUSED (rather than nock's
    // own "disallowed net connect" guard, which is not a transport-level error).
    nock.enableNetConnect('127.0.0.1');
    try {
      const [promise] = makeTransport().makeSendable(makeRequest({ origin: 'http://127.0.0.1:59321' }));
      await promise;
      expect.fail('expected rejection');
    } catch (error) {
      expect((error as PubNubAPIError).category).to.equal(StatusCategory.PNNetworkIssuesCategory);
    } finally {
      nock.disableNetConnect();
    }
  });

  it('deflate-compresses a compressible body', async () => {
    let received: Buffer | undefined;
    nock(ORIGIN)
      .post('/publish')
      .reply(function (_uri, body) {
        // nock provides the raw body as a hex string when it is not valid UTF-8 JSON.
        received = Buffer.from(body as string, 'hex');
        return [200, '[1]'];
      });

    const payload = JSON.stringify({ hello: 'world'.repeat(50) });
    const [promise] = makeTransport().makeSendable(
      makeRequest({ path: '/publish', method: TransportMethod.POST, body: payload, compressible: true }),
    );
    await promise;

    expect(received).to.not.equal(undefined);
    // zlib deflate stream starts with the 0x78 header byte.
    expect(received![0]).to.equal(0x78);
    expect(require('zlib').inflateSync(received!).toString()).to.equal(payload);
  });

  it('builds a multipart/form-data body with a boundary for file uploads', async () => {
    let contentType: string | undefined;
    let rawBody: string | undefined;
    nock(ORIGIN)
      .post('/upload')
      .reply(function (_uri, body) {
        contentType = this.req.headers['content-type'] as unknown as string;
        rawBody = body as string;
        return [204, ''];
      });

    const file: PubNubFileInterface = {
      name: 'cat.txt',
      mimeType: 'text/plain',
      toArrayBuffer: async () => new TextEncoder().encode('meow').buffer,
      toFileUri: async () => ({}),
    };

    const [promise] = makeTransport().makeSendable(
      makeRequest({
        path: '/upload',
        method: TransportMethod.POST,
        formData: [{ key: 'key', value: 'value-1' }],
        body: file as unknown as TransportRequest['body'],
      }),
    );
    await promise;

    expect(contentType).to.match(/^multipart\/form-data; boundary=/);
    expect(rawBody).to.contain('value-1');
    expect(rawBody).to.contain('cat.txt');
  });

  describe('network error classification', () => {
    // `normalizeNetworkError` is the node-only shim that re-shapes undici/global-`fetch` rejections so
    // the shared `PubNubAPIError` classifier maps them to the same categories `node-fetch` produced.
    // nock cannot synthesise undici's `error.cause.code`, so the contract is exercised directly.
    const classify = (error: unknown): StatusCategory => {
      const normalize = (NodeTransport as unknown as { normalizeNetworkError(e: unknown): Error })
        .normalizeNetworkError;
      return PubNubAPIError.create(normalize(error)).category;
    };

    // A global-`fetch` rejection is always a `TypeError: fetch failed` with the real cause attached.
    // A sentinel distinguishes "no cause" (the bad-request path) from "cause is undefined".
    const NO_CAUSE = Symbol('no-cause');
    const fetchFailed = (cause: unknown = NO_CAUSE): TypeError => {
      const error = new TypeError('fetch failed');
      if (cause !== NO_CAUSE) (error as { cause?: unknown }).cause = cause;
      return error;
    };

    it('maps undici UND_ERR_*_TIMEOUT causes to PNTimeoutCategory', () => {
      for (const code of ['UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT']) {
        expect(classify(fetchFailed({ code, message: code }))).to.equal(StatusCategory.PNTimeoutCategory);
      }
    });

    it('maps a POSIX ECONNREFUSED cause to PNNetworkIssuesCategory', () => {
      expect(classify(fetchFailed({ code: 'ECONNREFUSED', message: 'connect ECONNREFUSED' }))).to.equal(
        StatusCategory.PNNetworkIssuesCategory,
      );
    });

    it('maps a POSIX ETIMEDOUT cause to PNTimeoutCategory', () => {
      expect(classify(fetchFailed({ code: 'ETIMEDOUT', message: 'connect ETIMEDOUT' }))).to.equal(
        StatusCategory.PNTimeoutCategory,
      );
    });

    it('maps a fetch failure whose cause carries no code (TLS/DNS) to PNNetworkIssuesCategory', () => {
      // e.g. a TLS handshake failure or a DNS AggregateError — cause object without a string `code`.
      expect(classify(fetchFailed({ message: 'unable to verify the first certificate' }))).to.equal(
        StatusCategory.PNNetworkIssuesCategory,
      );
    });

    it('unwraps an AggregateError cause to classify on the wrapped error code', () => {
      // Multi-address connect failures surface a top-level-codeless AggregateError whose wrapped
      // errors carry the real POSIX code; the code must drive classification, not the generic branch.
      const aggregate = { message: 'connect failed', errors: [{ code: 'ECONNREFUSED' }] };
      expect(classify(fetchFailed(aggregate))).to.equal(StatusCategory.PNNetworkIssuesCategory);

      const timedOut = { message: 'connect failed', errors: [{ code: 'ETIMEDOUT' }] };
      expect(classify(fetchFailed(timedOut))).to.equal(StatusCategory.PNTimeoutCategory);
    });

    it('leaves a TypeError without a cause as PNBadRequestCategory', () => {
      // A genuine request-construction error must remain a (non-retryable) bad request.
      expect(classify(fetchFailed())).to.equal(StatusCategory.PNBadRequestCategory);
    });
  });

  it('does not charge body-building time against the request timeout', async () => {
    nock(ORIGIN).post('/upload').reply(204, '');

    // `toArrayBuffer` takes longer than the request timeout. Because the timeout clock only starts at
    // the `fetch` call (after the body is built), the upload must still succeed — matching node-fetch,
    // whose `{timeout}` likewise started at the fetch call.
    const file: PubNubFileInterface = {
      name: 'slow.txt',
      mimeType: 'text/plain',
      toArrayBuffer: async () => {
        await new Promise((resolve) => setTimeout(resolve, 120));
        return new TextEncoder().encode('slow').buffer;
      },
      toFileUri: async () => ({}),
    };

    const [promise] = makeTransport().makeSendable(
      makeRequest({
        path: '/upload',
        method: TransportMethod.POST,
        timeout: 0.05, // 50ms — shorter than the 120ms body build.
        formData: [{ key: 'key', value: 'value-1' }],
        body: file as unknown as TransportRequest['body'],
      }),
    );

    const response = await promise;
    expect(response.status).to.equal(204);
  });

  it('classifies a body-building rejection instead of letting it escape unhandled', async () => {
    // A file whose `toArrayBuffer()` rejects fails inside `requestFromTransportRequest`, before the
    // `fetch` call. The outer `.catch` must still convert it into a PubNubAPIError.
    const file: PubNubFileInterface = {
      name: 'broken.txt',
      mimeType: 'text/plain',
      toArrayBuffer: async () => {
        throw new Error('unreadable file');
      },
      toFileUri: async () => ({}),
    };

    const [promise] = makeTransport().makeSendable(
      makeRequest({
        path: '/upload',
        method: TransportMethod.POST,
        formData: [{ key: 'key', value: 'value-1' }],
        body: file as unknown as TransportRequest['body'],
      }),
    );

    try {
      await promise;
      expect.fail('expected rejection');
    } catch (error) {
      expect(error).to.be.instanceOf(PubNubAPIError);
    }
  });

  describe('connection lifecycle', () => {
    afterEach(() => sinon.restore());

    it('releases the dispatcher on the next macrotask when idle and creates a new one on demand', async () => {
      const transport = makeTransport();
      const agent = internals(transport).dispatcherForTransportRequest(TransportMethod.GET);
      const close = sinon.stub(agent, 'close').resolves();

      transport.releaseConnections();
      expect(close.called).to.equal(false);
      await nextMacrotask();

      expect(close.calledOnce).to.equal(true);
      expect(internals(transport).keepAliveAgent).to.equal(undefined);
      expect(internals(transport).dispatcherForTransportRequest(TransportMethod.GET)).to.not.equal(agent);
    });

    it('waits for in-flight requests (e.g. the destroy leave) before releasing', async () => {
      nock(ORIGIN).get('/time/0').delay(30).reply(200, '[1]');
      const transport = makeTransport();
      const agent = internals(transport).dispatcherForTransportRequest(TransportMethod.GET);
      const close = sinon.stub(agent, 'close').resolves();

      transport.releaseConnections();
      // Started in the same macrotask as the release request, like the `leave` sent by `destroy()`.
      const [promise] = transport.makeSendable(makeRequest());
      await nextMacrotask();
      expect(close.called).to.equal(false);

      await promise;
      await nextMacrotask();
      expect(close.calledOnce).to.equal(true);
    });

    it('sends non-GET requests through a separate, non-multiplexed dispatcher and releases both', async () => {
      const transport = makeTransport();
      const getAgent = internals(transport).dispatcherForTransportRequest(TransportMethod.GET);
      const postAgent = internals(transport).dispatcherForTransportRequest(TransportMethod.POST);
      expect(postAgent).to.not.equal(getAgent);
      expect(internals(transport).dispatcherForTransportRequest(TransportMethod.PATCH)).to.equal(postAgent);
      expect(internals(transport).dispatcherForTransportRequest(TransportMethod.DELETE)).to.equal(postAgent);

      const closeGet = sinon.stub(getAgent, 'close').resolves();
      const closePost = sinon.stub(postAgent, 'close').resolves();
      transport.releaseConnections();
      await nextMacrotask();

      expect(closeGet.calledOnce).to.equal(true);
      expect(closePost.calledOnce).to.equal(true);
      expect(internals(transport).sequentialAgent).to.equal(undefined);
    });

    it('does not release again for requests made after a completed release', async () => {
      nock(ORIGIN).get('/time/0').reply(200, '[1]');
      const transport = makeTransport();
      transport.releaseConnections();
      await nextMacrotask();

      const agent = internals(transport).dispatcherForTransportRequest(TransportMethod.GET);
      const close = sinon.stub(agent, 'close').resolves();
      await transport.makeSendable(makeRequest())[0];
      await nextMacrotask();

      expect(close.called).to.equal(false);
      expect(internals(transport).keepAliveAgent).to.equal(agent);
    });

    it('keeps request rejections unchanged while tracking completion', async () => {
      nock(ORIGIN).get('/time/0').reply(403, '{"message":"Forbidden"}', { 'Content-Type': 'application/json' });
      const transport = makeTransport();
      transport.releaseConnections();

      try {
        await transport.makeSendable(makeRequest())[0];
        expect.fail('expected rejection');
      } catch (error) {
        expect(error).to.be.instanceOf(PubNubAPIError);
        expect((error as PubNubAPIError).category).to.equal(StatusCategory.PNAccessDeniedCategory);
      }
    });

    it('uses the keep-alive timeout for idle connections, or undici default without keep-alive', () => {
      expect(internals(makeTransport()).idleConnectionTimeout()).to.equal(4000);
      expect(internals(makeTransport(true)).idleConnectionTimeout()).to.equal(30000);
      expect(internals(makeTransport(true, { timeout: 12000 })).idleConnectionTimeout()).to.equal(12000);
      expect(internals(makeTransport(true, {})).idleConnectionTimeout()).to.equal(4000);
    });

    describe('HTTP/2 connections', () => {
      let clock: sinon.SinonFakeTimers;
      beforeEach(() => (clock = sinon.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })));
      afterEach(() => clock.restore());

      it('multiplexes requests over an h2 session', () => {
        const client = makeFakeClient();
        internals(makeTransport()).onClientConnected(client, makeFakeSocket('h2'), true);

        expect(client.pipelining).to.equal(10);
      });

      it('does not multiplex h2 sessions of the non-GET dispatcher but still closes them when idle', () => {
        const client = makeFakeClient(0);
        const socket = makeFakeSocket('h2');
        internals(makeTransport()).onClientConnected(client, socket, false);
        expect(client.pipelining).to.equal(1);

        clock.tick(5000);
        expect(socket.destroy.calledOnce).to.equal(true);
      });

      it('leaves HTTP/1.1 connections untouched', () => {
        const client = makeFakeClient();
        const socket = makeFakeSocket('http/1.1');
        internals(makeTransport()).onClientConnected(client, socket, true);
        clock.tick(60000);

        expect(client.pipelining).to.equal(1);
        expect(socket.destroy.called).to.equal(false);
      });

      it('closes an idle h2 session after the idle timeout with a non-fatal undici error', () => {
        const client = makeFakeClient(0);
        const socket = makeFakeSocket('h2');
        internals(makeTransport()).onClientConnected(client, socket, true);

        clock.tick(3000);
        expect(socket.destroy.called).to.equal(false);
        clock.tick(2000);

        expect(socket.destroy.calledOnce).to.equal(true);
        expect(socket.destroy.firstCall.args[0]).to.be.instanceOf(errors.InformationalError);
      });

      it('keeps an h2 session open while requests (e.g. a long-poll) are running', () => {
        const client = makeFakeClient(1);
        const socket = makeFakeSocket('h2');
        internals(makeTransport()).onClientConnected(client, socket, true);
        clock.tick(60000);
        expect(socket.destroy.called).to.equal(false);

        // Idle time is counted from the moment the session became idle.
        client.stats.size = 0;
        clock.tick(3000);
        expect(socket.destroy.called).to.equal(false);
        clock.tick(2000);
        expect(socket.destroy.calledOnce).to.equal(true);
      });

      it('restores HTTP/1.1 pipelining when the h2 connection closes', () => {
        const client = makeFakeClient();
        const keepAliveClient = makeFakeClient();
        internals(makeTransport()).onClientConnected(client, makeFakeSocket('h2'), true);
        internals(makeTransport(true)).onClientConnected(keepAliveClient, makeFakeSocket('h2'), true);

        client.emit('disconnect');
        keepAliveClient.emit('disconnect');

        expect(client.pipelining).to.equal(0);
        expect(keepAliveClient.pipelining).to.equal(1);
      });
    });

    it('releases transport connections when the Node client is destroyed', () => {
      const pubnub = new PubNub({ subscribeKey: 'demo', publishKey: 'demo', userId: 'transport-test' });
      const release = sinon.stub(
        (pubnub as unknown as { nodeTransport: NodeTransport }).nodeTransport,
        'releaseConnections',
      );

      pubnub.destroy();

      expect(release.calledOnce).to.equal(true);
    });
  });
});
