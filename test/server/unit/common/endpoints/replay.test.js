/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../src/core/components/networking';
import Config from '../../../../../src/core/components/config';
import Keychain from '../../../../../src/core/components/keychain';

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('replay endpoints', () => {
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
      .setPublishKey('pubKey')
      .setSubscribeKey('subKey')
      .setAuthKey('authKey')
      .setUUID('uuidKey')
      .setInstanceId('instanceId');

    let respondersClass = class {};
    respondersClass.callback = successMock;
    respondersClass.error = failMock;

    proxiedInstance = proxyquire('../../../../../core/src/endpoints/replay', {
      '../presenters/responders': respondersClass,
    }).default;
  });

  describe('#performReplay', () => {
    describe('verifies required information exists', () => {
      it('errors if source is missing', () => {
        let args = {};
        let replayEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          error,
        });
        replayEndpoint.performReplay(args, () => {});
        assert.equal(error.called, 1);
        assert.equal(error.args[0][0], 'Missing Source Channel');
      });

      it('errors if gw_type is missing', () => {
        let args = {
          source: 'source1',
        };
        let replayEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          error,
        });
        replayEndpoint.performReplay(args, () => {});
        assert.equal(error.called, 1);
        assert.equal(error.args[0][0], 'Missing Destination Channel');
      });

      it('errors if publish key is missing', () => {
        let args = {
          source: 'source1',
          destination: 'destination1',
        };
        keychain.setPublishKey('');
        let replayEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          error,
        });
        replayEndpoint.performReplay(args, () => {});
        assert.equal(error.called, 1);
        assert.equal(error.args[0][0], 'Missing Publish Key');
      });

      it('errors if subscribe key is missing', () => {
        let args = {
          source: 'source1',
          destination: 'destination1',
        };
        keychain.setSubscribeKey('');
        let replayEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          error,
        });
        replayEndpoint.performReplay(args, () => {});
        assert.equal(error.called, 1);
        assert.equal(error.args[0][0], 'Missing Subscribe Key');
      });
    });

    it('uses auth-key passed if exists', () => {
      let replayStub = sinon.stub(networking, 'fetchReplay');
      let args = {
        source: 'source1',
        destination: 'destination1',
        auth_key: 'customAuth',
      };
      let replayEndpoint = new proxiedInstance({
        networking,
        config,
        keychain,
        error,
      });
      replayEndpoint.performReplay(args, () => {});
      assert.equal(replayStub.called, 1);
      assert.equal(replayStub.args[0][0], 'source1');
      assert.equal(replayStub.args[0][1], 'destination1');
      assert.deepEqual(replayStub.args[0][2].data, {
        auth: 'customAuth',
      });
    });

    it('passes thru stop, reverse, start, end, limit', () => {
      let replayStub = sinon.stub(networking, 'fetchReplay');
      let args = {
        source: 'source1',
        destination: 'destination1',
        stop: 'stopparam',
        start: 'startparam',
        reverse: 'reverse-param',
        limit: 'limit-param',
      };
      let replayEndpoint = new proxiedInstance({
        networking,
        config,
        keychain,
        error,
      });
      replayEndpoint.performReplay(args, () => {});
      assert.equal(replayStub.called, 1);
      assert.equal(replayStub.args[0][0], 'source1');
      assert.equal(replayStub.args[0][1], 'destination1');
      assert.deepEqual(replayStub.args[0][2].data, {
        auth: 'authKey',
        count: 'limit-param',
        reverse: 'true',
        start: 'startparam',
        stop: 'all',
      });
    });

    it('omits reverse if not passed in params', () => {
      let replayStub = sinon.stub(networking, 'fetchReplay');
      let args = {
        source: 'source1',
        destination: 'destination1',
        stop: 'stopparam',
        start: 'startparam',
        limit: 'limit-param',
      };
      let replayEndpoint = new proxiedInstance({
        networking,
        config,
        keychain,
        error,
      });
      replayEndpoint.performReplay(args, () => {});
      assert.equal(replayStub.called, 1);
      assert.equal(replayStub.args[0][0], 'source1');
      assert.equal(replayStub.args[0][1], 'destination1');
      assert.deepEqual(replayStub.args[0][2].data, {
        auth: 'authKey',
        count: 'limit-param',
        start: 'startparam',
        stop: 'all',
      });
    });

    describe('on success', () => {
      it('calls the Responders.callback back on success with args callback', () => {
        let replayStub = sinon.stub(networking, 'fetchReplay');
        let args = {
          source: 'source1',
          destination: 'destination1',
          stop: 'stopparam',
          start: 'startparam',
          limit: 'limit-param',
        };
        let replayEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          error,
        });
        let callbackStub = sinon.stub();
        args.callback = callbackStub;
        replayEndpoint.performReplay(args);

        replayStub.args[0][2].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][1], callbackStub);
      });

      it('uses the error function provided in args', () => {
        let replayStub = sinon.stub(networking, 'fetchReplay');
        let errorStub = sinon.stub();
        let args = {
          source: 'source1',
          destination: 'destination1',
          stop: 'stopparam',
          start: 'startparam',
          limit: 'limit-param',
          error: errorStub,
        };
        let replayEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          error,
        });
        replayEndpoint.performReplay(args, () => {});

        replayStub.args[0][2].success('success-response');
        assert.equal(successMock.called, 1);
        assert.equal(successMock.args[0][0], 'success-response');
        assert.deepEqual(successMock.args[0][2], errorStub);
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        let replayStub = sinon.stub(networking, 'fetchReplay');
        let errorStub = sinon.stub();
        let args = {
          source: 'source1',
          destination: 'destination1',
          stop: 'stopparam',
          start: 'startparam',
          limit: 'limit-param',
          error: errorStub,
        };
        let replayEndpoint = new proxiedInstance({
          networking,
          config,
          keychain,
          error,
        });
        replayEndpoint.performReplay(args, errorStub);

        replayStub.args[0][2].fail('fail-response');
        assert.equal(errorStub.called, 1);
        assert.deepEqual(errorStub.args[0][0], [0, 'Disconnected']);
      });
    });
  });
});
