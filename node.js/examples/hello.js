/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */

var PUBNUB = require("../pubnub.js")

var pubnub1 = PUBNUB({
    publish_key   : "demo",
    subscribe_key : "demo",
    cipher_key : "demo"
});
var pubnub = pubnub1.secure({
    publish_key   : "demo",
    subscribe_key : "demo",
    cipher_key : "demo"
});
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
    }

});
setTimeout(function(){
pubnub.publish({'channel' : 'a', 'message' : 'hi', callback : console.log});
},3000);
