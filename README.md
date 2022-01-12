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

## Configure PubNub

1. Integrate the JavaScript SDK into your project:
   * use `npm`:
     ```
     npm install pubnub
     ```
   * or download one of our builds from our CDN: 
     * https://cdn.pubnub.com/sdk/javascript/pubnub.5.0.0.js
     * https://cdn.pubnub.com/sdk/javascript/pubnub.5.0.0.min.js

2. Configure your keys:

  ```javascript
  pubnub = new PubNub({
    publishKey : "myPublishKey",
    subscribeKey : "mySubscribeKey",
    uuid: "myUniqueUUID"
  })
  ```

## Add event listeners

```javascript
pubnub.addListener({
  message: function (m) {
    // handle messages
  },
  presence: function (p) {
    // handle presence  
  },
  signal: function (s) {
    // handle signals
  },
  objects: (objectEvent) => {
    // handle objects
  },
  messageAction: function (ma) {
    // handle message actions
  },
  file: function (event) {
    // handle files  
  },
  status: function (s) {
  // handle status  
  },
});
```

## Publish/subscribe

```javascript
var publishPayload = {
    channel : "hello_world",
    message: {
        title: "greeting",
        description: "This is my first message!"
    }
}

pubnub.publish(publishPayload, function(status, response) {
    console.log(status, response);
})

pubnub.subscribe({
    channels: ["hello_world"]
});
```

## Documentation

* [Build your first realtime JS app with PubNub](https://www.pubnub.com/docs/platform/quickstarts/javascript)
* [API reference for JavaScript (web)](https://www.pubnub.com/docs/web-javascript/pubnub-javascript-sdk)
* [API reference for JavaScript (Node.js)](https://www.pubnub.com/docs/nodejs-javascript/pubnub-javascript-sdk)

## Support

If you **need help** or have a **general question**, contact <support@pubnub.com>.
