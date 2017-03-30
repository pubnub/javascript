
## [v4.7.0](https://github.com/pubnub/javascript/tree/v4.7.0)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.6.0...v4.7.0)

- 🌟add support for titanium SDK



- ⭐fix support for react-native SDK


- ⭐add validation for web distribution



## [v4.6.0](https://github.com/pubnub/javascript/tree/v4.6.0)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.5.0...v4.6.0)

- 🌟add support for presence deltas.


- 🌟keep track of new and upcoming timetokens on status messages




## [v4.5.0](https://github.com/pubnub/javascript/tree/v4.5.0)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.4.4...v4.5.0)

- 🌟add optional support for keepAlive by passing the keepAlive config into the init logic




## [v4.4.4](https://github.com/pubnub/javascript/tree/v4.4.4)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.4.3...v4.4.4)


- ⭐add guard to check for channel or channel group on state setting


- ⭐add guard to check for publish, secret keys when performing a grant



## [v4.4.3](https://github.com/pubnub/javascript/tree/v4.4.3)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.4.2...v4.4.3)


- ⭐downgrade superagent to v2; add new entry point for react native.



## [v4.4.2](https://github.com/pubnub/javascript/tree/v4.4.2)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.4.1...v4.4.2)


- ⭐adjust compilation for webpack based compilations



## [v4.4.1](https://github.com/pubnub/javascript/tree/v4.4.1)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.4.0...v4.4.1)


- ⭐proxy support for node



## [v4.4.0](https://github.com/pubnub/javascript/tree/v4.4.0)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.3.3...v4.4.0)


- ⭐upgrade dependencies; fix up linting.


- ⭐handle network outage cases for correct reporting.



## [v4.3.3](https://github.com/pubnub/javascript/tree/v4.3.3)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.3.2...v4.3.3)


- ⭐bump version after v3 release.



## [v4.3.2](https://github.com/pubnub/javascript/tree/v4.3.2)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.3.1...v4.3.2)


- ⭐removes bundling of package.json into the dist file



## [v4.3.1](https://github.com/pubnub/javascript/tree/v4.3.1)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.3.0...v4.3.1)


- ⭐SDK now supports the restore config to allow message catch-up



## [v4.3.0](https://github.com/pubnub/javascript/tree/v4.3.0)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.5...v4.3.0)


- ⭐bulk history exposed via pubnub.fetchMessages


- ⭐publish supports custom ttl interval


- ⭐v2 for audit and grant; no consumer facing changes.


- ⭐fixes for param validation on usage of promises



## [v4.2.5](https://github.com/pubnub/javascript/tree/v4.2.5)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.4...v4.2.5)


- ⭐SDK reports on the id of the publisher in the message



## [v4.2.4](https://github.com/pubnub/javascript/tree/v4.2.4)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.3...v4.2.4)


- ⭐Detection of support of promises improved.



## [v4.2.3](https://github.com/pubnub/javascript/tree/v4.2.3)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.2...v4.2.3)


- ⭐Fixes on encoding of apostraphes.



## [v4.2.2](https://github.com/pubnub/javascript/tree/v4.2.2)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.1...v4.2.2)


- ⭐Add promise support on setState operation (@jskrzypek)


- ⭐Add hooks to stop polling time when the number of subscriptions drops to 0 (@jasonpoe)



## [v4.2.1](https://github.com/pubnub/javascript/tree/v4.2.1)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.2.0...v4.2.1)


- ⭐Encode signatures to avoid sending restricted characters



## [v4.2.0](https://github.com/pubnub/javascript/tree/v4.2.0)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.1.1...v4.2.0)


- ⭐Add optional support for promises on all endpoints.


- ⭐History always returns timetokens in the payloads.


- ⭐Optionally, if queue size is set, send status on queue size threshold



## [v4.1.1](https://github.com/pubnub/javascript/tree/v4.1.1)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.1.0...v4.1.1)


- ⭐Fix state setting for channels with reserved tags.



## [v4.1.0](https://github.com/pubnub/javascript/tree/v4.1.0)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.13...v4.1.0)


- ⭐Reset timetoken when all unsubscribes happen


- ⭐Sign requests when a a secret key is passed



## [v4.0.13](https://github.com/pubnub/javascript/tree/v4.0.13)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.12...v4.0.13)


- ⭐Propogate status events to the status callback on subscribe operations.



## [v4.0.12](https://github.com/pubnub/javascript/tree/v4.0.12)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.11...v4.0.12)


- ⭐affectedChannels and affectedChannelGroups are now populated on subscribe / unsubscribe events



## [v4.0.11](https://github.com/pubnub/javascript/tree/v4.0.11)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.10...v4.0.11)


- ⭐Dependency upgrades



## [v4.0.10](https://github.com/pubnub/javascript/tree/v4.0.10)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.9...v4.0.10)


- ⭐Expose decryption and encryption as a global



## [v4.0.9](https://github.com/pubnub/javascript/tree/v4.0.9)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.8...v4.0.9)


- ⭐Channel / subscription items are populated in


- ⭐Constants for operation and category are exposed on global object



## [v4.0.8](https://github.com/pubnub/javascript/tree/v4.0.8)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.7...v4.0.8)


- ⭐Re-publish of v4.0.7



## [v4.0.7](https://github.com/pubnub/javascript/tree/v4.0.7)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.6...v4.0.7)


- ⭐Dependency upgrades


- ⭐Try..catch wrapped around localStorage for iframe compliance



## [v4.0.6](https://github.com/pubnub/javascript/tree/v4.0.6)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.5...v4.0.6)


- ⭐Adjustment of reconnection policies for web distributions.


- ⭐PNSDK support for partner identification



## [v4.0.5](https://github.com/pubnub/javascript/tree/v4.0.5)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.4...v4.0.5)


- ⭐Stop exposing .babelrc which causes unpredictable behavior on react native.



## [v4.0.4](https://github.com/pubnub/javascript/tree/v4.0.4)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.3...v4.0.4)


- ⭐Adjust handling of presence payloads for state settings.

- 🌟Exposing generateUUID method to create uuids.



- ⭐Triggering disconnect, reconnect events on Web distributions.


- ⭐React Native adjustments to package.json information.



## [v4.0.3](https://github.com/pubnub/javascript/tree/v4.0.3)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.2...v4.0.3)


- ⭐Global Here Now parsing adjustments.



## [v4.0.2](https://github.com/pubnub/javascript/tree/v4.0.2)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.1...v4.0.2)


- ⭐Adjustments to internet disconnects on node.



## [v4.0.1](https://github.com/pubnub/javascript/tree/v4.0.1)


  [Full Changelog](https://github.com/pubnub/javascript/compare/v4.0.0...v4.0.1)



- 🐛Fixes to avoid double encoding on JSON payloads.


## [v4.0.0](https://github.com/pubnub/javascript/tree/v4.0.0)



- 🌟New iteration of JS / Node SDK family



