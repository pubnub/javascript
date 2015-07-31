/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */
var PUBNUB  = require("./../pubnub.js");
var channel = 'my_channel1';
var pubnub = PUBNUB.init({
    publish_key   : "demo",
    subscribe_key : "demo"
});



pubnub.history({
    channel  : channel,
    include_token : true,
    string_message_token : true,
    callback : function(messages) {
        console.log(JSON.stringify(messages));
    }
});
