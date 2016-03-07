/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../core/src/components/networking';
import Config from '../../../../../core/src/components/config';
import Keychain from '../../../../../core/src/components/keychain';

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('push endpoints', () => {
  let networking;
  let config;
  let keychain;
  let error;
  let proxiedInstance;
  let successMock;
  let failMock;
  let jsonp_cb;

  beforeEach(() => {
    networking = new Networking();
    config = new Config();
    error = sinon.stub();
    jsonp_cb = () => 'im-jsonp';

    successMock = sinon.stub();
    failMock = sinon.stub();

    keychain = new Keychain()
      .setPublishKey('pubKey')
      .setSubscribeKey('subKey')
      .setAuthKey('authKey')
      .setUUID('uuidKey')
      .setInstanceId('instanceId');

    let respondersClass = class {};
    respondersClass.callback = successMock;
    respondersClass.error = failMock;

    proxiedInstance = proxyquire('../../../../../core/src/endpoints/push', {
      '../presenters/responders': respondersClass
    }).default;
  });

  describe('#provisionDevice', () => {
    describe('verifies required information exists', () => {
      it('errors if device id is missing', () => {
        let args = {};
        let pushEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          jsonp_cb,
          error
        });
        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(error.called, 1);
        assert.equal(error.args[0][0], 'Missing Device ID (device_id)');
      });

      it('errors if gw_type is missing', () => {
        let args = {
          device_id: 'device1'
        };
        let pushEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          jsonp_cb,
          error
        });
        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(error.called, 1);
        assert.equal(error.args[0][0], 'Missing GW Type (gw_type: gcm or apns)');
      });

      it('errors if op is missing', () => {
        let args = {
          device_id: 'device1',
          gw_type: 'apn'
        };
        let pushEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          jsonp_cb,
          error
        });
        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(error.called, 1);
        assert.equal(error.args[0][0], 'Missing GW Operation (op: add or remove)');
      });

      it('errors if channel is missing', () => {
        let args = {
          device_id: 'device1',
          gw_type: 'apn',
          op: 'add'
        };
        let pushEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          jsonp_cb,
          error
        });
        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(error.called, 1);
        assert.equal(error.args[0][0], 'Missing gw destination Channel (channel)');
      });

      it('errors if publish key is missing', () => {
        let args = {
          device_id: 'device1',
          gw_type: 'apn',
          op: 'add',
          channel: 'channel'
        };
        keychain.setPublishKey('');
        let pushEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          jsonp_cb,
          error
        });
        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(error.called, 1);
        assert.equal(error.args[0][0], 'Missing Publish Key');
      });

      it('errors if subscribe key is missing', () => {
        let args = {
          device_id: 'device1',
          gw_type: 'apn',
          op: 'add',
          channel: 'channel'
        };
        keychain.setSubscribeKey('');
        let pushEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          jsonp_cb,
          error
        });
        pushEndpoint.provisionDevice(args, () => {});
        assert.equal(error.called, 1);
        assert.equal(error.args[0][0], 'Missing Subscribe Key');
      });
    });

    it('uses auth-key passed if exists', () => {
      jsonp_cb = () => 0;
      let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
      let args = {
        device_id: 'device1',
        gw_type: 'pushType',
        op: 'add',
        channel: 'channel',
        auth_key: 'customAuth'
      };
      let pushEndpoint = new proxiedInstance({
        networking,
        config,
        keychain,
        jsonp_cb,
        error
      });
      pushEndpoint.provisionDevice(args, () => {});
      assert.equal(pushStub.called, 1);
      assert.equal(pushStub.args[0][0], 'device1');
      assert.deepEqual(pushStub.args[0][1].data, {
        auth: 'customAuth',
        uuid: 'uuidKey',
        add: 'channel',
        type: 'pushType'
      });
    });

    it('supports remove operation', () => {
      jsonp_cb = () => 0;
      let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
      let args = {
        device_id: 'device1',
        gw_type: 'pushType',
        op: 'remove',
        channel: 'channel',
      };
      let pushEndpoint = new proxiedInstance({
        networking,
        config,
        keychain,
        jsonp_cb,
        error
      });
      pushEndpoint.provisionDevice(args, () => {});
      assert.equal(pushStub.called, 1);
      assert.equal(pushStub.args[0][0], 'device1');
      assert.deepEqual(pushStub.args[0][1].data, {
        auth: 'authKey',
        uuid: 'uuidKey',
        remove: 'channel',
        type: 'pushType'
      });
    });

    it('passes jsonp_cb', () => {
      jsonp_cb = function () {
        return 'jsonp-cb';
      };
      let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
      let args = {
        device_id: 'device1',
        gw_type: 'pushType',
        op: 'remove',
        channel: 'channel'
      };
      let pushEndpoint = new proxiedInstance({
        networking,
        config,
        keychain,
        jsonp_cb,
        error
      });
      pushEndpoint.provisionDevice(args, () => {});
      assert.equal(pushStub.called, 1);
      assert.equal(pushStub.args[0][0], 'device1');
      assert.deepEqual(pushStub.args[0][1].callback, 'jsonp-cb');
    });

    it('uses instance id if enabled from args', () => {
      config.setInstanceIdConfig(true);
      let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
      let args = {
        device_id: 'device1',
        gw_type: 'pushType',
        op: 'remove',
        channel: 'channel'
      };
      let pushEndpoint = new proxiedInstance({
        networking,
        config,
        keychain,
        jsonp_cb,
        error
      });
      pushEndpoint.provisionDevice(args, () => {});
      assert.equal(pushStub.called, 1);
      assert.equal(pushStub.args[0][0], 'device1');
      assert.deepEqual(pushStub.args[0][1].data, {
        auth: 'authKey',
        instanceid: 'instanceId',
        remove: 'channel',
        type: 'pushType',
        uuid: 'uuidKey'
      });
    });

    describe('on success', () => {
      it('calls the Responders.callback back on success with args callback', () => {
        let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
        let args = {
          device_id: 'device1',
          gw_type: 'pushType',
          op: 'remove',
          channel: 'channel'
        };
        let pushEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          jsonp_cb,
          error
        });
        let callbackStub = sinon.stub();
        args.callback = callbackStub;
        pushEndpoint.provisionDevice(args);

        pushStub.args[0][1].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][1], callbackStub);
      });

      it('uses the error function provided in args', () => {
        let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
        let errorStub = sinon.stub();
        let args = {
          device_id: 'device1',
          gw_type: 'pushType',
          op: 'remove',
          channel: 'channel',
          error: errorStub
        };
        let pushEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          jsonp_cb,
          error
        });
        pushEndpoint.provisionDevice(args, () => {});

        pushStub.args[0][1].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][2], errorStub);
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
        let errorStub = sinon.stub();
        let args = {
          device_id: 'device1',
          gw_type: 'pushType',
          op: 'remove',
          channel: 'channel',
          error: errorStub
        };
        let pushEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          jsonp_cb,
          error
        });
        pushEndpoint.provisionDevice(args, () => {});

        pushStub.args[0][1].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
        assert.deepEqual(failMock.args[0][1], errorStub);
      });

      it('swallows the error if error is not provided', () => {
        let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
        let args = {
          device_id: 'device1',
          gw_type: 'pushType',
          op: 'remove',
          channel: 'channel'
        };
        let pushEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          jsonp_cb,
          error
        });
        pushEndpoint.provisionDevice(args, () => {});

        pushStub.args[0][1].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
      });
    });
  });
});
