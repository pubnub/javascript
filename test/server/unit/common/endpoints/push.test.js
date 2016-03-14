/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../src/core/components/networking';
import Responders from '../../../../../src/core/presenters/responders';
import PublishQueue from '../../../../../src/core/components/publish_queue';

import _ from 'lodash';
import assert from 'assert';
import sinon from 'sinon';
const proxyquire = require('proxyquire').noCallThru();

describe('push endpoints', () => {
  let networking;
  let publishQueue;

  let instance;

  let callbackStub;
  let validateMock;

  beforeEach(() => {
    networking = new Networking();
    publishQueue = new PublishQueue({ networking });
    callbackStub = sinon.stub();
    validateMock = sinon.stub().returns('vaidateResponder');

    let respondersClass = Responders;
    respondersClass.prototype.validationError = validateMock;

    let proxy = proxyquire('../../../../../src/core/endpoints/push', {
      '../presenters/responders': respondersClass,
    }).default;

    instance = new proxy({ networking, publishQueue });
  });

  describe('#addDeviceToChannel', () => {
    it('calls #__provisionDevice', () => {
      const args = {
        device: 'device1',
        pushGateway: 'apn',
        channel: 'channel',
      };
      const expectedArgs = _.extend({}, { operation: 'add' }, args);
      const provisionStub = sinon.stub(instance, '__provisionDevice');

      instance.addDeviceToChannel(args);

      assert.equal(provisionStub.called, 1);
      assert.deepEqual(provisionStub.args[0][0], expectedArgs);
    });
  });

  describe('#removeDeviceFromChannel', () => {
    it('calls #__provisionDevice', () => {
      let args = {
        device: 'device1',
        pushGateway: 'apn',
        channel: 'channel',
      };
      const expectedArgs = _.extend({}, { operation: 'remove' }, args);
      const provisionStub = sinon.stub(instance, '__provisionDevice');

      instance.removeDeviceFromChannel(args);

      assert.equal(provisionStub.called, 1);
      assert.deepEqual(provisionStub.args[0][0], expectedArgs);
    });
  });

  describe('#__provisionDevice', () => {
    describe('verifies required information exists', () => {
      it('errors if device id is missing', () => {
        let args = {};
        instance.__provisionDevice(args, callbackStub);
        assert.equal(validateMock.called, 1);
        assert.equal(callbackStub.args[0][0], 'vaidateResponder');
        assert.equal(validateMock.args[0][0], 'Missing Device ID (device)');
      });

      it('errors if gw_type is missing', () => {
        let args = { device: 'device1' };
        instance.__provisionDevice(args, callbackStub);
        assert.equal(validateMock.called, 1);
        assert.equal(callbackStub.args[0][0], 'vaidateResponder');
        assert.equal(validateMock.args[0][0], 'Missing GW Type (pushGateway: gcm or apns)');
      });

      it('errors if operation is missing', () => {
        let args = {
          device: 'device1',
          pushGateway: 'apn',
        };
        instance.__provisionDevice(args, callbackStub);
        assert.equal(validateMock.called, 1);
        assert.equal(callbackStub.args[0][0], 'vaidateResponder');
        assert.equal(validateMock.args[0][0], 'Missing GW Operation (operation: add or remove)');
      });

      it('errors if channel is missing', () => {
        let args = {
          device: 'device1',
          pushGateway: 'apn',
          operation: 'add',
        };

        instance.__provisionDevice(args, callbackStub);
        assert.equal(validateMock.called, 1);
        assert.equal(callbackStub.args[0][0], 'vaidateResponder');
        assert.equal(validateMock.args[0][0], 'Missing gw destination Channel (channel)');
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

      instance.__provisionDevice(args, callbackStub);
      assert.equal(pushStub.called, 1);
      assert.equal(pushStub.args[0][0], 'device1');
      assert.deepEqual(pushStub.args[0][1], {
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

      instance.__provisionDevice(args, callbackStub);
      assert.equal(pushStub.called, 1);
      assert.equal(pushStub.args[0][0], 'device1');
      assert.deepEqual(pushStub.args[0][1], {
        remove: 'channel',
        type: 'pushType',
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

        instance.__provisionDevice(args, callbackStub);

        pushStub.args[0][2](null, 'success-response');
        assert.equal(callbackStub.called, 1);
        assert.deepEqual(callbackStub.args[0], [null, 'success-response']);
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        let pushStub = sinon.stub(networking, 'provisionDeviceForPush');
        let args = {
          device: 'device1',
          pushGateway: 'pushType',
          operation: 'remove',
          channel: 'channel',
        };

        instance.__provisionDevice(args, callbackStub);

        pushStub.args[0][2]('fail-response', null);
        assert.equal(callbackStub.called, 1);
        assert.deepEqual(callbackStub.args[0], ['fail-response', null]);
      });
    });
  });
});
