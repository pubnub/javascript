/* global describe, beforeEach, afterEach, it */

import assert from 'assert';
import sinon from 'sinon';

import { AbortError } from '../../src/core/components/abort_signal';
import type { AbstractRequest } from '../../src/core/components/request';
import StatusCategory from '../../src/core/constants/categories';
import RequestOperation from '../../src/core/constants/operations';
import type * as Subscription from '../../src/core/types/api/subscription';
import PubNub from '../../src/node/index';

/**
 * Subscribe / unsubscribe bookkeeping of the event engine when the same channels and groups are used by several
 * subscriptions, subscribed and unsubscribed in multiple rounds, and then subscribed again.
 *
 * No HTTP is involved: the client's handshake and long-poll calls are stubbed (the long-poll stays pending until the
 * engine aborts it), and leave / heartbeat requests are captured at `sendRequest`. Every step settles within a few
 * event-loop turns, so there are no fixed delays.
 */

type Names = { channels: string[]; groups: string[] };

type ClientInternals = {
  subscribeHandshake(parameters: Subscription.CancelableSubscribeParameters): Promise<Subscription.SubscriptionCursor>;
  subscribeReceiveMessages(parameters: Subscription.CancelableSubscribeParameters): Promise<unknown>;
  sendRequest(
    request: AbstractRequest<unknown, object>,
    callback?: (status: Record<string, unknown>, response: unknown) => void,
  ): Promise<unknown> | void;
  eventEngine: { _engine: { currentState?: { label: string } } };
};

