import PubNub from '../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.eventListenerAddListeners

// create a subscription from a channel entity
const channel = pubnub.channel('channel_1');
const subscription = channel.subscription();

// Event-specific listeners
subscription.onMessage = (message) => { console.log("Message event: ", message); };
subscription.onPresence = (presence) => { console.log("Presence event: ", presence); };
subscription.onSignal = (signal) => { console.log("Signal event: ", signal); };
subscription.onObjects = (objectsEvent) => { console.log("Objects event: ", objectsEvent); };
subscription.onMessageAction = (messageActionEvent) => { console.log("Message Reaction event: ", messageActionEvent); };
subscription.onFile = (fileEvent) => { console.log("File event: ", fileEvent); };

// snippet.end

// snippet.AddConnectionStatusListener
pubnub.addListener({
    status: (s) => s.category
})
// snippet.end
