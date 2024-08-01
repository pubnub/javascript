## v8.2.7
August 01 2024

#### Fixed
- Fix issue because of which timeout enforced by browser triggered wrong error status category. Fixed the following issues reported by [@WalrusSoup](https://github.com/WalrusSoup): [#396](https://github.com/pubnub/javascript/issues/396).

## v8.2.6
July 23 2024

#### Fixed
- Resolves the issue of manually included presence channels not being unsubscribed from the subscription set. Fixed the following issues reported by [@roman-rr](https://github.com/roman-rr): [#390](https://github.com/pubnub/javascript/issues/390).

## v8.2.5
July 18 2024

#### Modified
- Fix PubNub client configuration and listener documentation.



## v8.2.4
June 17 2024

#### Fixed
- Subscription/SubscriptionSet's `subscribe()` method accepts `timetoken` parameter. Instead as in subscriptionOption.

## v8.2.3
June 06 2024

#### Fixed
- Fix issue because of which single string sort option wasn't serialized properly.

## v8.2.2
June 05 2024

#### Fixed
- Fix issue because of which `heartbeatInterval` wasn't computed if `presenceTimeout` provided during PubNub client configuration.

## v8.2.1
May 22 2024

#### Fixed
- Fix revoke token method signature where mistakenly expected object with `token` field.

## v8.2.0
May 21 2024

#### Added
- Add environment flags processing to opt-out feature modules from built bundles.

#### Fixed
- Add `application/json` content type for `Grant Token`, `Add Message Action` and `Generate File Upload URL` endpoints. Fixed the following issues reported by [@SpaseESG](https://github.com/SpaseESG): [#373](https://github.com/pubnub/javascript/issues/373).

## v8.1.0
May 16 2024

#### Added
- Use `SharedWorker` instead of `Service Worker` for better PubNub client instances feedback.
- Add configuration option to enable debug log output from the subscription `SharedWorker`.

#### Modified
- Create types declaration files.

## v8.0.1
April 23 2024

#### Modified
- Provider configuration option to set service worker from the URL (because of browser restrictions for worker files to be registered from the same domain).

## v8.0.0
April 22 2024

#### Added
- Upgraded the network layer, replacing the `superagent` module with the `Fetch API` for browser integrations and node-fetch for `npm` integrations, ensuring enhanced performance and reliability.
- Added service worker .
- Enhanced the subscribe feature with service worker support, improving user experience across multiple browser windows and tabs.           The client interface rewritten with TypeScript, which gives an up-to-date interface.

## v7.6.3
April 18 2024

#### Fixed
- Fixes issue of add or remove listener of subscription to/from subscriptionSet.

## v7.6.2
March 28 2024

#### Added
- Added support for pagination params for listChannels api of push notification devices.

## v7.6.1
February 26 2024

#### Fixed
- Fixes issue of App context event handling for channel and membership.

## v7.6.0
February 21 2024

#### Added
- Adding channel, channelGroup, channelMetadata and userMetadata entities to be first-class citizens to access APIs related to them. Currently, access is provided only for subscription API.

## v7.5.0
January 16 2024

#### Added
- Added `enableEventEngine`, `maintainPresenceState` flags and `retryConfiguration` for retry policy configuration.

#### Fixed
- Fixes issue of allowing duplicate listener registration.
- Fixes file name conflict in lib directory. Fixed the following issues reported by [@priyanshu102002](https://github.com/priyanshu102002): [#355](https://github.com/pubnub/javascript/issues/355).

## v7.4.5
November 28 2023

#### Fixed
- Handle unencrypted messages in subscribe with cryptoModule configured.
- Fixe for missing parameters to request or filter optional fields for App Context memberships api.

## v7.4.4
November 14 2023

#### Fixed
- Fixes issue of getChannelMembers call not returning status field.

## v7.4.3
November 08 2023

#### Fixed
- Fixes issue of not able to encrypt Blob file content in web.

## v7.4.2
October 30 2023

#### Modified
- Changed license type from MIT to PubNub Software Development Kit License.

## v7.4.1
October 17 2023

#### Fixed
- Fixes issue of `pubnub.decrypt()` returning wrong data format.

## v7.4.0
October 16 2023

#### Added
- Add crypto module that allows configure SDK to encrypt and decrypt messages.

#### Fixed
- Improved security of crypto implementation by adding enhanced AES-CBC cryptor.

## v7.3.3
September 11 2023

#### Fixed
- Fixes issue of getting misleading error message when sendFile fails.

## v7.3.2
August 31 2023

#### Fixed
- Fixes issue of having deprecated superagent version. Fixed the following issues reported by [@wimZ](https://github.com/wimZ): [#317](https://github.com/pubnub/javascript/issues/317).

## v7.3.1
August 21 2023

#### Fixed
- Fixes issue of missing get and set methods for userId field of PubNub configuration.

## v7.3.0
July 26 2023

#### Fixed
- Fixes issue of severe vulnerability warnings for vm2 usage.



## v7.2.3
June 19 2023

#### Added
- Added optional param `withHeartbeat` to set state through heartbeat endpoint.

## v7.2.2
December 12 2022

#### Fixed
- Fixes a case in React Native with using an error interface in superagent.
- Fixes issue of getFileUrl not setting auth value as token string when token is set. Fixed the following issues reported by [@abdalla-nayer](https://github.com/abdalla-nayer): [#302](https://github.com/pubnub/javascript/issues/302).

## v7.2.1
November 10 2022

#### Fixed
- Removes remains of Buffer from the crypto module.

## v7.2.0
July 01 2022

#### Added
- Allows to specify users and spaces in grantToken method.
- Allows to use userId instead of uuid in configuration.

## v7.1.2
June 22 2022

#### Fixed
- Fixes parseToken issues on Web and React Native.

## v7.1.1
June 14 2022

#### Added
- Added user and space memberships related methods.
- Added `type` and `status` fields in `User` and `Space`. `status` field in memberships.

## v7.0.1
May 24 2022

## v7.0.0
May 24 2022

#### Modified
- BREAKING CHANGES: Removed objects v1 methods support.

## v6.0.0

April 21 2022

#### Added

- Added a TypeScript build chain and moved from webpack to rollup.
- Added an initial implementation of Event Engine.

## v5.0.1

March 02 2022

#### Fixed

- Unsubscribe fix unsubscribe from channel group presence.

## v5.0.0

January 12 2022

#### Modified

- BREAKING CHANGES: `uuid` is required parameter in PubNub constructor.

## v4.37.0

December 16 2021

#### Added

- Add revoke token feature.

## v4.36.0

December 09 2021

#### Fixed

- Remove isomorphic-webcrypto polyfill for web Add buffer polyfill to react native. Fixed the following issues reported by [@JakeOrel](https://github.com/JakeOrel): [#233](https://github.com/pubnub/javascript/issues/233).

## v4.35.0

December 02 2021

#### Added

- Allows to specify multiple origins in the config, which enables domain sharding for custom origins.

## v4.34.2

December 01 2021

#### Fixed

- Fix listener callback is invoked multiple times. Fixed the following issues reported by [@puopg](https://github.com/puopg): [#230](https://github.com/pubnub/javascript/issues/230).

## v4.34.1

November 19 2021

#### Fixed

- Update `.npmignore` and excluded resources from from NPM package. Fixed the following issues reported by [@ElridgeDMello](https://github.com/ElridgeDMello): [#228](https://github.com/pubnub/javascript/issues/228).

## v4.34.0

November 19 2021

#### Added

- Upgrade superagent.

## [v4.33.1](https://github.com/pubnub/javascript/releases/tag/v4.33.1)

October-18-2021

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.33.0...v4.33.1)

- 🐛 Fixes issue of performing file publish message retry according to `fileUploadPublishRetryLimit` setting of PubNub instance.

## [v4.33.0](https://github.com/pubnub/javascript/releases/tag/v4.33.0)

August-31-2021

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.32.1...v4.33.0)

- 🌟️ Added support for Objects v2 in PAM v3 api.
- 🐛 Fixes issue related to file decryption when cipherkey is provided in method.

## [v4.32.1](https://github.com/pubnub/javascript/releases/tag/v4.32.1)

May-26-2021

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.32.0...v4.32.1)

- 🐛 Fixes issue of signature does not match error with `getAllUUIDMetadata` call.
- 🐛 Error handling with global hereNow call to provide detailed error message when feature not enabled.

## [v4.32.0](https://github.com/pubnub/javascript/releases/tag/v4.32.0)

April-28-2021

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.31.0...v4.32.0)

- 🌟️ Add grantToken support for channel and group resources.

## [v4.31.0](https://github.com/pubnub/javascript/releases/tag/v4.31.0)

April-22-2021

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.30.1...v4.31.0)

- ⭐️️ **BREAKING CHANGE** - Set `true` for `useRandomIVs` by default.
- 🐛 Fix `channel` and `uuid` which is used with: files API, Objects and presence.

## [v4.30.1](https://github.com/pubnub/javascript/releases/tag/v4.30.1)

March-30-2021

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.30.0...v4.30.1)

- 🐛 Revert v4.300.

## [v4.29.11](https://github.com/pubnub/javascript/releases/tag/v4.29.11)

January-11-2021

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.29.10...v4.29.11)

- ⭐️️ Set default increased limit for message count of History v3 api single call.

## [v4.29.10](https://github.com/pubnub/javascript/releases/tag/v4.29.10)

November-30-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.29.9...v4.29.10)

- 🐛 Fixes issue of missing more field in fetch messages response.

## [v4.29.9](https://github.com/pubnub/javascript/releases/tag/v4.29.9)

October-05-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.29.8...v4.29.9)

