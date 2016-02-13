/* global describe, it, before, after, beforeEach */

var assert = require('assert');
var PUBNUB = require('../../../node.js/pubnub.js');
var testUtils = require('../utils');

describe('#state()', function () {
  this.timeout(180000);
  var fileFixtures = {};
  var itFixtures = {};

  before(function () {
    fileFixtures.channel = 'test_state';
    fileFixtures.origin = 'blah.pubnub.com';
    fileFixtures.uuid = testUtils.getTestUUID();
    fileFixtures.message = 'hello';
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.pubnub = PUBNUB.init({
      publish_key: fileFixtures.publishKey, // 'demo',
      subscribe_key: fileFixtures.subscribeKey, // 'demo',
      uuid: fileFixtures.uuid,
      origin: fileFixtures.origin,
      build_u: true
    });
  });


  it('should be able to set state for uuid', function (done) {
    var ch = fileFixtures.channel + '-' + 'setstate' + testUtils.getChannelPostFix();
    var uuid = fileFixtures.uuid;
    var state = { name: 'name-' + uuid };

    itFixtures.pubnub.state({
      channel: ch,
      uuid: uuid,
      state: state,
      callback: function (response) {
        assert.deepEqual(response, state);
        itFixtures.pubnub.state({
          channel: ch,
          uuid: uuid,
          callback: function (response) {
            assert.deepEqual(response, state);
            done();
          },
          error: function (error) {
            done(new Error('Error occurred in state ' + JSON.stringify(error)));
          }
        });
      },
      error: function (error) {
        done(new Error('Error occurred in state ' + JSON.stringify(error)));
      }
    });
  });
});
