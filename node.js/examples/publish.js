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
pubnub.publish({
    channel  : "JAY",
    message  : "askldjflksjd_POST",
    callback : log,
    error    : retry
});

function log(e) { console.log(e) }
function retry() { console.log('retry?') }
