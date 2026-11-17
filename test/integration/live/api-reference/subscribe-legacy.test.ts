import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient, friend, observer, shopper } from '../support/clients';
import { connected, eventually, expectEvent, expectStatus, PRESENCE_EVENT_TIMEOUT, sleep } from '../support/wait';
import { ensureGroups, memberOf, removeGroupMembers } from '../support/subscribe-groups';
import { sorted } from '../support/util';

/**
 * Examples for the older `pubnub.subscribe()`, `pubnub.unsubscribe()` and `pubnub.unsubscribeAll()` methods.
 * Port of docs-snippets/api-reference/subscribe-legacy.ts. Presence must be on for the open keyset.
 */
describe('api-reference/subscribe-legacy', () => {
  const tagOf = (m: { message: unknown }): string | undefined => (m.message as { run?: string }).run;
  // Subscription state lists have no guaranteed order.

  // The groups the samples subscribe to, each with one member channel. A group without a channel carries no messages.
  const GROUPS = [
    'my_channelGroup',
    'family',
    'my_channelGroup1',
    'my_channelGroup2',
    'my_channelGroup3',
    'demo_group1',
    'demo_group2',
  ];
  before(() => ensureGroups(GROUPS));
  after(() => removeGroupMembers(GROUPS));

  it('OLDsubscribeBasicUsage: the legacy subscribe call connects and delivers a message', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const ready = connected(pubnub, { channels: ['my_channel'] });
    const received = expectEvent(pubnub, 'message', (m) => tagOf(m) === run && m.channel === 'my_channel');

    // snippet.OLDsubscribeBasicUsage
    pubnub.subscribe({
      channels: ['my_channel'],
    });
    // snippet.end

    await ready;
    assert.deepEqual(pubnub.getSubscribedChannels(), ['my_channel']);
    await friend().publish({ channel: 'my_channel', message: { run } });
    await received;
    pubnub.unsubscribeAll();
  });

  it('OLDsubscribeMultipleChannels: one legacy subscribe call covers three channels, shown by a message on the middle one', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const channels = ['my_channel_1', 'my_channel_2', 'my_channel_3'];
    const ready = connected(pubnub, { channels });
    const received = expectEvent(pubnub, 'message', (m) => tagOf(m) === run && m.channel === 'my_channel_2');

    // snippet.OLDsubscribeMultipleChannels
    pubnub.subscribe({
      channels: ['my_channel_1', 'my_channel_2', 'my_channel_3'],
    });
    // snippet.end

    await ready;
    assert.deepEqual(sorted(pubnub.getSubscribedChannels()), channels);
    await friend().publish({ channel: 'my_channel_2', message: { run } });
    await received;
    pubnub.unsubscribeAll();
  });

  it('OLDsubscribeWithPresence: withPresence true produces the own join event with the fields the page table lists', async function () {
    this.timeout(60_000);
    // A unique user id: a fixed one could still be present from an earlier test, and then no join event is emitted.
    const pubnub = createClient('open', `oldpresence-${randomUUID()}`);
    const ready = connected(pubnub, { channels: ['my_channel'] });
    const joined = expectEvent(
      pubnub,
      'presence',
      (p) => p.action === 'join' && p.channel === 'my_channel' && p.uuid === pubnub.getUserId(),
      { timeout: PRESENCE_EVENT_TIMEOUT },
    );

    // snippet.OLDsubscribeWithPresence
    pubnub.subscribe({
      channels: ['my_channel'],
      withPresence: true,
    });
    // snippet.end

    await ready;
    const event = await joined;
    // The docs presence payload table promises these fields.
    assert.equal(typeof (event as { occupancy?: number }).occupancy, 'number');
    assert.ok(event.timetoken);
    pubnub.unsubscribeAll();
  });

  it('OLDsubscribeWithWildCardChannels: a wildcard subscription receives a message on a matching channel', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const ready = connected(pubnub, { channels: ['ab.*'] });
    const received = expectEvent(pubnub, 'message', (m) => tagOf(m) === run && m.channel === 'ab.news');

    // snippet.OLDsubscribeWithWildCardChannels
    pubnub.subscribe({
      channels: ['ab.*'],
    });
    // snippet.end

    await ready;
    await friend().publish({ channel: 'ab.news', message: { run } });
    const message = await received;
    // The wildcard match is reported as the subscription.
    assert.equal(message.subscription, 'ab.*');
    pubnub.unsubscribeAll();
  });

  it('OLDsubscribeWithState: the connected status handler can set state, and the observer reads it back per channel', async function () {
    this.timeout(60_000);
    // A unique user id keeps the state of this run apart from any earlier one on the shared channels.
    const pubnub = createClient('open', `oldstate-${randomUUID()}`);
    const ready = connected(pubnub, { channels: ['ch1', 'ch2', 'ch3'] });

    // snippet.OLDsubscribeWithState
    pubnub.addListener({
      status: async (statusEvent) => {
        if (statusEvent.category === 'PNConnectedCategory') {
          await pubnub.setState({
            state: {
              some: 'state',
            },
            channels: ['ch1', 'ch2', 'ch3'],
          });
        }
      },
      message: (messageEvent) => {
        // handle message
      },
      presence: (presenceEvent) => {
        // handle presence
      },
    });

    pubnub.subscribe({
      channels: ['ch1', 'ch2', 'ch3'],
    });
    // snippet.end

    await ready;
    // The observer reads the state back. The docs sample called setState without channels, which the SDK rejects (an intended difference from the old docs body).
    const reader = observer();
    await eventually(
      async () => {
        // One channel per call: with several channels getState nests the result one level deeper (docs finding).
        for (const channel of ['ch1', 'ch2', 'ch3']) {
          const state = await reader.getState({ uuid: pubnub.getUserId(), channels: [channel] });
          assert.deepEqual(state.channels[channel], { some: 'state' }, `state on ${channel}`);
        }
      },
      { timeout: 30_000, label: 'state set from the connected status handler' },
    );
    pubnub.unsubscribeAll();
  });

  it('OLDsubscribeChannelGroup: subscribing to a channel group delivers a message from its member channel', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const ready = connected(pubnub, { channelGroups: ['my_channelGroup'] });
    const received = expectEvent(pubnub, 'message', (m) => tagOf(m) === run && m.subscription === 'my_channelGroup');

    // snippet.OLDsubscribeChannelGroup
    pubnub.subscribe({
      channelGroups: ['my_channelGroup'],
    });
    // snippet.end

    await ready;
    assert.deepEqual(pubnub.getSubscribedChannelGroups(), ['my_channelGroup']);
    await friend().publish({ channel: memberOf('my_channelGroup'), message: { run } });
    const message = await received;
    assert.equal(message.channel, memberOf('my_channelGroup'));
    pubnub.unsubscribeAll();
  });

  it('OLDsubscribeChannelGroupWithPresence: a group subscription with presence yields a join event that belongs to the group', async function () {
    this.timeout(60_000);
    const pubnub = createClient('open', `oldgrouppresence-${randomUUID()}`);
    const ready = connected(pubnub, { channelGroups: ['family'] });
    const joined = expectEvent(pubnub, 'presence', (p) => p.action === 'join' && p.uuid === pubnub.getUserId(), {
      timeout: PRESENCE_EVENT_TIMEOUT,
    });

    // snippet.OLDsubscribeChannelGroupWithPresence
    pubnub.subscribe({
      channelGroups: ['family'],
      withPresence: true,
    });
    // snippet.end

    await ready;
    const event = await joined;
    assert.ok(
      event.channel === memberOf('family') || event.subscription === 'family',
      `presence event belongs to the group (channel ${event.channel}, subscription ${event.subscription})`,
    );
    pubnub.unsubscribeAll();
  });

  it('OLDsubscribeMultipleChannelGroup: one call subscribes to three groups, shown by a message through the last group', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const groups = ['my_channelGroup1', 'my_channelGroup2', 'my_channelGroup3'];
    const ready = connected(pubnub, { channelGroups: groups });
    const received = expectEvent(pubnub, 'message', (m) => tagOf(m) === run && m.subscription === 'my_channelGroup3');

    // snippet.OLDsubscribeMultipleChannelGroup
    pubnub.subscribe({
      channelGroups: ['my_channelGroup1', 'my_channelGroup2', 'my_channelGroup3'],
    });
    // snippet.end

    await ready;
    assert.deepEqual(sorted(pubnub.getSubscribedChannelGroups()), groups);
    await friend().publish({ channel: memberOf('my_channelGroup3'), message: { run } });
    await received;
    pubnub.unsubscribeAll();
  });

  it('OLDsubscribeChannelGroupAndChannels: channels and groups can be mixed in one call, shown by a message through each', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const ready = connected(pubnub, { channels: ['my_channel'], channelGroups: ['my_channelGroup'] });
    const onChannel = expectEvent(
      pubnub,
      'message',
      (m) => tagOf(m) === `${run}-channel` && m.channel === 'my_channel',
    );
    const onGroup = expectEvent(
      pubnub,
      'message',
      (m) => tagOf(m) === `${run}-group` && m.subscription === 'my_channelGroup',
    );

    // snippet.OLDsubscribeChannelGroupAndChannels
    pubnub.subscribe({
      channels: ['my_channel'],
      channelGroups: ['my_channelGroup'],
    });
    // snippet.end

    await ready;
    const sender = friend();
    await sender.publish({ channel: 'my_channel', message: { run: `${run}-channel` } });
    await sender.publish({ channel: memberOf('my_channelGroup'), message: { run: `${run}-group` } });
    await onChannel;
    await onGroup;
    pubnub.unsubscribeAll();
  });

  it('OLDaddListeners: the legacy listener sample handlers see status, message and presence events whose fields exist on live events', async function () {
    this.timeout(120_000);
    const run = randomUUID();
    // The samples's handlers do not mention a channel, so the test picks a unique one. App Context metadata is set on it and removed at the end.
    const channel = `legacy_listeners_${run}`;
    const pubnub = createClient('open', `oldlisteners-${run}`);
    const joiner = createClient('open', `oldlisteners-joiner-${run}`);
    const sender = friend();
    // Everything the client sees, in arrival order (other tests' leftovers cannot reach a channel with a unique name).
    // The listener payload types are a union per kind. The test reads fields that only some members have, so it keeps them loose.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const seen = {
      message: [] as any[],
      presence: [] as any[],
      signal: [] as any[],
      objects: [] as any[],
      messageAction: [] as any[],
      status: [] as any[],
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
    pubnub.addListener({
      message: (m) => seen.message.push(m),
      presence: (p) => seen.presence.push(p),
      signal: (s) => seen.signal.push(s),
      objects: (o) => seen.objects.push(o),
      messageAction: (a) => seen.messageAction.push(a),
      status: (s) => seen.status.push(s),
    });

    /* eslint-disable prettier/prettier */
    // snippet.OLDaddListeners
    pubnub.addListener({
      // Messages
      message: function (m) {
        const channelName = m.channel; // Channel on which the message was published
        const channelGroup = m.subscription; // Channel group or wildcard subscription match (if exists)
        const pubTT = m.timetoken; // Publish timetoken
        const msg = m.message; // Message payload
        const publisher = m.publisher; // Message publisher
      },
      // Presence
      // requires a subscription with presence
      presence: function (p) {
        const action = p.action; // Can be join, leave, timeout, state-change, or interval
        const channelName = p.channel; // Channel to which the message belongs
        const channelGroup = p.subscription; //  Channel group or wildcard subscription match, if any
        const publishTime = p.timestamp; // Publish timetoken
        const timetoken = p.timetoken; // Current timetoken
        if (p.action !== 'state-change') {
          const occupancy = p.occupancy; // Number of users subscribed to the channel
        }
        if (p.action === 'state-change') {
          const state = p.state; // User state
        }
        if (p.action !== 'interval') {
          const uuid = p.uuid; // User ID of the user who joined, left, timed out, or changed state
        }
      },
      // Signals
      signal: function (s) {
        const channelName = s.channel; // Channel to which the signal belongs
        const channelGroup = s.subscription; // Channel group or wildcard subscription match, if any
        const pubTT = s.timetoken; // Publish timetoken
        const msg = s.message; // Payload
        const publisher = s.publisher; // Message publisher
      },
      // App Context
      objects: (objectEvent) => {
        const channel = objectEvent.channel; // Channel to which the event belongs
        const channelGroup = objectEvent.subscription; // Channel group
        const timetoken = objectEvent.timetoken; // Event timetoken
        const event = objectEvent.message.event; // Name of the event that occurred
        const type = objectEvent.message.type; // Type of the object that changed
        const data = objectEvent.message.data; // Data from the event that occurred
      },
      // Message Actions
      messageAction: function (ma) {
        const channelName = ma.channel; // Channel to which the message belongs
        const publisher = ma.publisher; // Message publisher
        const event = ma.event; // Message action added or removed
        const type = ma.data.type; // Message action type
        const value = ma.data.value; // Message action value
        const messageTimetoken = ma.data.messageTimetoken; // Timetoken of the original message
        const actionTimetoken = ma.data.actionTimetoken; // Timetoken of the message action
      },
      // File Sharing
      file: function (event) {
        const channelName = event.channel; // Channel to which the file belongs
        const channelGroup = event.subscription; // Channel group or wildcard subscription match (if exists)
        const publisher = event.publisher; // File publisher
        const timetoken = event.timetoken; // Event timetoken

        const message = event.message; // Optional message attached to the file
        const fileId = event.file?.id; // File unique id
        const fileName = event.file?.name; // File name
        const fileUrl = event.file?.url; // File direct URL
      },
      status: function (s) {
        const affectedChannelGroups = s.affectedChannelGroups; // Array of channel groups affected in the operation
        const affectedChannels = s.affectedChannels; // Array of channels affected in the operation
        const category = s.category; // Returns PNConnectedCategory
        const operation = s.operation; // Returns PNSubscribeOperation
        const lastTimetoken = s.lastTimetoken; // Last timetoken used in the subscribe request (type long), only with enableEventEngine: false
        const currentTimetoken = s.currentTimetoken; /* Current timetoken fetched in subscribe response,
                                                     * to be used in the next request (type long) */
        const subscribedChannels = s.subscribedChannels; // Array of all currently subscribed channels, only with enableEventEngine: false
      },
    });
    // snippet.end
    /* eslint-enable prettier/prettier */

    try {
      const ready = connected(pubnub, { channels: [channel] });
      pubnub.subscribe({ channels: [channel], withPresence: true });
      await ready;
      // The second client joins only after the first one is connected, so its join is published after the first client's
      // subscribe loop is running and must reach it.
      const joinerReady = connected(joiner, { channels: [channel] });
      joiner.subscribe({ channels: [channel] });
      await joinerReady;
      // The service can lose or delay one join. Wait briefly for the joiner's join. If it does not arrive, subscribe the joiner
      // again, at most twice, and log it so a lost join stays visible.
      const joinerJoined = () => seen.presence.some((p) => p.action === 'join' && p.uuid === joiner.getUserId());
      for (let attempt = 1; attempt <= 2 && !joinerJoined(); attempt += 1) {
        try {
          await eventually(() => assert.ok(joinerJoined(), 'the joiner join arrived'), {
            timeout: 8_000,
            label: 'joiner join arrived',
          });
        } catch {
          console.log(`joiner join not delivered, subscribed again (attempt ${attempt})`);
          joiner.unsubscribeAll();
          const again = connected(joiner, { channels: [channel] });
          joiner.subscribe({ channels: [channel] });
          await again;
        }
      }
      const published = await sender.publish({ channel, message: { run } });
      await sender.signal({ channel, message: 'ping' });
      await sender.addMessageAction({
        channel,
        messageTimetoken: published.timetoken,
        action: { type: 'reaction', value: 'smiley_face' },
      });
      await sender.objects.setChannelMetadata({ channel, data: { name: 'legacy listeners' } });
      await eventually(
        () => {
          assert.ok(
            seen.message.some((m) => tagOf(m) === run),
            'message arrived',
          );
          assert.ok(
            seen.presence.some((p) => p.action === 'join' && p.uuid === joiner.getUserId()),
            'joiner join arrived',
          );
          assert.ok(
            seen.signal.some((s) => s.message === 'ping'),
            'signal arrived',
          );
          assert.ok(
            seen.objects.some((o) => o.message?.event === 'set' && o.message?.data?.id === channel),
            'objects event arrived',
          );
          assert.ok(
            seen.messageAction.some((a) => a.event === 'added'),
            'message action arrived',
          );
        },
        { timeout: PRESENCE_EVENT_TIMEOUT, label: 'every event kind arrived' },
      );
      // The joiner leaves and the leave event must follow.
      joiner.unsubscribeAll();
      await eventually(
        () =>
          assert.ok(
            seen.presence.some((p) => p.action === 'leave' && p.uuid === joiner.getUserId()),
            `the joiner's leave event arrived. Presence events seen: ${seen.presence.map((p) => `${p.action} ${p.uuid}`).join(', ')}`,
          ),
        { timeout: PRESENCE_EVENT_TIMEOUT, label: 'leave event arrived' },
      );
      // The own join is not asserted: whether it is delivered depends on where the join falls against the first subscribe timetoken.

      const message = seen.message.find((m) => tagOf(m) === run)!;
      assert.equal(message.channel, channel);
      assert.equal(message.publisher, sender.getUserId());
      assert.equal(message.timetoken, published.timetoken);
      const presence = seen.presence.find((p) => p.action === 'join' && p.uuid === joiner.getUserId())!;
      assert.equal(presence.channel, channel);
      assert.equal(typeof presence.occupancy, 'number');
      assert.ok(presence.timestamp, 'presence timestamp');
      assert.ok(presence.timetoken, 'presence timetoken');
      const leave = seen.presence.find((p) => p.action === 'leave' && p.uuid === joiner.getUserId())!;
      assert.equal(typeof leave.occupancy, 'number');
      const signal = seen.signal.find((s) => s.message === 'ping')!;
      assert.equal(signal.publisher, sender.getUserId());
      const objectEvent = seen.objects.find((o) => o.message?.event === 'set' && o.message?.data?.id === channel)!;
      assert.equal(objectEvent.message.type, 'channel');
      // The old sample read event, type, data and publisher from the event itself. They are under message, and objects events have no publisher.
      assert.equal((objectEvent as { event?: unknown }).event, undefined);
      assert.equal((objectEvent as { publisher?: unknown }).publisher, undefined);
      const action = seen.messageAction.find((a) => a.event === 'added')!;
      assert.equal(action.data.type, 'reaction');
      assert.equal(action.data.value, 'smiley_face');
      assert.equal(action.data.messageTimetoken, published.timetoken);
      assert.ok(action.data.actionTimetoken);
      assert.ok(action.publisher, 'message action publisher (the docs read ma.publisher)');
      const connectedStatus = seen.status.find((s) => s.category === 'PNConnectedCategory');
      assert.ok(connectedStatus, 'connected status');
      assert.equal(connectedStatus.operation, 'PNSubscribeOperation');
      // The new-subscription-loop status carries neither lastTimetoken nor subscribedChannels, see the status fields test below.
      assert.ok(connectedStatus.affectedChannels.includes(channel));
      assert.ok(connectedStatus.currentTimetoken);
      pubnub.unsubscribeAll();
    } finally {
      await sender.objects.removeChannelMetadata({ channel }).catch(() => undefined);
    }
  });

  it('status fields: lastTimetoken and subscribedChannels are set on the status only by the legacy subscription manager', async () => {
    for (const enableEventEngine of [true, false]) {
      const pubnub = shopper({ enableEventEngine });
      const statuses: Array<Record<string, unknown>> = [];
      pubnub.addListener({ status: (s) => statuses.push(s as unknown as Record<string, unknown>) });
      pubnub.subscribe({ channels: ['my_channel'] });
      await eventually(() => assert.ok(statuses.some((s) => s.category === 'PNConnectedCategory')), {
        label: 'connected',
      });
      const status = statuses.find((s) => s.category === 'PNConnectedCategory')!;
      assert.equal(status.operation, 'PNSubscribeOperation');
      assert.deepEqual(status.affectedChannels, ['my_channel']);
      assert.ok(status.currentTimetoken, 'currentTimetoken');
      assert.equal(
        'lastTimetoken' in status,
        !enableEventEngine,
        `lastTimetoken is present only with enableEventEngine: false (enableEventEngine ${enableEventEngine})`,
      );
      assert.equal(
        'subscribedChannels' in status,
        !enableEventEngine,
        `subscribedChannels is present only with enableEventEngine: false (enableEventEngine ${enableEventEngine})`,
      );
      pubnub.unsubscribeAll();
    }
  });

  it('OLDremoveListeners: removeListener leaves the other listeners of the client working, and the removed object receives nothing', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const kept: unknown[] = [];
    pubnub.addListener({ message: (m) => tagOf(m) === run && kept.push(m) });

    /* eslint-disable no-var, prettier/prettier */
    // snippet.OLDremoveListeners
    var existingListener = {
      message: function () {
      },
    };

    pubnub.removeListener(existingListener);
    // snippet.end
    /* eslint-enable no-var, prettier/prettier */
    let removedCalls = 0;
    existingListener.message = () => {
      removedCalls += 1;
    };
    const ready = connected(pubnub, { channels: ['my_channel'] });
    pubnub.subscribe({ channels: ['my_channel'] });
    await ready;
    try {
      await observer().publish({ channel: 'my_channel', message: { text: 'after removeListener', run } });
      await eventually(() => assert.equal(kept.length, 1, 'the other listener still receives'), {
        label: 'kept listener receives',
      });
      assert.equal(removedCalls, 0, 'the removed listener object received nothing');
    } finally {
      pubnub.unsubscribeAll();
    }
  });

  it('removeListener effect: a removed listener gets no more events and a kept one does', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const removed: unknown[] = [];
    const kept: unknown[] = [];
    const removable = { message: (m: { message: unknown }) => tagOf(m) === run && removed.push(m) };
    pubnub.addListener(removable);
    pubnub.addListener({ message: (m) => tagOf(m) === run && kept.push(m) });
    const ready = connected(pubnub, { channels: ['my_channel'] });
    pubnub.subscribe({ channels: ['my_channel'] });
    await ready;
    pubnub.removeListener(removable);
    await friend().publish({ channel: 'my_channel', message: { run } });
    await eventually(() => assert.equal(kept.length, 1), { label: 'kept listener got the message' });
    // Proves that something did NOT arrive, so a short fixed wait is the right tool.
    await sleep(500);
    assert.equal(removed.length, 0, 'the removed listener got nothing');
    pubnub.unsubscribeAll();
  });

  it('OLDUnsubscribeBasicUsage: unsubscribe with channels drops that channel', async () => {
    const pubnub = shopper();
    const ready = connected(pubnub, { channels: ['my_channel'] });
    pubnub.subscribe({ channels: ['my_channel'] });
    await ready;
    assert.deepEqual(pubnub.getSubscribedChannels(), ['my_channel']);

    // snippet.OLDUnsubscribeBasicUsage
    pubnub.unsubscribe({
      channels: ['my_channel'],
    });
    // snippet.end

    await eventually(() => assert.deepEqual(pubnub.getSubscribedChannels(), []), { label: 'channel dropped' });
  });

  it('OLDUnsubscribeMultipleChannels: unsubscribing three of four channels leaves exactly the fourth', async () => {
    const pubnub = shopper();
    const channels = ['chan1', 'chan2', 'chan3', 'ch1'];
    const ready = connected(pubnub, { channels });
    pubnub.subscribe({ channels });
    await ready;

    // snippet.OLDUnsubscribeMultipleChannels
    pubnub.unsubscribe({
      channels: ['chan1', 'chan2', 'chan3'],
    });
    // snippet.end

    // Only the channel that the sample did not name stays subscribed.
    await eventually(() => assert.deepEqual(pubnub.getSubscribedChannels(), ['ch1']), {
      label: 'three channels dropped',
    });
    pubnub.unsubscribeAll();
  });

  it('OLDUnsubscribeMultipleChannelGroup: unsubscribing two of three groups leaves exactly the third', async () => {
    const pubnub = shopper();
    const groups = ['demo_group1', 'demo_group2', 'family'];
    const ready = connected(pubnub, { channelGroups: groups });
    pubnub.subscribe({ channelGroups: groups });
    await ready;

    // snippet.OLDUnsubscribeMultipleChannelGroup
    pubnub.unsubscribe({
      channelGroups: ['demo_group1', 'demo_group2'],
    });
    // snippet.end

    await eventually(() => assert.deepEqual(pubnub.getSubscribedChannelGroups(), ['family']), {
      label: 'two groups dropped',
    });
    pubnub.unsubscribeAll();
  });

  it('OLDUnsubscribeAllBasicUsage: unsubscribeAll clears all channels and groups', async () => {
    const pubnub = shopper();
    const channels = ['ch1', 'ch2'];
    const ready = connected(pubnub, { channels, channelGroups: ['family'] });
    pubnub.subscribe({ channels, channelGroups: ['family'] });
    await ready;
    const disconnected = expectStatus(pubnub, ['PNDisconnectedCategory']);

    // snippet.OLDUnsubscribeAllBasicUsage
    pubnub.unsubscribeAll();
    // snippet.end

    await eventually(
      () => {
        assert.deepEqual(pubnub.getSubscribedChannels(), []);
        assert.deepEqual(pubnub.getSubscribedChannelGroups(), []);
      },
      { label: 'everything dropped' },
    );
    void disconnected.catch(() => undefined);
  });
});
