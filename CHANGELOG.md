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



