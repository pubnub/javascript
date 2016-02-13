/* globals describe, beforeEach, PUBNUB, chai, it, before, _pubnub, variationRunner */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

var assert = chai.assert;

describe('#history', function () {
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

  describe('should return 1 messages when 2 messages were published on channel but count is 1', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var historyChannel = itFixtures.channel + '-history-1' + + Math.random();
      pubnub.publish({ channel: historyChannel,
        message: messageString,
        callback: function (response) {
          assert.equal(response[0], 1);
          pubnub.publish({ channel: historyChannel,
            message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
              setTimeout(function () {
                pubnub.history({ channel: historyChannel,
                  count: 1,
                  callback: function (response) {
                    assert.equal(response[0].length, 1);
                    done();
                  }
                });
              }, 5000);
            }
          });
        }
      });
    };

    variationRunner(testFun);
  });

  describe('should return 2 messages when 2 messages were published on channel', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var history_channel = itFixtures.channel + '-history-2' + Math.random();
      pubnub.publish({ channel: history_channel,
        message: messageString,
        callback: function (response) {
          assert.equal(response[0], 1);
          pubnub.publish({ channel: history_channel,
            message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
              setTimeout(function () {
                pubnub.history({ channel: history_channel,
                  callback: function (response) {
                    assert.equal(response[0].length, 2);
                    done();
                  }
                });
              }, 5000);
            }
          });
        }
      });
    };

    variationRunner(testFun);
  });

  describe('should pass on plain text in case of decryption failure', function () {
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

      var history_channel = itFixtures.channel + '-history-3' + Math.random();
      pubnub.publish({ channel: history_channel,
        message: messageString,
        callback: function (response) {
          assert.equal(response[0], 1);
          pubnub_enc.publish({ channel: history_channel,
            message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
              setTimeout(function () {
                pubnub_enc.history({ channel: history_channel,
                  callback: function (response) {
                    assert.equal(response[0].length, 2);
                    assert.equal(response[0][0], messageString);
                    assert.equal(response[0][1], messageString);
                    done();
                  },
                  error: function () {
                    assert.ok(false, 'error should not occur');
                    done();
                  }
                });
              }, 5000);
            }
          });
        }
      });
    };

    variationRunner(testFun);
  });
});
