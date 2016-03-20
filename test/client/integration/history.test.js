/* globals describe, beforeEach, PUBNUB, chai, it, before, _pubnub, variationRunner */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

let assert = chai.assert;

describe('#history', function () {
  this.timeout(180000);

  let fileFixtures = {};
  let itFixtures = {};
  let messageString = 'Hi from Javascript';
  let message_jsono = { message: 'Hi Hi from Javascript' };
  let message_jsona = ['message', 'Hi Hi from javascript'];

  before(function () {
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.channel = 'javascript-test-channel-' + Math.floor((Math.random() * 10) + 1);
  });

  describe('should return 1 messages when 2 messages were published on channel but count is 1', () => {
    let testFun = function (done, config) {
      let pubnub = _pubnub({
        publishKey: fileFixtures.publishKey,
        subscribeKey: fileFixtures.subscribeKey
      }, config);

      let historyChannel = itFixtures.channel + '-history-1' + + Math.random();
      pubnub.publish({ channel: historyChannel, message: messageString }, (err, response) => {
        assert.equal(response[0], 1);
        pubnub.publish({ channel: historyChannel, message: messageString }, (err, response) => {
          assert.equal(response[0], 1);
          setTimeout(() => {
            pubnub.history({ channel: historyChannel, count: 1 }, (err, response) => {
              assert.equal(response[0].length, 1);
              done();
            });
          }, 5000);
        });
      });
    };

    variationRunner(testFun);
  });

  describe('should return 2 messages when 2 messages were published on channel', () => {
    let testFun = function (done, config) {
      let pubnub = _pubnub({
        publishKey: fileFixtures.publishKey,
        subscribeKey: fileFixtures.subscribeKey
      }, config);

      let history_channel = itFixtures.channel + '-history-2' + Math.random();
      pubnub.publish({ channel: history_channel, message: messageString }, (err, response) => {
        assert.equal(response[0], 1);
        pubnub.publish({ channel: history_channel, message: messageString }, (err, response) => {
          assert.equal(response[0], 1);
          setTimeout(() => {
            pubnub.history({ channel: history_channel }, (err, response) => {
              assert.equal(response[0].length, 2);
              done();
            });
          }, 5000);
        });
      });
    };

    variationRunner(testFun);
  });

  describe('should pass on plain text in case of decryption failure', () => {
    let testFun = function (done, config) {
      let pubnub = _pubnub({
        publishKey: fileFixtures.publishKey,
        subscribeKey: fileFixtures.subscribeKey
      }, config);

      let pubnub_enc = _pubnub({
        publishKey: fileFixtures.publishKey,
        subscribeKey: fileFixtures.subscribeKey,
        cipherKey: 'enigma'
      }, config);

      let history_channel = itFixtures.channel + '-history-3' + Math.random();
      pubnub.publish({ channel: history_channel, message: messageString }, (err, response) => {
        assert.equal(response[0], 1);
        pubnub_enc.publish({ channel: history_channel, message: messageString }, (err, response) => {
          assert.equal(response[0], 1);
          setTimeout(() => {
            pubnub_enc.history({ channel: history_channel }, (err, response) => {
              if (err) done(err);
              assert.equal(response[0].length, 2);
              assert.equal(response[0][0], messageString);
              assert.equal(response[0][1], messageString);
              done();
            });
          }, 5000);
        });
      });
    };

    variationRunner(testFun);
  });
});
