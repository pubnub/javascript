var Pubnub = require('cloud/pubnub'),
    assert = require('assert'),
    Sandbox = require('cloud/utils/sandbox'),
    TestSuite = require('cloud/utils/testSuite');

var test = new TestSuite("Using Cipher Key"),
    cipher_key = 'blah',
    pubnub,
    pubnub2,
    pubnub3,
    sandbox;

test.before(function () {
    pubnub = Pubnub.init({
        publish_key: test.config.get("pub_key"),
        subscribe_key: test.config.get("sub_key"),
        secret_key: test.config.get("secret_key"),
        cipher_key: cipher_key
    });

    pubnub2 = Pubnub.init({
        publish_key: test.config.get("pub_key"),
        subscribe_key: test.config.get("sub_key"),
        cipher_key: cipher_key
    });

    pubnub3 = Pubnub.init({
        publish_key: test.config.get("pub_key"),
        subscribe_key: test.config.get("sub_key"),
        cipher_key: cipher_key + "_wrong"
    });
});

test.beforeEach(function () {
    sandbox = Sandbox.create();
});

test.it("should be able to send & receive encrypted messages", function (done) {
    var channel = 'js-parse-test-cypher',
        message = 'hi cypher!',
        encodedMessage = 'M5PIZiKHKMaHc1O1E47cxQ==';

    pubnub.publish({
        channel: channel,
        message: message,
        callback: function (response) {
            assert.equal(response[0], 1);
            pubnub2.history({
                channel: channel,
                count: 1,
                callback: function (response) {
                    assert.equal(response[0][0], message);
                    pubnub3.history({
                        channel: channel,
                        count: 1,
                        callback: function (response) {
                            assert.equal(response[0][0], encodedMessage);
                            done();
                        },
                        error: function (error) {
                            done(new Error("Error callback invoked while shouldn't: " + JSON.stringify(error)))
                        }
                    });
                },
                error: function (error) {
                    done(new Error("Error callback invoked while shouldn't: " + JSON.stringify(error)))
                }
            });
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
