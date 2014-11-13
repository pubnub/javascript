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
    console.log('Error: ' + log(m));
}

function onSuccess(m) {
    console.log('Success: ' + log(m));
}

function logLogfile(m) {
    var prettyData = m.value();
    if (prettyData.length > 0) {
        $("#fullLog").html(log(prettyData.slice(0, 5)));
    } else {
        $("#fullLog").html("No log data to show!");
    }

}

function refLog(ref) {
    console.log("Action at node " + ref.path + ".");
    console.log("It was a " + ref.type + " kinda change.");
    console.log("The changed data is " + log(ref.delta));
    console.log("The changed data is " + log(ref.delta[0].value));
    console.log("The new raw object looks like: " + log(ref.value()));
}

var dial = {};

// We have many devices in a house. This house is organized by rooms.

var home = {}
var thermostat = {};
var occupants = {};


var connectionStatusIcon = "disconnect.png";

// These are populated by callbacks on home.thermostat
var thermostatTemp = -1;
var thermostatPower = "unknown";
var thermostatMode = "unknown";

// These are populated by callbacks from home.occupants
var presenceObject = {};


function thermostatSetter(ref) {

    if (ref.value("temperature")) {
        thermostatTemp = ref.value("temperature");
        $("#currentTemp").html(thermostatTemp);
    }

    if (ref.value("mode")) {
        thermostatMode = ref.value("mode");
        $("#thermostatMode").html(thermostatMode);
    }

    if (ref.value("power")) {
        thermostatPower = ref.value("power");
        $("#thermostatPower").html(thermostatPower);
    }

    $("#thermostatLogs").html("<pre>" + log(ref.value()) + "</pre>");

}

function logOccupants() {

    var presenceCount = Object.keys(presenceObject).length;
    console.log(presenceCount);

    $("#occupancyLogs").html("<pre>" + log(presenceObject) + "</pre>");

    // if nobody is home
    if (presenceCount == 0) {

        // turn off all but the porch lights
        $("#houseScene").attr("src", "img/house_at_night_porch_on.jpg");
        // set the thermostat to heat at 65
        thermostatPower = "on";
        thermostatMode = "heat";
        thermostatTemp = 65;
        thermostat.replace({"data": {"temperature": thermostatTemp, "power": thermostatPower, "mode": thermostatMode}, "success": onSuccess, "error": onError});

        if (dial.set) {
            dial.set('value', thermostatTemp);
        }


    }
    else if (presenceCount == 1 && (presenceObject["dog"] || presenceObject["pizza"])) {
        // if there is only one person home, and its the dog or pizza delivery
        // then don't turn the lights on
        return;

    }
    else if (presenceCount == 2 && (presenceObject["dog"] && presenceObject["pizza"])) {
        // if there are two people home, and its the dog and pizza delivery
        // then don't turn the lights on
        return;
    } else {

        $("#houseScene").attr("src", "img/house_at_night_all_on.jpg");
    }
}

function refreshPresenceObject(ref) {


    // If !ref.data then our reference is now empty
    if (!ref.data) {
        //console.log("tree is empty!");
        logOccupants();
        return;
    }

    $.each(ref.data, function (index, value) {
        var person = value.pn_val;
        presenceObject[ person] = index;
        console.log(person);
        roofSelector(person).toggle();
    });

    logOccupants();
}

function roofSelector(person) {
    return $('#' + person + 'Roof');
}

