var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin        : "dara25.devbuild.pubnub.com"

});


function in_list(list,str) {
    for (var x in list) {
        if (list[x] == str) return true;
    }
    return false;
 }

 function in_list_deep(list,obj) {
    for (var x in list) {
        if (_.isEqual(list[x], obj)) return true;
    }
    return false;
 }

function pn_random(){
	return Math.floor((Math.random() * 100000000000000000000) + 1);
}

test("on.ready() should be invoked when sync reference ready", function() {
    expect(1);
    stop(1);
    var seed = pn_random() + '-ready-';
    var ref = pubnub.sync(seed + 'a.b');
    ref.on.ready(function(r){
        ok(true,"Ready should be called");
        ref.on.ready();
        start();
    });
});


test("each() should be able to iterate over a list", function() {
    expect(5);
    stop(2);
    var seed 				= pn_random() + '-ready-';
    var location 			= seed + 'office.occupants';
    var occupants_list 		= ["a", "b", "c", "d"];	 

    pubnub.merge({
    	'object_id' : location,
    	'data'		: occupants_list,
    	'success'	: function(r) {
    		start();
		    var occupants = pubnub.sync(location);
		    occupants.on.ready(function(r){

		    	occupants.each(function(occupant){
		    		ok(in_list(occupants_list, occupant.value()), "Occupant present in list");
		    	});


		    	ok(r.value().length == occupants_list.length);
		    	start();
		    });
    	},
    	'error'		: function(r) {
    		ok(false, "error occurred");
    		start();
    	}
    })


});