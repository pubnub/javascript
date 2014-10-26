
var PUBNUB = require("../../pubnub.js")

function log(r) {
	console.log(JSON.stringify(r));
}

var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin        : "dara24.devbuild.pubnub.com",
    auth_key	  : 'abcd'
});

var office_lights           = pubnub.sync('office.lights');
var office_lights_lights    = pubnub.sync('office.lights.lights');
var office                  = pubnub.sync('office');
var office_lights_get       = office.get('lights');


office_lights.on.ready(function(){
    console.log('OFFICE LIGHTS READY');
    console.log(JSON.stringify(office_lights.value('lights')));
});


office_lights_lights.on.ready(function(){
    console.log('OFFICE LIGHTS LIGHTS READY');
    console.log(JSON.stringify(office_lights_lights.value()));
});

office.on.ready(function(){
    console.log('OFFICE READY');
    console.log(JSON.stringify(office.value('lights.lights')));
});


office_lights.on.merge(function(){
    console.log('OFFICE LIGHTS MERGE');
    console.log(JSON.stringify(office_lights.value('lights')));

    office_lights_get.on.merge(function(){
        console.log('OFFICE LIGHTS (GET) MERGE');
        console.log(JSON.stringify(office_lights_get.value('lights')));
    });
});

office.on.merge(function(){
    console.log('OFFICE MERGE');
    console.log(JSON.stringify(office.value('lights.lights')));
});


office_lights_lights.on.merge(function(){
    console.log('OFFICE LIGHTS LIGHTS MERGE');
    console.log(JSON.stringify(office_lights_lights.value()));
});

office_lights_get.on.ready(function(){
    console.log('OFFICE LIGHTS (GET) READY');
    console.log(JSON.stringify(office_lights_get.value('lights')));
});


