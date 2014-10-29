
function log(m) {
    return JSON.stringify(m, null, 4);
}
function onError(m) {
    //console.log("Error: - " + m.op + " at " + m.path + " - onSuccess: " + JSON.stringify(m));
    console.log("Error");
}

function onSuccess(m) {
    //console.log("Success: - " + m.op + " at " + m.path + " - onSuccess: " + JSON.stringify(m));
    console.log("Success");
}

var pubnub = PUBNUB.init({
    write_key: "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key: "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin: "dara24.devbuild.pubnub.com"
});

var bedroom1 = {};
var light1 = {};
var light2 = {};
var garage = {};
var bathroom1 = {};
var kitchen = {};
var occupants = {};

var home = pubnub.sync('home');

home.on.merge(function(ref) {
    console.log("A new value was merged to the home at node " + ref.path + ".");
    console.log("The changed data is " + log(ref.delta.changes[0].value));
    console.log("The new object looks like: " + log(ref.data[ref.path]));
});

home.on.replace(function(ref) {
    console.log("A new value was replaced in the home.");
});

home.on.remove(function(ref) {
    console.log("A value was removed in the home.");
});


home.on.ready(function (ref) {
    log(ref);
    //console.log("Home is Ready. Value: " + log(home.value()));

    occupants = pubnub.sync('home.occupants');
    garage = pubnub.sync('home.garage');
    bathroom1 = pubnub.sync('home.bathroom1');
    kitchen = pubnub.sync('home.kitchen');
    bedroom1 = pubnub.sync('home.bedroom1');
    light2 = pubnub.sync('home.bedroom1.light2');
    light1 = pubnub.sync('home.bedroom1.light1');

    // TODO: This will not work until this is fixed:
    // https://www.pivotaltracker.com/story/show/81637286

    light1.on.ready(function (ref) {
        log(ref);

        // TODO: Make ref() work, then replace light1 references with ref below
        // Dependent on https://www.pivotaltracker.com/story/show/81638512
        //console.log("light1 Ready. Value: " + ref.value());

        console.log("light1 Ready. Value: " + log(light1.value()));
        console.log("Now turning light1 on...");
        light1.replace({ status: 'on' }, onSuccess, onError);
        light1.replace({ config: {intensity: "low"} }, onSuccess, onError);
        light1.replace({ config: {color: "mauve"} }, onSuccess, onError);

    });

    // Whenever someone leaves or exits, I want to know!

    // TODO: https://www.pivotaltracker.com/story/show/81645662
    // This should be rendering a pretty array, but its not

    occupants.on.change(function(ref) {
        console.log("Occupancy change: " + log(occupants.value()));
    })

});

