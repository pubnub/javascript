import PubNub from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

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

// snippet.eventListenerAddConnectionStatusListenersBasicUsage
// add a status listener
pubnub.addListener({
  status: (s) => {
    console.log('Status', s.category);
  },
});
// snippet.end