- 🌟️ Adds timetoken of file publish in the sendFile response.
- 🐛 Fixes getFileUrl so that it includes auth and signature query params.
- 🐛 Fixes downloadFile method to generate correct signature.

## [v4.29.8](https://github.com/pubnub/javascript/releases/tag/v4.29.8)

September-21-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.29.7...v4.29.8)

- 🐛 Fixes compatibility with @sentry/react-native library.

## [v4.29.7](https://github.com/pubnub/javascript/releases/tag/v4.29.7)

September-14-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.29.6...v4.29.7)

- 🌟️ Added support for managing permissions of objects v2 while applying PAM v2.
- 🐛 Fix uncaught promise exception in subscription manager caused by error in user code inside of subscription handlers. Error will be handled and returned to status handler with PNUnknownCategory category where errorData can be examined.

## [v4.29.6](https://github.com/pubnub/javascript/releases/tag/v4.29.6)

September-08-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.29.5...v4.29.6)

- 🌟️ Add file download to Blob in React Native.

## [v4.29.5](https://github.com/pubnub/javascript/releases/tag/v4.29.5)

September-01-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.29.4...v4.29.5)

- 🌟️ Add support for file upload via file URI in React Native.
- 🐛 Fix file download to ArrayBuffer in React Native.

## [v4.29.4](https://github.com/pubnub/javascript/releases/tag/v4.29.4)

