
var PUBNUB = require("../../pubnub.js")

function log(r) {
    console.log(JSON.stringify(r, null, 2));
}

var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin        : "dara25.devbuild.pubnub.com",
    auth_key      : 'abcd'
});


function log(msg, space) {
	var s = ''
	for (var i = 0; i < space;i++) {
		s += '  ';
	}
	console.log(s + msg);
}

var occupants = pubnub.sync('office.occupants');


function nested_list(r, space) {
	if (!r.each) {
		log(r.value(), space);
	}
	else {
		++space;
		r.each(function(x){
			nested_list(x,space);
		})
	}
}

occupants.on.ready(function(r){
    console.log('OCCUPANTS READY');
    nested_list(r,0);
})
