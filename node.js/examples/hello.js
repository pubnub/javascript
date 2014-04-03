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


console.log(pubnub.get_version());
/* ---------------------------------------------------------------------------
Listen for Messages
--------------------------------------------------------------------------- */
pubnub.subscribe({
    channel  : "a",
    callback : function(message) {
        console.log( " > ", message );
    },
    error : function(r) {
       console.log(JSON.stringify(r));
    },
    presence : function(r) { console.log(JSON.stringify(r)) }

});
