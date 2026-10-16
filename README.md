<img width="1920" height="600" alt="image" src="https://github.com/user-attachments/assets/b60b4e27-a140-4784-8b34-85ae421023e2" />

# PubNub JavaScript and TypeScript SDK

[![npm](https://img.shields.io/npm/v/pubnub.svg)](https://www.npmjs.com/package/pubnub)

This is the official PubNub SDK for browsers, Node.js, React, React Native, Angular, Vue, and other JavaScript or TypeScript applications.

[Documentation](https://www.pubnub.com/docs/sdks/javascript) · [API reference](https://www.pubnub.com/docs/sdks/javascript/api-reference/publish-and-subscribe) · [Changelog](https://www.pubnub.com/docs/sdks/javascript/changelog)

## Requirements

- **Node.js:** [22 or later](https://www.pubnub.com/docs/sdks/javascript/environment-setup)
- **Supported environments:** [Modern browsers, Node.js, React, React Native, Angular, Vue, and other JavaScript/TypeScript environments](https://www.pubnub.com/docs/sdks/javascript)
- **React Native:** Install `react-native-url-polyfill` alongside `pubnub` when using React Native.

## Installation

From your JavaScript project's root directory:

```sh
npm install pubnub
```

See [Environment setup](https://www.pubnub.com/docs/sdks/javascript/environment-setup) for toolchain and platform details.

## Example

This example runs on Node.js 22 or later.

If Access Manager is enabled, obtain a token from your trusted backend and call `pubnub.setToken(token)` before accessing protected resources. Keep the secret key and token-granting logic on the backend.

Create `index.js` in the project root and add:

```javascript
const PubNub = require("pubnub");

const pubnub = new PubNub({
  publishKey: "YOUR_PUBLISH_KEY",
  subscribeKey: "YOUR_SUBSCRIBE_KEY",
  userId: "hello-world-user",
});

const subscription = pubnub.channel("hello_world").subscription();
let published = false;

subscription.onMessage = (event) => {
  console.log(event.message);

  subscription.unsubscribe();
  pubnub.removeAllListeners();
  pubnub.destroy();
};

pubnub.addListener({
  status: async (status) => {
    if (status.category === "PNConnectedCategory" && !published) {
      published = true;

      await pubnub.publish({
        channel: "hello_world",
        message: "Hello world",
      });
    }
  },
});

subscription.subscribe();
```

Run the example:

```sh
node index.js
```

The terminal prints:

```text
Hello world
```

The example calls `subscription.unsubscribe()`, `pubnub.removeAllListeners()`, and `pubnub.destroy()` after receiving the message. Reuse one PubNub client for the user/session rather than creating a client for every operation.

## Next steps

See the [JavaScript SDK documentation](https://www.pubnub.com/docs/sdks/javascript).

| Next step | Documentation |
| --- | --- |
| Configure the client | [Configuration](https://www.pubnub.com/docs/sdks/javascript/api-reference/configuration) |
| Work with subscriptions and messages | [Publish & Subscribe](https://www.pubnub.com/docs/sdks/javascript/api-reference/publish-and-subscribe) |
| Check channel occupancy | [Presence](https://www.pubnub.com/docs/sdks/javascript/api-reference/presence) |
| Read message history | [Message Persistence](https://www.pubnub.com/docs/sdks/javascript/api-reference/storage-and-playback) |

## Access Manager

[Access Manager](https://www.pubnub.com/docs/sdks/javascript/api-reference/access-manager)

## Client lifetime

Create one PubNub instance and reuse it for the lifetime of the user or application session. Call `subscription.unsubscribe()` when an individual subscription is no longer needed, `pubnub.unsubscribeAll()` to stop all subscriptions, `pubnub.removeAllListeners()` when registered listeners are no longer required, and `pubnub.destroy()` when the client itself is no longer needed.

## Delivery

Live delivery through PubNub SDKs is at-most-once. A subscriber can miss messages if its buffer overflows or if it is disconnected when a message is published. For recovery after longer gaps, see [Message Persistence](https://www.pubnub.com/docs/sdks/javascript/api-reference/storage-and-playback).

## Troubleshooting

### React Native reports URL-related errors

Install `react-native-url-polyfill` alongside `pubnub`. The SDK no longer bundles this dependency. See [JavaScript Environment Setup](https://www.pubnub.com/docs/sdks/javascript/environment-setup).

### Access Manager grant APIs are unavailable in a browser build

Issue tokens from a trusted backend and call `pubnub.setToken(token)` in the client. The prebuilt browser SDK deliberately disables the Access Manager server module and secret-key functionality. See [Configuration](https://www.pubnub.com/docs/sdks/javascript/api-reference/configuration).

### Hot reload and server rendering

Reuse the PubNub client and subscription across renders. In React, create them in lifecycle/application code and unsubscribe, remove listeners, and destroy an owned client from the corresponding cleanup instead of creating another client on every render.

Further troubleshooting: [JavaScript SDK documentation](https://www.pubnub.com/docs/sdks/javascript).

## Changelog and upgrades

[Changelog](https://www.pubnub.com/docs/sdks/javascript/changelog)

For a major version change, review the SDK-specific migration guidance linked from the JavaScript documentation and the [JavaScript SDK changelog](https://www.pubnub.com/docs/sdks/javascript/changelog) for breaking changes introduced after that guide.

## Contributing

Report bugs and request features in the [issue tracker](https://github.com/pubnub/javascript/issues).

Install the repository dependencies, run the relevant build and test commands for the affected package/platform, and include tests for behavioral changes before opening a pull request.

## License

[PubNub Software Development Kit License Agreement](https://github.com/pubnub/javascript/blob/master/LICENSE)


## Support

If you **need help** or have a **general question**, contact <support@pubnub.com>.
