import assert from '../harness/assert.js';
import { page, step, check } from '../harness/step.js';
import { recorder } from '../harness/recorder.js';
import { connected, eventually, expectEvent, expectStatus, KindLog, PRESENCE_EVENT_TIMEOUT, sleep } from '../harness/wait.js';

/**
 * Examples for the older `pubnub.subscribe()`, `pubnub.unsubscribe()` and `pubnub.unsubscribeAll()` methods.
 */
export default page('api-reference/subscribe-legacy', 'P8', (world) => {
  const tag = (m: { message: unknown }): string | undefined => (m.message as { legacy?: string }).legacy;
  // Subscription state lists have no guaranteed order.
  const sorted = (values: string[]): string[] => [...values].sort();

  /** The groups the samples subscribe to, each with one member channel. The groups must exist and hold a channel to carry messages. */
  // The groups the samples subscribe to, each with one member channel. Groups must hold a channel to carry messages.
  const GROUPS = ['my_channelGroup', 'family', 'my_channelGroup1', 'my_channelGroup2', 'my_channelGroup3', 'demo_group1', 'demo_group2'];
  const member = (group: string): string => `${world.n(group)}_member`;

  // Creates every group above with its member channel.
  check('legacyGroupsFixture', { phase: 'P3', proves: 'Fixture: every channel group of the legacy subscribe page exists with a member channel.' }, async () => {
    for (const group of GROUPS) {
      await world.friend.channelGroups.addChannels({ channelGroup: world.n(group), channels: [member(group)] });
    }
    await eventually(async () => {
      for (const group of GROUPS) {
        const listed = await world.observer.channelGroups.listChannels({ channelGroup: world.n(group) });
        assert.deepEqual(listed.channels, [member(group)], `${group} lists its member`);
      }
    }, { label: 'legacy groups have their members' });
  });

  step('OLDsubscribeBasicUsage', { proves: 'The legacy subscribe call connects and delivers a message.' }, async () => {
    const pubnub = world.fresh('oldsub');
    const channel = world.n('my_channel');
    const ready = connected(pubnub, { channels: [channel] });
    const received = expectEvent(pubnub, 'message', (m) => tag(m) === 'basic' && m.channel === channel);

    // snippet.OLDsubscribeBasicUsage
    pubnub.subscribe({
      channels: ['my_channel'],
    });
    // snippet.end

    await ready;
    assert.deepEqual(pubnub.getSubscribedChannels(), [channel]);
    await world.friend.publish({ channel, message: { legacy: 'basic' } });
    await received;
    pubnub.unsubscribeAll();
  });

  step('OLDsubscribeMultipleChannels', { proves: 'One legacy subscribe call covers three channels, shown by a message on the middle one.' }, async () => {
    const pubnub = world.fresh('oldmulti');
    const channels = ['my_channel_1', 'my_channel_2', 'my_channel_3'].map((c) => world.n(c));
    const ready = connected(pubnub, { channels });
    const received = expectEvent(pubnub, 'message', (m) => tag(m) === 'multi' && m.channel === channels[1]);

    // snippet.OLDsubscribeMultipleChannels
    pubnub.subscribe({
      channels: ['my_channel_1', 'my_channel_2', 'my_channel_3'],
    });
    // snippet.end

    await ready;
    assert.deepEqual(sorted(pubnub.getSubscribedChannels()), sorted(channels));
    await world.friend.publish({ channel: channels[1], message: { legacy: 'multi' } });
    await received;
    pubnub.unsubscribeAll();
  });

  step('OLDsubscribeWithPresence', { needs: ['preflightPresence'], proves: 'withPresence true produces the own join event with the fields the page table lists.' }, async () => {
    const pubnub = world.fresh('oldpresence');
    const channel = world.n('my_channel');
    const ready = connected(pubnub, { channels: [channel] });
    const joined = expectEvent(pubnub, 'presence', (p) => p.action === 'join' && p.channel === channel && p.uuid === pubnub.getUserId());

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

  step('OLDsubscribeWithWildCardChannels', { proves: 'A wildcard subscription receives a message on a matching channel.' }, async () => {
    const pubnub = world.fresh('oldwild');
    const root = world.n('ab.*');
    const actual = root.replace('.*', '.news');
    const ready = connected(pubnub, { channels: [root] });
    const received = expectEvent(pubnub, 'message', (m) => tag(m) === 'wild' && m.channel === actual);

    // snippet.OLDsubscribeWithWildCardChannels
    pubnub.subscribe({
      channels: ['ab.*'],
    });
    // snippet.end

    await ready;
    await world.friend.publish({ channel: actual, message: { legacy: 'wild' } });
    const message = await received;
    // The wildcard match is reported as the subscription.
    assert.equal(message.subscription, root);
    pubnub.unsubscribeAll();
  });

  step('OLDsubscribeWithState', { needs: ['preflightPresence'], timeout: 60_000, proves: 'The connected status handler can set state, and the observer reads it back per channel.' }, async () => {
    const pubnub = world.fresh('oldstate');
    const channels = ['ch1', 'ch2', 'ch3'].map((c) => world.n(c));
    const ready = connected(pubnub, { channels });

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
    await eventually(async () => {
      // One channel per call: with several channels getState nests the result one level deeper (docs finding).
      for (const channel of channels) {
        const state = await world.observer.getState({ uuid: pubnub.getUserId(), channels: [channel] });
        assert.deepEqual(state.channels[channel], { some: 'state' }, `state on ${channel}`);
      }
    }, { timeout: 30_000, label: 'state set from the connected status handler' });
    pubnub.unsubscribeAll();
  });

  step('OLDsubscribeChannelGroup', { needs: ['legacyGroupsFixture'], proves: 'Subscribing to a channel group delivers a message from its member channel.' }, async () => {
    const pubnub = world.fresh('oldgroup');
    const group = world.n('my_channelGroup');
    const ready = connected(pubnub, { channelGroups: [group] });
    const received = expectEvent(pubnub, 'message', (m) => tag(m) === 'group' && m.subscription === group);

    // snippet.OLDsubscribeChannelGroup
    pubnub.subscribe({
      channelGroups: ['my_channelGroup'],
    });
    // snippet.end

    await ready;
    assert.deepEqual(pubnub.getSubscribedChannelGroups(), [group]);
    await world.friend.publish({ channel: member('my_channelGroup'), message: { legacy: 'group' } });
    const message = await received;
    assert.equal(message.channel, member('my_channelGroup'));
    pubnub.unsubscribeAll();
  });

  step('OLDsubscribeChannelGroupWithPresence', { needs: ['legacyGroupsFixture', 'preflightPresence'], timeout: 60_000, proves: 'A group subscription with presence yields a join event that belongs to the group.' }, async () => {
    const pubnub = world.fresh('oldgrouppresence');
    const group = world.n('family');
    const ready = connected(pubnub, { channelGroups: [group] });
    const joined = expectEvent(pubnub, 'presence', (p) => p.action === 'join' && p.uuid === pubnub.getUserId());

    // snippet.OLDsubscribeChannelGroupWithPresence
    pubnub.subscribe({
      channelGroups: ['family'],
      withPresence: true,
    });
    // snippet.end

    await ready;
    const event = await joined;
    assert.ok(event.channel === member('family') || event.subscription === group, `presence event belongs to the group (channel ${event.channel}, subscription ${event.subscription})`);
    pubnub.unsubscribeAll();
  });

  step('OLDsubscribeMultipleChannelGroup', { needs: ['legacyGroupsFixture'], proves: 'One call subscribes to three groups, shown by a message through the last group.' }, async () => {
    const pubnub = world.fresh('oldgroups');
    const groups = ['my_channelGroup1', 'my_channelGroup2', 'my_channelGroup3'].map((g) => world.n(g));
    const ready = connected(pubnub, { channelGroups: groups });
    const received = expectEvent(pubnub, 'message', (m) => tag(m) === 'groups' && m.subscription === groups[2]);

    // snippet.OLDsubscribeMultipleChannelGroup
    pubnub.subscribe({
      channelGroups: ['my_channelGroup1', 'my_channelGroup2', 'my_channelGroup3'],
    });
    // snippet.end

    await ready;
    assert.deepEqual(sorted(pubnub.getSubscribedChannelGroups()), sorted(groups));
    await world.friend.publish({ channel: member('my_channelGroup3'), message: { legacy: 'groups' } });
    await received;
    pubnub.unsubscribeAll();
  });

  step('OLDsubscribeChannelGroupAndChannels', { needs: ['legacyGroupsFixture'], proves: 'Channels and groups can be mixed in one call, shown by a message through each.' }, async () => {
    const pubnub = world.fresh('oldmixed');
    const [channel, group] = [world.n('my_channel'), world.n('my_channelGroup')];
    const ready = connected(pubnub, { channels: [channel], channelGroups: [group] });
    const onChannel = expectEvent(pubnub, 'message', (m) => tag(m) === 'mixed-channel' && m.channel === channel);
    const onGroup = expectEvent(pubnub, 'message', (m) => tag(m) === 'mixed-group' && m.subscription === group);

    // snippet.OLDsubscribeChannelGroupAndChannels
    pubnub.subscribe({
      channels: ['my_channel'],
      channelGroups: ['my_channelGroup'],
    });
    // snippet.end

    await ready;
    await world.friend.publish({ channel, message: { legacy: 'mixed-channel' } });
    await world.friend.publish({ channel: member('my_channelGroup'), message: { legacy: 'mixed-group' } });
    await onChannel;
    await onGroup;
    pubnub.unsubscribeAll();
  });

  step('OLDaddListeners', { needs: ['preflightPresence'], timeout: 90_000, proves: 'The legacy listener sample handlers see status, message and presence events whose fields exist on live events.' }, async () => {
    const pubnub = world.fresh('oldlisteners');
    const joiner = world.fresh('oldlistenersjoiner');
    const channel = world.n('legacy_listeners_channel');
    const log = new KindLog(['message', 'presence', 'signal', 'objects', 'messageAction', 'status'], {
      message: (m) => (m.message as { legacy?: string }).legacy === 'listeners',
      presence: (p) => p.action === 'join' && p.uuid === joiner.getUserId(),
      signal: (s) => s.message === 'ping',
      objects: (o) => o.message?.event === 'set' && o.message?.data?.id === channel,
      messageAction: (a) => a.event === 'added',
    });
    const seen = Object.fromEntries(log.kinds.map((kind) => [kind, log.of(kind)])) as Record<string, any[]>;
    pubnub.addListener({
      message: log.on('message'),
      presence: log.on('presence'),
      signal: log.on('signal'),
      objects: log.on('objects'),
      messageAction: log.on('messageAction'),
      status: log.on('status'),
    });

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

    const ready = connected(pubnub, { channels: [channel] });
    pubnub.subscribe({ channels: [channel], withPresence: true });
    await ready;
    // The second client joins only after the first one is connected, so its join is published after the first client's
    // subscribe loop is running and must reach it.
    const joinerReady = connected(joiner, { channels: [channel] });
    joiner.subscribe({ channels: [channel] });
    await joinerReady;
    const published = await world.friend.publish({ channel, message: { legacy: 'listeners' } });
    await world.friend.signal({ channel, message: 'ping' });
    await world.friend.addMessageAction({ channel, messageTimetoken: published.timetoken, action: { type: 'reaction', value: 'smiley_face' } });
    await world.friend.objects.setChannelMetadata({ channel, data: { name: 'legacy listeners' } });
    // On timeout the error names the kinds that arrived (with counts and times) and the ones still missing, and adds what
    // the service reports for the channel, so a missing presence event can be told from a client that is not subscribed.
    try {
      await eventually(() => log.assertArrived(['message', 'presence', 'signal', 'objects', 'messageAction']), { timeout: PRESENCE_EVENT_TIMEOUT, label: 'every event kind arrived' });
    } catch (error) {
      const here = await world.observer.hereNow({ channels: [channel] }).then((r) => `hereNow occupancy ${r.channels[channel]?.occupancy ?? 0}`, (e) => `hereNow failed: ${(e as Error).message}`);
      throw new Error(`${(error as Error).message}. ${here}. All presence events seen: ${seen.presence.map((p) => `${p.action} ${p.uuid}`).join(', ') || 'none'}`);
    }
    // Keep the arrival times in the report: they show how late the slowest kind was.
    recorder.record({ kind: 'event', label: `event kinds: ${log.summary()}`, ok: true });
    // The joiner leaves and the leave event must follow. Same wait, same reasoning.
    joiner.unsubscribeAll();
    await eventually(() => assert.ok(seen.presence.some((p) => p.action === 'leave' && p.uuid === joiner.getUserId()), `the joiner's leave event arrived. Presence events seen: ${seen.presence.map((p) => `${p.action} ${p.uuid}`).join(', ')}`), { timeout: PRESENCE_EVENT_TIMEOUT, label: 'leave event arrived' });
    // The own join is not asserted: whether it is delivered depends on where the join falls against the first subscribe timetoken.
    // Recording it keeps the question open in the report instead of hiding it.
    recorder.record({ kind: 'event', label: `own join event ${seen.presence.some((p) => p.action === 'join' && p.uuid === pubnub.getUserId()) ? 'was' : 'was NOT'} delivered to the subscribing client (not asserted)`, ok: true });

    const [message] = seen.message;
    assert.equal(message.channel, channel);
    assert.equal(message.publisher, world.friend.getUserId());
    assert.ok(message.timetoken);
    const [presence] = log.matching('presence');
    assert.equal(presence.channel, channel);
    assert.equal(typeof presence.occupancy, 'number');
    assert.ok(presence.timestamp, 'presence timestamp');
    assert.ok(presence.timetoken, 'presence timetoken');
    assert.equal(presence.uuid, joiner.getUserId());
    const leave = seen.presence.find((p) => p.action === 'leave' && p.uuid === joiner.getUserId())!;
    assert.equal(typeof leave.occupancy, 'number');
    const [signal] = seen.signal;
    assert.equal(signal.publisher, world.friend.getUserId());
    const [objectEvent] = seen.objects;
    assert.equal(objectEvent.message.event, 'set');
    assert.equal(objectEvent.message.type, 'channel');
    assert.equal(objectEvent.message.data.id, channel);
    // The old sample read event, type, data and publisher from the event itself. They are under message, and objects events have no publisher.
    assert.equal(objectEvent.event, undefined);
    assert.equal(objectEvent.publisher, undefined);
    const [action] = seen.messageAction;
    assert.equal(action.event, 'added');
    assert.equal(action.data.type, 'reaction');
    assert.equal(action.data.value, 'smiley_face');
    assert.equal(action.data.messageTimetoken, published.timetoken);
    assert.ok(action.data.actionTimetoken);
    assert.ok(action.publisher, 'message action publisher (the docs read ma.publisher)');
    const connectedStatus = seen.status.find((s) => s.category === 'PNConnectedCategory');
    assert.ok(connectedStatus, 'connected status');
    assert.equal(connectedStatus.operation, 'PNSubscribeOperation');
    // The new-subscription-loop status carries neither lastTimetoken nor subscribedChannels, see legacyStatusFieldsByEventEngine.
    assert.ok(connectedStatus.affectedChannels.includes(channel));
    assert.ok(connectedStatus.currentTimetoken);
    pubnub.unsubscribeAll();
    await world.friend.objects.removeChannelMetadata({ channel });
  });

  check('legacyStatusFieldsByEventEngine', { proves: 'lastTimetoken and subscribedChannels are set on the status only by the legacy subscription manager.' }, async () => {
    const channel = world.n('my_channel');
    for (const enableEventEngine of [true, false]) {
      const pubnub = world.fresh(`oldstatus-${enableEventEngine}`, { enableEventEngine });
      const statuses: Array<Record<string, unknown>> = [];
      pubnub.addListener({ status: (s) => statuses.push(s as unknown as Record<string, unknown>) });
      pubnub.subscribe({ channels: [channel] });
      await eventually(() => assert.ok(statuses.some((s) => s.category === 'PNConnectedCategory')), { label: 'connected' });
      const status = statuses.find((s) => s.category === 'PNConnectedCategory')!;
      assert.equal(status.operation, 'PNSubscribeOperation');
      assert.deepEqual(status.affectedChannels, [channel]);
      assert.ok(status.currentTimetoken, 'currentTimetoken');
      assert.equal('lastTimetoken' in status, !enableEventEngine, `lastTimetoken is present only with enableEventEngine: false (enableEventEngine ${enableEventEngine})`);
      assert.equal('subscribedChannels' in status, !enableEventEngine, `subscribedChannels is present only with enableEventEngine: false (enableEventEngine ${enableEventEngine})`);
      pubnub.unsubscribeAll();
    }
  });

  step('OLDremoveListeners', { timeout: 45_000, proves: 'removeListener leaves the other listeners of the client working, and the removed object receives nothing.' }, async () => {
    const pubnub = world.fresh('oldremove');
    const channel = world.n('my_channel');
    const kept: unknown[] = [];
    pubnub.addListener({ message: (m) => kept.push(m) });

    // snippet.OLDremoveListeners
    var existingListener = {
      message: function () {
      },
    };

    pubnub.removeListener(existingListener);
    // snippet.end
    const removedCalls = world.spy(existingListener, 'message');
    const ready = connected(pubnub, { channels: [channel] });
    pubnub.subscribe({ channels: [channel] });
    await ready;
    try {
      await world.observer.publish({ channel, message: { text: 'after removeListener' } });
      await eventually(() => assert.equal(kept.length, 1, 'the other listener still receives'), { label: 'kept listener receives' });
      assert.equal(removedCalls.calls.length, 0, 'the removed listener object received nothing');
    } finally {
      pubnub.unsubscribeAll();
    }
  });

  // Effect of removeListener: a removed listener gets no more events, a kept one does.
  check('legacyRemoveListenerStopsDelivery', { proves: 'A removed listener gets no more events and a kept one does.' }, async () => {
    const pubnub = world.fresh('oldremoveeffect');
    const channel = world.n('my_channel');
    const removed: unknown[] = [];
    const kept: unknown[] = [];
    const removable = { message: (m: unknown) => removed.push(m) };
    pubnub.addListener(removable);
    pubnub.addListener({ message: (m) => kept.push(m) });
    const ready = connected(pubnub, { channels: [channel] });
    pubnub.subscribe({ channels: [channel] });
    await ready;
    pubnub.removeListener(removable);
    await world.friend.publish({ channel, message: { legacy: 'after-remove' } });
    await eventually(() => assert.equal(kept.length, 1), { label: 'kept listener got the message' });
    await sleep(500);
    assert.equal(removed.length, 0, 'the removed listener got nothing');
    pubnub.unsubscribeAll();
  });

  step('OLDUnsubscribeBasicUsage', { proves: 'unsubscribe with channels drops that channel.' }, async () => {
    const pubnub = world.fresh('oldunsub');
    const channel = world.n('my_channel');
    const ready = connected(pubnub, { channels: [channel] });
    pubnub.subscribe({ channels: ['my_channel'].map((c) => world.n(c)) });
    await ready;
    assert.deepEqual(pubnub.getSubscribedChannels(), [channel]);

    // snippet.OLDUnsubscribeBasicUsage
    pubnub.unsubscribe({
      channels: ['my_channel'],
    });
    // snippet.end

    await eventually(() => assert.deepEqual(pubnub.getSubscribedChannels(), []), { label: 'channel dropped' });
  });

  step('OLDUnsubscribeMultipleChannels', { proves: 'Unsubscribing three of four channels leaves exactly the fourth.' }, async () => {
    const pubnub = world.fresh('oldunsubmulti');
    const channels = ['chan1', 'chan2', 'chan3', 'ch1'].map((c) => world.n(c));
    const ready = connected(pubnub, { channels });
    pubnub.subscribe({ channels });
    await ready;

    // snippet.OLDUnsubscribeMultipleChannels
    pubnub.unsubscribe({
      channels: ['chan1', 'chan2', 'chan3'],
    });
    // snippet.end

    // Only the channel that the sample did not name stays subscribed.
    await eventually(() => assert.deepEqual(pubnub.getSubscribedChannels(), [world.n('ch1')]), { label: 'three channels dropped' });
    pubnub.unsubscribeAll();
  });

  step('OLDUnsubscribeMultipleChannelGroup', { needs: ['legacyGroupsFixture'], proves: 'Unsubscribing two of three groups leaves exactly the third.' }, async () => {
    const pubnub = world.fresh('oldunsubgroups');
    const groups = ['demo_group1', 'demo_group2', 'family'].map((g) => world.n(g));
    const ready = connected(pubnub, { channelGroups: groups });
    pubnub.subscribe({ channelGroups: groups });
    await ready;

    // snippet.OLDUnsubscribeMultipleChannelGroup
    pubnub.unsubscribe({
      channelGroups: ['demo_group1', 'demo_group2'],
    });
    // snippet.end

    await eventually(() => assert.deepEqual(pubnub.getSubscribedChannelGroups(), [world.n('family')]), { label: 'two groups dropped' });
    pubnub.unsubscribeAll();
  });

  step('OLDUnsubscribeAllBasicUsage', { needs: ['legacyGroupsFixture'], proves: 'unsubscribeAll clears all channels and groups.' }, async () => {
    const pubnub = world.fresh('oldunsuball');
    const channels = ['ch1', 'ch2'].map((c) => world.n(c));
    const group = world.n('family');
    const ready = connected(pubnub, { channels, channelGroups: [group] });
    pubnub.subscribe({ channels, channelGroups: [group] });
    await ready;
    const disconnected = expectStatus(pubnub, ['PNDisconnectedCategory']);

    // snippet.OLDUnsubscribeAllBasicUsage
    pubnub.unsubscribeAll();
    // snippet.end

    await eventually(() => {
      assert.deepEqual(pubnub.getSubscribedChannels(), []);
      assert.deepEqual(pubnub.getSubscribedChannelGroups(), []);
    }, { label: 'everything dropped' });
    void disconnected.catch(() => undefined);
  });
});
