/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */
/*
  - callback multiplexing x 2
  - error || blackhole x 2
*/

import Networking from '../../../../../src/core/components/networking';
import Responders from '../../../../../src/core/presenters/responders';
import _ from 'lodash';

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('channel groups endpoints', () => {
  let instance;
  let networking;
  let callbackStub;
  let validateResponderStub;

  let xdrMock;

  beforeEach(() => {
    networking = new Networking({});
    validateResponderStub = sinon.stub().returns('validationError');
    xdrMock = sinon.stub(networking, 'performChannelGroupOperation');
    callbackStub = sinon.stub();

    let respondersClass = Responders;
    respondersClass.prototype.validationError = validateResponderStub;

    let proxy = proxyquire('../../../../../src/core/endpoints/channel_groups', {
      '../presenters/responders': respondersClass,
    }).default;

    instance = new proxy({ networking });
  });

  describe('#channelGroup', () => {
    it('uses the mode from args variable', () => {
      let args = { mode: 'remove' };
      instance.channelGroup(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = {};
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'remove');
      assert.deepEqual(xdrMock.args[0][2], expectedResponse);
      assert.deepEqual(xdrMock.args[0][3], callbackStub);
    });

    it('uses the channel group param', () => {
      let args = { channelGroup: 'cg1' };
      instance.channelGroup(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = {};
      assert.deepEqual(xdrMock.args[0][0], 'cg1');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2], expectedResponse);
      assert.deepEqual(xdrMock.args[0][3], callbackStub);
    });

    it('uses the channel group param when namespaced', () => {
      let args = { channelGroup: 'cg1:abcd' };
      instance.channelGroup(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = {};
      assert.deepEqual(xdrMock.args[0][0], 'abcd');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2], expectedResponse);
      assert.deepEqual(xdrMock.args[0][3], callbackStub);
    });

    it('uses the channels param', () => {
      let args = { channels: ['ch1,ch2'] };
      instance.channelGroup(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { add: 'ch1,ch2' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2], expectedResponse);
      assert.deepEqual(xdrMock.args[0][3], callbackStub);
    });

    it('uses the channel param w/ array', () => {
      let args = { channels: ['ch1', 'ch2'] };
      instance.channelGroup(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { add: 'ch1,ch2' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2], expectedResponse);
      assert.deepEqual(xdrMock.args[0][3], callbackStub);
    });

    it('uses the channels param', () => {
      let args = { channels: ['ch1', 'ch2'] };
      instance.channelGroup(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { add: 'ch1,ch2' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2], expectedResponse);
      assert.deepEqual(xdrMock.args[0][3], callbackStub);
    });

    it('uses the channel param w/ array when removing', () => {
      let args = { channels: ['ch1', 'ch2'], mode: 'remove' };
      instance.channelGroup(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { remove: 'ch1,ch2' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'remove');
      assert.deepEqual(xdrMock.args[0][2], expectedResponse);
      assert.deepEqual(xdrMock.args[0][3], callbackStub);
    });

    it('uses the channels param when removing', () => {
      let args = { channels: ['ch1', 'ch2'], mode: 'remove' };
      instance.channelGroup(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { remove: 'ch1,ch2' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'remove');
      assert.deepEqual(xdrMock.args[0][2], expectedResponse);
      assert.deepEqual(xdrMock.args[0][3], callbackStub);
    });

    describe('on success', () => {
      it('calls the Responders.callback back on success with argument callback', () => {
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        instance.channelGroup(args, callbackStub);

        xdrMock.args[0][3](null, 'success-response');
        assert.equal(callbackStub.called, 1);
        assert.equal(callbackStub.args[0][0], null);
        assert.equal(callbackStub.args[0][1], 'success-response');
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        let errorStub = sinon.stub();
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key', error: errorStub };
        instance.channelGroup(args, callbackStub);

        xdrMock.args[0][3]('fail', null);
        assert.equal(callbackStub.called, 1);
        assert.equal(callbackStub.args[0][0], 'fail');
        assert.deepEqual(callbackStub.args[0][1], null);
      });
    });
  });

  describe('#listGroups', () => {
    it('calls #channelGroup', () => {
      let channelGroupStub = sinon.stub();
      const args = { a: 10, b: 15 };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.listGroups(args, callback);
      assert.equal(channelGroupStub.called, 1);
      assert.deepEqual(channelGroupStub.args[0], [args, callback]);
    });
  });

  describe('#listChannels', () => {
    it('errors if channel group is not provided ', () => {
      let channelGroupStub = sinon.stub();
      const args = { a: 10, b: 15 };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.listChannels(args, callback);

      assert.equal(channelGroupStub.called, false);
      assert.equal(validateResponderStub.called, true);
      assert.equal(validateResponderStub.args[0][0], 'Missing Channel Group');
    });

    it('forward requests to the #channelGroup', () => {
      let channelGroupStub = sinon.stub();
      const args = { channelGroup: 'ma-channel-group', a: 10, b: 15 };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.listChannels(args, callback);
      assert.equal(channelGroupStub.called, 1);
      assert.deepEqual(channelGroupStub.args[0], [args, callback]);
    });
  });

  describe('#deleteGroup', () => {
    it('errors if channel group is not provided ', () => {
      let channelGroupStub = sinon.stub();
      const args = { a: 10, b: 15 };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.deleteGroup(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(validateResponderStub.called, true);
      assert.equal(validateResponderStub.args[0][0], 'Missing Channel Group');
    });

    it('errors if channel is provided ', () => {
      let channelGroupStub = sinon.stub();
      const args = { channelGroup: 'my-cg', channel: 'ma-channel', a: 10, b: 15 };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.deleteGroup(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(validateResponderStub.called, true);
      assert.equal(validateResponderStub.args[0][0], 'Use removeChannel to remove a channel from a group.');
    });

    it('forward requests to the #channelGroup', () => {
      let channelGroupStub = sinon.stub();
      const args = { channelGroup: 'ma-channel-group', a: 10, b: 15 };
      const expectedArgs = { channelGroup: 'ma-channel-group', a: 10, b: 15, mode: 'remove' };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.deleteGroup(args, callback);
      assert.equal(channelGroupStub.called, 1);

      assert.deepEqual(channelGroupStub.args[0][0], expectedArgs);
      assert.deepEqual(channelGroupStub.args[0][1], callback);
    });
  });

  describe('#addChannels', () => {
    it('errors if channel group is not provided ', () => {
      let channelGroupStub = sinon.stub();
      const args = { a: 10, b: 15 };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.addChannels(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(validateResponderStub.called, true);
      assert.equal(validateResponderStub.args[0][0], 'Missing Channel Group');
    });

    it('errors if channel is not provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channelGroup: 'my-cg', a: 10, b: 15 };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.addChannels(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(validateResponderStub.called, true);
      assert.equal(validateResponderStub.args[0][0], 'Missing Channel');
    });

    it('forward requests to the #channelGroup if channel provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channelGroup: 'ma-channel-group', channels: ['channel1'], a: 10, b: 15 };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.addChannels(args, callback);
      assert.equal(channelGroupStub.called, 1);

      assert.deepEqual(channelGroupStub.args[0][0], args);
      assert.deepEqual(channelGroupStub.args[0][1], callback);
    });

    it('forward requests to the #channelGroup if channels provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channelGroup: 'ma-channel-group', channels: ['channel1', 'ch2'], a: 10, b: 15 };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.addChannels(args, callback);
      assert.equal(channelGroupStub.called, 1);

      assert.deepEqual(channelGroupStub.args[0][0], args);
      assert.deepEqual(channelGroupStub.args[0][1], callback);
    });
  });

  describe('#removeChannels', () => {
    it('errors if channel group is not provided ', () => {
      let channelGroupStub = sinon.stub();
      const args = { a: 10, b: 15 };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.removeChannels(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(validateResponderStub.called, true);
      assert.equal(validateResponderStub.args[0][0], 'Missing Channel Group');
    });

    it('errors if channel is not provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channelGroup: 'my-cg', a: 10, b: 15 };
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.removeChannels(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(validateResponderStub.called, true);
      assert.equal(validateResponderStub.args[0][0], 'Missing Channel');
    });

    it('forward requests to the #channelGroup if channel provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channelGroup: 'ma-channel-group', channels: ['channel1'], a: 10, b: 15 };
      const outputArgs = _.extend(args, { remove: 'true' });
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.removeChannels(outputArgs, callback);
      assert.equal(channelGroupStub.called, 1);

      assert.deepEqual(channelGroupStub.args[0][0], args);
      assert.deepEqual(channelGroupStub.args[0][1], callback);
    });

    it('forward requests to the #channelGroup if channels provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channelGroup: 'ma-channel-group', channels: 'channel1', a: 10, b: 15 };
      const outputArgs = _.extend(args, { remove: 'true' });
      const callback = sinon.stub();
      instance.channelGroup = channelGroupStub;
      instance.removeChannels(args, callback);
      assert.equal(channelGroupStub.called, 1);

      assert.deepEqual(channelGroupStub.args[0][0], outputArgs);
      assert.deepEqual(channelGroupStub.args[0][1], callback);
    });
  });
});
