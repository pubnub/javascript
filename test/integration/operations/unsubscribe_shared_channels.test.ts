/* global describe, beforeEach, it, before, afterEach, after */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

/**
 * Channels and groups shared by several subscriptions of the same client must stay subscribed while any of them is
 * active, and must be released (with a single `leave`) once the last one unsubscribes.
 */
describe('unsubscribe with shared channels (event engine)', () => {
  let pubnub: PubNub;
  let subscribeRequests: string[];
  let leaveRequests: { channels: string[]; groups: string[] }[];
  let timetokenCounter: number;

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const waitFor = async (condition: () => boolean, description: string, timeout = 2000) => {
    const start = Date.now();
    while (!condition()) {
      if (Date.now() - start > timeout) throw new Error(`Timed out waiting for: ${description}`);
      await sleep(10);
    }
  };

  // @ts-expect-error Access event engine core for test purpose.
  const engineState = (): string => pubnub.eventEngine!._engine.currentState?.label;

  const splitList = (value: string | undefined) =>
    !value || value === ','
      ? []
      : decodeURIComponent(value)
          .split(',')
          .filter((name) => name.length > 0)
          .sort();

  const waitForReceiving = () => waitFor(() => engineState() === 'RECEIVING', 'event engine RECEIVING state');

  /**
   * Assert that no subscribe request is made once nothing is subscribed (the long-poll loop has stopped).
   */
  const assertSubscribeLoopStopped = async () => {
    await waitFor(() => engineState() === 'UNSUBSCRIBED', 'event engine UNSUBSCRIBED state');
    const requestsBefore = subscribeRequests.length;
    await sleep(300);
    assert.equal(subscribeRequests.length, requestsBefore, 'subscribe requests made after everything unsubscribed');
  };

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    subscribeRequests = [];
    leaveRequests = [];
    timetokenCounter = 0;

    utils
      .createNock()
      .persist()
      .get(/^\/v2\/subscribe\/demo\/[^/]+\/0/)
      .query(true)
      .delay(100)
      .reply((uri) => {
        subscribeRequests.push(uri);
        timetokenCounter += 1;
        const timetoken = `1760000000000${String(timetokenCounter).padStart(4, '0')}`;
        return [200, `{"t":{"t":"${timetoken}","r":1},"m":[]}`, { 'content-type': 'text/javascript' }];
      });

    utils
      .createNock()
      .persist()
      .get(/^\/v2\/presence\/sub-key\/demo\/channel\/[^/]+\/(leave|heartbeat)/)
      .query(true)
      .reply((uri) => {
        const url = new URL(uri, 'https://ps.pndsn.com');
        const [, channels, action] = url.pathname.match(/\/channel\/([^/]+)\/(leave|heartbeat)$/) ?? [];
        if (action === 'leave')
          leaveRequests.push({
            channels: splitList(channels),
            groups: splitList(url.searchParams.get('channel-group') ?? undefined),
          });

        return [200, '{"status": 200, "message": "OK", "service": "Presence"}', { 'content-type': 'text/javascript' }];
      });

    pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      userId: 'shared-channels-test',
      enableEventEngine: true,
      // @ts-expect-error Force override default value.
      useRequestId: false,
      logLevel: PubNub.LogLevel.None,
    });
  });

  afterEach(() => {
    pubnub.removeAllListeners();
    pubnub.destroy(true);
    nock.cleanAll();
  });

  it('releases a channel after the only subscription unsubscribes', async () => {
    const subscription = pubnub.channel('room').subscription();

    subscription.subscribe();
    await waitForReceiving();

    subscription.unsubscribe();
    await waitFor(() => leaveRequests.length > 0, 'leave request');

    assert.deepEqual(leaveRequests, [{ channels: ['room'], groups: [] }]);
    assert.deepEqual(pubnub.getSubscribedChannels(), []);
    await assertSubscribeLoopStopped();
  });

  it('keeps a channel while another subscription uses it and releases it after the last one', async () => {
    const first = pubnub.channel('room').subscription();
    const second = pubnub.channel('room').subscription();

    first.subscribe();
    await waitForReceiving();
    second.subscribe();
    await sleep(150);

    first.unsubscribe();
    await sleep(200);
    assert.deepEqual(leaveRequests, [], 'leave sent while another subscription still uses the channel');
    assert.deepEqual(pubnub.getSubscribedChannels(), ['room']);
    assert.equal(engineState(), 'RECEIVING');

    second.unsubscribe();
    await waitFor(() => leaveRequests.length > 0, 'leave request after the last subscription unsubscribed');

    assert.deepEqual(leaveRequests, [{ channels: ['room'], groups: [] }]);
    assert.deepEqual(pubnub.getSubscribedChannels(), []);
    await assertSubscribeLoopStopped();
  });

  it('does not accumulate the channel across repeated subscribe / unsubscribe cycles', async () => {
    const first = pubnub.channel('room').subscription();
    const second = pubnub.channel('room').subscription();

    first.subscribe();
    await waitForReceiving();
    second.subscribe();
    await sleep(150);
    first.unsubscribe();
    second.unsubscribe();
    await waitFor(() => leaveRequests.length > 0, 'leave request after the first cycle');

    const third = pubnub.channel('room').subscription();
    third.subscribe();
    await waitForReceiving();
    assert.deepEqual(pubnub.getSubscribedChannels(), ['room']);

    third.unsubscribe();
    await waitFor(() => leaveRequests.length > 1, 'leave request after the second cycle');

    assert.deepEqual(leaveRequests, [
      { channels: ['room'], groups: [] },
      { channels: ['room'], groups: [] },
    ]);
    assert.deepEqual(pubnub.getSubscribedChannels(), []);
    await assertSubscribeLoopStopped();
  });

  it('releases a channel shared by a subscription and a subscription set', async () => {
    const subscription = pubnub.channel('room').subscription();
    const subscriptionSet = pubnub.subscriptionSet({ channels: ['room', 'other'] });

    subscription.subscribe();
    await waitForReceiving();
    subscriptionSet.subscribe();
    await sleep(150);

    subscription.unsubscribe();
    await sleep(200);
    assert.deepEqual(leaveRequests, [], 'leave sent while the subscription set still uses the channel');
    assert.deepEqual(pubnub.getSubscribedChannels().sort(), ['other', 'room']);

    subscriptionSet.unsubscribe();
    await waitFor(() => leaveRequests.length > 0, 'leave request after the subscription set unsubscribed');
    await sleep(100);

    assert.deepEqual(
      leaveRequests.flatMap((request) => request.channels).sort(),
      ['other', 'room'],
      'every channel left exactly once',
    );
    assert.deepEqual(pubnub.getSubscribedChannels(), []);
    await assertSubscribeLoopStopped();
  });

  it('releases a channel subscribed twice with the legacy subscribe() after one unsubscribe()', async () => {
    pubnub.subscribe({ channels: ['room'] });
    await waitForReceiving();
    pubnub.subscribe({ channels: ['room'] });
    await sleep(150);

    pubnub.unsubscribe({ channels: ['room'] });
    await waitFor(() => leaveRequests.length > 0, 'leave request');

    assert.deepEqual(leaveRequests, [{ channels: ['room'], groups: [] }]);
    assert.deepEqual(pubnub.getSubscribedChannels(), []);
    await assertSubscribeLoopStopped();
  });

  it('releases a channel and its presence channel shared by subscriptions with presence events', async () => {
    const first = pubnub.channel('room').subscription({ receivePresenceEvents: true });
    const second = pubnub.channel('room').subscription({ receivePresenceEvents: true });

    first.subscribe();
    await waitForReceiving();
    second.subscribe();
    await sleep(150);

    first.unsubscribe();
    await sleep(200);
    assert.deepEqual(leaveRequests, []);
    assert.deepEqual(pubnub.getSubscribedChannels().sort(), ['room', 'room-pnpres']);

    second.unsubscribe();
    await waitFor(() => leaveRequests.length > 0, 'leave request');

    assert.deepEqual(leaveRequests, [{ channels: ['room'], groups: [] }]);
    assert.deepEqual(pubnub.getSubscribedChannels(), []);
    await assertSubscribeLoopStopped();
  });

  it('releases a channel group shared by two subscriptions', async () => {
    const first = pubnub.channelGroup('cg').subscription();
    const second = pubnub.channelGroup('cg').subscription();

    first.subscribe();
    await waitForReceiving();
    second.subscribe();
    await sleep(150);

    first.unsubscribe();
    await sleep(200);
    assert.deepEqual(leaveRequests, []);
    assert.deepEqual(pubnub.getSubscribedChannelGroups(), ['cg']);

    second.unsubscribe();
    await waitFor(() => leaveRequests.length > 0, 'leave request');

    assert.deepEqual(leaveRequests, [{ channels: [], groups: ['cg'] }]);
    assert.deepEqual(pubnub.getSubscribedChannelGroups(), []);
    await assertSubscribeLoopStopped();
  });
});
