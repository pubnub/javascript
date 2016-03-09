/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */
/*
  - callback multiplexing x 2
  - error || blackhole x 2
*/

import Networking from '../../../../../core/src/components/networking';
import Keychain from '../../../../../core/src/components/keychain';
import Config from '../../../../../core/src/components/config';
import _ from 'lodash';

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('channel groups endpoints', () => {
  let proxiedInstance;

  let networking;
  let keychain;
  let error;
  let config;

  let successMock;
  let failMock;
  let jsonp_cb = () => 'im-jsonp';
  let xdrMock;

  beforeEach(() => {
    networking = new Networking();
    config = new Config();
    error = sinon.stub();
    jsonp_cb = () => 'im-jsonp';
    successMock = sinon.stub();
    failMock = sinon.stub();

    xdrMock = sinon.stub();
    networking.performChannelGroupOperation = xdrMock;

    keychain = new Keychain()
      .setSubscribeKey('subKey')
      .setAuthKey('authKey')
      .setUUID('uuidKey')
      .setInstanceId('instanceId');

    let respondersClass = class {};
    respondersClass.callback = successMock;
    respondersClass.error = failMock;

    proxiedInstance = proxyquire('../../../../../core/src/endpoints/channel_groups', {
      '../presenters/responders': respondersClass
    }).default;
  });

  describe('#channelGroup', () => {
    it('uses the default auth key from keychain', () => {
      let args = {};
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'authKey', callback: 'im-jsonp' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('uses the custom auth key from params', () => {
      let args = { auth_key: 'customAuth' };
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'customAuth', callback: 'im-jsonp' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('uses the mode from args variable', () => {
      let args = { mode: 'remove' };
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'authKey', callback: 'im-jsonp' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'remove');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('uses the channel group param', () => {
      let args = { channel_group: 'cg1' };
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'authKey', callback: 'im-jsonp' };
      assert.deepEqual(xdrMock.args[0][0], 'cg1');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('uses the channel group param when namespaced', () => {
      let args = { channel_group: 'cg1:abcd' };
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'authKey', callback: 'im-jsonp' };
      assert.deepEqual(xdrMock.args[0][0], 'abcd');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('uses the channel param', () => {
      let args = { channel: 'ch1,ch2' };
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'authKey', callback: 'im-jsonp', add: 'ch1,ch2' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('uses the channels param', () => {
      let args = { channels: 'ch1,ch2' };
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'authKey', callback: 'im-jsonp', add: 'ch1,ch2' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('uses the channel param w/ array', () => {
      let args = { channel: ['ch1', 'ch2'] };
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'authKey', callback: 'im-jsonp', add: 'ch1,ch2' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('uses the channels param', () => {
      let args = { channels: ['ch1', 'ch2'] };
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'authKey', callback: 'im-jsonp', add: 'ch1,ch2' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('uses the channel param w/ array when removing', () => {
      let args = { channel: ['ch1', 'ch2'], mode: 'remove' };
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'authKey', callback: 'im-jsonp', remove: 'ch1,ch2' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'remove');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('uses the channels param when removing', () => {
      let args = { channels: ['ch1', 'ch2'], mode: 'remove' };
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'authKey', callback: 'im-jsonp', remove: 'ch1,ch2' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'remove');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('skips jsonp if it is disabled', () => {
      jsonp_cb = function () { return 0; };
      let args = {};
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup(args, null);
      assert.equal(xdrMock.called, 1);
      let expectedResponse = { auth: 'authKey' };
      assert.deepEqual(xdrMock.args[0][0], '');
      assert.deepEqual(xdrMock.args[0][1], 'add');
      assert.deepEqual(xdrMock.args[0][2].data, expectedResponse);
    });

    it('massages params with the prepareParams function', () => {
      jsonp_cb = () => 0;
      let prepareParams = sinon.stub(networking, 'prepareParams').returns({ prepared: 'params' });
      let args = {};
      let cgEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
      cgEndpoint.channelGroup(args, () => {});
      assert.equal(xdrMock.called, 1);
      assert.equal(xdrMock.args[0][0], '');
      assert.equal(prepareParams.called, 1);
      assert.deepEqual(prepareParams.args[0][0], { auth: 'authKey' });
      assert.deepEqual(xdrMock.args[0][2].data, { prepared: 'params' });
    });

    describe('on success', () => {
      it('calls the Responders.callback back on success with argument callback', () => {
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        let cgEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
        let callbackStub = sinon.stub();
        cgEndpoint.channelGroup(args, callbackStub);

        xdrMock.args[0][2].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][1], callbackStub);
      });

      it('calls the Responders.callback back on success with args callback', () => {
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        let cgEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
        let callbackStub = sinon.stub();
        args.callback = callbackStub;
        cgEndpoint.channelGroup(args);

        xdrMock.args[0][2].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][1], callbackStub);
      });

      it('uses the error function provided in args', () => {
        let errorStub = sinon.stub();
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key', error: errorStub };
        let cgEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
        cgEndpoint.channelGroup(args, () => {});

        xdrMock.args[0][2].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][2], errorStub);
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        let errorStub = sinon.stub();
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key', error: errorStub };
        let cgEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
        cgEndpoint.channelGroup(args, () => {});

        xdrMock.args[0][2].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
        assert.deepEqual(failMock.args[0][1], errorStub);
      });

      it('swallows the error if error is not provided', () => {
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        let cgEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
        cgEndpoint.channelGroup(args, () => {});

        xdrMock.args[0][2].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
      });
    });
  });

  describe('#listGroups', () => {
    it('errors if channel group is not provided ', () => {
      let channelGroupStub = sinon.stub();
      const args = { a: 10, b: 15 };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.listGroups(args, callback);
      assert.equal(channelGroupStub.called, 1);
      assert.deepEqual(channelGroupStub.args[0], [args, callback]);
    });
  });

  describe('#listChannels', () => {
    it('errors if channel group is not provided ', () => {
      let channelGroupStub = sinon.stub();
      const args = { a: 10, b: 15 };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.listChannels(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(error.called, true);
      assert.equal(error.args[0][0], 'Missing Channel Group');
    });

    it('forward requests to the #channelGroup', () => {
      let channelGroupStub = sinon.stub();
      const args = { channel_group: 'ma-channel-group', a: 10, b: 15 };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.listChannels(args, callback);
      assert.equal(channelGroupStub.called, 1);
      assert.deepEqual(channelGroupStub.args[0], [args, callback]);
    });
  });

  describe('#removeGroup', () => {
    it('errors if channel group is not provided ', () => {
      let channelGroupStub = sinon.stub();
      const args = { a: 10, b: 15 };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.removeGroup(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(error.called, true);
      assert.equal(error.args[0][0], 'Missing Channel Group');
    });

    it('errors if channel is provided ', () => {
      let channelGroupStub = sinon.stub();
      const args = { channel_group: 'my-cg', channel: 'ma-channel', a: 10, b: 15 };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.removeGroup(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(error.called, true);
      assert.equal(error.args[0][0], 'Use channel_group_remove_channel if you want to remove a channel from a group.');
    });

    it('forward requests to the #channelGroup', () => {
      let channelGroupStub = sinon.stub();
      const args = { channel_group: 'ma-channel-group', a: 10, b: 15 };
      const expectedArgs = { channel_group: 'ma-channel-group', a: 10, b: 15, mode: 'remove' };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.removeGroup(args, callback);
      assert.equal(channelGroupStub.called, 1);

      assert.deepEqual(channelGroupStub.args[0][0], expectedArgs);
      assert.deepEqual(channelGroupStub.args[0][1], callback);
    });
  });

  describe('#addChannel', () => {
    it('errors if channel group is not provided ', () => {
      let channelGroupStub = sinon.stub();
      const args = { a: 10, b: 15 };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.addChannel(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(error.called, true);
      assert.equal(error.args[0][0], 'Missing Channel Group');
    });

    it('errors if channel is not provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channel_group: 'my-cg', a: 10, b: 15 };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.addChannel(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(error.called, true);
      assert.equal(error.args[0][0], 'Missing Channel');
    });

    it('forward requests to the #channelGroup if channel provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channel_group: 'ma-channel-group', channel: 'channel1', a: 10, b: 15 };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.addChannel(args, callback);
      assert.equal(channelGroupStub.called, 1);

      assert.deepEqual(channelGroupStub.args[0][0], args);
      assert.deepEqual(channelGroupStub.args[0][1], callback);
    });

    it('forward requests to the #channelGroup if channels provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channel_group: 'ma-channel-group', channels: 'channel1', a: 10, b: 15 };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.addChannel(args, callback);
      assert.equal(channelGroupStub.called, 1);

      assert.deepEqual(channelGroupStub.args[0][0], args);
      assert.deepEqual(channelGroupStub.args[0][1], callback);
    });
  });

  describe('#removeChannel', () => {
    it('errors if channel group is not provided ', () => {
      let channelGroupStub = sinon.stub();
      const args = { a: 10, b: 15 };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.removeChannel(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(error.called, true);
      assert.equal(error.args[0][0], 'Missing Channel Group');
    });

    it('errors if channel is not provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channel_group: 'my-cg', a: 10, b: 15 };
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.removeChannel(args, callback);
      assert.equal(channelGroupStub.called, false);
      assert.equal(error.called, true);
      assert.equal(error.args[0][0], 'Missing Channel');
    });

    it('forward requests to the #channelGroup if channel provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channel_group: 'ma-channel-group', channel: 'channel1', a: 10, b: 15 };
      const outputArgs = _.extend(args, { remove: 'true' });
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.removeChannel(outputArgs, callback);
      assert.equal(channelGroupStub.called, 1);

      assert.deepEqual(channelGroupStub.args[0][0], args);
      assert.deepEqual(channelGroupStub.args[0][1], callback);
    });

    it('forward requests to the #channelGroup if channels provided', () => {
      let channelGroupStub = sinon.stub();
      const args = { channel_group: 'ma-channel-group', channels: 'channel1', a: 10, b: 15 };
      const outputArgs = _.extend(args, { remove: 'true' });
      const callback = sinon.stub();
      let endpointInstance = new proxiedInstance({ networking, keychain, config, error, jsonp_cb });
      endpointInstance.channelGroup = channelGroupStub;
      endpointInstance.removeChannel(args, callback);
      assert.equal(channelGroupStub.called, 1);

      assert.deepEqual(channelGroupStub.args[0][0], outputArgs);
      assert.deepEqual(channelGroupStub.args[0][1], callback);
    });
  });
});
