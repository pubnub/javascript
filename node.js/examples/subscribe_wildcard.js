/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */

var pubnub = require("./../pubnub.js").init({
    publish_key   : "pub-c-c077418d-f83c-4860-b213-2f6c77bde29a",
    subscribe_key : "sub-c-e8839098-f568-11e2-a11a-02ee2ddab7fe"
});


/* ---------------------------------------------------------------------------
Listen for Messages
--------------------------------------------------------------------------- */



function subscribe(channel) {
    pubnub.subscribe({
        'channel' : channel,
        'connect' : function(c) {
            console.log('CONNECTED to ' + c);
        },
        'disconnect' : function(c) {
            console.log('CONNECTED to ' + c);
        },
        'reconnect' : function(c) {
            console.log('CONNECTED to ' + c);
        },
        'error' : function(e) {
            console.log('ERROR  ' + JSON.stringify(r));
        },
        'callback' : function(m,a,b,c,d) {
            console.log(JSON.stringify(m));
            console.log(JSON.stringify(b));
            console.log(JSON.stringify(d));
        }
    })
}

subscribe('ab.*');