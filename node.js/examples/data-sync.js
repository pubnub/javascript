/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */

var PUBNUB = require("../pubnub.js")

var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin        : "dara24.devbuild.pubnub.com",
    auth_key	  : 'abcd'
});

var ds = pubnub.sync("dp3");

ds.on.ready(function(){
	console.log('READY');
	console.log(JSON.stringify(ds.value(), null, 2));
});


// Data Events
ds.on.merge(function(params) { 
    console.log('UPDATE');
	console.log(JSON.stringify(params.value(), null, 2));
	//console.log(JSON.stringify(ds.get(), null, 2));
})

ds.on.replace(function(params){ 
    console.log('REPLACE');
	//console.log(JSON.stringify(params));
	console.log(JSON.stringify(params.value(), null, 2));
})

ds.on.remove(function(params){ 
    console.log('REMOVE');
	//console.log(JSON.stringify(params));
	console.log(JSON.stringify(params.value(), null, 2));
})

ds.on.error(function(params){ 
    console.log('ERROR');
	console.log(JSON.stringify(params));
})

// Network Events
ds.on.network.connect(function(params)      { console.log(JSON.stringify(params)); })
ds.on.network.disconnect(function(params)   { console.log(JSON.stringify(params)); })
ds.on.network.reconnect(function(params)    { console.log(JSON.stringify(params)); })

/*
ds1 = ds.get('a').get('a');

ds1.on.ready(function(){
    console.log('READY');
    console.log(JSON.stringify(ds1.value(), null, 2));
});


// Data Events
ds1.on.update(function(params) { 
    console.log('UPDATE 1');
    console.log(JSON.stringify(params.value(), null, 2));
    //console.log(JSON.stringify(ds.get(), null, 2));
})

ds1.on.set(function(params){ 
    console.log('SET 1');
    //console.log(JSON.stringify(params));
    console.log(JSON.stringify(params.value(), null, 2));
})

ds1.on.remove(function(params){ 
    console.log('REMOVE 1');
    //console.log(JSON.stringify(params));
    console.log(JSON.stringify(params.value(), null, 2));
})

ds1.on.error(function(params){ 
    console.log('ERROR 1');
    console.log(JSON.stringify(params.value()));
})

// Network Events
ds1.on.network.connect(function(params)      { console.log(JSON.stringify(params)); })
ds1.on.network.disconnect(function(params)   { console.log(JSON.stringify(params)); })
ds1.on.network.reconnect(function(params)    { console.log(JSON.stringify(params)); })

*/
