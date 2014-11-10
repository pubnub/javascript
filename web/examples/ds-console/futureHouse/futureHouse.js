// Initialize PubNub

var pubnub = PUBNUB.init({
    write_key: "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key: "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin: "pubsub.pubnub.com"
});

// Define some generic callbacks

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

var dial = {};

// We have many devices in a house. This house is organized by rooms.

var home = {}
var thermostat = {};
var occupants = {};
var garage_light1 = {};
var porch_light1 = {};
var porch_light2 = {};

var connectionStatusIcon = "disconnect.png";

// These are populated by callbacks on home.thermostat
var thermostatTemp = -1;
var thermostatStatus = "unknown";
var thermostatMode = "unknown";

// These are populated by callbacks from home.occupants
var momHome = "";
var dadHome = "";
var sisterHome = "";
var brotherHome = "";
var dogHome = "";
var pizzaHome = "";
var presenceObject = {};


function thermostatSetter(ref) {

    if (ref.value("temperature")) {
        thermostatTemp = ref.value("temperature");
    }

    if (ref.value("mode")) {
        thermostatMode = ref.value("mode");
    }

    if (ref.value("status")) {
        thermostatStatus = ref.value("status");
    }

    $("#thermostatOutput").html("<pre>" + JSON.stringify(ref.value(), null, 4) + "</pre>");

}

function logOccupants() {
    $("#occupancyOutput").html("<pre>" + log(presenceObject) + "</pre>");
}
function refreshPresenceObject(ref) {
    // If !ref.data then our reference is now empty
    if (!ref.data) {
        //console.log("tree is empty!");
        logOccupants();
        return;
    }
    //console.log(log(ref.data));
    $.each(ref.data, function (index, value) {
        presenceObject[value.pn_val] = index;
    });
    logOccupants();
}

function roofSelector(person){
    return $('#' + person + 'Roof');
}

$(document).ready(function () {

    home = pubnub.sync('home');
    thermostat = pubnub.sync('home.living_room.thermostat');
    occupants = pubnub.sync('home.occupants');
    garage_light1 = pubnub.sync('home.garage.light1');
    porch_light1 = pubnub.sync('home.porch.light1');
    porch_light2 = pubnub.sync('home.porch.light2');

// Acknowledge when the thermostat has registered by turning it green

    thermostat.on.ready(function (ref) {
        $("#connectStatus").attr("src", "img/connect.png");
        $("#thermostat").css("background-color", "green");

        thermostatSetter(ref);

        YUI().use('dial', function (Y) {

            dial = new Y.Dial({
                min: 0,
                max: 120,
                stepsPerRevolution: 5,
                value: 30,
                strings: {"label": "Thermostat Control"}

            });

            dial.render('#thermostatDial');

            dial.on("valueChange", function (e) {
                if (e.newVal == thermostatTemp) {
                    return;
                }
                thermostat.replace({"temperature": e.newVal, "status": "thermostatStatus", "mode": thermostatMode}, log, log);
            });

            dial.set('value', thermostatTemp);
        });
    });

    $("#thermostatMode").on('change', function (e) {
        // Note, we're not setting the mode here. We'll set that at the on.replace callback below.
        if (thermostatMode == "heat") {
            thermostat.replace({"temperature": thermostatTemp, "status": thermostatStatus, "mode": "cold"}, log, log);
        } else {
            thermostat.replace({"temperature": thermostatTemp, "status": thermostatStatus, "mode": "heat"}, log, log);
        }

    });

    thermostat.on.replace(function (ref) {
        thermostatSetter(ref);
    });

    // Occupants Logic

    $(".family").on("click", function (e) {
        var person = this.id;
        if (!person) {
            console.log("No ID found on clicked person.");
            return;
        }

        if (presenceObject[person]) {
            // here we show examples of manually storing the key to remove a list item
            // vs removing a list item by name (only safe when in a "Set" / no dup name paradigm)

            //occupants.remove(presenceObject["mom"], log, log);
            occupants.removeByKey(presenceObject[person], log, log);
            // occupants.removeByValue('mom', log, log); // alternatively, if we knew this was a unique value
            // occupants.removeByIndex(0); // only if performing queue-like operations

        } else {
            occupants.push(person);
        }
    });

    // When occupants is ready, lets add all members to our presenceObject.
    occupants.on.ready(function (ref) {
        refreshPresenceObject(ref);
    });

    // On each change, just delete and recreate the presence object.
    // This is lazy, but easy.

    occupants.on.change(function (ref) {
//        presenceObject = {};
//        refreshPresenceObject(ref);
    });

    // Alternatively, we have the fine-grained control to easily handle remove operations on the occupants
    // When an occupant is removed
    occupants.on.remove(function (ref) {
        var removedUser = ref.delta.changes[0].value;
        var removedKey = ref.delta.changes[0].key;

        console.log("Occupant Removed: " + removedUser + " at " + removedKey);
        delete presenceObject[removedUser];

        roofSelector(removedUser).toggle();

        logOccupants();
    });


    // When an occupant is merged. For lists, this will be called on push()
    occupants.on.merge(function (ref) {
        var addedUser = ref.delta.changes[0].value;
        var addedKey = ref.delta.changes[0].key;

        console.log("Occupant Added: " + addedUser + " at " + addedKey);
        presenceObject[addedUser] = addedKey;

        roofSelector(addedUser).toggle();

        logOccupants();

    });


    home.on.ready(function (ref) {

        home.on.remove(function (ref) {
            //console.log("REMOVE");
            //refLog(ref);
        });

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
