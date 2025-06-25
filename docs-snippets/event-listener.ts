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
    const channel = objectEvent.channel; // Channel to which the event belongs
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

// snippet.AddConnectionStatusListener
pubnub.addListener({
  status: (s) => s.category,
});
// snippet.end