August-14-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.29.3...v4.29.4)

- 🐛 Fixes an artifact where ract-native entrypoint didnt use ssl.

## [v4.29.3](https://github.com/pubnub/javascript/releases/tag/v4.29.3)

August-14-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.29.2...v4.29.3)

- 🐛 Fixes an issue with react-native entrypoint where interfaces to File and Crypto are not included in the build.
- 🐛 Fixes the ability to sendByPost in publish.
- 🐛 Fixes an issue where getFileUrl returned and URI without a protocol.
- 🐛 Fixes an issue where storeInHistory false would not include the param.
- 🐛 Removes mime types dependency since that will be handled by the server.
- 🐛 Adds userMetadata to file event listener.

## [v4.29.2](https://github.com/pubnub/javascript/releases/tag/v4.29.2)

August-05-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.29.1...v4.29.2)

- 🐛 Move @babel/runtime to runtime dependency.

## [v4.29.1](https://github.com/pubnub/javascript/releases/tag/v4.29.1)

August-04-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.29.0...v4.29.1)

- 🐛 Release 4.291.

## [v4.29.0](https://github.com/pubnub/javascript/releases/tag/v4.29.0)

August-04-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.28.4...v4.29.0)

- 🌟️ Allows to upload files to channels, download them with optional encryption support.
- 🌟️ Allows to enable random IVs when encrypting messages.
- 🐛 Fixes a bug with PAM and Objects v2.

