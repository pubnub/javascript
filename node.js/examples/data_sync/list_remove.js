
var PUBNUB = require("../../pubnub.js")

function log(r) {
	console.log(JSON.stringify(r));
}

var mylist = ["a", "b", "c", "d", "e", "f", "g", "h"];

var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin        : "pubsub.pubnub.com",
    auth_key	  : 'abcd'
});

var list = pubnub.sync('my.list');

list.merge(mylist);

setTimeout(function(){
	list.on.ready(function(ref){
		console.log('my.list :' + JSON.stringify(ref.value()));

		ref.each(function(element){
			console.log(JSON.stringify(element.value()));

			// lets see how to delete one element
			if (element.value() == 'e') {
				element.remove();
			}
		})

		// on remove callback on list, print list after each delete 
		list.on.remove(function(ref){
			console.log('my list on delete');
			pubnub.snapshot('my.list', function(r){
				console.log('my.list SNAPSHOT :' + JSON.stringify(r.value()));

				list.remove();  // remove whole list
			});
		});

	});
}, 5000);
