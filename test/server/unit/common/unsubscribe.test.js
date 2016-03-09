/* global describe, beforeEach, it */
/* eslint no-console: 0 */

var pubnub = require('../../../../node.js/pubnub.js');
var sinon = require('sinon');
var assert = require('assert');

var fixture = {};

describe('#unsubscribe', function () {
  beforeEach(function (done) {
    this.timeout(3000);
    fixture = {};

    fixture.errorStub = sinon.stub();

    fixture.pubnubInstance = pubnub.init({
      publish_key: 'ds',
      subscribe_key: 'ds',
      origin: 'pubsub.pubnub.com',
      build_u: true,
      error: fixture.errorStub
    });

    fixture.stubbedLeave = sinon.stub(fixture.pubnubInstance.__PN, 'LEAVE', function (channel, int, authKey, callback) {
      callback();
      return true;
    });

    fixture.stubbedLeaveGroup = sinon.stub(fixture.pubnubInstance.__PN, 'LEAVE_GROUP', function (channel, int, authKey, callback) {
      callback();
      return true;
    });

    fixture.pubnubInstance.ready();
    setTimeout(done, 1500);
  });

  describe('init checks are executed', function () {
    it('triggers error if subscribe key is not passed', function () {
      var errorStub = sinon.stub();

      var localInstance = pubnub.init({
        publish_key: 'ds',
        origin: 'pubsub.pubnub.com',
        build_u: true,
        error: errorStub
      });

      localInstance.unsubscribe({ channel: 'ch' });
      assert.equal(errorStub.callCount, 1);
      assert.equal(errorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('triggers error if both channel and channel group are missing', function () {
      fixture.pubnubInstance.unsubscribe({});
      assert.equal(fixture.errorStub.callCount, 1);
      assert.equal(fixture.stubbedLeave.callCount, 0);
      assert.equal(fixture.stubbedLeaveGroup.callCount, 0);
      assert.equal(fixture.errorStub.args[0][0], 'Missing Channel or Channel Group');
    });
  });

  describe('leaving a channel', function () {
    it('supports leaving of a singular channel', function (done) {
      fixture.pubnubInstance.subscribe({ channel: 'ch' }, function () {});

      fixture.pubnubInstance.unsubscribe({ channel: 'ch' }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 1);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 0);
        assert.deepEqual(fixture.stubbedLeave.firstCall.args[0], 'ch');
        done();
      });
    });

    it('supports leaving of a singular integer channel', function (done) {
      fixture.pubnubInstance.subscribe({ channel: 1 }, function () {});

      fixture.pubnubInstance.unsubscribe({ channel: 1 }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 1);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 0);
        assert.deepEqual(fixture.stubbedLeave.firstCall.args[0], '1');
        done();
      });
    });

    it('supports leaving of multiple channels', function (done) {
      fixture.pubnubInstance.subscribe({ channel: ['ch', 'ch2'] }, function () {});

      fixture.pubnubInstance.unsubscribe({ channel: ['ch', 'ch2'] }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 1);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 0);
        assert.deepEqual(fixture.stubbedLeave.firstCall.args[0], 'ch,ch2');
        done();
      });
    });

    it('supports leaving of multiple channels with a string splitting ,', function (done) {
      fixture.pubnubInstance.subscribe({ channel: ['ch', 'ch2'] }, function () {});

      fixture.pubnubInstance.unsubscribe({ channel: 'ch,ch2' }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 1);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 0);
        assert.deepEqual(fixture.stubbedLeave.firstCall.args[0], 'ch,ch2');
        done();
      });
    });

    it('omits channels which are not present in the subscribed records', function (done) {
      fixture.pubnubInstance.subscribe({ channel: ['ch', 'ch10'] }, function () {});

      fixture.pubnubInstance.unsubscribe({ channel: ['ch', 'ch2'] }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 1);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 0);
        assert.deepEqual(fixture.stubbedLeave.firstCall.args[0], 'ch');
        done();
      });
    });

    it('does not call server if all the channels are not present in the subscribed records', function (done) {
      fixture.pubnubInstance.unsubscribe({ channel: ['ch', 'ch2'] }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 0);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 0);
        done();
      });
    });
  });

  describe('leaving a channel group', function () {
    it('supports leaving of a singular channel group', function (done) {
      fixture.pubnubInstance.subscribe({ channel_group: ['ch'] }, function () {});

      fixture.pubnubInstance.unsubscribe({ channel_group: 'ch' }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 0);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 1);
        assert.deepEqual(fixture.stubbedLeaveGroup.firstCall.args[0], 'ch');
        done();
      });
    });

    it('supports leaving of a singular integer channel group', function (done) {
      fixture.pubnubInstance.subscribe({ channel_group: [1] }, function () {});

      fixture.pubnubInstance.unsubscribe({ channel_group: 1 }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 0);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 1);
        assert.deepEqual(fixture.stubbedLeaveGroup.firstCall.args[0], '1');
        done();
      });
    });

    it('supports leaving of multiple channel groups', function (done) {
      fixture.pubnubInstance.subscribe({ channel_group: ['ch', 'ch2'] }, function () {});

      fixture.pubnubInstance.unsubscribe({ channel_group: ['ch', 'ch2'] }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 0);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 1);
        assert.deepEqual(fixture.stubbedLeaveGroup.firstCall.args[0], 'ch,ch2');
        done();
      });
    });

    it('supports leaving of multiple channel groups with a string splitting ,', function (done) {
      fixture.pubnubInstance.subscribe({ channel_group: ['ch', 'ch2'] }, function () {});

      fixture.pubnubInstance.unsubscribe({ channel_group: 'ch,ch2' }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 0);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 1);
        assert.deepEqual(fixture.stubbedLeaveGroup.firstCall.args[0], 'ch,ch2');
        done();
      });
    });

    it('omits channel groups which are not present in the subscribed records', function (done) {
      fixture.pubnubInstance.subscribe({ channel_group: ['ch', 'ch10'] }, function () {});

      fixture.pubnubInstance.unsubscribe({ channel_group: ['ch', 'ch2'] }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 0);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 1);
        assert.deepEqual(fixture.stubbedLeaveGroup.firstCall.args[0], 'ch');
        done();
      });
    });

    it('does not call server if all the channel groups are not present in the subscribed records', function (done) {
      fixture.pubnubInstance.unsubscribe({ channel_group: ['ch', 'ch2'] }, function () {
        assert.equal(fixture.stubbedLeave.callCount, 0);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 0);
        done();
      });
    });
  });
});
