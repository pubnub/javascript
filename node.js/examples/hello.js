/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */

var PUBNUB = require("../pubnub.js")

var pubnub = PUBNUB({
    publish_key   : "demo",
    subscribe_key : "demo"
    //cipher_key : "demo"
});

pubnub.publish({
    post: false,
channel : 'PubNubTest_RX',
message : { 'test' : 'f?ds' },
callback : function(details) {
var success = details[0]
, response = details[1];

if (success) console.log( "Success!", response );
if (!success) console.log( "Fail!", response );
}
});
