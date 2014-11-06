// Initialize PubNub

var pubnub = PUBNUB.init({
    write_key: "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key: "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin: "dara24.devbuild.pubnub.com"
});

// Define some generic callbacks

function log2(m,e,z) {
    return JSON.stringify(m, null, 4);
}

function log(m) {
    return JSON.stringify(m, null, 4);
}
function onError(m) {
    //console.log("Error: - " + m.op + " at " + m.path + " - onSuccess: " + JSON.stringify(m));
    console.log('Error');
}

function onSuccess(m) {
    //console.log("Success: - " + m.op + " at " + m.path + " - onSuccess: " + JSON.stringify(m));
    console.log('Success');
}

function refLog(ref) {
    console.log("Action at node " + ref.path + ".");
    console.log("It was a " + ref.type + " kinda change.");
    console.log("The changed data is " + log(ref.delta.changes));
    console.log("The changed data is " + log(ref.delta.changes[0].value));
    console.log("The new raw object looks like: " + log(ref.value()));
}

// We have many devices in a house. This house is organized by rooms.

var home = {}
var thermostat = {};
var occupants = {};
var garage_light1 = {};
var porch_light1 = {};
var porch_light2 = {};

var thermostatTemp = 10;
var thermostatStatus = "on";
var thermostatMode = "heat";

var dial = {};

$( document ).ready(function() {

    home = pubnub.sync('home');
    thermostat = pubnub.sync('home.living_room.thermostat');
    occupants = pubnub.sync('home.occupants');
    garage_light1 = pubnub.sync('home.garage.light1');
    porch_light1 = pubnub.sync('home.porch.light1');
    porch_light2 = pubnub.sync('home.porch.light2');

// Acknowledge when the thermostat has registered by turning it green

    thermostat.on.ready(function(ref) {
        $("#thermostat").css("background-color", "green");

        thermostatStatus = ref.value("status");
        thermostatTemp = ref.value("temperature");

        console.log(thermostatTemp);

        $("#thermostat #status").html(thermostatStatus);
        $("#thermostat #temperature").html(thermostatTemp);

        YUI().use('dial', function(Y) {

            dial = new Y.Dial({
                min:0,
                max:120,
                stepsPerRevolution:5,
                value: 30,
                strings: {"label":"Thermostat Control"}

            });

            dial.render('#thermostatDial');

            dial.on( "valueChange", function(e){
                if (e.newVal == thermostatTemp) {
                    return;
                }
                thermostat.replace({"temperature": e.newVal, "status":thermostatStatus, "mode":thermostatMode}, log, log);
            });

            dial.set('value', thermostatTemp);

        });

    });


    $("#thermostatMode").on('change', function(e){
        if (this.value == thermostatMode) {
            return;
        }
        thermostatMode = this.value;
        thermostat.replace({"temperature": thermostatTemp, "status":thermostatStatus, "mode":thermostatMode}, log, log);

    });

    thermostat.on.replace(function(ref){
        thermostatTemp = ref.value("temperature");
        $("#thermostatOutput").html("<pre>" + JSON.stringify(ref.value(), null, 4) + "</pre>");
    });

});



//
//
//
//
//
//
//home.on.change(function(ref){
//    console.log("CHANGE");
//    refLog(ref);
//});
//
//home.on.merge(function(ref) {
//    console.log("MERGE");
//    refLog(ref);
//});
//
//home.on.replace(function(ref) {
//    console.log("REPLACE");
//    refLog(ref);
//});
//
//home.on.remove(function(ref) {
//    console.log("REMOVE");
//    refLog(ref);
//});
//
//
//home.on.ready(function (ref) {
//    //console.log("Home is Ready. Value: " + log(home.value()));
//
//    occupants = pubnub.sync('home.occupants');
//    porch_light1 = pubnub.sync('home.porch_light1');
//    porch_light2 = pubnub.sync('home.porch_light2');
//    light2 = pubnub.sync('home.bedroom1.light2');
//    garage_light1 = pubnub.sync('home.bedroom1.light1');
//
//
//    garage_light1.on.ready(function (ref) {
//
//        setTimeout(function(){
//            console.log("garage_light1 Ready. Value: " + log(ref.value()));
//            console.log("Now turning garage_light1 on...");
//            garage_light1.replace({ status: 'on' }, onSuccess, onError);
//            garage_light1.replace({ config: {intensity: "low"} }, onSuccess, onError);
//            garage_light1.replace({ config: {color: "mauve"} }, onSuccess, onError);
//        }, 2000);
//    });
//
//    occupants.on.change(function(ref) {
//        console.log("Occupancy change: " + log(occupants.value()));
//    });
//
//    // pubnub.snapshot({"object_id":"home", "path":"occupants", "callback":log2, "error":log2});
//    // pubnub.snapshot({"object_id":"home.occupants", "callback":console.log, "error":console.log});
//
//    //garage_light1.merge({ status: 'dontknow' }, log2, log2);
//
//    pubnub.merge({
//        object_id : "home.z",
//        data      : {
//            "name" : {
//                "first" : "John"
//            },
//            "age" : 20
//        },
//        callback  : log2,
//        error     : log2
//    })
//
//
//});
