
var PUBNUB = require("../pubnub.js")

function log(r) {
	console.log(JSON.stringify(r));
}

var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin        : "dara24.devbuild.pubnub.com",
    auth_key	  : 'abcd'
});




var home = pubnub.sync('home');

// Home object has finished downloading and is ready to use
home.on.ready(function(ref) {
    console.log('HOME READY');
    //console.log(JSON.stringify(home.value(), null, 2));
    
    // Bedroom 1
    var bedroom1 = home.get('bedroom1');
    
    var office = pubnub.sync('office');

    //office.merge({'lights5' : [1,2,3,4,5,6,7,8,9,10]});
    
    office.on.ready(function(){
        console.log('OFFICE READY');
        var office_lights = office.get('lights5');
        var office_lights0 = office.get('light0');

        console.log(JSON.stringify(office.value('lights5')));
        setInterval(function(){
            console.log((office_lights.removeByIndex(0)));
        },5000);
         office_lights0.pop();
        office.on.merge(function(){
            console.log('OFFICE MERGE');
            //console.log(office.value());
            console.log(JSON.stringify(office.value('lights5')));
        });
                office.on.remove(function(){
            console.log('OFFICE REMOVE');
            //console.log(office.value());
            console.log(JSON.stringify(office.value('lights5')));
        });

    });


    /*
    office_lights.push_with_sort_key('test7','z');

    setTimeout(function(){
        office_lights.push_with_sort_key("test-" + Date.now(),'z');
    }, 2000);
*/
    


    var light1 = bedroom1.get('light1');

    light1.on.merge(function(r){
        console.log('MERGE on HOME.BEDROOM1.light1');
        console.log(JSON.stringify(bedroom1.value('status'),null,2));
        console.log(JSON.stringify(r,null,2));
        console.log(JSON.stringify(r.value('status'),null,2));

    });

    light1.on.remove(function(r){
        console.log('REMOVE on HOME.BEDROOM1.light1');
        console.log(JSON.stringify(bedroom1.value('status'),null,2));
        console.log(JSON.stringify(light1.value('status'),null,2));
    });

    light1.on.replace(function(r){
        console.log('REPLACE on HOME.BEDROOM1.light1');
        console.log(JSON.stringify(bedroom1.value('status'),null,2));
        console.log(JSON.stringify(light1.value('status'),null,2));
    });
    

/*
    
    // Light 1
    var b1light1 = home.get('bedroom1.light1');

    var b1light2 = bedroom1.get('light2');


    // Light 1 Dedicated Event Listeners
    b1light1.on.merge(function(ref) {
    	log('Bedroom 1 Light 1 UPDATED');
        //log(bedroom1.value());
    	log(b1light1.value('status'));
    });

    // Light 1 Dedicated Event Listeners
    b1light2.on.merge(function(ref) {
        log('Bedroom 1 Light 2 UPDATED');
        //log(bedroom1.value());
        log(b1light2.value('status'));
    });

    // Write Data
    setTimeout(function(){
        home.merge({'bedroom1' :{ 'light1' : { status : 'off' }}});
    },1000);

    // Write Data
    setTimeout(function(){
        home.merge({'bedroom1' :{ 'light1' : { status : 'on' }}});
    },3000);

    
    // Write Data
    setTimeout(function(){
        b1light1.merge({'status' : 'off'});
    },6000);

    // Write Data
    setTimeout(function(){
        b1light1.merge({'status' : 'on'});
    },9000);

    // Write Data
    setTimeout(function(){
        home.merge({'bedroom1' :{ 'light2' : { status : 'off' }}});
    },10000);
    
    // Write Data
    setTimeout(function(){
        home.merge({'bedroom1' :{ 'light2' : { status : 'on' }}});
    },18000);

    
    // Write Data
    setTimeout(function(){
        b1light2.merge({'status' : 'off'});
    },27000);

    // Write Data
    setTimeout(function(){
        b1light2.merge({'status' : 'on'});
    },36000);
    
    */
    
})


home.on.error(function(info) { console.log(info) })

// Network Events
home.on.network.connect(function(info)    { /* network active   */ })
home.on.network.disconnect(function(info) { /* network inactive */ })
home.on.network.reconnect(function(info)  { /* network restored */ })
