var Pubnub = require('cloud/pubnub'),
    assert = require('assert'),
    Sandbox = require('cloud/utils/sandbox'),
    TestSuite = require('cloud/utils/testSuite');

var test = new TestSuite("Using SSL mode"),
    sandbox;

test.beforeEach(function () {
    sandbox = Sandbox.create();
});

test.it("should successfully execute SSL requests", function (done) {
    var pubnub = Pubnub.init({
        publish_key: 'demo',
        subscribe_key: 'demo',
        ssl: true
    });

    pubnub.publish({
        channel: "blah",
        message: "hey",
        callback: function (response) {
            assert.equal(response[0], 1);
            done()
        },
        error: function (error) {
            done(new Error("Error callback invoked while shouldn't: " + JSON.stringify(error)))
        }
    });
});

test.afterEach(function () {
    sandbox.restore();
});

module.exports = test;