## [v4.28.4](https://github.com/pubnub/javascript/releases/tag/v4.28.4)

July-15-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.28.3...v4.28.4)

- 🐛 Fixes issue of high cpu usage when heartbeat interval is not set.

## [v4.28.3](https://github.com/pubnub/javascript/releases/tag/v4.28.3)

July-15-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.28.2...v4.28.3)

- 🐛 _ getAllChannelMetadata no longer includes customFields by default, _ removeChannelMetadata no longer hits wrong endpoint, _ getMemberships and getChannelMembers now includes customFields by default, _ getAllUUIDMetadata now includes totalCount by default, _ getAllUUIDMetadata no longer includes limit by default, _ all membership and channel members methods now accept a callback, _ all objects v2 methods are properly typed now to include an optional callback, _ getMemberships and getChannelMembers now include totalCount, prev, and next in the response.

## [v4.28.2](https://github.com/pubnub/javascript/releases/tag/v4.28.2)

June-29-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.28.1...v4.28.2)

- 🐛 Fixes a bug in removeChannelMembers and removeMemberships.

## [v4.28.1](https://github.com/pubnub/javascript/releases/tag/v4.28.1)

June-19-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.28.0...v4.28.1)

- 🐛 Ensure proper bytes padding in ArrayBuffer prepared for `cbor-js` library.

## [v4.28.0](https://github.com/pubnub/javascript/releases/tag/v4.28.0)

June-03-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.27.6...v4.28.0)

- 🌟️ Added Objects v2 API and deprecated Objects v1 API.

## [v4.27.6](https://github.com/pubnub/javascript/releases/tag/v4.27.6)

April-24-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.27.5...v4.27.6)

- 🌟️ Added support for delete permission in the grant method of accesses manager.
- ⭐️️ Added missing feature entries. Removed incorrect feature entries.

## [v4.27.5](https://github.com/pubnub/javascript/releases/tag/v4.27.5)

April-21-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.27.4...v4.27.5)

- 🐛 Update READMEmd CDN links during deployment.
- 🐛 Fix pre-compiled scripts update.

## [v4.27.4](https://github.com/pubnub/javascript/releases/tag/v4.27.4)

March-18-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.27.3...v4.27.4)

- 🌟️ Add telemetry (latency) for all existing operation types.
- 🐛 Replace `cbor-sync` module with `cbor-js` for client implementation for web to fix compatibility with Salesforce Lightning Web Components.

## [v4.27.3](https://github.com/pubnub/javascript/tree/v4.27.3)

January-06-2020

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.27.2...v4.27.3)

- ⭐ Support for APNS2 Push API
- ⭐ Restore functionality to set heartbeat interval when presence timeout is set below the default

## [v4.27.2](https://github.com/pubnub/javascript/tree/v4.27.2)

December-05-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.27.1...v4.27.2)

- ⭐ disable presence heartbeats by default

## [v4.27.1](https://github.com/pubnub/javascript/tree/v4.27.1)

November-20-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.27.0...v4.27.1)

- ⭐ Make changes in fetch_messages endpoint to move message actions (if any) for message from 'data' to 'actions' property (old 'data' will be in place for few updates to not break existing clients).
- ⭐ fix PAMv3 tests mocked signature
- ⭐ fix lint warnings for tests and code
- ⭐ fix gulp build so that failures in test and lint will trigger failure in travis

## [v4.27.0](https://github.com/pubnub/javascript/tree/v4.27.0)

October-08-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.26.1...v4.27.0)

- ⭐ Add Message Actions API support which allow to: add, remove and fetch previously added action
- ⭐ Add new arguments to fetch messages function which allow to fetch previously added actions and message metadata
- ⭐ Add new handler which can be used to track message actions addition / removal events

