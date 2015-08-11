/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */
var PUBNUB  = require("./../pubnub.js");
var channel = 'demo';
var pubnub = PUBNUB.init({
    publish_key   : "demo",
    subscribe_key : "demo"
});



pubnub.history({
    channel  : channel,
    count : 5,
    include_token : true,
    string_message_token : true,
    callback : function(messages) {
        console.log(JSON.stringify(messages));
    }
});
