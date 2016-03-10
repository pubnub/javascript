#PubNub JavaScript SDK for Parse.com CloudCode platform.
###NOTICE: This platform build is designed for server-side Parse.com environment. For web-clients use our web platform builds https://github.com/pubnub/javascript/tree/master/web

The following methods are disabled in Parse.com platform SDK due to `#setTimeout()` unavailability:

* LEAVE
* LEAVE_GROUP
* get_heartbeat
* set_heartbeat
* get_heartbeat_interval
* set_heartbeat_interval
* unsubscribe
* subscribe
* get_subscibed_channels
* presence_heartbeat

How to use:

* place this file in /cloud/* folder of your app
* require it in your script:

  ```javascript
  var Pubnub = require('cloud/pubnub');
  ```
