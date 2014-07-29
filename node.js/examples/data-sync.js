/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */

var PUBNUB = require("../pubnub.js")

var pubnub = PUBNUB({
    write_key   : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin        : "pubsub-beta.pubnub.com"
});

var ds = pubnub.sync("dp.a.b");

ds.on.ready(function(){
	console.log('READY');
	console.log(JSON.stringify(ds.content.data, null, 2));
});


// Data Events
ds.on.update(function(params) { 
	console.log(JSON.stringify(params));
	console.log(JSON.stringify(ds.content.data, null, 2));
})
ds.on.set(function(params){ 
	console.log(JSON.stringify(params));
	console.log(JSON.stringify(ds.content.data, null, 2));
})
ds.on.remove(function(params){ 
	console.log(JSON.stringify(params));
	console.log(JSON.stringify(ds.content.data, null, 2));
})
ds.on.error(function(params){ 
	console.log(JSON.stringify(params));
	console.log(JSON.stringify(ds.content.data, null, 2));
})

// Network Events
ds.on.network.connect(function(params)      { console.log(JSON.stringify(params)); })
ds.on.network.disconnect(function(params)   { console.log(JSON.stringify(params)); })
ds.on.network.reconnect(function(params)    { console.log(JSON.stringify(params)); })
