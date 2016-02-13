var p, pub, sub, sec, chan, chgr, uuid, moduleName = null;

// Ensure Tests are run in order (all tests, not just failed ones)
QUnit.config.reorder = false;


QUnit.module( "CHANNEL GROUP CLEANUP", {
    setupOnce: function () {

        moduleName = QUnit.config.current.module.name;

        console.info("*** START :: " + moduleName);

        pub = "pub-c-ef9e786b-f172-4946-9b8c-9a2c24c2d25b";
        sub = "sub-c-564d94c2-895e-11e4-a06c-02ee2ddab7fe";
        sec = "sec-c-Yjc5MTg5Y2MtODRmNi00OTc5LTlmZDItNWJkMjFkYmMyNDRl";

        uuid = PUBNUB.uuid();

        console.log("PUBNUB INIT");

        p = PUBNUB.init({
            publish_key: pub,
            subscribe_key: sub,
            secret_key: sec,
            uuid: uuid
        });

        console.info("Channel Group: ", chgr);
        console.info("Channel: ", chan);
        console.info("UUID: ", uuid);
    },
    setup: function () {

    },
    teardown: function () {

    },
    teardownOnce: function () {
        console.log("PUBNUB RESET TO NULL");
        p = null;
        console.info("*** DONE :: " + moduleName);
        console.log(" ");
    }
});

QUnit.test("TEST: Delete all Channel Groups", function(assert) {

    console.log(QUnit.config.current.testName);

    var done = assert.async();
    assert.expect(0);

    var remove_channel_from_group = function(g,c) {
        p.channel_group_remove_channel({
            channel_group: g,
            channel: c,
            callback: function(msg) {
                console.log("REMOVE CHANNEL: ", c, " FROM GROUP: ", g, msg)
            }
        });
    };

    var remove_all_channels_from_group = function(g) {

        p.channel_group_list_channels({
            channel_group: g,
            callback: function(msg) {
                console.log("CHANNELS: ", msg.channels, " IN GROUP: ", g, msg);
                _.forEach(msg.channels, function(c) {
                    remove_channel_from_group(g,c);
                })
            }
        });
    };

    p.channel_group_list_groups({
        callback: function(msg) {
            console.log("CHANNEL GROUPS: ", msg);

            _.forEach(msg.groups, function(g) {
                remove_all_channels_from_group(g);
            });
        }
    });

    setTimeout(function(){
        console.log("REMOVAL COMPLETED.");
        done();
    }, 10000);

});



