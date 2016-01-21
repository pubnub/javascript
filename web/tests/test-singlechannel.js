var p, pub, sub, sec, chan, uuid, moduleName = null;



// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;

QUnit.module( "SINGLE CHANNEL", {
    setupOnce: function () {

        moduleName = QUnit.config.current.module.name;

        console.info("*** START :: " + moduleName);

        pub = "pub-c-ef9e786b-f172-4946-9b8c-9a2c24c2d25b";
        sub = "sub-c-564d94c2-895e-11e4-a06c-02ee2ddab7fe";
        sec = "sec-c-Yjc5MTg5Y2MtODRmNi00OTc5LTlmZDItNWJkMjFkYmMyNDRl";

        p = null;
        uuid = PUBNUB.uuid();

        p = PUBNUB.init({
            publish_key: pub,
            subscribe_key: sub,
            secret_key: sec,
            uuid: uuid
        });
    },
    setup: function () {
        chan = PUBNUB.uuid();
        uuid = PUBNUB.uuid();
    },
    teardown: function () {

    },
    teardownOnce: function () {

        console.info("*** DONE :: " + moduleName);
        console.log(" ");

        p = null;
    }
});

QUnit.test( "TEST: Connect Callback :: no presence callback defined", function( assert ) {

    console.log("TEST: Connect Callback :: no presence callback defined");

    var done = assert.async();

    p.subscribe({
        channel: chan,
        message: function(msg) { },
        connect: function() {
            assert.ok(true, "Connect to PubNub on Channel " + chan);
            p.unsubscribe({
                channel: chan,
                callback: function() {
                    assert.ok(true, "Unsubscribed to Channel " + chan);
                    console.log("\tUNSUBSCRIBE: ", chan);
                    done();
                }
            });
        }
    });

});

QUnit.test( "TEST: Connect Callback :: presence callback defined", function( assert ) {

    console.log("TEST: Connect Callback :: presence callback defined");

    var done = assert.async();

    p.subscribe({
        channel: chan,
        message: function(msg) { },
        presence: function(msg) { },
        connect: function() {
            assert.ok(true, "Connect to PubNub on Channel " + chan);
            p.unsubscribe({
                channel: chan,
                callback: function() {
                    assert.ok(true, "Unsubscribed to Channel " + chan);
                    console.log("\tUNSUBSCRIBE: ", chan);
                    done();
                }
            });
        }
    });

});

QUnit.test( "TEST: Message Callback :: no presence callback defined", function( assert ) {

    console.log("TEST: Message Callback :: no presence callback defined" );

    var done = assert.async();

    var all_clear = true;

    var check_messages = function(msg) {

        if (msg.rand === window.rand) {
            // ignore, this is all good
        }
        else if ('action' in msg) {
            // Oops we received something we shouldn't have
            all_clear = false;
        }
    };

    var finalize = function() {
        if (all_clear) {
            assert.ok(1 == "1", "Presence Message Not Detected in Message-Callback");
        }
        else {
            assert.ok(0 == "1", "Presence Message Detected in Message-Callback");
        }
        p.unsubscribe({
            channel: chan,
            callback: function() {
                assert.ok(true, "Unsubscribed to Channel " + chan);
                console.log("\tUNSUBSCRIBE: ", chan);
                done();
            }
        });
    };

    window.rand = PUBNUB.uuid();

    setTimeout(function() {

        var msg = {
            chan: chan,
                test: "TEST: Message Callback",
                rand: window.rand
        };

        p.publish({
            channel: chan,
            message: msg
        });

        console.log("\tWAIT 5 SECONDS TO CHECK IF PRESENCE MESSAGES ARE BEING RECEIVED IN MESSAGE CALLBACK");
        setTimeout(function(){
            finalize();
        }, 5000);

    }, 5000);

    assert.ok(true, "Subscribe to Channel " + chan);
    p.subscribe({
        channel: chan,
        message: function(msg, env, ch) {
            console.log("\tMESSAGE: ", msg, env, ch);
            assert.ok(true, "Received message on " + ch);
            check_messages(msg, ch);
        },
        presence: function(msg, env, ch) {
            assert.ok(true, "Received Presence on " + ch);
            console.log("\tPRESENCE: ", msg, env, ch);
        },
        connect: function() {
            assert.ok(true, "Connected to PubNub on Channel " + chan);
            console.log("\tCONNECTED: ", chan);
        }
    });

});

