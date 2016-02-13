/* globals describe, beforeEach, PUBNUB, chai, it, before, _pubnub, variationRunner, _pubnub_subscribe */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

var assert = chai.assert;

describe('#here_now', function () {
  this.timeout(180000);

  var fileFixtures = {};
  var itFixtures = {};
  var message_string = 'Hi from Javascript';
  var message_jsono = { message: 'Hi Hi from Javascript' };
  var message_jsona = ['message', 'Hi Hi from javascript'];

  before(function () {
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.channel = 'javascript-test-channel-' + Math.floor((Math.random() * 10) + 1);
  });

  describe('#here_now() should show occupancy 1 when 1 user subscribed to channel', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + 'here-now' + Math.random();
      _pubnub_subscribe(pubnub, {
        channel: ch,
        connect: function () {
          setTimeout(function () {
            pubnub.here_now({
              channel: ch, callback: function (data) {
                assert.equal(data.occupancy, 1);
                pubnub.unsubscribe({ channel: ch });
                done();
              }
            });
          }, 10000);
          pubnub.publish({
            channel: ch, message: message_jsona,
            callback: function (response) {
              assert.equal(response[0], 1);
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_jsona);
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('#here_now() should show occupancy 1 when 1 user subscribed to channel (DEBUG TEST)', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + 'here-now' + Math.random();
      _pubnub_subscribe(pubnub, {
        channel: ch,
        connect: function () {
          setTimeout(function () {
            pubnub.here_now({
              channel: ch, callback: function (data) {
                assert.equal(data.occupancy, 1);
              }
            });
          }, 15000);

          setTimeout(function () {
            pubnub.here_now({
              channel: ch, callback: function (data) {
                assert.equal(data.occupancy, 1);
              }
            });
          }, 30000);

          setTimeout(function () {
            pubnub.here_now({
              channel: ch, callback: function (data) {
                assert.equal(data.occupancy, 1);
                pubnub.unsubscribe({ channel: ch });
                done();
              }
            });
          }, 45000);

          pubnub.publish({
            channel: ch, message: message_jsona,
            callback: function (response) {
              assert.equal(response[0], 1);
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_jsona);
        }
      }, config);
    };

    variationRunner(testFun);
  });
});
