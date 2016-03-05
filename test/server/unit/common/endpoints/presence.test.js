/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../core/src/components/networking';
import Config from '../../../../../core/src/components/config';
import Keychain from '../../../../../core/src/components/keychain';

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('presence endpoints', () => {
  let networking;
  let config;
  let keychain;
  let error;
  let proxiedInstance;
  let successMock;
  let failMock;
  let jsonp_cb = () => 'im-jsonp';

  beforeEach(() => {
    networking = new Networking();
    config = new Config();
    error = sinon.stub();

    successMock = sinon.stub();
    failMock = sinon.stub();

    keychain = new Keychain()
      .setSubscribeKey('subKey')
      .setAuthKey('authKey')
      .setUUID('uuidKey')
      .setInstanceId('instanceId');

    let respondersClass = class {};
    respondersClass.callback = successMock;
    respondersClass.error = failMock;

    proxiedInstance = proxyquire('../../../../../core/src/endpoints/presence', {
      '../presenters/responders': respondersClass
    }).default;
  });

  describe('#fetchWhereNow', () => {
    it('calls networking #fetchWhereNow', () => {
      let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
      let args = {};
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(fetchWhereNowStub.called, 1);
      assert.equal(fetchWhereNowStub.args[0][0], 'uuidKey');
      assert.deepEqual(fetchWhereNowStub.args[0][1].data, { auth: 'authKey', callback: 'im-jsonp' });
    });

    it('uses passed uuid from args', () => {
      let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
      let args = { uuid: 'passed-uuid' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(fetchWhereNowStub.called, 1);
      assert.equal(fetchWhereNowStub.args[0][0], 'passed-uuid');
      assert.deepEqual(fetchWhereNowStub.args[0][1].data, { auth: 'authKey', callback: 'im-jsonp' });
    });

    it('uses instance id if enabled from args', () => {
      config.setInstanceIdConfig(true);
      let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
      let args = { uuid: 'passed-uuid' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(fetchWhereNowStub.called, 1);
      assert.equal(fetchWhereNowStub.args[0][0], 'passed-uuid');
      assert.deepEqual(fetchWhereNowStub.args[0][1].data, {
        auth: 'authKey',
        callback: 'im-jsonp',
        instanceid: 'instanceId'
      });
    });

    it('does not pass callback if jsonp_cb returns 0', () => {
      jsonp_cb = () => 0;
      let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
      let args = { uuid: 'passed-uuid' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(fetchWhereNowStub.called, 1);
      assert.equal(fetchWhereNowStub.args[0][0], 'passed-uuid');
      assert.deepEqual(fetchWhereNowStub.args[0][1].data, { auth: 'authKey' });
    });

    it('uses auth-key passed if exists', () => {
      jsonp_cb = () => 0;
      let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(fetchWhereNowStub.called, 1);
      assert.equal(fetchWhereNowStub.args[0][0], 'passed-uuid');
      assert.deepEqual(fetchWhereNowStub.args[0][1].data, { auth: 'custom-auth-key' });
    });

    it('errors if callback is not passed', () => {
      jsonp_cb = () => 0;
      sinon.stub(networking, 'fetchWhereNow');
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
      presenceEndpoint.whereNow(args);
      assert.equal(error.called, 1);
      assert.equal(error.args[0][0], 'Missing Callback');
    });

    it('errors if subscribe key is not passed', () => {
      jsonp_cb = () => 0;
      keychain.setSubscribeKey('');
      sinon.stub(networking, 'fetchWhereNow');
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(error.called, 1);
      assert.equal(error.args[0][0], 'Missing Subscribe Key');
    });

    it('massages params with the prepareParams function', () => {
      jsonp_cb = () => 0;
      let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
      let prepareParams = sinon.stub(networking, 'prepareParams').returns({ prepared: 'params' });
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(fetchWhereNowStub.called, 1);
      assert.equal(fetchWhereNowStub.args[0][0], 'passed-uuid');
      assert.equal(prepareParams.called, 1);
      assert.deepEqual(prepareParams.args[0][0], { auth: 'custom-auth-key' });
      assert.deepEqual(fetchWhereNowStub.args[0][1].data, { prepared: 'params' });
    });

    describe('on success', () => {
      it('calls the Responders.callback back on success with argument callback', () => {
        let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
        let callbackStub = sinon.stub();
        presenceEndpoint.whereNow(args, callbackStub);

        fetchWhereNowStub.args[0][1].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][1], callbackStub);
      });

      it('calls the Responders.callback back on success with args callback', () => {
        let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
        let callbackStub = sinon.stub();
        args.callback = callbackStub;
        presenceEndpoint.whereNow(args);

        fetchWhereNowStub.args[0][1].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][1], callbackStub);
      });

      it('uses the error function provided in args', () => {
        let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
        let errorStub = sinon.stub();
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key', error: errorStub };
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
        presenceEndpoint.whereNow(args, () => {});

        fetchWhereNowStub.args[0][1].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][2], errorStub);
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
        let errorStub = sinon.stub();
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key', error: errorStub };
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
        presenceEndpoint.whereNow(args, () => {});

        fetchWhereNowStub.args[0][1].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
        assert.deepEqual(failMock.args[0][1], errorStub);
      });

      it('swallows the error if error is not provided', () => {
        let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, jsonp_cb, error });
        presenceEndpoint.whereNow(args, () => {});

        fetchWhereNowStub.args[0][1].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
      });
    });
  });
});
