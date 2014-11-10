
var PUBNUB = require("../../pubnub.js")

function log(r) {
	console.log(JSON.stringify(r, null, 2));
}

var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin        : "dara25.devbuild.pubnub.com",
    auth_key	  : 'abcd'
});


function log_after(msg, timeout, indent) {
    setTimeout(function(){
        console.log(JSON.stringify(msg, null, indent));
    }, timeout * 1000);
}


function log(msg) {
    if (1) {
        console.log(msg);
    } else {
        log_after(msg, 2, 2);
    }
}


var home = pubnub.sync('ab');
var d = pubnub.sync('ab.a.b.c.d');
var e = pubnub.sync('az');
var f = pubnub.sync('az.a.b.c.d');
var g = pubnub.sync('ab.a.b.c');



// Home object has finished downloading and is ready to use
home.on.ready(function(ref) {
    console.log('HOME READY');
    log(ref.value());
})

home.on.merge(function(r){
    console.log('HOME MERGE');
    console.log(JSON.stringify(r.value(), null, 2));
})



home.on.error(function(info) { console.log(info) })

// Network Events
home.on.network.connect(function(info)    {})
home.on.network.disconnect(function(info) {  })
home.on.network.reconnect(function(info)  {  })




var h = pubnub.sync('ab');

h.on.ready(function(r){
    log('AB READY ' + JSON.stringify(r.value()));
});





g.on.ready(function(r){
    log('AB.A.B.C READY ' + JSON.stringify(r.value()));
})

g.on.resync(function(r){
    log('AB.A.B.C RESYNC ' + JSON.stringify(r.value()));
})


d.on.ready(function(r){
    log('AB.A.B.C.D READY ' + JSON.stringify(r.value()));
})

d.on.resync(function(r){
    log('AB.A.B.C.D RESYNC ' + JSON.stringify(r.value()));
})

e.on.ready(function(r){
    log('AZ READY ' + JSON.stringify(r.value()));
})

f.on.ready(function(r){
    log('AZ.A.B.C.D READY ' + JSON.stringify(r.value()));
})
f.on.resync(function(r){
    log('AZ.A.B.C.D RESYNC ' + JSON.stringify(r.value()));
})

d.on.merge(function(r){
    console.log('D MERGE');
    console.log(JSON.stringify(r.value()));
})

setInterval(function(){
    setTimeout(function(){
        var x = '10' + Date.now();
        console.log('MERGING ' + x + ' at D'); 
        d.merge(x, function(){
            setTimeout(function(){
                home.resync();
            },2000);
        });
    }, 5000)
}, 10000)

/*
setTimeout(function(){
    d.merge('10' + Date.now());
}, 20000)
*/
