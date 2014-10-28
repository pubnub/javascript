/* ---------------------------------------------------------------------------

 Init PubNub and Get your PubNub API Keys:
 http://www.pubnub.com/account#api-keys

 --------------------------------------------------------------------------- */

var PUBNUB = require("../../pubnub.js")

var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin: "dara24.devbuild.pubnub.com"

});


function log(r) {
    console.log(JSON.stringify(r, null, 2));
}


console.log(pubnub.get_version());
/* ---------------------------------------------------------------------------
 Listen for Messages
 --------------------------------------------------------------------------- */

function consoleOut(m) {
    console.log("callback: " + JSON.stringify(m));
}

function errorOut(m) {
    console.log("error: " + JSON.stringify(m));
}

function dataOut(m) {
    console.log("data: " + JSON.stringify(m));
}

var i = 0;


var readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt(
        '1: Create new local sync object\n' +
        '2: Merge\n' +
        '3: Push\n' +
        '4: Replace\n' +
        '5: Remove\n'
);
rl.prompt();

var OBJECTS = {};

function merge() {
    rl.question('Object Id (Ex. home  or home.bedroom.light )? ', function(object_id) {
        var obj = OBJECTS[object_id];

        if (obj) { // object already synced, we can call methods on object
            rl.question('Enter JSON value to be merged : ', function(jso){
                obj.merge(jso, log, log);
            });

        } else { // object not already synced, use pubnub methods. 
            var split_o = object_id.split('.');
            var obj_id = split_o.shift();

            var path = split_o.join(".");
            rl.question('Enter JSON value to be merged : ', function(jso){
                pubnub.merge({
                    object_id : obj_id,
                    path : path,
                    data : jso,
                    success: log, 
                    error : log
                });
            });

        }
    });
}

function push() {
    rl.question('Object Id (Ex. home  or home.bedroom.light )? ', function(object_id) {
        var obj = OBJECTS[object_id];

        if (obj) { // object already synced, we can call methods on object
            rl.question('Enter JSON value to be pushed : ', function(jso){
                obj.push(jso, log, log);
            });

        } else { // object not already synced, use pubnub methods. 
            var split_o = object_id.split('.');
            var obj_id = split_o.shift();

            var path = split_o.join(".");
            rl.question('Enter JSON value to be pushed : ', function(jso){
                pubnub.push({
                    object_id : obj_id,
                    path : path,
                    data : jso,
                    success: log, 
                    error : log
                });
            });

        }
    });
}

function replace() {
    rl.question('Object Id (Ex. home  or home.bedroom.light )? ', function(object_id) {
        var obj = OBJECTS[object_id];

        if (obj) { // object already synced, we can call methods on object
            rl.question('Enter JSON value to be replaced : ', function(jso){
                obj.replace(jso, log, log);
            });

        } else { // object not already synced, use pubnub methods. 
            var split_o = object_id.split('.');
            var obj_id = split_o.shift();

            var path = split_o.join(".");
            rl.question('Enter JSON value to be replaced : ', function(jso){
                pubnub.replace({
                    object_id : obj_id,
                    path : path,
                    data : jso,
                    success: log, 
                    error : log
                });
            });

        }
    });
}

function remove() {
    rl.question('Object Id (Ex. home  or home.bedroom.light )? ', function(object_id) {
        var obj = OBJECTS[object_id];

        if (obj) { // object already synced, we can call methods on object
            obj.remove(log, log);

        } else { // object not already synced, use pubnub methods. 
            var split_o = object_id.split('.');
            var obj_id = split_o.shift();

            var path = split_o.join(".");
            pubnub.remove({
                object_id : obj_id,
                path : path,
                success: log, 
                error : log
            });
        }
    });
}


function createSyncObject() {
    rl.question('Object Id (Ex. home  or home.bedroom.light )? ', function(object_id) {
        OBJECTS[object_id] = pubnub.sync(object_id);
        
        var obj = OBJECTS[object_id];

        // ready callback
        obj.on.ready(function(r){
            log(object_id + ' : ' + 'READY EVENT');
            log(obj.value());
        })
        
        // Merge callback
        obj.on.merge(function(r){
            log(object_id + ' : ' + 'MERGE EVENT');
            log(obj.value());
        })
        
        // Replace callback
        obj.on.replace(function(r){
            log(object_id + ' : ' + 'REPLACE EVENT');
            log(obj.value());
        })
        
        // Remove callback
        obj.on.remove(function(r){
            log(object_id + ' : ' + 'REMOVE EVENT');
            log(obj.value());
        })
    });
}

rl.on('line',function (line) {
    switch (line.trim()) {
        case '1':
            createSyncObject();
            break;
        case '2':
            merge();
            break;
        case '3':
            push();
            break;
        case '4':
            replace();
            break;
        case '5':
            remove();
            break;
        default:
            break;
    }
    rl.prompt();
}).on('close', function () {
        console.log('BYE BYE!');
        process.exit(0);
    });

var intervalHandle = 0;

function intervalPub() {
    intervalHandle = setInterval(pnPub, 1000);
}