## [v4.26.1](https://github.com/pubnub/javascript/tree/v4.26.1)

September-27-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.26.0...v4.26.1)

- ⭐ Ensures history response is an array before iterating it

## [v4.26.0](https://github.com/pubnub/javascript/tree/v4.26.0)

September-20-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.25.2...v4.26.0)

- ⭐ Add support for auth tokens with Objects for Users, Spaces and Memberships

## [v4.25.2](https://github.com/pubnub/javascript/tree/v4.25.2)

September-03-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.25.1...v4.25.2)

- ⭐ Fix issue with subdomains ending in 'ps'

## [v4.25.1](https://github.com/pubnub/javascript/tree/v4.25.1)

August-23-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.25.0...v4.25.1)

- ⭐ Fix regression: Fix titanium build to support recent version

## [v4.25.0](https://github.com/pubnub/javascript/tree/v4.25.0)

August-16-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.24.6...v4.25.0)

- ⭐ Fix regression: Add Objects support for Users, Spaces and Memberships

## [v4.24.6](https://github.com/pubnub/javascript/tree/v4.24.6)

August-09-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.24.5...v4.24.6)

- ⭐ Fix regression: 'PubNub is not a constructor' in Node.js

## [v4.24.5](https://github.com/pubnub/javascript/tree/v4.24.5)

August-07-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.24.4...v4.24.5)

- ⭐ Add Signals support

## [v4.24.4](https://github.com/pubnub/javascript/tree/v4.24.4)

July-26-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.24.0...v4.24.4)

- ⭐ Add minimum presence timeout

## [v4.24.3](https://github.com/pubnub/javascript/tree/v4.24.3)

June-19-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.24.0...v4.24.3)

- ⭐ Added support to enable heartbeat requests while subscribe when heartbeat interval is provided

## [v4.24.2](https://github.com/pubnub/javascript/tree/v4.24.2)

June-13-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.24.0...v4.24.2)

- ⭐ Added try catch block to handle exception for JSON.parse function
- ⭐ Changed default origin to ps.pndsn.com

## [v4.24.1](https://github.com/pubnub/javascript/tree/v4.24.1)

June-06-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.24.0...v4.24.1)

- ⭐ Maintains the state when presence heartbeat is explicitly disabled

## [v4.24.0](https://github.com/pubnub/javascript/tree/v4.24.0)

May-09-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.23.0...v4.24.0)

- ⭐ Disables the presence heartbeat by default when a subscribe is called. Presence heartbeat can still be enabled explicitly.

## [v4.23.0](https://github.com/pubnub/javascript/tree/v4.23.0)

March-14-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.22.0...v4.23.0)

- ⭐ The `timetoken` parameter is deprecated in the `message-counts` function. Use `channelTimetokens` instead, pass one value in `channelTimetokens` to achieve the same results

## [v4.22.0](https://github.com/pubnub/javascript/tree/v4.22.0)

March-04-2019

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.21.7...v4.22.0)

- ⭐message counts

- ⭐use null instead of '' for NativeScript networking module

## [v4.21.7](https://github.com/pubnub/javascript/tree/v4.21.7)

December-20-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.21.6...v4.21.7)

- ⭐update dependencies

- ⭐fix flow process on nativescript

## [v4.21.6](https://github.com/pubnub/javascript/tree/v4.21.6)

October-04-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.21.5...v4.21.6)

- 🐛fix POST for nativescript adapter over android

## [v4.21.5](https://github.com/pubnub/javascript/tree/v4.21.5)

August-06-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.21.4...v4.21.5)

- ⭐update dependencies

## [v4.21.4](https://github.com/pubnub/javascript/tree/v4.21.4)

August-04-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.21.3...v4.21.4)

- ⭐return error parameter into errorData when logVerbosity = true

## [v4.21.3](https://github.com/pubnub/javascript/tree/v4.21.3)

July-10-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.21.2...v4.21.3)

- ⭐update dependencies

## [v4.21.2](https://github.com/pubnub/javascript/tree/v4.21.2)

