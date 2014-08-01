/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */

var PUBNUB = require("../pubnub.js")

var pubnub = PUBNUB({
    write_key     : "pub-c-952bded9-99f6-455f-b2c6-1e34cd2af6dd",
    read_key      : "sub-c-ea59aa58-1739-11e4-a9f2-02ee2ddab7fe",
    origin        : "pubsub-beta.pubnub.com",
    auth_key	  : 'abcd'
});

var ds = pubnub.sync("dp");

ds.on.ready(function(){
	console.log('READY');
	console.log(JSON.stringify(ds.get(), null, 2));
});


// Data Events
ds.on.update(function(params) { 
    console.log('UPDATE');
	console.log(JSON.stringify(params));
	console.log(JSON.stringify(ds.get(), null, 2));
})

ds.on.set(function(params){ 
    console.log('SET');
	console.log(JSON.stringify(params));
	console.log(JSON.stringify(ds.get(), null, 2));
})

ds.on.remove(function(params){ 
    console.log('REMOVE');
	console.log(JSON.stringify(params));
	console.log(JSON.stringify(ds.get(), null, 2));
})

ds.on.error(function(params){ 
    console.log('ERROR');
	console.log(JSON.stringify(params));
})

// Network Events
ds.on.network.connect(function(params)      { console.log(JSON.stringify(params)); })
ds.on.network.disconnect(function(params)   { console.log(JSON.stringify(params)); })
ds.on.network.reconnect(function(params)    { console.log(JSON.stringify(params)); })
