import assert from '../harness/assert.js';
import { page, step, check } from '../harness/step.js';
import { assertAll, connected, eventually, expectEvent, PRESENCE_EVENT_TIMEOUT } from '../harness/wait.js';

/**
 * Subscribe examples, without the DataSync examples, which are in the DataSync examples file.
 */
export default page('api-reference/subscribe', 'P4', (world) => {
  // Subscription state lists have no guaranteed order.
  const sorted = (values: string[]): string[] => [...values].sort();
  const hasLine = (lines: string[], prefix: string): boolean => lines.some((line) => line.startsWith(prefix));

  // Gives `channelGroup_1` one member channel, because three samples subscribe to it. A group without channels carries no messages.
  // Channel group `channelGroup_1` is subscribed by three samples. Give it one member channel.
  check('subscribeGroupFixture', { phase: 'P3', proves: 'Fixture: channelGroup_1 has a member channel so that group subscriptions carry messages.' }, async () => {
    const group = world.n('channelGroup_1');
    const member = world.n('channelGroup_1_member');
    await world.friend.channelGroups.addChannels({ channelGroup: group, channels: [member] });
    await eventually(async () => {
      const listed = await world.observer.channelGroups.listChannels({ channelGroup: group });
      assert.deepEqual(listed.channels, [member]);
    }, { label: 'channelGroup_1 has its member' });
  });

  step('createChannelBasicUsage', { proves: 'The channel entity factory returns the run channel name and does not subscribe.' }, () => {
    const pubnub = world.shopper;
    // snippet.createChannelBasicUsage
    const channel = pubnub.channel('my_channel');
    // snippet.end
    assert.equal(channel.name, world.n('my_channel'));
    assert.deepEqual(pubnub.getSubscribedChannels(), [], 'creating an entity does not subscribe');
  });

  step('createChannelGroupBasicUsage', { proves: 'The channel group entity carries the run group name.' }, () => {
    const pubnub = world.shopper;
    // snippet.createChannelGroupBasicUsage
    // Initialize PubNub with demo keys
    const channelGroup = pubnub.channelGroup('channelGroup_1');
    // snippet.end
    assert.equal(channelGroup.name, world.n('channelGroup_1'));
  });

  step('createChannelMetadataBasicUsage', { proves: 'The channel metadata entity carries the run id and makes no network call.' }, () => {
    const pubnub = world.shopper;
    // snippet.createChannelMetadataBasicUsage
    // Initialize PubNub with demo keys

    const channelMetadata = pubnub.channelMetadata('channel_1');
    // snippet.end
    assert.equal(channelMetadata.id, world.n('channel_1'));
  });

  step('createUserMetadataBasicUsage', { proves: 'The user metadata entity carries the run id and makes no network call.' }, () => {
    const pubnub = world.shopper;
    // snippet.createUserMetadataBasicUsage
    // Initialize PubNub with demo keys

    const userMetadata = pubnub.userMetadata('user_meta1');
    // snippet.end
    assert.equal(userMetadata.id, world.n('user_meta1'));
  });

  step('createSubscription', { proves: 'Creating a subscription object does not subscribe anything.' }, () => {
    const pubnub = world.fresh('createsub');
    // snippet.createSubscription
    const channel = pubnub.channel('my_channel');

    const subscriptionOptions = { receivePresenceEvents: true };
    channel.subscription(subscriptionOptions);
    // snippet.end
    // Creating a subscription object does not subscribe.
    assert.deepEqual(pubnub.getSubscribedChannels(), []);
  });

  step('subscriptionSetSubscribeBasicUsage', { proves: 'Subscribing a set connects both channels and delivers a message from a friend.' }, async () => {
    const pubnub = world.fresh('setsubscribe');
    const [ch1, ch2] = [world.n('ch1'), world.n('ch2')];
    const ready = connected(pubnub, { channels: [ch1, ch2] });
    const received = expectEvent(pubnub, 'message', (m) => m.channel === ch1 && (m.message as { via?: string }).via === 'set');

    // snippet.subscriptionSetSubscribeBasicUsage
    const channelsSubscriptionSet = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });
    channelsSubscriptionSet.subscribe();
    // snippet.end

    await ready;
    assert.deepEqual(sorted(pubnub.getSubscribedChannels()), sorted([ch1, ch2]));
    await world.friend.publish({ channel: ch1, message: { via: 'set' } });
    await received;
    channelsSubscriptionSet.unsubscribe();
  });

  step('eventListenerAddListeners', { proves: 'The message, signal and message action handlers of the sample log when the events arrive.' }, async () => {
    const pubnub = world.fresh('addlisteners');
    const channelName = world.n('channel_1');
    await world.withConsole(async (logs) => {
      // snippet.eventListenerAddListeners

      // create a subscription from a channel entity
      const channel = pubnub.channel('channel_1');
      const subscription = channel.subscription();

      // Event-specific listeners
      subscription.onMessage = (message) => {
        console.log('Message event: ', message);
      };
      subscription.onPresence = (presence) => {
        console.log('Presence event: ', presence);
      };
      subscription.onSignal = (signal) => {
        console.log('Signal event: ', signal);
      };
      subscription.onObjects = (objectsEvent) => {
        console.log('Objects event: ', objectsEvent);
      };
      subscription.onMessageAction = (messageActionEvent) => {
        console.log('Message Reaction event: ', messageActionEvent);
      };
      subscription.onFile = (fileEvent) => {
        console.log('File event: ', fileEvent);
      };

      // Generic listeners
      subscription.addListener({
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
          const channel = objectEvent.channel; // channel Id or a User Id of updated/set app context metadata object
          const channelGroup = objectEvent.subscription; // Channel group
          const timetoken = objectEvent.timetoken; // Event timetoken
          const event = objectEvent.message.data.type; // Event name
        },
        // Message Actions
        messageAction: function (ma) {
          const channelName = ma.channel; // Channel to which the message belongs
          const publisher = ma.data.uuid; // Message publisher
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
        },
      });

      // snippet.end

      const ready = connected(pubnub, { channels: [channelName] });
      subscription.subscribe();
      await ready;
      const published = await world.friend.publish({ channel: channelName, message: { n: 1 } });
      await world.friend.signal({ channel: channelName, message: 'ping' });
      await world.friend.addMessageAction({
        channel: channelName,
        messageTimetoken: published.timetoken,
        action: { type: 'reaction', value: 'smiley_face' },
      });
      await eventually(() => assertAll({
        'onMessage ran': hasLine(logs.lines, 'Message event: '),
        'onSignal ran': hasLine(logs.lines, 'Signal event: '),
        'onMessageAction ran': hasLine(logs.lines, 'Message Reaction event: '),
      }), { label: 'event-specific listeners ran' });
      subscription.unsubscribe();
    });
  });

  step('eventListenerBasicUsage', { needs: ['preflightPresence'], timeout: 60_000, proves: 'Status, message, presence and set level message action listeners all fire from one sample.' }, async () => {
    const pubnub = world.fresh('listenerbasic');
    const [c1, ch1, ch2] = [world.n('channel_1'), world.n('ch1'), world.n('ch2')];
    await world.withConsole(async (logs) => {
      const ready = connected(pubnub, { channels: [c1, ch1, ch2] });

      // snippet.eventListenerBasicUsage
      // create a subscription from a channel entity
      const channel = pubnub.channel('channel_1');
      const subscription1 = channel.subscription({ receivePresenceEvents: true });

      // create a subscription set with multiple channels
      const subscriptionSet1 = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });

      // add a status listener
      pubnub.addListener({
        status: (s) => {
          console.log('Status', s.category);
        },
      });

      // add message and presence listeners
      subscription1.addListener({
        // Messages
        message: (m) => {
          console.log('Received message', m);
        },
        // Presence
        presence: (p) => {
          console.log('Presence event', p);
        },
      });

      // add event-specific message actions listener
      subscriptionSet1.onMessageAction = (p) => {
        console.log('Message action event:', p);
      };

      subscription1.subscribe();
      subscriptionSet1.subscribe();
      // snippet.end

      await ready;
      const joiner = world.fresh('listenerbasicjoiner');
      const joinerReady = connected(joiner, { channels: [c1] });
      joiner.subscribe({ channels: [c1] });
      await joinerReady;
      const onChannel = await world.friend.publish({ channel: c1, message: { n: 1 } });
      const onSet = await world.friend.publish({ channel: ch1, message: { n: 2 } });
      await world.friend.addMessageAction({
        channel: ch1,
        messageTimetoken: onSet.timetoken,
        action: { type: 'reaction', value: 'smiley_face' },
      });
      assert.ok(onChannel.timetoken);
      // One error that lists every handler that has not logged yet, not only the first one.
      await eventually(() => assertAll({
        'status listener saw the connection': hasLine(logs.lines, 'Status PNConnectedCategory'),
        'subscription message listener ran': hasLine(logs.lines, 'Received message'),
        'presence listener saw a presence event (the joiner)': hasLine(logs.lines, 'Presence event'),
        'subscription set message action listener ran': hasLine(logs.lines, 'Message action event:'),
      }), { label: 'listeners from the snippet ran', timeout: PRESENCE_EVENT_TIMEOUT });
      joiner.unsubscribeAll();
      subscription1.unsubscribe();
      subscriptionSet1.unsubscribe();
    });
  });

  step('eventListenerAddConnectionStatusListenersBasicUsage', { proves: 'The status listener fires PNConnectedCategory.' }, async () => {
    const pubnub = world.fresh('statuslistener');
    await world.withConsole(async (logs) => {
      // snippet.eventListenerAddConnectionStatusListenersBasicUsage
      // add a status listener
      pubnub.addListener({
        status: (s) => {
          console.log('Status', s.category);
        },
      });
      // snippet.end

      const subscription = pubnub.channel(world.n('ch1')).subscription();
      subscription.subscribe();
      await eventually(() => assert.ok(hasLine(logs.lines, 'Status PNConnectedCategory')), { label: 'connected status logged' });
      subscription.unsubscribe();
    });
  });

  step('unsubscribeBasicUsage', { proves: 'Unsubscribing a subscription and a set leaves nothing subscribed.' }, async () => {
    const pubnub = world.fresh('unsubscribe');
    // snippet.unsubscribeBasicUsage
    // create a subscription from a channel entity
    const channel1 = pubnub.channel('channel_1');
    const subscription1 = channel1.subscription({ receivePresenceEvents: true });

    // create a subscription set with multiple channels
    const subscriptionSet1 = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });

    subscription1.subscribe();
    subscriptionSet1.subscribe();

    subscription1.unsubscribe();
    subscriptionSet1.unsubscribe();
    // snippet.end
    await eventually(() => assert.deepEqual(pubnub.getSubscribedChannels(), []), { label: 'nothing left subscribed' });
  });

  step('unsubscribeAllBasicUsage', { needs: ['subscribeGroupFixture'], proves: 'unsubscribeAll clears channels and groups.' }, async () => {
    const pubnub = world.fresh('unsubscribeall');
    // snippet.unsubscribeAllBasicUsage
    // create a subscription set with multiple channels
    const subscriptionSet = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });
    subscriptionSet.subscribe();

    // create a subscription from a channel entity
    const channelGroup1 = pubnub.channelGroup('channelGroup_1');
    const groupSubscription1 = channelGroup1.subscription({ receivePresenceEvents: true });
    groupSubscription1.subscribe();

    // unsubscribe all active subscriptions
    pubnub.unsubscribeAll();
    // snippet.end
    await eventually(() => {
      assert.deepEqual(pubnub.getSubscribedChannels(), []);
      assert.deepEqual(pubnub.getSubscribedChannelGroups(), []);
    }, { label: 'unsubscribeAll clears channels and groups' });
  });

  step('subscriptionSetFrom2IndividualSubscriptions', { needs: ['subscribeGroupFixture'], proves: 'addSubscription and removeSubscription change the set before subscribing.' }, async () => {
    const pubnub = world.fresh('setfromsubs');
    const [c1, c3, group] = [world.n('channel_1'), world.n('channel_3'), world.n('channelGroup_1')];
    const ready = connected(pubnub, { channels: [c1], channelGroups: [group] });

    // snippet.subscriptionSetFrom2IndividualSubscriptions
    // create a subscription from a channel entity
    const channel = pubnub.channel('channel_1');
    const subscription1 = channel.subscription({ receivePresenceEvents: true });

    // create a subscription from a channel group entity
    const channelGroup = pubnub.channelGroup('channelGroup_1');
    const subscription2 = channelGroup.subscription();

    // add 2 subscriptions to create a subscription set
    const subscriptionSet = subscription1.addSubscription(subscription2);

    // add another subscription to the set
    const subscription3 = pubnub.channel('channel_3').subscription({ receivePresenceEvents: false });
    subscriptionSet.addSubscription(subscription3);

    // remove a subscription from a subscription set
    subscriptionSet.removeSubscription(subscription3);

    subscriptionSet.subscribe();
    // snippet.end

    await ready;
    const channels = pubnub.getSubscribedChannels();
    assert.ok(channels.includes(c1), 'channel_1 is subscribed');
    assert.ok(!channels.includes(c3), 'channel_3 was removed before subscribing');
    assert.ok(pubnub.getSubscribedChannelGroups().includes(group), 'channelGroup_1 is subscribed');
    pubnub.unsubscribeAll();
  });

  step('SubscriptionSetFrom2Sets', { proves: 'addSubscriptionSet and removeSubscriptionSet are local operations and subscribe nothing.' }, () => {
    const pubnub = world.fresh('setfromsets');
    // snippet.SubscriptionSetFrom2Sets
    // create a subscription set with multiple channels
    const subscriptionSet1 = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });

    // create another subscription set with multiple channels and options
    const subscriptionSet2 = pubnub.subscriptionSet({
      channels: ['ch3', 'ch4'],
      subscriptionOptions: { receivePresenceEvents: true },
    });

    // add a subscription set to another subscription set
    subscriptionSet1.addSubscriptionSet(subscriptionSet2);

    // remove a subscription set from another subscription set
    subscriptionSet1.removeSubscriptionSet(subscriptionSet2);
    // snippet.end
    // Nothing subscribed, and the first set is back to its own two channels.
    assert.deepEqual(pubnub.getSubscribedChannels(), []);
    assert.deepEqual(sorted(subscriptionSet1.channels), sorted([world.n('ch1'), world.n('ch2')]));
  });

  step('AddToExistingSubscriptionSet', { needs: ['subscribeGroupFixture'], proves: 'Adding sets and subscriptions to an already subscribed set takes effect at once.' }, async () => {
    const pubnub = world.fresh('addtoset');
    const [ch1, ch2, ch3, ch4] = ['ch1', 'ch2', 'ch3', 'ch4'].map((c) => world.n(c));
    const [group, member] = [world.n('channelGroup_1'), world.n('channelGroup_1_member')];
    const ready = connected(pubnub, { channels: [ch1, ch2, ch3, ch4], channelGroups: [group] });
    const onLateChannel = expectEvent(pubnub, 'message', (m) => m.channel === ch4 && (m.message as { n?: number }).n === 4);
    const onGroup = expectEvent(pubnub, 'message', (m) => m.channel === member && m.subscription === group);

    // snippet.AddToExistingSubscriptionSet
    // create a subscription set with multiple channels
    const subscriptionSet1 = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });

    // subscribe to the set
    // start receiving events from ch1 and ch2
    subscriptionSet1.subscribe();

    // create another subscription set with multiple channels
    const subscriptionSet2 = pubnub.subscriptionSet({ channels: ['ch3', 'ch4'] });

    // add the new set to the initial set
    subscriptionSet1.addSubscriptionSet(subscriptionSet2);

    // you're now receiving events from ch1, ch2, ch3, and ch4
    // because the set has been subscribed to previously

    // create and add another subscription to the set
    const channelGroup = pubnub.channelGroup('channelGroup_1');
    const subscription2 = channelGroup.subscription();
    subscriptionSet1.addSubscription(subscription2);

    // you're now receiving events from ch1, ch2, ch3, and ch4 and channelGroup_1
    // snippet.end

    await ready;
    await world.friend.publish({ channel: ch4, message: { n: 4 } });
    await world.friend.publish({ channel: member, message: { n: 5 } });
    await onLateChannel;
    await onGroup;
    subscriptionSet1.unsubscribe();
  });
});
