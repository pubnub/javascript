/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../src/core/components/networking';
import Config from '../../../../../src/core/components/config';
import Keychain from '../../../../../src/core/components/keychain';

import Responders from '../../../../../src/core/presenters/responders';

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('push endpoints', () => {
  let networking;
  let config;
  let keychain;

  let proxiedInstance;
  let pushEndpoint;

  let successMock;
  let failMock;
  let validateMock;

  beforeEach(() => {
    networking = new Networking();
    config = new Config();
    successMock = sinon.stub();
    failMock = sinon.stub();
    validateMock = sinon.stub();

    keychain = new Keychain()
      .setPublishKey('pubKey')
      .setSubscribeKey('subKey')
      .setAuthKey('authKey')
      .setUUID('uuidKey')
      .setInstanceId('instanceId');

    let respondersClass = Responders;
    respondersClass.prototype.callback = successMock;
    respondersClass.prototype.error = failMock;
    respondersClass.prototype.validationError = validateMock;

    proxiedInstance = proxyquire('../../../../../src/core/endpoints/push', {
      '../presenters/responders': respondersClass,
    }).default;

    pushEndpoint = new proxiedInstance({ networking, config, keychain });
  });

  describe('#provisionDevice', () => {
    describe('verifies required information exists', () => {
      it('errors if device id is missing', () => {
        let args = {};
        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(validateMock.called, 1);
        assert.equal(validateMock.args[0][1], 'Missing Device ID (device)');
      });

      it('errors if gw_type is missing', () => {
        let args = {
          device: 'device1',
        };
        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(validateMock.called, 1);
        assert.equal(validateMock.args[0][1], 'Missing GW Type (pushGateway: gcm or apns)');
      });

      it('errors if operation is missing', () => {
        let args = {
          device: 'device1',
          pushGateway: 'apn',
        };
        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(validateMock.called, 1);
        assert.equal(validateMock.args[0][1], 'Missing GW Operation (operation: add or remove)');
      });

      it('errors if channel is missing', () => {
        let args = {
          device: 'device1',
          pushGateway: 'apn',
          operation: 'add',
        };

        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(validateMock.called, 1);
        assert.equal(validateMock.args[0][1], 'Missing gw destination Channel (channel)');
      });

      it('errors if publish key is missing', () => {
        let args = {
          device: 'device1',
          pushGateway: 'apn',
          operation: 'add',
          channel: 'channel',
        };
        keychain.setPublishKey('');
        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(validateMock.called, 1);
        assert.equal(validateMock.args[0][1], 'Missing Publish Key');
      });

      it('errors if subscribe key is missing', () => {
        let args = {
          device: 'device1',
          pushGateway: 'apn',
          operation: 'add',
          channel: 'channel',
        };
        keychain.setSubscribeKey('');
        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(validateMock.called, 1);
        assert.equal(validateMock.args[0][1], 'Missing Subscribe Key');
      });
    });

    it('supports remove operation', () => {
      let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
      let args = {
        device: 'device1',
        pushGateway: 'pushType',
        operation: 'remove',
        channel: 'channel',
      };

      pushEndpoint.provisionDevice(args, () => {});
      assert.equal(pushStub.called, 1);
      assert.equal(pushStub.args[0][0], 'device1');
      assert.deepEqual(pushStub.args[0][1].data, {
        auth: 'authKey',
        uuid: 'uuidKey',
        remove: 'channel',
        type: 'pushType',
      });
    });

    it('passes params to the networking class', () => {
      let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
      let args = {
        device: 'device1',
        pushGateway: 'pushType',
        operation: 'remove',
        channel: 'channel',
      };

      pushEndpoint.provisionDevice(args, () => {});
      assert.equal(pushStub.called, 1);
      assert.equal(pushStub.args[0][0], 'device1');
      assert.deepEqual(pushStub.args[0][1].data, {
        auth: 'authKey',
        remove: 'channel',
        type: 'pushType',
        uuid: 'uuidKey',
      });
    });

    it('uses instance id if enabled from args', () => {
      config.setInstanceIdConfig(true);
      let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
      let args = {
        device: 'device1',
        pushGateway: 'pushType',
        operation: 'remove',
        channel: 'channel',
      };

      pushEndpoint.provisionDevice(args, () => {});
      assert.equal(pushStub.called, 1);
      assert.equal(pushStub.args[0][0], 'device1');
      assert.deepEqual(pushStub.args[0][1].data, {
        auth: 'authKey',
        instanceid: 'instanceId',
        remove: 'channel',
        type: 'pushType',
        uuid: 'uuidKey',
      });
    });

    describe('on success', () => {
      it('calls the Responders.callback back on success with args callback', () => {
        let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
        let args = {
          device: 'device1',
          pushGateway: 'pushType',
          operation: 'remove',
          channel: 'channel',
        };
        let callbackStub = sinon.stub();
        pushEndpoint.provisionDevice(args, callbackStub);

        pushStub.args[0][1].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][1], callbackStub);
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
        let args = {
          device: 'device1',
          pushGateway: 'pushType',
          operation: 'remove',
          channel: 'channel'
        };
        let callbackStub = sinon.stub();
        pushEndpoint.provisionDevice(args, callbackStub);

        pushStub.args[0][1].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
        assert.deepEqual(failMock.args[0][1], callbackStub);
      });
    });
  });
});