$(document).ready(function () {

    // TODO: Change everything to positional

    home = pubnub.sync({"object_id": 'home'});
    thermostat = pubnub.sync({"object_id": 'home.living_room.thermostat'});
    occupants = pubnub.sync({"object_id": 'home.occupants'});

    $("#addLogMerge").on('keydown', function (e) {
        if (e.keyCode == 13) {
            console.log("Log Merging!");

            // TODO: Do not document detached methods

            pubnub.merge({"object_id": "home.log.custom", "data": this.value, "success": onSuccess, "error": onError});
        }
    });

    $("#addLogPushValue").on('keydown', function (e) {
        if (e.keyCode == 13) {

            var sortKey = $("#addLogPushSortKey").val();
            var pushArg = {"object_id": "home.log.entries", "data": this.value, "success": onSuccess, "error": onError};

            if (sortKey && sortKey.length > 0) {
                console.log("Adding Custom Sort Key: " + sortKey + " !");
                pushArg['sort_key'] = sortKey;
            }
            console.log("Log Pushing!");
            pubnub.push(pushArg);
        }
    });


    $("#deleteLog").on('click', function (e) {
        console.log("Removing at home.log");
        pubnub.remove({"object_id": "home.log", "success": onSuccess, "error": onError});
    });

    $("#truncateLog").on('click', function (e) {
        console.log("Truncating at home.log");
        pubnub.replace({"object_id": "home.log", "data": {}, "success": onSuccess, "error": onError});
    });

    $("#getLogfile").on('click', function (e) {
        // Using callback instead of success
        // Should be ok in general, but bad form :)
        // https://www.pivotaltracker.com/story/show/82518702

        // TODO: Hide snapshot from this version or strip pn_* data
        // If we keep it, make it parameterized

        pubnub.snapshot({"object_id": "home.log.entries", "callback": logLogfile, "error": logLogfile});

    });

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
                strings: {"label": ""}

            });

            dial.render('#thermostatDial');

            dial.on("valueChange", function (e) {
                if (e.newVal == thermostatTemp) {
                    return;
                }
                // TODO: Make it parameterized
                thermostat.replace({"data": {"temperature": e.newVal, "power": thermostatPower, "mode": thermostatMode}, "success": log, "error": log});
            });

            dial.set('value', thermostatTemp);
        });
    });

    $("#thermostatMode").on('click', function (e) {
        // Note, we're not setting the mode here. We'll set that at the on.replace callback below.
        if (thermostatMode == "heat") {

            thermostat.replace({"data": {"temperature": thermostatTemp, "power": thermostatPower, "mode": "cold"}, "success": log, "error": log});
        } else {
            thermostat.replace({"data": {"temperature": thermostatTemp, "power": thermostatPower, "mode": "heat"}, "success": log, "error": log});
        }

    });

    $("#thermostatPower").on('click', function (e) {
        // Note, we're not setting the mode here. We'll set that at the on.replace callback below.
        if (thermostatPower == "on") {
            thermostat.replace({"data": {"temperature": thermostatTemp, "power": "off", "mode": thermostatMode}, "success": log, "error": log});
        } else {
            thermostat.replace({"data": {"temperature": thermostatTemp, "power": "on", "mode": thermostatMode}, "success": log, "error": log});
        }
    });

    $("#thermostatAwayMode").on('click', function (e) {
        // Note, we're not setting the mode here. We'll set that at the on.replace callback below.
            thermostat.merge({"data": {"temperature": 65, "power": "on", "mode": "heat"}, "success": log, "error": log});
    });


    thermostat.on.replace(function (ref) {
        thermostatSetter(ref);
    });

    thermostat.on.merge(function (ref) {
        thermostatSetter(ref);
    });

    // Occupants

    // TODO: remove all removeBy* and replaceBy*
    // RemoveBy* Logic

    $("#removeByIndex").on('keydown', function (e) {
        if (e.keyCode == 13) {
            console.log("Removing by Index!");
            occupants.removeByIndex(this.value, onSuccess, onError);
        }
    });

    $("#removeByKey").on('keydown', function (e) {
        if (e.keyCode == 13) {
            console.log("Removing by Key!");
            occupants.removeByKey(this.value, onSuccess, onError);
        }
    });

    $("#removeByValue").on('keydown', function (e) {
        if (e.keyCode == 13) {
            console.log("Removing by Value!");
            occupants.removeByValue(this.value, onSuccess, onError);
        }
    });

    // ReplaceBy* Logic

    $("#replaceByIndex").on('keydown', function (e) {
        if (e.keyCode == 13) {
            var replaceData = $("#replaceData").val();
            console.log("Replacing by Index!");
            occupants.replaceByIndex(this.value, replaceData, onSuccess, onError);
        }
    });

    $("#replaceByKey").on('keydown', function (e) {
        if (e.keyCode == 13) {
            var replaceData = $("#replaceData").val();
            console.log("Replacing by Key!");
            occupants.replaceByKey(this.value, replaceData, onSuccess, onError);
        }
    });

    $("#replaceByValue").on('keydown', function (e) {
        if (e.keyCode == 13) {
            var replaceData = $("#replaceData").val();
            console.log("Replacing by Value!");
            occupants.replaceByValue(this.value, replaceData, onSuccess, onError);
        }
    });

    // pop example

    $("#ejectPerson").on("click", function(e){
        occupants.pop({"success":onSuccess, "error":onError});
    });

    $("#evacuateHouse").on('click', function (e) {
        console.log("Removing at home.occupants");
        pubnub.remove({"object_id": "home.occupants", "success": onSuccess, "error": onError});
    });

    $(".family").on("click", function (e) {
        var person = this.id;
        if (!person) {
            console.log("No ID found on clicked person.");
            return;
        }

        if (presenceObject[person]) {
            // here we show examples of manually storing the key to remove a list item
            // vs removing a list item by name (only safe when in a "Set" / no dup name paradigm)

            // TODO: occupants.remove() takes 0 or 2 arguments

            //occupants.remove(presenceObject["mom"], log, log);
            occupants.removeByKey(presenceObject[person], log, log);
            // occupants.removeByValue('mom', log, log); // alternatively, if we knew this was a unique value
            // occupants.removeByIndex(0); // only if performing queue-like operations

        } else {
            occupants.push({"data": person, "success": onSuccess, "error": onError });
        }
    });

    // When occupants is ready, lets add all members to our presenceObject.
    occupants.on.ready(function (ref) {
        refreshPresenceObject(ref);
    });

    // On each change, just delete and recreate the presence object.
    // This is lazy, but easy.

    occupants.on.change(function (ref) {
    });

    // Alternatively, we have the fine-grained control to easily handle remove operations on the occupants
    // When an occupant is removed
    occupants.on.remove(function (ref) {

        $.each(ref.delta, function (index, person){

            console.log("Occupant Removed: " + person.value + " at " + person.index);
            delete presenceObject[person.value];
            roofSelector(person.value).toggle();
        });

        logOccupants();
    });


    // When an occupant is merged. For lists, this will be called on push()
    occupants.on.merge(function (ref) {
        var addedUser = ref.delta[0].value;
        var addedKey = ref.delta[0].key;

        console.log("Occupant Added: " + addedUser + " at " + addedKey);
        presenceObject[addedUser] = addedKey;

        roofSelector(addedUser).toggle();

        logOccupants();

    });


    home.on.ready(function (ref) {

        // The on.ready() callback fires when the reference point (in this case, home) is synced

        home.on.change(function (ref) {

            // on.change() is any mutation -- useful for general catchalls

            // In this example, we'll use it as a logger interface
            // We'll log everything that happens
            // Unless its happening for log stuff

            var theChange = ref.delta[0];
            if (theChange.updateAt.indexOf("log") != -1) {
                return;
            } else {
                pubnub.push({
                    object_id: "home.log.entries",
                    data: (new Date() + ": action: " + theChange.action + " at " + theChange.location),
                    success: onSuccess,
                    error: onError
                });
            }
        });

        home.on.merge(function (ref) {
            console.log("MERGE");
        });

        home.on.replace(function (ref) {
            console.log("REPLACE");
        });

        home.on.remove(function (ref) {
            console.log("REMOVE");
        });

        home.on.error(function (ref) {
            // In the event of error!
            // This includes PAM access denied
            // Passes the standard error object

            console.log("ERROR");
        });

        home.on.resync(function (ref) {
            // In the event the object has lost sync with the server
            // And is attempting recovery, this will fire

            console.log("RESYNC");
        });

    });
});

