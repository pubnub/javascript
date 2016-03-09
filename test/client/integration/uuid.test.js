/* globals describe, beforeEach, PUBNUB, chai, it, before, _pubnub, variationRunner, get_random, _pubnub_subscribe */
/* globals _pubnub_init */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

var assert = chai.assert;

describe('#uuid', function () {
  this.timeout(180000);

  var fileFixtures = {};
  var itFixtures = {};

  before(function () {
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.channel = 'javascript-test-channel-' + Math.floor((Math.random() * 10) + 1);
  });

  describe('response is accurate', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      pubnub.uuid(function (uuid) {
        assert.ok(uuid, 'Pass');
        done();
      });
    };

    variationRunner(testFun);
  });

  describe('response should be long enough', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      pubnub.uuid(function (uuid) {
        assert.ok(uuid.length > 10, 'Pass');
        done();
      });
    };

    variationRunner(testFun);
  });

  describe('should set uuid', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      pubnub.set_uuid('abcd');
      assert.deepEqual(pubnub.get_uuid(), 'abcd');
      done();
    };

    variationRunner(testFun);
  });

  describe('should set uuid and new presence event should come with new uuid', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + get_random();
      var uuid;
      var uuid2;
      var uuid1 = uuid = pubnub.get_uuid();
      pubnub.subscribe({ channel: ch,
        connect: function () {
          setTimeout(function () {
            uuid2 = uuid = 'efgh';
            pubnub.set_uuid(uuid);
          }, 3000);
        },
        callback: function (response) {

        },
        presence: function (response) {
          if (response.action === 'join') {
            assert.deepEqual(response.uuid, uuid);
            if (response.uuid === uuid2) pubnub.unsubscribe({ channel: ch });
            done();
          }
        }
      });
    };

    variationRunner(testFun);
  });
});
