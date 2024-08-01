# PubNub JavaScript SDK (V4)

[![Build Status](https://travis-ci.com/pubnub/javascript.svg?branch=master)](https://travis-ci.com/pubnub/javascript)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2859917905c549b8bfa27630ff276fce)](https://www.codacy.com/app/PubNub/javascript?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=pubnub/javascript&amp;utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/v/pubnub.svg)]()
[![Bower](https://img.shields.io/bower/v/pubnub.svg)]()
[![Known Vulnerabilities](https://snyk.io/test/npm/pubnub/badge.svg)](https://snyk.io/test/npm/pubnub)

This is the official PubNub JavaScript SDK repository.

PubNub takes care of the infrastructure and APIs needed for the realtime communication layer of your application. Work on your app's logic and let PubNub handle sending and receiving data across the world in less than 100ms.

## Get keys

You will need the publish and subscribe keys to authenticate your app. Get your keys from the [Admin Portal](https://dashboard.pubnub.com/login).

## Tutorial Video

[![Getting Started with PubNub JS SDK](https://replayable-api-production.herokuapp.com/replay/64ee0d2ca4bc310061f566ca/gif?shareKey=8YQoHC40jdzYpYGpcJhQ)](https://app.dashcam.io/replay/64ee0d2ca4bc310061f566ca?share=8YQoHC40jdzYpYGpcJhQ) 

Watch [Getting Started with PubNub JS SDK](https://app.dashcam.io/replay/64ee0d2ca4bc310061f566ca?share=8YQoHC40jdzYpYGpcJhQ) on Dashcam

## Configure PubNub

1. Integrate the JavaScript SDK into your project:
   * use `npm`:
     ```
     npm install pubnub
     ```
   * or download one of our builds from our CDN: 
     * https://cdn.pubnub.com/sdk/javascript/pubnub.8.2.7.js
     * https://cdn.pubnub.com/sdk/javascript/pubnub.8.2.7.min.js

2. Configure your keys:

  ```javascript
  pubnub = new PubNub({
    publishKey: 'myPublishKey',
    subscribeKey: 'mySubscribeKey',
    userId: 'myUniqueUserId',
  });
  ```

## Add event listeners

```javascript
// create a subscription from a channel entity
const channel = pubnub.channel('my_channel');
const subscription = channel.subscription();
subscription.subscribe();

// Event-specific listeners
subscription.onMessage =  (messageEvent) => { console.log("Message event: ", messageEvent); };
subscription.onPresence =  (presenceEvent) => { console.log("Presence event: ", presenceEvent); };
subscription.onMessage = (messageEvent) => { console.log("Message event: ", messageEvent); };
subscription.onPresence = (presenceEvent) => { console.log("Presence event: ", presenceEvent); };
subscription.onSignal = (signalEvent) => { console.log("Signal event: ", signalEvent); };
subscription.onObjects = (objectsEvent) => { console.log("Objects event: ", objectsEvent); };
subscription.onMessageAction = (messageActionEvent) => { console.log("Message Action event: ", messageActionEvent); };
subscription.onFile = (fileEvent) => { console.log("File event: ", fileEvent); };

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
    const action = p.action; // Can be join, leave, state-change, or timeout
    const channelName = p.channel; // Channel to which the message belongs
    const occupancy = p.occupancy; // Number of users subscribed to the channel
    const state = p.state; // User state
    const channelGroup = p.subscription; //  Channel group or wildcard subscription match, if any
    const publishTime = p.timestamp; // Publish timetoken
    const timetoken = p.timetoken; // Current timetoken
    const uuid = p.uuid; // UUIDs of users who are subscribed to the channel
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
    const publisher = objectEvent.publisher; // UUID that made the call
    const event = objectEvent.event; // Name of the event that occurred
    const type = objectEvent.type; // Type of the event that occurred
    const data = objectEvent.data; // Data from the event that occurred
  },
  // Message Reactions
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
    const fileId = event.file.id; // File unique id
    const fileName = event.file.name;// File name
    const fileUrl = event.file.url; // File direct URL
  }
});
```

## Publish/subscribe

```javascript
const channel = pubnub.channel('my_channel');
const subscription = channel.subscription();
subscription.subscribe();

try {
    const result = await pubnub.publish({
        message: {
            such: "object",
        },
        channel: "my_channel",
        sendByPost: false, // true to send via post
        storeInHistory: false, //override default Message Persistence options
        meta: {
            cool: "meta",
        }, // publish extra meta with the request
    });
} catch (status) {
    console.log(status);
}
```

## Documentation

* [Build your first realtime JS app with PubNub](https://www.pubnub.com/tutorials/real-time-data-streaming/)
* [API reference for JavaScript](https://www.pubnub.com/docs/sdks/javascript/api-reference/publish-and-subscribe)

## Support

If you **need help** or have a **general question**, contact <support@pubnub.com>.