June-12-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.21.1...v4.21.2)

- ⭐add stringifiedTimeToken into the fetch endpoint

## [v4.21.1](https://github.com/pubnub/javascript/tree/v4.21.1)

June-08-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.21.0...v4.21.1)

- 🐛avoid security vulnerability in growl < 1.10.0

## [v4.21.0](https://github.com/pubnub/javascript/tree/v4.21.0)

June-06-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.20.3...v4.21.0)

- ⭐subscribe without using the heartbeat loop with flag withHeartbeats = false

## [v4.20.3](https://github.com/pubnub/javascript/tree/v4.20.3)

Abril-24-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.20.2...v4.20.3)

- 🐛fix timetoken announces

- ⭐categorize ETIMEDOUT errors as PNNetworkIssuesCategory

## [v4.20.2](https://github.com/pubnub/javascript/tree/v4.20.2)

February-28-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.20.1...v4.20.2)

- 🐛fix signature to delete message

## [v4.20.1](https://github.com/pubnub/javascript/tree/v4.20.1)

January-29-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.20.0...v4.20.1)

- ⭐allow set ssl to false for nodejs

## [v4.20.0](https://github.com/pubnub/javascript/tree/v4.20.0)

January-04-2018

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.19.0...v4.20.0)

- ⭐add support for heartbeat sending without subscription via .presence()

- ⭐add method setProxy for Nodejs

- ⭐set ssl to true for nodejs by default

## [v4.19.0](https://github.com/pubnub/javascript/tree/v4.19.0)

December-05-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.18.0...v4.19.0)

- ⭐add support for Native Script

- ⭐add missing flow types

- ⭐upgrade superagent to ^3.8.1

## [v4.18.0](https://github.com/pubnub/javascript/tree/v4.18.0)

November-20-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.17.0...v4.18.0)

- ⭐keepAlive is now initialized globally instead of per-call, allowing better connection reuse

- ⭐added sdkName configuration parameter which allow completely override pnsdk in request query

## [v4.17.0](https://github.com/pubnub/javascript/tree/v4.17.0)

October-19-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.16.2...v4.17.0)

- ⭐allow disabling of heartbeats by passing 0 during initialization.

## [v4.16.2](https://github.com/pubnub/javascript/tree/v4.16.2)

October-19-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.16.1...v4.16.2)

- 🐛fix UUID library to work in browsers.

## [v4.16.1](https://github.com/pubnub/javascript/tree/v4.16.1)

October-12-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.16.0...v4.16.1)

- 🐛fix incorrect packaging of lil-uuid and uuid

## [v4.16.0](https://github.com/pubnub/javascript/tree/v4.16.0)

October-10-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.15.1...v4.16.0)

- 🌟support delete messages from history

- ⭐swap uuid generator with support for IE9 and IE10

## [v4.15.1](https://github.com/pubnub/javascript/tree/v4.15.1)

August-21-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.15.0...v4.15.1)

- ⭐fix typo to enable http keep alive support

## [v4.15.0](https://github.com/pubnub/javascript/tree/v4.15.0)

August-21-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.14.0...v4.15.0)

- ⭐Support optional message deduping via the dedupeOnSubscribe config

- ⭐Do not issue leave events if the channel mix is empty.

## [v4.14.0](https://github.com/pubnub/javascript/tree/v4.14.0)

August-14-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.13.0...v4.14.0)

- ⭐Allow disable of heartbeats by passing heartbeatInterval = 0

## [v4.13.0](https://github.com/pubnub/javascript/tree/v4.13.0)

July-27-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.12.0...v4.13.0)

- ⭐patch up 503 reporting

- ⭐fix issue with where now and invalid server response

- ⭐fix issue with here now and invalid server response

## [v4.12.0](https://github.com/pubnub/javascript/tree/v4.12.0)

June-19-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.10.0...v4.12.0)

- ⭐fix issue of net with android for titanium

- 🌟add additional hooks for connectivity

- 🌟add auto network detection

## [v4.10.0](https://github.com/pubnub/javascript/tree/v4.10.0)

May-23-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.9.2...v4.10.0)

