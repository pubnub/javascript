/* globals describe, beforeEach, PUBNUB, chai, it, before, _pubnub, variationRunner, get_random, _pubnub_subscribe */
/* globals _pubnub_init */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

var assert = chai.assert;

describe('#publish', function () {
  this.timeout(180000);

  var fileFixtures = {};
  var itFixtures = {};
  var messageString = 'Hi from Javascript';
  var message_jsono = { message: 'Hi Hi from Javascript' };
  var message_jsona = ['message', 'Hi Hi from javascript'];
  var message_number = 123456;

  before(function () {
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.channel = 'javascript-test-channel-' + Math.floor((Math.random() * 10) + 1);
  });

  describe('should publish strings without error', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.ch + '-' + get_random();
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

  describe('should publish strings when using channel groups without error', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var channel_group = 'cg' + get_random();
      var ch = itFixtures.channel + '-' + get_random();

      pubnub.channel_group_add_channel({
        channel_group: channel_group,
        channel: ch,
        callback: function () {
          setTimeout(function () {
            _pubnub_subscribe(pubnub, { channel_group: channel_group,
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
          }, 2000);
        },
        error: function () {
          assert.ok(false);
          done();
        }
      });
    };

    variationRunner(testFun);
  });

  describe('should publish strings without error (Encryption Enabled)', function () {
    var testFun = function (done, config) {
      var pubnub_enc = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        cipher_key: 'enigma'
      }, config);

      var ch = itFixtures.channel + '-' + get_random();

      _pubnub_subscribe(pubnub_enc, { channel: ch,
        connect: function () {
          pubnub_enc.publish({ channel: ch, message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, messageString);
          pubnub_enc.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('should publish json array without error', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + get_random();

      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: message_jsona,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_jsona);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('should publish json object without error', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + get_random();

      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: message_jsono,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_jsono);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('should publish numbers without error', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + get_random();

      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: message_number,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_number);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      });
    };

    variationRunner(testFun);
  });

  describe('should publish numbers without error (Encryption Enabled)', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var pubnub_enc = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        cipher_key: 'enigma'
      }, config);

      var ch = itFixtures.channel + '-' + get_random();

      _pubnub_subscribe(pubnub_enc, { channel: ch,
        connect: function () {
          pubnub_enc.publish({ channel: ch, message: message_number,
            callback: function (response) {
              assert.equal(response[0], 1);
              done();
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_number);
          pubnub_enc.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });
});
