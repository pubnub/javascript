var Pubnub = require('cloud/pubnub'),
    assert = require('assert'),
    Sandbox = require('cloud/utils/sandbox'),
    TestSuite = require('cloud/utils/testSuite');

var test = new TestSuite("Error callback"),
    pubnub,
    sandbox;

test.before(function () {
    pubnub = Pubnub.init({
        publish_key: test.config.get("pub_key"),
        subscribe_key: test.config.get("sub_key")
    });
});

test.beforeEach(function () {
    sandbox = Sandbox.create();
});

test.it("should be invoked on JSON response without error description", function (done) {
    sandbox.stub(Parse.Cloud, 'httpRequest', function () {
        var deferred = new Parse.Promise();
        deferred.resolve("{}");
        return deferred;
    }, "request");

    pubnub.publish({
        channel: "blah",
        message: "hey",
        callback: function () {
            done(new Error("Success callback invoked while shouldn't"))
        },
        error: function (error) {
            assert.equal(error.message, "Bad JSON response");
            done();
        }
    });
});

test.it("should be invoked on JSON error without error description", function (done) {
    sandbox.stub(Parse.Cloud, 'httpRequest', function () {
        var deferred = new Parse.Promise();
        deferred.reject("{}");
        return deferred;
    }, "request");

    pubnub.publish({
        channel: "blah",
        message: "hey",
        callback: function () {
            done(new Error("Success callback invoked while shouldn't"))
        },
        error: function (error) {
            assert.equal(error.message, "Network error");
            done();
        }
    });
});

test.it("should be invoked on non-JSON response", function (done) {
    sandbox.stub(Parse.Cloud, 'httpRequest', function (options) {
        options.url = 'http://google.com';
        return sandbox.invokeOriginal("request", [options]);
    }, "request");

    pubnub.publish({
        channel: "blah",
        message: "hey",
        callback: function () {
            done(new Error("Success callback invoked while shouldn't"))
        },
        error: function (error) {
            assert.equal(error.message, "Bad JSON response");
            done();
        }
    });
});

test.it("should be invoked on non-JSON error", function (done) {
    sandbox.stub(Parse.Cloud, 'httpRequest', function (options) {
        options.url = 'http://blah.hey';
        return sandbox.invokeOriginal("request", [options]);
    }, "request");

    pubnub.publish({
        channel: "blah",
        message: "hey",
        callback: function () {
            done(new Error("Success callback invoked while shouldn't"))
        },
        error: function (error) {
            assert.equal(error.message, "Network error");
            done();
        }
    });
});

test.it("should be invoked on any #subscribe() invocation", function (done) {
    assert.throws(function () {
        pubnub.subscribe({});
    });
    done();
});

test.afterEach(function () {
    sandbox.restore();
});

module.exports = test;
