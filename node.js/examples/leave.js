
var pubnub = require("../pubnub.js").init({
    publish_key   : "demo",
    subscribe_key : "demo"
});

function log(r) {
	console.log(JSON.stringify(r));
}

pubnub.subscribe({
	channel : ['b', 'c', 'd', 'e'],
	channel_group : ["gb", "gc", "gd", "ge"],
	callback : log,
	error : log,
	connect : log
});

setTimeout(function(){
	pubnub.unsubscribe({channel : ['c','e'], channel_group: ["gb", "ge"], callback : log})
},8000)