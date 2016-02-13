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
});