describe('EventEngine shared subscriptions', () => {
  let pubnub: PubNub;
  let handshakes: Names[];
  let receives: Names[];
  let leaves: Names[];
  let unexpectedRequests: string[];

  const sorted = (names?: string[]) => [...(names ?? [])].sort();
  const parseNames = (value?: string) =>
    !value || value === ','
      ? []
      : value
          .split(',')
          .map((name) => decodeURIComponent(name))
          .sort();

  const internals = () => pubnub as unknown as ClientInternals;
  const engineState = () => internals().eventEngine._engine.currentState?.label;

  /** Let queued promise chains and engine transitions run to completion. */
  const settle = async () => {
    for (let i = 0; i < 5; i++) await new Promise<void>((resolve) => setImmediate(resolve));
  };

  /** Names used by the most recent handshake or long-poll request (the active subscribe loop). */
  const activeLoop = (): Names => {
    const lastReceive = receives[receives.length - 1];
    const lastHandshake = handshakes[handshakes.length - 1];
    if (engineState() === 'RECEIVING') return lastReceive;
    return lastHandshake;
  };

  const expectSubscribed = (expected: { channels?: string[]; groups?: string[] }) => {
    const channels = sorted(expected.channels);
    const groups = sorted(expected.groups);

    assert.deepEqual(sorted(pubnub.getSubscribedChannels()), channels, 'getSubscribedChannels()');
    assert.deepEqual(sorted(pubnub.getSubscribedChannelGroups()), groups, 'getSubscribedChannelGroups()');
    assert.equal(engineState(), 'RECEIVING', 'event engine state');
    assert.deepEqual(activeLoop(), { channels, groups }, 'names in the active subscribe request');
  };

  /** Nothing is subscribed and the subscribe loop doesn't make new requests. */
  const expectNothingSubscribed = async () => {
    assert.deepEqual(pubnub.getSubscribedChannels(), [], 'getSubscribedChannels()');
    assert.deepEqual(pubnub.getSubscribedChannelGroups(), [], 'getSubscribedChannelGroups()');
    assert.equal(engineState(), 'UNSUBSCRIBED', 'event engine state');

    const requestCount = handshakes.length + receives.length;
    await settle();
    assert.equal(handshakes.length + receives.length, requestCount, 'subscribe requests after everything unsubscribed');
  };

  const expectLeaves = (expected: { channels?: string[]; groups?: string[] }[]) => {
    assert.deepEqual(
      leaves,
      expected.map((names) => ({ channels: sorted(names.channels), groups: sorted(names.groups) })),
      'leave requests',
    );
  };

  beforeEach(() => {
    handshakes = [];
    receives = [];
    leaves = [];
    unexpectedRequests = [];

    pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      userId: 'shared-subscriptions-test',
      enableEventEngine: true,
      logLevel: PubNub.LogLevel.None,
    });

    let timetoken = 17600000000000000;
    const nextCursor = () => ({ timetoken: `${(timetoken += 10000)}`, region: 1 });

    sinon.stub(internals(), 'subscribeHandshake').callsFake(async (parameters) => {
      handshakes.push({ channels: sorted(parameters.channels), groups: sorted(parameters.channelGroups) });
      return nextCursor();
    });

    // Long-poll which never returns any messages; it ends only when the engine cancels it.
    sinon.stub(internals(), 'subscribeReceiveMessages').callsFake((parameters) => {
      receives.push({ channels: sorted(parameters.channels), groups: sorted(parameters.channelGroups) });
      return new Promise((_resolve, reject) => {
        parameters.abortSignal.subscribe(() => reject(new AbortError()));
      });
    });

    sinon.stub(internals(), 'sendRequest').callsFake((request, callback) => {
      const operation = request.operation();
      const transportRequest = request.request();

      if (operation === RequestOperation.PNUnsubscribeOperation) {
        const [, channels] = transportRequest.path.match(/\/channel\/([^/]+)\/leave$/) ?? [];
        leaves.push({
          channels: parseNames(channels),
          groups: parseNames(transportRequest.queryParameters?.['channel-group'] as string | undefined),
        });
      } else if (operation !== RequestOperation.PNHeartbeatOperation) unexpectedRequests.push(operation);

      const status = { error: false, statusCode: 200, operation, category: StatusCategory.PNAcknowledgmentCategory };
      if (callback) return callback(status, {});
      return Promise.resolve({});
    });
  });

  afterEach(() => {
    pubnub.removeAllListeners();
    pubnub.destroy(true);
    sinon.restore();
    assert.deepEqual(unexpectedRequests, [], 'unexpected requests');
  });

  it('releases overlapping multi-channel subscriptions one by one and resubscribes a released channel', async () => {
    const setA = pubnub.subscriptionSet({ channels: ['ch1', 'ch2', 'ch3'] });
    const setB = pubnub.subscriptionSet({ channels: ['ch2', 'ch3', 'ch4'] });
    const single = pubnub.channel('ch3').subscription();

    setA.subscribe();
    setB.subscribe();
    single.subscribe();
    await settle();
    expectSubscribed({ channels: ['ch1', 'ch2', 'ch3', 'ch4'] });
    expectLeaves([]);

    // Only ch1 is used by setA alone.
    setA.unsubscribe();
    await settle();
    expectSubscribed({ channels: ['ch2', 'ch3', 'ch4'] });
    expectLeaves([{ channels: ['ch1'] }]);

    // ch3 is still used by the single subscription.
    setB.unsubscribe();
    await settle();
    expectSubscribed({ channels: ['ch3'] });
    expectLeaves([{ channels: ['ch1'] }, { channels: ['ch2', 'ch4'] }]);

    single.unsubscribe();
    await settle();
    await expectNothingSubscribed();
    expectLeaves([{ channels: ['ch1'] }, { channels: ['ch2', 'ch4'] }, { channels: ['ch3'] }]);

    // Subscribing again to one released channel must not bring back the others.
    const resubscribed = pubnub.channel('ch2').subscription();
    resubscribed.subscribe();
    await settle();
    expectSubscribed({ channels: ['ch2'] });
    assert.deepEqual(handshakes[handshakes.length - 1], { channels: ['ch2'], groups: [] }, 'handshake on resubscribe');
    assert.equal(leaves.length, 3, 'no leave on resubscribe');

    resubscribed.unsubscribe();
    await settle();
    await expectNothingSubscribed();
    expectLeaves([{ channels: ['ch1'] }, { channels: ['ch2', 'ch4'] }, { channels: ['ch3'] }, { channels: ['ch2'] }]);
  });

  it('treats repeated subscribe() and unsubscribe() on the same objects as no-ops', async () => {
    const set = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });
    const single = pubnub.channel('ch2').subscription();

    set.subscribe();
    set.subscribe();
    set.subscribe();
    single.subscribe();
    single.subscribe();
    await settle();
    expectSubscribed({ channels: ['ch1', 'ch2'] });

    set.unsubscribe();
    set.unsubscribe();
    set.unsubscribe();
    await settle();
    expectSubscribed({ channels: ['ch2'] });
    expectLeaves([{ channels: ['ch1'] }]);

    single.unsubscribe();
    single.unsubscribe();
    await settle();
    await expectNothingSubscribed();
    expectLeaves([{ channels: ['ch1'] }, { channels: ['ch2'] }]);

    // The same subscription set object can be subscribed again.
    set.subscribe();
    await settle();
    expectSubscribed({ channels: ['ch1', 'ch2'] });

    set.unsubscribe();
    await settle();
    await expectNothingSubscribed();
    expectLeaves([{ channels: ['ch1'] }, { channels: ['ch2'] }, { channels: ['ch1', 'ch2'] }]);
  });

  it('handles legacy subscribe() / unsubscribe() called multiple times with overlapping channel lists', async () => {
    pubnub.subscribe({ channels: ['ch1', 'ch2'] });
    pubnub.subscribe({ channels: ['ch2', 'ch3'] });
    pubnub.subscribe({ channels: ['ch1', 'ch2'] });
    await settle();
    expectSubscribed({ channels: ['ch1', 'ch2', 'ch3'] });

    // Legacy unsubscribe() removes the channel no matter how many times it was subscribed.
    pubnub.unsubscribe({ channels: ['ch2'] });
    await settle();
    expectSubscribed({ channels: ['ch1', 'ch3'] });
    expectLeaves([{ channels: ['ch2'] }]);

    // Already unsubscribed: nothing changes and no leave is sent.
    pubnub.unsubscribe({ channels: ['ch2'] });
    await settle();
    expectSubscribed({ channels: ['ch1', 'ch3'] });
    expectLeaves([{ channels: ['ch2'] }]);

    pubnub.unsubscribe({ channels: ['ch1', 'ch3'] });
    await settle();
    await expectNothingSubscribed();
    expectLeaves([{ channels: ['ch2'] }, { channels: ['ch1', 'ch3'] }]);

    pubnub.subscribe({ channels: ['ch3'] });
    await settle();
    expectSubscribed({ channels: ['ch3'] });
    assert.deepEqual(handshakes[handshakes.length - 1], { channels: ['ch3'], groups: [] }, 'handshake on resubscribe');

    pubnub.unsubscribe({ channels: ['ch3'] });
    await settle();
    await expectNothingSubscribed();
    expectLeaves([{ channels: ['ch2'] }, { channels: ['ch1', 'ch3'] }, { channels: ['ch3'] }]);
  });

  it('drops presence channels of released subscriptions when a channel is resubscribed without presence', async () => {
    const first = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'], subscriptionOptions: { receivePresenceEvents: true } });
    const second = pubnub.subscriptionSet({
      channels: ['ch1', 'ch2'],
      subscriptionOptions: { receivePresenceEvents: true },
    });

    first.subscribe();
    second.subscribe();
    await settle();
    expectSubscribed({ channels: ['ch1', 'ch1-pnpres', 'ch2', 'ch2-pnpres'] });

    first.unsubscribe();
    await settle();
    expectSubscribed({ channels: ['ch1', 'ch1-pnpres', 'ch2', 'ch2-pnpres'] });
    expectLeaves([]);

    second.unsubscribe();
    await settle();
    await expectNothingSubscribed();
    expectLeaves([{ channels: ['ch1', 'ch2'] }]);

    const resubscribed = pubnub.channel('ch1').subscription();
    resubscribed.subscribe();
    await settle();
    expectSubscribed({ channels: ['ch1'] });

    resubscribed.unsubscribe();
    await settle();
    await expectNothingSubscribed();
    expectLeaves([{ channels: ['ch1', 'ch2'] }, { channels: ['ch1'] }]);
  });

  it('releases channel groups and channels shared across rounds and resubscribes a released group', async () => {
    const mixedA = pubnub.subscriptionSet({ channels: ['ch1'], channelGroups: ['cg1', 'cg2'] });
    const mixedB = pubnub.subscriptionSet({ channels: ['ch1'], channelGroups: ['cg2'] });
    const group = pubnub.channelGroup('cg2').subscription();

    mixedA.subscribe();
    mixedB.subscribe();
    group.subscribe();
    await settle();
    expectSubscribed({ channels: ['ch1'], groups: ['cg1', 'cg2'] });

    mixedA.unsubscribe();
    await settle();
    expectSubscribed({ channels: ['ch1'], groups: ['cg2'] });
    expectLeaves([{ groups: ['cg1'] }]);

    mixedB.unsubscribe();
    await settle();
    expectSubscribed({ groups: ['cg2'] });
    expectLeaves([{ groups: ['cg1'] }, { channels: ['ch1'] }]);

    group.unsubscribe();
    await settle();
    await expectNothingSubscribed();
    expectLeaves([{ groups: ['cg1'] }, { channels: ['ch1'] }, { groups: ['cg2'] }]);

    const resubscribed = pubnub.channelGroup('cg1').subscription();
    resubscribed.subscribe();
    await settle();
    expectSubscribed({ groups: ['cg1'] });
    assert.deepEqual(handshakes[handshakes.length - 1], { channels: [], groups: ['cg1'] }, 'handshake on resubscribe');

    resubscribed.unsubscribe();
    await settle();
    await expectNothingSubscribed();
    expectLeaves([{ groups: ['cg1'] }, { channels: ['ch1'] }, { groups: ['cg2'] }, { groups: ['cg1'] }]);
  });
});