- ⭐fix issue of net with android for react-native

## [v4.9.2](https://github.com/pubnub/javascript/tree/v4.9.2)

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.9.1...v4.9.2)

- 🌟metadata is now passed on message envelope

## [v4.9.1](https://github.com/pubnub/javascript/tree/v4.9.1)

May-18-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.9.0...v4.9.1)

- 🌟add support custom encryption and decryption

## [v4.9.0](https://github.com/pubnub/javascript/tree/v4.9.0)

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.8.0...v4.9.0)

- 🌟integrate fetch for react-native SDK

- ⭐announce when subscription get reactivated

- ⭐stop heartbeats for responses with status PNBadRequestCategory

## [v4.8.0](https://github.com/pubnub/javascript/tree/v4.8.0)

April-06-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.7.0...v4.8.0)

- 🌟allow manual control over network state via listenToBrowserNetworkEvents

## [v4.7.0](https://github.com/pubnub/javascript/tree/v4.7.0)

March-30-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.6.0...v4.7.0)

- 🌟add support for titanium SDK

- ⭐fix support for react-native SDK

- ⭐add validation for web distribution

## [v4.6.0](https://github.com/pubnub/javascript/tree/v4.6.0)

March-27-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.5.0...v4.6.0)

- 🌟add support for presence deltas.

- 🌟keep track of new and upcoming timetokens on status messages

## [v4.5.0](https://github.com/pubnub/javascript/tree/v4.5.0)

March-08-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.4.4...v4.5.0)

- 🌟add optional support for keepAlive by passing the keepAlive config into the init logic

## [v4.4.4](https://github.com/pubnub/javascript/tree/v4.4.4)

February-14-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.4.3...v4.4.4)

- ⭐add guard to check for channel or channel group on state setting

- ⭐add guard to check for publish, secret keys when performing a grant

## [v4.4.3](https://github.com/pubnub/javascript/tree/v4.4.3)

February-07-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.4.2...v4.4.3)

- ⭐downgrade superagent to v2; add new entry point for react native.

## [v4.4.2](https://github.com/pubnub/javascript/tree/v4.4.2)

January-31-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.4.1...v4.4.2)

- ⭐adjust compilation for webpack based compilations

## [v4.4.1](https://github.com/pubnub/javascript/tree/v4.4.1)

January-31-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.4.0...v4.4.1)

- ⭐proxy support for node

## [v4.4.0](https://github.com/pubnub/javascript/tree/v4.4.0)

January-23-2017

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.3.3...v4.4.0)

- ⭐upgrade dependencies; fix up linting.

- ⭐handle network outage cases for correct reporting.

## [v4.3.3](https://github.com/pubnub/javascript/tree/v4.3.3)

December-16-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.3.2...v4.3.3)

- ⭐bump version after v3 release.

## [v4.3.2](https://github.com/pubnub/javascript/tree/v4.3.2)

November-28-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.3.1...v4.3.2)

- ⭐removes bundling of package.json into the dist file

## [v4.3.1](https://github.com/pubnub/javascript/tree/v4.3.1)

November-22-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.3.0...v4.3.1)

- ⭐SDK now supports the restore config to allow message catch-up

## [v4.3.0](https://github.com/pubnub/javascript/tree/v4.3.0)

November-18-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.5...v4.3.0)

- ⭐bulk history exposed via pubnub.fetchMessages

- ⭐publish supports custom ttl interval

- ⭐v2 for audit and grant; no consumer facing changes.

- ⭐fixes for param validation on usage of promises

## [v4.2.5](https://github.com/pubnub/javascript/tree/v4.2.5)

November-04-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.4...v4.2.5)

- ⭐SDK reports on the id of the publisher in the message

## [v4.2.4](https://github.com/pubnub/javascript/tree/v4.2.4)

November-01-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.3...v4.2.4)

- ⭐Detection of support of promises improved.

## [v4.2.3](https://github.com/pubnub/javascript/tree/v4.2.3)

November-01-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.2...v4.2.3)

- ⭐Fixes on encoding of apostraphes.

