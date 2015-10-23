/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */
var PUBNUB  = require("./../pubnub.js");
var channel = 'my_channel1';
var pubnub = PUBNUB.init({
    publish_key   : "demo",
    subscribe_key : "demo",
    cipher_key    : "enigma"
});
var pubnub1 = PUBNUB.init({
    publish_key   : "demo",
    subscribe_key : "demo"
});

pubnub.history({
	'channel' : channel,
    'callback' : function(r) {
		console.log(JSON.stringify(r));
	},
	'error' : function(r) {

	}
});
pubnub.history({
    'include_token' : true,
	'channel' : channel,
    'callback' : function(r) {
		console.log(JSON.stringify(r));
	},
	'error' : function(r) {

	}
});
pubnub1.history({
    'include_token' : true,
	'channel' : channel,
    'callback' : function(r) {
		console.log(JSON.stringify(r));
	},
	'error' : function(r) {

	}
});
