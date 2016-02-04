/* global describe, it, before, after, beforeEach */
/* eslint-disable no-console */

var path = require('path');
var assert = require('assert');
var PUBNUB = require('../../../pubnub.js');
var sepia = require('sepia');
var testUtils = require('../../utils');


function subscribeAndPublish(pubnub, channel, message, done) {
  pubnub.subscribe({
    channel: channel,
    connect: function () {
      pubnub.publish({
        channel: channel,
        message: message
      });
    },
    callback: function (msg, envelope, ch) {
      assert.equal(message, msg);
      assert.equal(channel, ch);
      done();
    },
    error: function (err) {
      console.log(err);
      done(new Error('Error callback triggered'));
    }
  });
}

describe('When SSL mode', function () {
  var fileFixtures = {};
  var itFixtures = {};

  beforeEach(function () {
    sepia.fixtureDir(path.join(__dirname, '../sepia-fixtures', 'ssl_test'));
  });

  before(function () {
    fileFixtures.channel = 'test_javascript_ssl';
    fileFixtures.origin = 'blah.pubnub.com';
    fileFixtures.uuid = testUtils.getTestUUID();
    fileFixtures.message = 'hello';
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });


  describe('is enabled', function () {
    beforeEach(function () {
      itFixtures.pubnub = PUBNUB.init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        ssl: true,
        origin: fileFixtures.origin,
        uuid: fileFixtures.uuid
      });
    });

    it('should be able to successfully subscribe to the channel and publish message to it on port 443', function (done) {
      subscribeAndPublish(itFixtures.pubnub, fileFixtures.channel + '_enabled_' + testUtils.getChannelPostFix(), fileFixtures.message, function (err) {
        itFixtures.pubnub.shutdown();
        done(err);
      });
    });

    it('should send requests via HTTPS to 443 port', function (done) {
      itFixtures.pubnub.publish({
        channel: fileFixtures.channel,
        message: fileFixtures.message,
        callback: function () {
          itFixtures.pubnub.shutdown();
          done();
        },
        error: function (err) {
          console.log(err);
          itFixtures.pubnub.shutdown();
          done(new Error('Error callback triggered'));
        }
      });
    });
  });

  describe('is disabled', function () {
    beforeEach(function () {
      itFixtures.pubnub = PUBNUB.init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        ssl: false,
        origin: fileFixtures.origin,
        uuid: fileFixtures.uuid
      });
    });

    it('should be able to successfully subscribe to the channel and publish message to it on port 80', function (done) {
      subscribeAndPublish(itFixtures.pubnub, fileFixtures.channel + '_disabled_' + testUtils.getChannelPostFix(), fileFixtures.message, function (err) {
        itFixtures.pubnub.shutdown();
        done(err);
      });
    });

    it('should send requests via HTTP to 80 port', function (done) {
      itFixtures.pubnub.publish({
        channel: fileFixtures.channel,
        message: fileFixtures.message,
        callback: function () {
          itFixtures.pubnub.shutdown();
          done();
        },
        error: function () {
          itFixtures.pubnub.shutdown();
          done(new Error('Error callback triggered'));
        }
      });
    });
  });
});
