/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */
var pubnub  = require("./../pubnub.js");
var network = pubnub.init({
    publish_key   : "demo",
    subscribe_key : "demo",
    secret_key    : "",
    ssl           : true,
    origin        : "pubsub.pubnub.com"
});
console.log(pubnub.PNmessage);
