var PUBNUB = require('../pubnub.js'),
    assert = require("assert"),
    channel = "test_javascript_ssl",
    message = "hello";

describe("When SSL mode", function () {
    describe("is enabled", function () {
        it("should be able to successfully subscribe to the channel and publish message to it ", function (done) {
            this.timeout(5000);

            var pubnub = PUBNUB.init({
                publish_key     : 'demo',
                subscribe_key   : 'demo',
                ssl             : true,
                origin          : 'pubsub.pubnub.com'
            });

            subscribeAndPublish(pubnub, channel + "_enabled", done);
        });
    });

    describe("is disabled", function () {
        it("should be able to successfully subscribe to the channel and publish message to it ", function (done) {
            this.timeout(5000);

            var pubnub = PUBNUB.init({
                publish_key     : 'demo',
                subscribe_key   : 'demo',
                ssl             : false,
                origin          : 'pubsub.pubnub.com'
            });

            subscribeAndPublish(pubnub, channel + "_disabled", done);
        });
    });
});

function subscribeAndPublish(pubnub, channel, done) {
    pubnub.subscribe({
        channel: channel,
        connect: function () {
            pubnub.publish({
                channel: channel,
                message: message
            })
        },
        callback: function (msg, envelope, ch) {
            assert.equal(message, msg);
            assert.equal(channel, ch);
            done();
        }
    });
}
