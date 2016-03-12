/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../src/core/components/networking';
import Keychain from '../../../../../src/core/components/keychain';

import Responders from '../../../../../src/core/presenters/responders';

import _ from 'lodash';
import assert from 'assert';
import sinon from 'sinon';
const proxyquire = require('proxyquire').noCallThru();

describe('push endpoints', () => {
  let networking;
  let keychain;

  let proxiedInstance;
  let pushEndpoint;

  let successMock;
  let failMock;
  let validateMock;

  beforeEach(() => {
    networking = new Networking();
    successMock = sinon.stub().returns('successResponder');
    failMock = sinon.stub().returns('failResponder');
    validateMock = sinon.stub().returns('vaidateResponder');

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

    pushEndpoint = new proxiedInstance({ networking, keychain });
  });

  describe.skip('#addDevice', () => {
    it('calls #__provisionDevice', () => {
      const args = {
        device: 'device1',
        pushGateway: 'apn',
        channel: 'channel',
      };
      const expectedArgs = _.extend({}, { operation: 'add' }, args);
      const provisionStub = sinon.stub();
      pushEndpoint.__provisionDevice = provisionStub;

      pushEndpoint.addDevice(args);

      assert.equal(provisionStub.called, 1);
      assert.deepEqual(provisionStub.args[0][0], expectedArgs);
    });
  });

  describe.skip('#removeDevice', () => {
    it('calls #__provisionDevice', () => {
      let args = {
        device: 'device1',
        pushGateway: 'apn',
        channel: 'channel',
      };
      const expectedArgs = _.extend({}, { operation: 'remove' }, args);
      const provisionStub = sinon.stub();
      pushEndpoint.__provisionDevice = provisionStub;

      pushEndpoint.removeDevice(args);

      assert.equal(provisionStub.called, 1);
      assert.deepEqual(provisionStub.args[0][0], expectedArgs);
    });
  });

  describe.only('#__provisionDevice', () => {
    describe('verifies required information exists', () => {
      it('errors if device id is missing', (done) => {
        let args = {};
        pushEndpoint.__provisionDevice(args).fail(function (error) {
          assert.equal(validateMock.called, 1);
          assert.equal(error, 'validationMock');
          assert.equal(validateMock.args[0][1], 'Missing Device ID (device)');
          done();
        });
      });

      it('errors if gw_type is missing', () => {
        let args = {
          device: 'device1',
        };
        pushEndpoint.__provisionDevice(args, () => {});
        assert.equal(validateMock.called, 1);
        assert.equal(validateMock.args[0][1], 'Missing GW Type (pushGateway: gcm or apns)');
      });

      it('errors if operation is missing', () => {
        let args = {
          device: 'device1',
          pushGateway: 'apn',
        };
        pushEndpoint.__provisionDevice(args, () => {});
        assert.equal(validateMock.called, 1);
        assert.equal(validateMock.args[0][1], 'Missing GW Operation (operation: add or remove)');
      });

      it('errors if channel is missing', () => {
        let args = {
          device: 'device1',
          pushGateway: 'apn',
          operation: 'add',
        };

        pushEndpoint.__provisionDevice(args, () => {});
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
        pushEndpoint.__provisionDevice(args, () => {});
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
        pushEndpoint.__provisionDevice(args, () => {});
        assert.equal(validateMock.called, 1);
        assert.equal(validateMock.args[0][1], 'Missing Subscribe Key');
      });
    });

    it.skip('supports remove operation', () => {
      let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
      let args = {
        device: 'device1',
        pushGateway: 'pushType',
        operation: 'remove',
        channel: 'channel',
      };

      pushEndpoint.__provisionDevice(args, () => {});
      assert.equal(pushStub.called, 1);
      assert.equal(pushStub.args[0][0], 'device1');
      assert.deepEqual(pushStub.args[0][1].data, {
        auth: 'authKey',
        uuid: 'uuidKey',
        remove: 'channel',
        type: 'pushType',
      });
    });

    it.skip('passes params to the networking class', () => {
      let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
      let args = {
        device: 'device1',
        pushGateway: 'pushType',
        operation: 'remove',
        channel: 'channel',
      };

      pushEndpoint.__provisionDevice(args, () => {});
      assert.equal(pushStub.called, 1);
      assert.equal(pushStub.args[0][0], 'device1');
      assert.deepEqual(pushStub.args[0][1].data, {
        auth: 'authKey',
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
        pushEndpoint.__provisionDevice(args, callbackStub);

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
        pushEndpoint.__provisionDevice(args, callbackStub);

        pushStub.args[0][1].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
        assert.deepEqual(failMock.args[0][1], callbackStub);
      });
    });
  });
});