## [v4.2.2](https://github.com/pubnub/javascript/tree/v4.2.2)

October-31-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.1...v4.2.2)

- ⭐Add promise support on setState operation (@jskrzypek)

- ⭐Add hooks to stop polling time when the number of subscriptions drops to 0 (@jasonpoe)

## [v4.2.1](https://github.com/pubnub/javascript/tree/v4.2.1)

October-30-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.0...v4.2.1)

- ⭐Encode signatures to avoid sending restricted characters

## [v4.2.0](https://github.com/pubnub/javascript/tree/v4.2.0)

October-26-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.1.1...v4.2.0)

- ⭐Add optional support for promises on all endpoints.

- ⭐History always returns timetokens in the payloads.

- ⭐Optionally, if queue size is set, send status on queue size threshold

## [v4.1.1](https://github.com/pubnub/javascript/tree/v4.1.1)

October-17-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.1.0...v4.1.1)

- ⭐Fix state setting for channels with reserved tags.

## [v4.1.0](https://github.com/pubnub/javascript/tree/v4.1.0)

October-13-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.13...v4.1.0)

- ⭐Reset timetoken when all unsubscribes happen

- ⭐Sign requests when a a secret key is passed

## [v4.0.13](https://github.com/pubnub/javascript/tree/v4.0.13)

October-05-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.12...v4.0.13)

- ⭐Propogate status events to the status callback on subscribe operations.

## [v4.0.12](https://github.com/pubnub/javascript/tree/v4.0.12)

October-03-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.11...v4.0.12)

- ⭐affectedChannels and affectedChannelGroups are now populated on subscribe / unsubscribe events

## [v4.0.11](https://github.com/pubnub/javascript/tree/v4.0.11)

September-27-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.10...v4.0.11)

- ⭐Dependency upgrades

## [v4.0.10](https://github.com/pubnub/javascript/tree/v4.0.10)

September-14-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.9...v4.0.10)

- ⭐Expose decryption and encryption as a global

## [v4.0.9](https://github.com/pubnub/javascript/tree/v4.0.9)

September-09-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.8...v4.0.9)

- ⭐Channel / subscription items are populated in

- ⭐Constants for operation and category are exposed on global object

## [v4.0.8](https://github.com/pubnub/javascript/tree/v4.0.8)

August-25-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.7...v4.0.8)

- ⭐Re-publish of v4.0.7

## [v4.0.7](https://github.com/pubnub/javascript/tree/v4.0.7)

August-25-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.6...v4.0.7)

- ⭐Dependency upgrades

- ⭐Try..catch wrapped around localStorage for iframe compliance

## [v4.0.6](https://github.com/pubnub/javascript/tree/v4.0.6)

August-18-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.5...v4.0.6)

- ⭐Adjustment of reconnection policies for web distributions.

- ⭐PNSDK support for partner identification

## [v4.0.5](https://github.com/pubnub/javascript/tree/v4.0.5)

August-10-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.4...v4.0.5)

- ⭐Stop exposing .babelrc which causes unpredictable behavior on react native.

## [v4.0.4](https://github.com/pubnub/javascript/tree/v4.0.4)

August-09-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.3...v4.0.4)

- ⭐Adjust handling of presence payloads for state settings.

- 🌟Exposing generateUUID method to create uuids.

- ⭐Triggering disconnect, reconnect events on Web distributions.

- ⭐React Native adjustments to package.json information.

## [v4.0.3](https://github.com/pubnub/javascript/tree/v4.0.3)

August-07-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.2...v4.0.3)

- ⭐Global Here Now parsing adjustments.

## [v4.0.2](https://github.com/pubnub/javascript/tree/v4.0.2)

August-03-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.1...v4.0.2)

- ⭐Adjustments to internet disconnects on node.

## [v4.0.1](https://github.com/pubnub/javascript/tree/v4.0.1)

August-01-2016

[Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.0...v4.0.1)

- 🐛Fixes to avoid double encoding on JSON payloads.

## [v4.0.0](https://github.com/pubnub/javascript/tree/v4.0.0)

- 🌟New iteration of JS / Node SDK family