QUnit.test( "TEST: Message Callback :: presence callback defined", function( assert ) {

    console.log("TEST: Message Callback :: presence callback defined");

    var done = assert.async();

    var all_clear = true;

    var check_messages = function(msg) {
        if (msg.rand === window.rand) {
            // ignore, this is all good
        }
        else if ('action' in msg) {
            // Oops we received something we shouldn't have
            all_clear = false;
        }
    };

    var finalize = function() {
        if (all_clear) {
            assert.ok(1 == "1", "Presence Message Not Detected in Message-Callback");
        }
        else {
            assert.ok(0 == "1", "Presence Message Detected in Message-Callback");
        }
        p.unsubscribe({
            channel: chan,
            callback: function() {
                assert.ok(true, "Unsubscribed to Channel " + chan);
                console.log("\tUNSUBSCRIBE: ", chan);
                done();
            }
        });
    };

    window.rand = PUBNUB.uuid();

    setTimeout(function() {

        var msg = {
            chan: chan,
            test: "TEST: Message Callback",
            rand: window.rand
        };

        p.publish({
            channel: chan,
            message: msg
        });

        console.log("\tWAIT 5 SECONDS TO CHECK IF PRESENCE MESSAGES ARE BEING RECEIVED IN MESSAGE CALLBACK");
        setTimeout(function(){
            finalize();
        }, 5000);

    }, 5000);

    assert.ok(true, "Subscribe to Channel " + chan);
    p.subscribe({
        channel: chan,
        message: function(msg, env, ch) {
            console.log("\tMESSAGE: ", msg, env, ch);
            assert.ok(true, "Received message on " + ch);
            check_messages(msg, ch);
        },
        presence: function(msg, env, ch) {
            assert.ok(true, "Received Presence on " + ch);
            console.log("\tPRESENCE: ", msg, env, ch);
        },
        connect: function() {
            assert.ok(true, "Connected to PubNub on Channel " + chan);
            console.log("\tCONNECTED: ", chan);
        }
    });

});

QUnit.test( "TEST: Unsubscribe Callback :: no presence callback defined", function( assert ) {

    console.log("TEST: Unsubscribe Callback :: presence callback defined");

    assert.expect( 1 );

    var done1 = assert.async();
    var check_completed = false;

    var check_success = function(result, msg) {
        if (!check_completed) {
            check_completed = true;
            assert.ok(true == result, msg);
            done1();
        }
        else {
            console.error("\tUnsubscribe callback called after more than 5 seconds.")
        }
    };

    p.subscribe({
        channel: chan,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });

    console.log("\tWAIT 5 SECONDS AND UNSUBSCRIBE, 5 MORE SECONDS FOR UNSUBSCRIBE CALLBACK");

    var timeout = setTimeout(function() {
        check_success(false, "\tUnsubscribe callback not called within 5 seconds")
    }, 10000);

    setTimeout(function(){
        p.unsubscribe({
            channel: chan,
            callback: function() {
                console.log("\tUNSUBSCRIBE: ", chgr);
                clearTimeout(timeout);
                check_success(true, "Unsubscribe callback called")
            }
        });
    }, 5000);

});

QUnit.test( "TEST: Unsubscribe Callback :: presence callback defined", function( assert ) {

    console.log("TEST: Unsubscribe Callback :: presence callback defined");

    assert.expect( 1 );

    var done1 = assert.async();
    var check_completed = false;

    var check_success = function(result, msg) {
        if (!check_completed) {
            check_completed = true;
            assert.ok(true == result, msg);
            done1();
        }
        else {
            console.error("\tUnsubscribe callback called after more than 5 seconds.")
        }
    };

    p.subscribe({
        channel: chan,
        message: function(msg) {
            console.log("\tMESSAGE: ", msg);
        },
        presence: function(msg) {
            console.log("\tPRESENCE: ", msg);
        },
        connect: function() {
            console.log("\tCONNECTED: ", chan);
        }
    });

    console.log("\tWAIT 5 SECONDS AND UNSUBSCRIBE, 5 MORE SECONDS FOR UNSUBSCRIBE CALLBACK");

    var timeout = setTimeout(function() {
        check_success(false, "\tUnsubscribe callback not called within 5 seconds")
    }, 10000);

    setTimeout(function(){
        p.unsubscribe({
            channel: chan,
            callback: function() {
                console.log("\tUNSUBSCRIBE: ", chgr);
                clearTimeout(timeout);
                check_success(true, "Unsubscribe callback called")
            }
        });
    }, 5000);

});