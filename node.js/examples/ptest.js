var clOptions = [];
var config = {};

process.argv.forEach(function (val, index, array) {
    //console.log(index + ': ' + val);
    clOptions[index] = val;
});

var keysets = {

    "keyset1": {
        "pub": "pub-c-fb5fa283-0d93-424f-bf86-d9aca2366c86",
        "sub": "sub-c-d247d250-9dbd-11e3-8008-02ee2ddab7fe",
        "sec": "sec-c-MmI2YjRjODAtNWU5My00ZmZjLTg0MzUtZGM1NGExNjJkNjg1",
        "description": "499 on Leave Enabled"
    },

    "keyset2": {
        "pub": "pub-c-c9b0fe21-4ae1-433b-b766-62667cee65ef",
        "sub": "sub-c-d91ee366-9dbd-11e3-a759-02ee2ddab7fe",
        "sec": "sec-c-ZDUxZGEyNmItZjY4Ny00MjJmLWE0MjQtZTQyMDM0NTY2MDVk",
        "description": "499 on Leave Disabled"
    }
};


// console.log(clOptions);

//[ 0 'node',
//  1  '/Users/gcohen/clients/javascript/node.js/examples/ptest.js',
//  2  'keyset1',
//  3  'beta',
//  4  'gecA',
//  5  'gecB' ]

validateArgs(clOptions);

function usageOutput() {
    console.log("\nUsage: " + clOptions[1] + " KEYSET ENVIRONMENT CHANNEL(S)");
    console.log("KEYSET: 1 or 2");
    console.log("ENVIRONMENT: prod or beta");
    console.log("CHANNEL(S): CH1[,CH2,CH3,CH4]");
    console.log("\n");
    process.exit(1);
}

function initClientWithArgs(config) {
    console.log("Using keyset " + config.keyset.description + ".");
    console.log("Using environment " + config.environment + ".");

}

function validateArgs(opts) {

    if (opts.length < 6) {
        usageOutput();
    }

    // set keyset
    if ((clOptions[2] == 1) || (clOptions[2] == 2)) {
        if (clOptions[2] == 1) {
            config.keyset = keysets.keyset1;
        } else if (clOptions[2] == 2) {
            config.keyset = keysets.keyset2;
        }
    } else {
        usageOutput();
    }

    // set env
    if ((clOptions[3] == "beta") || (clOptions[3] == "prod")) {
        config.environment = clOptions[3];
    } else {
        usageOutput();
    }

    // set channels
    if ((clOptions[3] == "beta") || (clOptions[3] == "prod")) {
        config.environment = clOptions[3];
    } else {
        usageOutput();
    }

    initClientWithArgs(config);


}


var pubnub = require("./../pubnub.js").init({
        publish_key: "demo",
        subscribe_key: "demo"
    })
    , exec = require('child_process').exec;

pubnub.subscribe({
    channel: "my_channel",
    connect: function () {
        // Publish a Message on Connect
        pubnub.publish({
            channel: "my_channel",
            message: { text: 'Ready to Receive Voice Script.' }
        });
    },
    callback: function (message) {
        console.log(message);
        exec('say ' + (
            'voice' in message &&
                message.voice ? '-v ' +
                message.voice + ' ' : ''
            ) + message.text);

    },
    error: function () {
        console.log("Network Connection Dropped");
    }
});
