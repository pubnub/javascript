/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */

var pubnub = require("./../pubnub.js").init({
    publish_key   : "demo",
    subscribe_key : "demo"
});

/* ---------------------------------------------------------------------------
Listen for Messages
--------------------------------------------------------------------------- */
pubnub.subscribe({
    channel  : "a",
    windowing : 10000,
    callback : function(message) {
        console.log( " > ", message );
    }
});
