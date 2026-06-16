/* global describe, it, before, after, beforeEach, afterEach */

import { expect } from 'chai';
import nock from 'nock';

import { NodeTransport } from '../../src/transport/node-transport';
import { TransportMethod, TransportRequest } from '../../src/core/types/transport-request';
import { LoggerManager } from '../../src/core/components/logger-manager';
import { LogLevel } from '../../src/core/interfaces/logger';
import StatusCategory from '../../src/core/constants/categories';
import { PubNubAPIError } from '../../src/errors/pubnub-api-error';
import { PubNubFileInterface } from '../../src/core/types/file';

const ORIGIN = 'https://ps.pndsn.com';

/** Build a transport with a silent logger. */
const makeTransport = (keepAlive = false) =>
  new NodeTransport(new LoggerManager('test', LogLevel.None, []), keepAlive);

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
    nock(ORIGIN)
      .get('/time/0')
      .reply(200, '[123]', { 'Content-Type': 'TEXT/Javascript; CHARSET=UTF-8' });

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
});
