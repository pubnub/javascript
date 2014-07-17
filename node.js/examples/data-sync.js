/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */

var PUBNUB = require("../pubnub.js")

var pubnub = PUBNUB({
    publish_key   : "demo",
    subscribe_key : "demo",
    origin        : "pubsub-beta.pubnub.com"
});

function read() {
pubnub.get({
	callback : console.log,
    error : console.log,
    object_id : 'biggest',
});
}
//read()
/*
var x = { "a" : Date.now()}
pubnub.write({
	callback : function(r){console.log(JSON.stringify(r)); read();},
    error : console.log,
    object_id : 'abcd1',
    data : x
})
/*
pubnub.delete({
	callback : console.log,
    error : console.log,
    object_id : 'game',
});
*/
/*  
setInterval(function(){
    pubnub.write({
        callback : function(){},
        //callback : console.log,
        error : console.log,
        object_id : 'devdb',
        path  : '/home/owner/Bob',
        data : {'is_away' : true}
    })
    setTimeout(function(){
        pubnub.write({
            callback : function(){},
            //callback : console.log,
            error : console.log,
            object_id : 'devdb',
            path  : '/home/owner/Bob',
            data : {'is_away' : false}
        })
    }, 50);
},100);
*/
var o = pubnub.get_synced_object({
	'object_id' : 'biggest',
    callback : function(r){ console.log(r); console.log(JSON.stringify(o, null, 2)); },
    error : function(r){ console.log(r); console.log(JSON.stringify(o, null, 2)); },
    connect : function(r){ console.log(r); console.log(JSON.stringify(o, null, 2)); console.log(r)}
});

/*
setInterval(function(){
    pubnub.set({
        'object_id' : 'devd2',
        'data' : {"a" : "set-" + Date.now()},
        callback : function(r){ console.log(r); console.log(JSON.stringify(o, null, 2)); },
        error : function(r){ console.log(r); console.log(JSON.stringify(o, null, 2)); }
    });
}, 10000);
/*
pubnub.grant({
    'object_id' : 'devd2',
    'read' : true,
    'write' : false,
    callback : function(r){ console.log(JSON.stringify(r, null, 2)); },
    error : function(r){console.log(JSON.stringify(r, null, 2)); }
});

setTimeout(function(){
    pubnub.audit({
        'object_id' : 'devd2',
        callback : function(r){ console.log(JSON.stringify(r, null, 2)); },
        error : function(r){console.log(JSON.stringify(r, null, 2)); }
    }  );
},5000);
*/
