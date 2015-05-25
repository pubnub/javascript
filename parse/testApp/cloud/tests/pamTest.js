var Pubnub = require('cloud/pubnub'),
    assert = require('assert'),
    Sandbox = require('cloud/utils/sandbox'),
    TestSuite = require('cloud/utils/testSuite');

var test = new TestSuite("PAM methods"),
    pubnub,
    sandbox;

test.before(function () {
    pubnub = Pubnub.init({
        publish_key: 'pub-c-a82961b5-d8ee-462c-bd16-0cd53edbbe09',
        subscribe_key: 'sub-c-f5674c7e-7d52-11e3-a993-02ee2ddab7fe',
        secret_key: 'sec-c-ZjBjYTRhNTgtYzBkNS00NmRmLWJjNjYtYTFiNGRkYjVhMDU0'
    });
});

test.beforeEach(function () {
    sandbox = Sandbox.create();
});

test.it("should be able to grant to the sub-key", function (done) {
    var channel = 'js-parse-test';

    pubnub.grant({
        channel: channel,
        read: true,
        write: false,
        callback: function (response) {
            assert('channels' in response);
            assert(channel in response['channels']);
            assert.equal(1, response['channels'][channel]['r']);
            assert.equal(0, response['channels'][channel]['w']);
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
