<img width="1920" height="600" alt="image" src="https://github.com/user-attachments/assets/b60b4e27-a140-4784-8b34-85ae421023e2" />

# PubNub JavaScript and TypeScript SDK

[![npm](https://img.shields.io/npm/v/pubnub.svg)](https://www.npmjs.com/package/pubnub)
PubNub provides global infrastructure for real-time, interactive applications.

Publish and receive messages in JavaScript and TypeScript. Use this SDK for browsers, Node.js, React, React Native, Angular, Vue, and other JavaScript or TypeScript applications.

[Documentation](https://www.pubnub.com/docs/sdks/javascript) · [API reference](https://www.pubnub.com/docs/sdks/javascript/api-reference/publish-and-subscribe) · [Changelog](https://www.pubnub.com/docs/sdks/javascript/changelog) · [Support](https://support.pubnub.com/)

## Requirements

| Requirement | Supported version or setup |
| --- | --- |
| Node.js | [22 or later](https://www.pubnub.com/docs/sdks/javascript/environment-setup) |
| Supported environments | [Modern browsers, Node.js, React, React Native, Angular, Vue, and other JavaScript/TypeScript environments](https://www.pubnub.com/docs/sdks/javascript) |
| React Native | Install `react-native-url-polyfill` alongside `pubnub` when using React Native. |

## Installation

From your JavaScript project's root directory:

```sh
npm install pubnub
```

Or download one of our builds from our CDN:

- https://cdn.pubnub.com/sdk/javascript/pubnub.13.1.3.js
- https://cdn.pubnub.com/sdk/javascript/pubnub.13.1.3.min.js

For other installation methods, see [environment setup](https://www.pubnub.com/docs/sdks/javascript/environment-setup).

## Quickstart

This example runs in Node.js 22 or later. It subscribes to hello_world, publishes one message, and prints the received text.

### Get your keys

1. Open the [PubNub Admin Portal](https://admin.pubnub.com/).

2. Create an app and a keyset for development, or select an existing development keyset.

3. Copy its publish key and subscribe key.

If Access Manager is enabled, obtain a token from your trusted backend and call `pubnub.setToken(token)` before accessing protected resources. Keep the secret key and token-granting logic on the backend.

### Send and receive a message

Create `index.js` in the project root and add:

Replace the key placeholders. Use a User ID that identifies the user or device in your app.

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
    if (status.category === PubNub.CATEGORIES.PNConnectedCategory && !published) {
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

### Run the example

```sh
node index.js
```

The terminal should show:

```text
Hello world
```

The example calls `subscription.unsubscribe()`, `pubnub.removeAllListeners()`, and `pubnub.destroy()` after receiving the message. Reuse one PubNub client for the user/session rather than creating a client for every operation.

For a complete application, see the [getting started guide](https://www.pubnub.com/docs/sdks/javascript).

## Next steps

| Task | Documentation |
| --- | --- |
| Configure the client | [Configuration](https://www.pubnub.com/docs/sdks/javascript/api-reference/configuration) |
| Work with subscriptions and messages | [Publish & Subscribe](https://www.pubnub.com/docs/sdks/javascript/api-reference/publish-and-subscribe) |
| Check channel occupancy | [Presence](https://www.pubnub.com/docs/sdks/javascript/api-reference/presence) |
| Read message history | [Message Persistence](https://www.pubnub.com/docs/sdks/javascript/api-reference/storage-and-playback) |

## Build with an AI coding assistant

The PubNub MCP server gives an AI coding assistant access to PubNub SDK documentation and PubNub APIs. Connect the assistant to the hosted server at https://mcp.pubnub.com, or run `npx @pubnub/mcp@latest` locally.

The [server repository](https://github.com/pubnub/pubnub-mcp-server) has setup steps for VS Code, Cursor, Claude Code, Claude Desktop, Codex, Gemini CLI, and OpenCode.

## Before production

Use [Access Manager](https://www.pubnub.com/docs/sdks/javascript/api-reference/access-manager) to grant each client the permissions it needs. Keep the secret key on your backend. Never include it in a distributed client.

Create one PubNub instance and reuse it for the lifetime of the user or application session. Call `subscription.unsubscribe()` when an individual subscription is no longer needed, `pubnub.unsubscribeAll()` to stop all subscriptions, `pubnub.removeAllListeners()` when registered listeners are no longer required, and `pubnub.destroy()` when the client itself is no longer needed.

Live delivery through PubNub SDKs is at-most-once. A subscriber can miss messages if its buffer overflows or if it is disconnected when a message is published. For recovery after longer gaps, see [Message Persistence](https://www.pubnub.com/docs/sdks/javascript/api-reference/storage-and-playback).

## Troubleshooting

| Symptom | Check |
| --- | --- |
| React Native reports URL-related errors | Install `react-native-url-polyfill` alongside `pubnub`. The SDK no longer bundles this dependency. See [JavaScript Environment Setup](https://www.pubnub.com/docs/sdks/javascript/environment-setup). |
| A publish succeeds but no message appears | Check the message handler, subscription readiness, keyset, and channel name. |
| Access Manager grant APIs are unavailable in a browser build | Issue tokens from a trusted backend and call `pubnub.setToken(token)` in the client. The prebuilt browser SDK deliberately disables the Access Manager server module and secret-key functionality. See [Configuration](https://www.pubnub.com/docs/sdks/javascript/api-reference/configuration). |
| Extra clients or duplicate messages during development | Reuse the PubNub client and subscription across renders. In React, create them in lifecycle/application code and unsubscribe, remove listeners, and destroy an owned client from the corresponding cleanup instead of creating another client on every render. |

For setup help, see [troubleshooting](https://www.pubnub.com/docs/sdks/javascript). Check [network status](https://status.pubnub.com/) for service incidents.

## Releases

Read the [changelog](https://www.pubnub.com/docs/sdks/javascript/changelog) before upgrading.

For a major version change, review the SDK-specific migration guidance linked from the JavaScript documentation and the [JavaScript SDK changelog](https://www.pubnub.com/docs/sdks/javascript/changelog) for breaking changes introduced after that guide.

## Support and contributions

For setup or account help, contact [PubNub Support](https://support.pubnub.com/).

For a reproducible SDK bug, use [GitHub Issues](https://github.com/pubnub/javascript/issues). Include the SDK version, runtime, and a small reproduction with credentials removed.

Install the repository dependencies, run the relevant build and test commands for the affected package/platform, and include tests for behavioral changes before opening a pull request.

## License

See the [PubNub Software Development Kit License Agreement](https://github.com/pubnub/javascript/blob/master/LICENSE).


## Support

If you **need help** or have a **general question**, contact <support@pubnub.com>.
