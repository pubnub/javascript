/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../src/core/components/networking';
import Config from '../../../../../src/core/components/config';
import Keychain from '../../../../../src/core/components/keychain';

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
      '../presenters/responders': respondersClass,
    }).default;
  });

  describe('#hereNow', () => {
    it('calls networking #fetchHereNow for global here now', () => {
      let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
      let args = {};
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.hereNow(args, () => {});
      assert.equal(fetchHereNowStub.called, 1);
      assert.equal(fetchHereNowStub.args[0][0], undefined);
      assert.equal(fetchHereNowStub.args[0][1], undefined);
      assert.deepEqual(fetchHereNowStub.args[0][2].data, { uuid: 'uuidKey', auth: 'authKey' });
    });

    it('calls networking #fetchHereNow for channel here now', () => {
      let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
      let args = { channel: 'ch1,ch2,ch3' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.hereNow(args, () => {});
      assert.equal(fetchHereNowStub.called, 1);
      assert.equal(fetchHereNowStub.args[0][0], 'ch1,ch2,ch3');
      assert.equal(fetchHereNowStub.args[0][1], undefined);
      assert.deepEqual(fetchHereNowStub.args[0][2].data, { uuid: 'uuidKey', auth: 'authKey' });
    });

    it('calls networking #fetchHereNow for channel group here now', () => {
      let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
      let args = { channel_group: 'cg1,cg2,cg3' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.hereNow(args, () => {});
      assert.equal(fetchHereNowStub.called, 1);
      assert.equal(fetchHereNowStub.args[0][0], undefined);
      assert.equal(fetchHereNowStub.args[0][1], 'cg1,cg2,cg3');
      assert.deepEqual(fetchHereNowStub.args[0][2].data, {
        uuid: 'uuidKey', auth: 'authKey', 'channel-group': 'cg1,cg2,cg3' });
    });

    it('uses state, disabled uuids from args', () => {
      let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
      let args = { state: true, uuids: false };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.hereNow(args, () => {});
      assert.equal(fetchHereNowStub.called, 1);
      assert.equal(fetchHereNowStub.args[0][0], undefined);
      assert.deepEqual(fetchHereNowStub.args[0][2].data, {
        auth: 'authKey', disable_uuids: 1, state: 1, uuid: 'uuidKey' });
    });

    it('uses instance id if enabled from args', () => {
      config.setInstanceIdConfig(true);
      let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
      let args = {};
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.hereNow(args, () => {});
      assert.equal(fetchHereNowStub.called, 1);
      assert.equal(fetchHereNowStub.args[0][0], undefined);
      assert.deepEqual(fetchHereNowStub.args[0][2].data, {
        auth: 'authKey',
        instanceid: 'instanceId',
        uuid: 'uuidKey',
      });
    });

    it('uses auth-key passed if exists', () => {
      let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
      let args = { auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.hereNow(args, () => {});
      assert.equal(fetchHereNowStub.called, 1);
      assert.equal(fetchHereNowStub.args[0][0], undefined);
      assert.deepEqual(fetchHereNowStub.args[0][2].data, { auth: 'custom-auth-key', uuid: 'uuidKey' });
    });

    it('errors if callback is not passed', () => {
      sinon.stub(networking, 'fetchHereNow');
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.hereNow(args);
      assert.equal(error.called, 1);
      assert.equal(error.args[0][0], 'Missing Callback');
    });

    it('errors if subscribe key is not passed', () => {
      keychain.setSubscribeKey('');
      sinon.stub(networking, 'fetchHereNow');
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.hereNow(args, () => {});
      assert.equal(error.called, 1);
      assert.equal(error.args[0][0], 'Missing Subscribe Key');
    });

    it('massages params with the prepareParams function', () => {
      let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
      let prepareParams = sinon.stub(networking, 'prepareParams').returns({ prepared: 'params' });
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.hereNow(args, () => {});
      assert.equal(fetchHereNowStub.called, 1);
      assert.equal(fetchHereNowStub.args[0][0], undefined);
      assert.equal(prepareParams.called, 1);
      assert.deepEqual(prepareParams.args[0][0], { auth: 'custom-auth-key', uuid: 'uuidKey' });
      assert.deepEqual(fetchHereNowStub.args[0][2].data, { prepared: 'params' });
    });

    describe('on success', () => {
      it('calls the Responders.callback back on success with argument callback', () => {
        let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
        let callbackStub = sinon.stub();
        presenceEndpoint.hereNow(args, callbackStub);

        fetchHereNowStub.args[0][2].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][1], callbackStub);
      });

      it('calls the Responders.callback back on success with args callback', () => {
        let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
        let callbackStub = sinon.stub();
        args.callback = callbackStub;
        presenceEndpoint.hereNow(args);

        fetchHereNowStub.args[0][2].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][1], callbackStub);
      });

      it('uses the error function provided in args', () => {
        let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
        let errorStub = sinon.stub();
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key', error: errorStub };
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
        presenceEndpoint.hereNow(args, () => {});

        fetchHereNowStub.args[0][2].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][2], errorStub);
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
        let errorStub = sinon.stub();
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key', error: errorStub };
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
        presenceEndpoint.hereNow(args, () => {});

        fetchHereNowStub.args[0][2].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
        assert.deepEqual(failMock.args[0][1], errorStub);
      });

      it('swallows the error if error is not provided', () => {
        let fetchHereNowStub = sinon.stub(networking, 'fetchHereNow');
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
        presenceEndpoint.hereNow(args, () => {});

        fetchHereNowStub.args[0][2].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
      });
    });
  });

  describe('#WhereNow', () => {
    it('calls networking #fetchWhereNow', () => {
      let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
      let args = {};
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(fetchWhereNowStub.called, 1);
      assert.equal(fetchWhereNowStub.args[0][0], 'uuidKey');
      assert.deepEqual(fetchWhereNowStub.args[0][1].data, { auth: 'authKey' });
    });

    it('uses passed uuid from args', () => {
      let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
      let args = { uuid: 'passed-uuid' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(fetchWhereNowStub.called, 1);
      assert.equal(fetchWhereNowStub.args[0][0], 'passed-uuid');
      assert.deepEqual(fetchWhereNowStub.args[0][1].data, { auth: 'authKey' });
    });

    it('uses instance id if enabled from args', () => {
      config.setInstanceIdConfig(true);
      let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
      let args = { uuid: 'passed-uuid' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(fetchWhereNowStub.called, 1);
      assert.equal(fetchWhereNowStub.args[0][0], 'passed-uuid');
      assert.deepEqual(fetchWhereNowStub.args[0][1].data, {
        auth: 'authKey',
        instanceid: 'instanceId',
      });
    });

    it('uses auth-key passed if exists', () => {
      let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(fetchWhereNowStub.called, 1);
      assert.equal(fetchWhereNowStub.args[0][0], 'passed-uuid');
      assert.deepEqual(fetchWhereNowStub.args[0][1].data, { auth: 'custom-auth-key' });
    });

    it('errors if callback is not passed', () => {
      sinon.stub(networking, 'fetchWhereNow');
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.whereNow(args);
      assert.equal(error.called, 1);
      assert.equal(error.args[0][0], 'Missing Callback');
    });

    it('errors if subscribe key is not passed', () => {
      keychain.setSubscribeKey('');
      sinon.stub(networking, 'fetchWhereNow');
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
      presenceEndpoint.whereNow(args, () => {});
      assert.equal(error.called, 1);
      assert.equal(error.args[0][0], 'Missing Subscribe Key');
    });

    it('massages params with the prepareParams function', () => {
      let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
      let prepareParams = sinon.stub(networking, 'prepareParams').returns({ prepared: 'params' });
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
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
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
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
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
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
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
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
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
        presenceEndpoint.whereNow(args, () => {});

        fetchWhereNowStub.args[0][1].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
        assert.deepEqual(failMock.args[0][1], errorStub);
      });

      it('swallows the error if error is not provided', () => {
        let fetchWhereNowStub = sinon.stub(networking, 'fetchWhereNow');
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        let presenceEndpoint = new proxiedInstance({ networking, config, keychain, error });
        presenceEndpoint.whereNow(args, () => {});

        fetchWhereNowStub.args[0][1].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
      });
    });
  });
});
