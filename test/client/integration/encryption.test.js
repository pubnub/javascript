
/* globals describe, beforeEach, PUBNUB, chai, it, before, _pubnub, variationRunner, _pubnub_subscribe */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

var assert = chai.assert;

describe('#encryption/decryption', function () {
  this.timeout(180000);

  var fileFixtures = {};
  var itFixtures = {};
  var message_string = 'Hi from Javascript';

  before(function () {
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.channel = 'javascript-test-channel-' + Math.floor((Math.random() * 10) + 1);
  });

  describe('encrypted and unencrypted messages should be received on a channel with cipher key', function () {
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

      var count = 0;
      var ch = itFixtures.channel + '-both-' + ++count + Math.random();

      _pubnub_subscribe(pubnub_enc, {
        channel: ch,
        connect: function () {
          pubnub.publish({
            channel: ch, message: message_string,
            callback: function (response) {
              assert.equal(response[0], 1);
              pubnub_enc.publish({
                channel: ch, message: message_string,
                callback: function (response) {
                  assert.equal(response[0], 1);
                }
              });
            }
          });
        },
        callback: function (response, channel) {
          assert.deepEqual(response, message_string);
          count++;
          if (count === 2) {
            pubnub_enc.unsubscribe({ channel: ch });
            done();
          }
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('test global cipher key', function () {
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

      var count = 0;
      var ch = itFixtures.channel + '-global-' + ++count + Math.random();
      _pubnub_subscribe(pubnub_enc, { channel: ch,
        cipher_key: 'local_cipher_key',
        connect: function () {
          pubnub.publish({ channel: ch, message: message_string,
            cipher_key: 'enigma',
            callback: function (response) {
              assert.equal(response[0], 1);
              pubnub_enc.publish({ channel: ch, message: message_string,
                cipher_key: 'enigma',
                callback: function (response) {
                  assert.equal(response[0], 1);
                }
              });
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_string);
          count++;
          if (count === 2) {
            pubnub_enc.unsubscribe({ channel: ch });
            done();
          }
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('test local cipher key', function () {
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

      var count = 0;
      var ch = itFixtures.channel + '-local-test-' + Date.now();
      _pubnub_subscribe(pubnub_enc, { channel: ch,
        cipher_key: 'local_cipher_key',
        connect: function () {
          pubnub.publish({ channel: ch, message: message_string,
            cipher_key: 'local_cipher_key',
            callback: function (response) {
              assert.equal(response[0], 1);
              pubnub_enc.publish({ channel: ch, message: message_string,
                cipher_key: 'local_cipher_key',
                callback: function (response) {
                  assert.equal(response[0], 1);
                }
              });
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_string);
          count++;
          if (count === 2) {
            pubnub_enc.unsubscribe({ channel: ch });
            done();
          }
        }
      }, config);
    };

    variationRunner(testFun);
  });
});
