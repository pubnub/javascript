/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */
/*
  - callback multiplexing x 2
  - error || blackhole x 2
*/

import Networking from '../../../../../core/src/components/networking';
import Keychain from '../../../../../core/src/components/keychain';

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('history endpoints', () => {
  let networking;
  let keychain;
  let error;
  let proxiedInstance;
  let successMock;
  let prepareParamsMock;
  let failMock;
  let decryptMock;
  let fetchHistoryMock;

  beforeEach(() => {
    networking = new Networking();
    error = sinon.stub();
    decryptMock = sinon.stub().returnsArg(0);

    successMock = sinon.stub();
    failMock = sinon.stub();

    fetchHistoryMock = sinon.stub(networking, 'fetchHistory');
    prepareParamsMock = sinon.spy(networking, 'prepareParams');

    keychain = new Keychain()
      .setSubscribeKey('subKey')
      .setAuthKey('authKey')
      .setUUID('uuidKey')
      .setInstanceId('instanceId');

    let respondersClass = class {};
    respondersClass.callback = successMock;
    respondersClass.error = failMock;

    proxiedInstance = proxyquire('../../../../../core/src/endpoints/history', {
      '../presenters/responders': respondersClass,
    }).default;
  });

  describe('#fetchHistory', () => {
    let instance;
    let defaultArgsInput;
    let defaultArgsOutput;

    beforeEach(() => {
      defaultArgsInput = {
        channel: 'ch1',
        cipher_key: 'cipher_key',
        start: 'start',
        end: 'end',
        include_token: 'include_token',
      };

      defaultArgsOutput = {
        count: 100,
        start: 'start',
        end: 'end',
        auth: 'authKey',
        stringtoken: 'true',
        include_token: 'true',
        reverse: 'false',
      };

      instance = new proxiedInstance({
        keychain,
        networking,
        decrypt: decryptMock,
        error,
      });
    });

    it('errors out if channel or channel-group is not provided', () => {
      let callbackMock = sinon.stub();
      instance.fetchHistory({}, callbackMock);
      assert.equal(error.args[0][0], 'Missing Channel');
    });

    it('errors out if callback is not defined', () => {
      instance.fetchHistory({ channel: 'ch1' });
      assert.equal(error.args[0][0], 'Missing Callback');
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      let callbackMock = sinon.stub();
      instance.fetchHistory({ channel: 'ch1' }, callbackMock);
      assert.equal(error.args[0][0], 'Missing Subscribe Key');
    });

    it('passes through args', () => {
      let callbackMock = sinon.stub();
      instance.fetchHistory(defaultArgsInput, callbackMock);

      assert.equal(fetchHistoryMock.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryMock.args[0][1].data, defaultArgsOutput);
    });

    it('uses auth-key from params if provided', () => {
      let callbackMock = sinon.stub();
      defaultArgsInput.auth_key = 'auth-key-params';
      defaultArgsOutput.auth = 'auth-key-params';
      instance.fetchHistory(defaultArgsInput, callbackMock);

      assert.equal(fetchHistoryMock.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryMock.args[0][1].data, defaultArgsOutput);
    });

    it('uses string_message_token from params if provided', () => {
      let callbackMock = sinon.stub();
      defaultArgsInput.string_message_token = 'string_message_token-true';
      defaultArgsOutput.string_message_token = 'true';
      instance.fetchHistory(defaultArgsInput, callbackMock);

      assert.equal(fetchHistoryMock.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryMock.args[0][1].data, defaultArgsOutput);
    });

    it('uses reverse from params if provided', () => {
      let callbackMock = sinon.stub();
      defaultArgsInput.reverse = 'reverse-true';
      defaultArgsOutput.reverse = 'reverse-true';
      instance.fetchHistory(defaultArgsInput, callbackMock);

      assert.equal(fetchHistoryMock.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryMock.args[0][1].data, defaultArgsOutput);
    });

    it('uses count from params if provided', () => {
      let callbackMock = sinon.stub();
      defaultArgsInput.count = 25;
      defaultArgsOutput.count = 25;
      instance.fetchHistory(defaultArgsInput, callbackMock);

      assert.equal(fetchHistoryMock.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryMock.args[0][1].data, defaultArgsOutput);
    });

    it('uses limit from params if provided', () => {
      let callbackMock = sinon.stub();
      defaultArgsInput.limit = 25;
      defaultArgsOutput.count = 25;
      instance.fetchHistory(defaultArgsInput, callbackMock);

      assert.equal(fetchHistoryMock.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryMock.args[0][1].data, defaultArgsOutput);
    });

    it('uses channel-group from params if provided', () => {
      let callbackMock = sinon.stub();
      defaultArgsInput.channel_group = 'cg1,cg2,cg3';
      defaultArgsOutput['channel-group'] = 'cg1,cg2,cg3';
      instance.fetchHistory(defaultArgsInput, callbackMock);

      assert.equal(fetchHistoryMock.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryMock.args[0][1].data, defaultArgsOutput);
    });

    it('uses , for channels if not provided', () => {
      let callbackMock = sinon.stub();
      delete defaultArgsInput.channel;
      defaultArgsInput.channel_group = 'cg1,cg2,cg3';
      defaultArgsOutput['channel-group'] = 'cg1,cg2,cg3';
      instance.fetchHistory(defaultArgsInput, callbackMock);

      assert.equal(fetchHistoryMock.args[0][0], ',');
      assert.deepEqual(fetchHistoryMock.args[0][1].data, defaultArgsOutput);
    });

    describe('callbacks and delgation to networking', () => {
      it('executs #prepareParamsMock to prepare params', () => {
        let callbackMock = sinon.stub();
        instance.fetchHistory(defaultArgsInput, callbackMock);
        assert.equal(prepareParamsMock.called, true);
      });

      it('executes the #error responder if on error', () => {
        let callbackMock = sinon.stub();
        defaultArgsInput.error = sinon.stub();
        instance.fetchHistory(defaultArgsInput, callbackMock);

        fetchHistoryMock.args[0][1].fail('fail-response');
        assert.equal(failMock.called, 1);
        assert.equal(failMock.args[0][0], 'fail-response');
        assert.deepEqual(failMock.args[0][1], defaultArgsInput.error);
      });

      it('executes the callback', () => {
        let callbackMock = sinon.stub();
        defaultArgsInput.error = sinon.stub();
        instance.fetchHistory(defaultArgsInput, callbackMock);

        let stubbedModifier = sinon.stub(instance, '_handleHistoryResponse');
        fetchHistoryMock.args[0][1].success('success-response');

        assert.equal(stubbedModifier.called, 1);
        assert.deepEqual(stubbedModifier.args[0], [
          'success-response', defaultArgsInput.error, callbackMock,
          defaultArgsInput.include_token, defaultArgsInput.cipher_key,
        ]);
      });

      it('executes the callback passed from args', () => {
        let callbackMock = sinon.stub();
        defaultArgsInput.error = sinon.stub();
        defaultArgsInput.callback = callbackMock;
        instance.fetchHistory(defaultArgsInput);

        let stubbedModifier = sinon.stub(instance, '_handleHistoryResponse');
        fetchHistoryMock.args[0][1].success('success-response');

        assert.equal(stubbedModifier.called, 1);
        assert.deepEqual(stubbedModifier.args[0], [
          'success-response', defaultArgsInput.error, callbackMock,
          defaultArgsInput.include_token, defaultArgsInput.cipher_key,
        ]);
      });
    });
  });

  // we are testing a private method here, but the function is very dense and
  // needs further deconstruction. To make sure we do not regress, this test suite
  // covers decryption methods.
  describe('#_handleHistoryResponse', () => {
    let err;
    let callback;
    let instance;

    beforeEach(() => {
      err = sinon.stub();
      callback = sinon.stub();
      instance = new proxiedInstance({
        keychain,
        networking,
        decrypt: decryptMock,
        error,
      });
    });

    it('triggers error if payload contains an error and is an object', () => {
      let payload = { error: true, message: 'message', payload: 'payload' };
      instance._handleHistoryResponse(payload, err, callback, false, 'cipherKey');

      assert.equal(err.called, 1);
      assert.deepEqual(err.args[0][0], { message: 'message', payload: 'payload' });
    });

    describe('include_token = true', () => {
      it('hits the callback with correct raw data', () => {
        let message1 = { message: 'm1', timetoken: 't1' };
        let message2 = { message: 'm2', timetoken: 't2' };
        let messagePayload = [message1, message2];
        let combinedPayload = [messagePayload, 'firstElement', 'secondElement'];

        instance._handleHistoryResponse(combinedPayload, err, callback, true, 'cipherKey');
        assert.equal(callback.called, 1);
        assert.equal(decryptMock.callCount, 2);
        assert.equal(decryptMock.args[0][1], 'cipherKey');
        assert.deepEqual(decryptMock.args[0][0], 'm1');
        assert.deepEqual(decryptMock.args[1][0], 'm2');
        assert.deepEqual(callback.args[0], [[[message1, message2], 'firstElement', 'secondElement']]);
      });

      it('hits the callback with correct json data', () => {
        let message1 = { message: '{"complex": "payload1"}', timetoken: 't1' };
        let message1Output = { message: { complex: 'payload1' }, timetoken: 't1' };
        let message2 = { message: '{"complex": "payload2"}', timetoken: 't2' };
        let message2Output = { message: { complex: 'payload2' }, timetoken: 't2' };
        let messagePayload = [message1, message2];
        let combinedPayload = [messagePayload, 'firstElement', 'secondElement'];

        instance._handleHistoryResponse(combinedPayload, err, callback, true, 'cipherKey');
        assert.equal(callback.called, 1);
        assert.equal(decryptMock.callCount, 2);
        assert.equal(decryptMock.args[0][1], 'cipherKey');
        assert.deepEqual(decryptMock.args[0][0], '{"complex": "payload1"}');
        assert.deepEqual(decryptMock.args[1][0], '{"complex": "payload2"}');
        assert.deepEqual(callback.args[0], [[[message1Output, message2Output], 'firstElement', 'secondElement']]);
      });
    });

    describe('include_token = false', () => {
      it('hits the callback with correct raw data', () => {
        let messagePayload = ['m1', 'm2'];
        let combinedPayload = [messagePayload, 'firstElement', 'secondElement'];

        instance._handleHistoryResponse(combinedPayload, err, callback, false, 'cipherKey');
        assert.equal(callback.called, 1);
        assert.equal(decryptMock.callCount, 2);
        assert.equal(decryptMock.args[0][1], 'cipherKey');
        assert.deepEqual(decryptMock.args[0][0], 'm1');
        assert.deepEqual(decryptMock.args[1][0], 'm2');
        assert.deepEqual(callback.args[0], [[['m1', 'm2'], 'firstElement', 'secondElement']]);
      });

      it('hits the callback with correct json data', () => {
        let message1 = '{"complex": "payload1"}';
        let message1Output = { complex: 'payload1' };
        let message2 = '{"complex": "payload2"}';
        let message2Output = { complex: 'payload2' };
        let messagePayload = [message1, message2];
        let combinedPayload = [messagePayload, 'firstElement', 'secondElement'];

        instance._handleHistoryResponse(combinedPayload, err, callback, false, 'cipherKey');
        assert.equal(callback.called, 1);
        assert.equal(decryptMock.callCount, 2);
        assert.equal(decryptMock.args[0][1], 'cipherKey');
        assert.deepEqual(decryptMock.args[0][0], '{"complex": "payload1"}');
        assert.deepEqual(decryptMock.args[1][0], '{"complex": "payload2"}');
        assert.deepEqual(callback.args[0], [[[message1Output, message2Output], 'firstElement', 'secondElement']]);
      });
    });
  });
});
