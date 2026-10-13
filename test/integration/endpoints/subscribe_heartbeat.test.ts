/* global describe, beforeEach, it, before, afterEach */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('subscribe heartbeat parameter', () => {
  const channel = 'heartbeatChannel';
  const cursorTimetoken = '14607577960932487';
  const replyBody = `{"t":{"t":"${cursorTimetoken}","r":1},"m":[]}`;
  const headers = { 'content-type': 'text/javascript' };
  let pubnub: PubNub;

  before(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    pubnub?.destroy(true);
  });

  const createClient = (parameters: Record<string, unknown> = {}) =>
    new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      autoNetworkDetection: false,
      ...parameters,
    });

  const waitForReply = (scope: nock.Scope) => new Promise<void>((resolve) => scope.once('replied', () => resolve()));

  // Event Engine handshake (no `tt`) and receive (`tt` from handshake) must both carry `heartbeat`.
  const mockEventEngineRequests = (heartbeat: string) => {
    const handshake = utils
      .createNock()
      .get(`/v2/subscribe/mySubKey/${channel}/0`)
      .query((query) => query.ee === '' && query.heartbeat === heartbeat && !('tt' in query))
      .reply(200, replyBody, headers);

    const receive = utils
      .createNock()
      .get(`/v2/subscribe/mySubKey/${channel}/0`)
      .query((query) => query.ee === '' && query.heartbeat === heartbeat && query.tt === cursorTimetoken)
      .reply(200, replyBody, headers)
      .persist();

    return { handshake, receive };
  };

  it('sends default presence timeout as heartbeat for event engine requests', async () => {
    const { handshake, receive } = mockEventEngineRequests('300');
    pubnub = createClient({ enableEventEngine: true });

    pubnub.subscribe({ channels: [channel] });
    await waitForReply(receive);

    assert.equal(handshake.isDone(), true);
  });

  it('sends configured presenceTimeout as heartbeat for event engine requests', async () => {
    const { handshake, receive } = mockEventEngineRequests('20');
    pubnub = createClient({ enableEventEngine: true, presenceTimeout: 20 });

    pubnub.subscribe({ channels: [channel] });
    await waitForReply(receive);

    assert.equal(handshake.isDone(), true);
  });

  it('keeps sending configured presenceTimeout as heartbeat for legacy subscribe requests', async () => {
    const legacy = utils
      .createNock()
      .get(`/v2/subscribe/mySubKey/${channel}/0`)
      .query((query) => query.heartbeat === '20' && !('ee' in query))
      .reply(200, replyBody, headers)
      .persist();

    pubnub = createClient({ enableEventEngine: false, presenceTimeout: 20 });

    pubnub.subscribe({ channels: [channel] });
    await waitForReply(legacy);

    assert.equal(legacy.isDone(), true);
  });
});
