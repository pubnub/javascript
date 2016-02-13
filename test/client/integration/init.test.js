/* globals describe, beforeEach, PUBNUB, chai, it, before, _pubnub, variationRunner, get_random, _pubnub_subscribe */
/* globals _pubnub_init */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

var assert = chai.assert;

describe('#init', function () {
  this.timeout(180000);

  var fileFixtures = {};
  var itFixtures = {};
  var messageString = 'Hi from Javascript';
  var message_jsono = { message: 'Hi Hi from Javascript' };
  var message_jsona = ['message', 'Hi Hi from javascript'];

  before(function () {
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.channel = 'javascript-test-channel-' + Math.floor((Math.random() * 10) + 1);
  });

  describe('test #1', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, messageString);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('test #2', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);
      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, {
        channel: ch,
        connect: function () {
          pubnub.publish({
            channel: ch, message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, messageString);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('test #3', function () {
    var testFun = function (done, config) {
      var pubnub1 = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config, pubnub1);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, messageString);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('test #4', function () {
    var testFun = function (done, config) {
      var pubnub1 = PUBNUB({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config, pubnub1);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, messageString);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('test #5', function () {
    var testFun = function (done, config) {
      var pubnub1 = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config, pubnub1);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, messageString);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('test #6', function () {
    var testFun = function (done, config) {
      var pubnub1 = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config, pubnub1);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, messageString);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('test #7', function () {
    var testFun = function (done, config) {
      var pubnub1 = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var pubnub2 = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config, pubnub1);

      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config, pubnub2);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, messageString);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('instantiation test (heartbeat)', function () {
    var testFun = function (done, config) {
      var hb = 20;
      var hbi = 5;
      var pubnub1 = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        heartbeat: hb,
        heartbeat_interval: hbi
      }, config);

      var pubnub2 = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        heartbeat: hb
      }, config);

      assert.equal(hb, pubnub1.get_heartbeat());
      assert.equal(hbi, pubnub1.get_heartbeat_interval());

      assert.equal(hb, pubnub2.get_heartbeat());
      assert.equal(hb / 2 - 1, pubnub2.get_heartbeat_interval());
      done();
    };

    variationRunner(testFun);
  });
});
