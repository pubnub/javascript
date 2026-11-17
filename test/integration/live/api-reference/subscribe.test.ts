import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient, friend, shopper } from '../support/clients';
import { captureConsole } from '../support/console';
import { connected, eventually, expectEvent, PRESENCE_EVENT_TIMEOUT } from '../support/wait';
import { ensureGroups, memberOf, removeGroupMembers } from '../support/subscribe-groups';
import { sorted } from '../support/util';

/**
 * Subscribe examples, without the DataSync examples.
 * Presence must be on for the open keyset (eventListenerBasicUsage reads join events).
 */
describe('api-reference/subscribe', () => {
  // Subscription state lists have no guaranteed order.
  const hasLine = (lines: string[], prefix: string, containing: string): boolean =>
    lines.some((line) => line.startsWith(prefix) && line.includes(containing));

  // Three samples subscribe to channelGroup_1, and a group without a channel carries no messages.
  before(() => ensureGroups(['channelGroup_1']));
  after(() => removeGroupMembers(['channelGroup_1']));

  it('createChannelBasicUsage: the channel entity factory returns the channel name and does not subscribe', () => {
    const pubnub = shopper();
    // snippet.createChannelBasicUsage
    const channel = pubnub.channel('my_channel');
    // snippet.end
    assert.equal(channel.name, 'my_channel');
    assert.deepEqual(pubnub.getSubscribedChannels(), [], 'creating an entity does not subscribe');
  });

  it('createChannelGroupBasicUsage: the channel group entity carries the group name', () => {
    const pubnub = shopper();
    // snippet.createChannelGroupBasicUsage
    // Initialize PubNub with demo keys
    const channelGroup = pubnub.channelGroup('channelGroup_1');
    // snippet.end
    assert.equal(channelGroup.name, 'channelGroup_1');
  });

  it('createChannelMetadataBasicUsage: the channel metadata entity carries the id and makes no network call', () => {
    const pubnub = shopper();
    // snippet.createChannelMetadataBasicUsage
    // Initialize PubNub with demo keys

    const channelMetadata = pubnub.channelMetadata('channel_1');
    // snippet.end
    assert.equal(channelMetadata.id, 'channel_1');
  });

  it('createUserMetadataBasicUsage: the user metadata entity carries the id and makes no network call', () => {
    const pubnub = shopper();
    // snippet.createUserMetadataBasicUsage
    // Initialize PubNub with demo keys

    const userMetadata = pubnub.userMetadata('user_meta1');
    // snippet.end
    assert.equal(userMetadata.id, 'user_meta1');
  });

  it('createSubscription: creating a subscription object does not subscribe anything', () => {
    const pubnub = shopper();
    // snippet.createSubscription
    const channel = pubnub.channel('my_channel');

    const subscriptionOptions = { receivePresenceEvents: true };
    channel.subscription(subscriptionOptions);
    // snippet.end
    // Creating a subscription object does not subscribe.
    assert.deepEqual(pubnub.getSubscribedChannels(), []);
  });

  it('subscriptionSetSubscribeBasicUsage: subscribing a set connects both channels and delivers a message from a friend', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const ready = connected(pubnub, { channels: ['ch1', 'ch2'] });
    const received = expectEvent(
      pubnub,
      'message',
      (m) => m.channel === 'ch1' && (m.message as { run?: string }).run === run,
    );

    // snippet.subscriptionSetSubscribeBasicUsage
    const channelsSubscriptionSet = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });
    channelsSubscriptionSet.subscribe();
    // snippet.end

    await ready;
    assert.deepEqual(sorted(pubnub.getSubscribedChannels()), ['ch1', 'ch2']);
    await friend().publish({ channel: 'ch1', message: { via: 'set', run } });
    await received;
    channelsSubscriptionSet.unsubscribe();
  });

  it('eventListenerAddListeners: the message, signal and message action handlers of the sample log when the events arrive', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const logs = captureConsole('log');
    try {
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

      const ready = connected(pubnub, { channels: ['channel_1'] });
      subscription.subscribe();
      await ready;
      const sender = friend();
      const published = await sender.publish({ channel: 'channel_1', message: { n: 1, run } });
      await sender.signal({ channel: 'channel_1', message: `ping-${run}` });
      await sender.addMessageAction({
        channel: 'channel_1',
        messageTimetoken: published.timetoken,
        action: { type: 'reaction', value: 'smiley_face' },
      });
      // Each line must carry this run's own data: the channel is shared and persistent.
      await eventually(
        () => {
          assert.ok(hasLine(logs.lines, 'Message event: ', run), 'onMessage ran for this run');
          assert.ok(hasLine(logs.lines, 'Signal event: ', run), 'onSignal ran for this run');
          assert.ok(
            hasLine(logs.lines, 'Message Reaction event: ', published.timetoken),
            'onMessageAction ran for this run',
          );
        },
        { label: 'event-specific listeners ran' },
      );
      subscription.unsubscribe();
    } finally {
      logs.restore();
    }
  });

  it('eventListenerBasicUsage: status, message, presence and set level message action listeners all fire from one sample', async function () {
    this.timeout(90_000);
    const run = randomUUID();
    const pubnub = createClient('open', `listenerbasic-${run}`);
    const joiner = createClient('open', `listenerbasic-joiner-${run}`);
    const logs = captureConsole('log');
    try {
      const ready = connected(pubnub, { channels: ['channel_1', 'ch1', 'ch2'] });

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
      const joinerReady = connected(joiner, { channels: ['channel_1'] });
      joiner.subscribe({ channels: ['channel_1'] });
      await joinerReady;
      const sender = friend();
      await sender.publish({ channel: 'channel_1', message: { n: 1, run } });
      const onSet = await sender.publish({ channel: 'ch1', message: { n: 2, run } });
      await sender.addMessageAction({
        channel: 'ch1',
        messageTimetoken: onSet.timetoken,
        action: { type: 'reaction', value: 'smiley_face' },
      });
      // Every line is matched on this run's data (the run id, the joiner's unique user id, the set message's timetoken).
      await eventually(
        () => {
          assert.ok(logs.lines.includes('Status PNConnectedCategory'), 'status listener saw the connection');
          assert.ok(hasLine(logs.lines, 'Received message', run), 'subscription message listener ran');
          assert.ok(
            hasLine(logs.lines, 'Presence event', joiner.getUserId()),
            'presence listener saw the join of the joiner',
          );
          assert.ok(
            hasLine(logs.lines, 'Message action event:', onSet.timetoken),
            'subscription set message action listener ran',
          );
        },
        { label: 'listeners from the snippet ran', timeout: PRESENCE_EVENT_TIMEOUT },
      );
      joiner.unsubscribeAll();
      subscription1.unsubscribe();
      subscriptionSet1.unsubscribe();
    } finally {
      logs.restore();
    }
  });

  it('eventListenerAddConnectionStatusListenersBasicUsage: the status listener fires PNConnectedCategory', async () => {
    const pubnub = shopper();
    const logs = captureConsole('log');
    try {
      // snippet.eventListenerAddConnectionStatusListenersBasicUsage
      // add a status listener
      pubnub.addListener({
        status: (s) => {
          console.log('Status', s.category);
        },
      });
      // snippet.end

      const subscription = pubnub.channel('ch1').subscription();
      subscription.subscribe();
      await eventually(() => assert.ok(logs.lines.includes('Status PNConnectedCategory')), {
        label: 'connected status logged',
      });
      subscription.unsubscribe();
    } finally {
      logs.restore();
    }
  });

  it('unsubscribeBasicUsage: unsubscribing a subscription and a set leaves nothing subscribed', async () => {
    const pubnub = shopper();
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

  it('unsubscribeAllBasicUsage: unsubscribeAll clears channels and groups', async () => {
    const pubnub = shopper();
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
    await eventually(
      () => {
        assert.deepEqual(pubnub.getSubscribedChannels(), []);
        assert.deepEqual(pubnub.getSubscribedChannelGroups(), []);
      },
      { label: 'unsubscribeAll clears channels and groups' },
    );
  });

  it('subscriptionSetFrom2IndividualSubscriptions: addSubscription and removeSubscription change the set before subscribing', async () => {
    const pubnub = shopper();
    const ready = connected(pubnub, { channels: ['channel_1'], channelGroups: ['channelGroup_1'] });

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
    assert.ok(channels.includes('channel_1'), 'channel_1 is subscribed');
    assert.ok(!channels.includes('channel_3'), 'channel_3 was removed before subscribing');
    assert.ok(pubnub.getSubscribedChannelGroups().includes('channelGroup_1'), 'channelGroup_1 is subscribed');
    pubnub.unsubscribeAll();
  });

  it('SubscriptionSetFrom2Sets: addSubscriptionSet and removeSubscriptionSet are local operations and subscribe nothing', () => {
    const pubnub = shopper();
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
    assert.deepEqual(sorted(subscriptionSet1.channels), ['ch1', 'ch2']);
  });

  it('AddToExistingSubscriptionSet: adding sets and subscriptions to an already subscribed set takes effect at once', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const member = memberOf('channelGroup_1');
    const ready = connected(pubnub, {
      channels: ['ch1', 'ch2', 'ch3', 'ch4'],
      channelGroups: ['channelGroup_1'],
    });
    const onLateChannel = expectEvent(
      pubnub,
      'message',
      (m) => m.channel === 'ch4' && (m.message as { run?: string }).run === run,
    );
    const onGroup = expectEvent(
      pubnub,
      'message',
      (m) => m.channel === member && m.subscription === 'channelGroup_1' && (m.message as { run?: string }).run === run,
    );

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
    const sender = friend();
    await sender.publish({ channel: 'ch4', message: { n: 4, run } });
    await sender.publish({ channel: member, message: { n: 5, run } });
    await onLateChannel;
    await onGroup;
    subscriptionSet1.unsubscribe();
  });
});
