/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../src/core/components/networking';
import Responders from '../../../../../src/core/presenters/responders';
import Crypto from '../../../../../src/core/components/cryptography/index';

import assert from 'assert';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import loglevel from 'loglevel';

loglevel.disableAll();

describe('history endpoints', () => {
  let networking;
  let instance;
  let cryptoStub;
  let validateResponderStub;
  let fetchHistoryStub;
  let callbackStub;

  beforeEach(() => {
    cryptoStub = new Crypto({});
    networking = new Networking({});
    callbackStub = sinon.stub();
    validateResponderStub = sinon.stub().returns('validationError');
    fetchHistoryStub = sinon.stub(networking, 'fetchHistory');

    const respondersClass = Responders;
    respondersClass.prototype.validationError = validateResponderStub;

    const proxy = proxyquire('../../../../../src/core/endpoints/history', {
      '../presenters/responders': respondersClass,
    }).default;

    instance = new proxy({ networking, crypto: cryptoStub });
  });

  describe('#fetchHistory', () => {
    let defaultArgsInput;
    let defaultArgsOutput;

    beforeEach(() => {
      defaultArgsInput = {
        channel: 'ch1',
        start: 'start',
        end: 'end',
        includeToken: 'include_token',
      };

      defaultArgsOutput = {
        count: 100,
        start: 'start',
        end: 'end',
        stringtoken: 'true',
        include_token: 'true',
        reverse: 'false',
      };
    });

    it('errors out if channel or channel-group is not provided', () => {
      instance.fetch({}, callbackStub);
      assert.equal(callbackStub.args[0][0], 'validationError');
      assert.equal(validateResponderStub.args[0][0], 'Missing channel and/or channel group');
    });

    it('errors out if callback is not defined', () => {
      instance.fetch({ channel: 'ch1' });
      assert.equal(fetchHistoryStub.callCount, 0);
    });

    it('passes through args', () => {
      instance.fetch(defaultArgsInput, callbackStub);

      assert.equal(fetchHistoryStub.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryStub.args[0][1], defaultArgsOutput);
    });

    it('uses string_message_token from params if provided', () => {
      defaultArgsInput.stringMessageToken = 'string_message_token-true';
      defaultArgsOutput.string_message_token = 'true';
      instance.fetch(defaultArgsInput, callbackStub);

      assert.equal(fetchHistoryStub.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryStub.args[0][1], defaultArgsOutput);
    });

    it('uses reverse from params if provided', () => {
      defaultArgsInput.reverse = 'reverse-true';
      defaultArgsOutput.reverse = 'reverse-true';
      instance.fetch(defaultArgsInput, callbackStub);

      assert.equal(fetchHistoryStub.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryStub.args[0][1], defaultArgsOutput);
    });

    it('uses count from params if provided', () => {
      defaultArgsInput.count = 25;
      defaultArgsOutput.count = 25;
      instance.fetch(defaultArgsInput, callbackStub);

      assert.equal(fetchHistoryStub.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryStub.args[0][1], defaultArgsOutput);
    });

    it('uses limit from params if provided', () => {
      defaultArgsInput.limit = 25;
      defaultArgsOutput.count = 25;
      instance.fetch(defaultArgsInput, callbackStub);

      assert.equal(fetchHistoryStub.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryStub.args[0][1], defaultArgsOutput);
    });

    it('uses channel-group from params if provided', () => {
      defaultArgsInput.channelGroup = 'cg1,cg2,cg3';
      defaultArgsOutput['channel-group'] = 'cg1,cg2,cg3';
      instance.fetch(defaultArgsInput, callbackStub);

      assert.equal(fetchHistoryStub.args[0][0], 'ch1');
      assert.deepEqual(fetchHistoryStub.args[0][1], defaultArgsOutput);
    });

    it('uses , for channels if not provided', () => {
      delete defaultArgsInput.channel;
      defaultArgsInput.channelGroup = 'cg1,cg2,cg3';
      defaultArgsOutput['channel-group'] = 'cg1,cg2,cg3';
      instance.fetch(defaultArgsInput, callbackStub);

      assert.equal(fetchHistoryStub.args[0][0], ',');
      assert.deepEqual(fetchHistoryStub.args[0][1], defaultArgsOutput);
    });

    describe('callbacks and delgation to networking', () => {
      it('executes the #error responder if on error', () => {
        instance.fetch(defaultArgsInput, callbackStub);

        fetchHistoryStub.args[0][2]('fail-response', null);
        assert.equal(callbackStub.called, 1);
        assert.deepEqual(callbackStub.args[0], ['fail-response', null]);
      });

      it('executes the callback', () => {
        instance.fetch(defaultArgsInput, callbackStub);

        let stubbedModifier = sinon.stub(instance, '_parseResponse').returns('prparedData');
        fetchHistoryStub.args[0][2](null, 'success-response');

        assert.equal(stubbedModifier.called, 1);
        assert.equal(callbackStub.called, 1);
        assert.deepEqual(stubbedModifier.args[0], ['success-response', 'include_token']);
        assert.deepEqual(callbackStub.args[0], [null, 'prparedData']);
      });
    });
  });

  // we are testing a private method here, but the function is very dense and
  // needs further deconstruction. To make sure we do not regress, this test suite
  // covers decryption methods.
  describe('#_parseResponse', () => {
    describe('include_token = true', () => {
      it('hits the callback with correct raw data', () => {
        let decryptStub = sinon.stub(cryptoStub, 'decrypt').returnsArg(0);
        let message1 = { message: 'm1', timetoken: 't1' };
        let message2 = { message: 'm2', timetoken: 't2' };
        let messagePayload = [message1, message2];
        let combinedPayload = [messagePayload, 'firstElement', 'secondElement'];

        let resp = instance._parseResponse(combinedPayload, true);

        assert.equal(decryptStub.callCount, 2);
        assert.deepEqual(decryptStub.args[0][0], 'm1');
        assert.deepEqual(decryptStub.args[1][0], 'm2');
        assert.deepEqual(resp, [[message1, message2], 'firstElement', 'secondElement']);
      });

      it('hits the callback with correct json data', () => {
        let decryptStub = sinon.stub(cryptoStub, 'decrypt').returnsArg(0);
        let message1 = { message: '{"complex": "payload1"}', timetoken: 't1' };
        let message1Output = { message: { complex: 'payload1' }, timetoken: 't1' };
        let message2 = { message: '{"complex": "payload2"}', timetoken: 't2' };
        let message2Output = { message: { complex: 'payload2' }, timetoken: 't2' };
        let messagePayload = [message1, message2];
        let combinedPayload = [messagePayload, 'firstElement', 'secondElement'];

        let resp = instance._parseResponse(combinedPayload, true);
        assert.equal(decryptStub.callCount, 2);
        assert.equal(decryptStub.args[0][1]);
        assert.deepEqual(decryptStub.args[0][0], '{"complex": "payload1"}');
        assert.deepEqual(decryptStub.args[1][0], '{"complex": "payload2"}');

        assert.deepEqual(resp, [[message1Output, message2Output], 'firstElement', 'secondElement']);
      });
    });

    describe('include_token = false', () => {
      it('hits the callback with correct raw data', () => {
        let decryptStub = sinon.stub(cryptoStub, 'decrypt').returnsArg(0);
        let messagePayload = ['m1', 'm2'];
        let combinedPayload = [messagePayload, 'firstElement', 'secondElement'];

        let resp = instance._parseResponse(combinedPayload, false);
        assert.equal(decryptStub.callCount, 2);
        assert.deepEqual(decryptStub.args[0][0], 'm1');
        assert.deepEqual(decryptStub.args[1][0], 'm2');
        assert.deepEqual(resp, [['m1', 'm2'], 'firstElement', 'secondElement']);
      });

      it('hits the callback with correct json data', () => {
        let decryptStub = sinon.stub(cryptoStub, 'decrypt').returnsArg(0);
        let message1 = '{"complex": "payload1"}';
        let message1Output = { complex: 'payload1' };
        let message2 = '{"complex": "payload2"}';
        let message2Output = { complex: 'payload2' };
        let messagePayload = [message1, message2];
        let combinedPayload = [messagePayload, 'firstElement', 'secondElement'];

        let resp = instance._parseResponse(combinedPayload, false);

        assert.equal(decryptStub.callCount, 2);
        assert.deepEqual(decryptStub.args[0][0], '{"complex": "payload1"}');
        assert.deepEqual(decryptStub.args[1][0], '{"complex": "payload2"}');
        assert.deepEqual(resp, [[message1Output, message2Output], 'firstElement', 'secondElement']);
      });
    });
  });
});
