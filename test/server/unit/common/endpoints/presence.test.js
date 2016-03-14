/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../src/core/components/networking';
import State from '../../../../../src/core/components/state';
import Responders from '../../../../../src/core/presenters/Responders';

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

import loglevel from 'loglevel';

loglevel.disableAll();

describe('presence endpoints', () => {
  let networking;
  let state;
  let instance;
  let callbackStub;
  let xdrMock;
  let validateResponderStub;

  beforeEach(() => {
    networking = new Networking({});
    state = new State();
    callbackStub = sinon.stub();

    validateResponderStub = sinon.stub().returns('validationError');

    let respondersClass = Responders;
    respondersClass.prototype.validationError = validateResponderStub;

    let proxy = proxyquire('../../../../../src/core/endpoints/presence', {
      '../presenters/responders': respondersClass,
    }).default;

    instance = new proxy({ networking, state });
  });

  describe('#hereNow', () => {
    beforeEach(() => {
      xdrMock = sinon.stub(networking, 'fetchHereNow');
    });

    it('calls networking #fetchHereNow for global here now', () => {
      let args = {};
      instance.hereNow(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      assert.equal(xdrMock.args[0][0], undefined);
      assert.equal(xdrMock.args[0][1], undefined);
      assert.deepEqual(xdrMock.args[0][2], {});
    });

    it('calls networking #fetchHereNow for channel here now', () => {
      let args = { channel: 'ch1,ch2,ch3' };
      instance.hereNow(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      assert.equal(xdrMock.args[0][0], 'ch1,ch2,ch3');
      assert.equal(xdrMock.args[0][1], undefined);
      assert.deepEqual(xdrMock.args[0][2], {});
    });

    it('calls networking #fetchHereNow for channel group here now', () => {
      let args = { channelGroup: 'cg1,cg2,cg3' };
      instance.hereNow(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      assert.equal(xdrMock.args[0][0], undefined);
      assert.equal(xdrMock.args[0][1], 'cg1,cg2,cg3');
      assert.deepEqual(xdrMock.args[0][2], { 'channel-group': 'cg1,cg2,cg3' });
    });

    it('uses state, disabled uuids from args', () => {
      let args = { state: true, uuids: false };
      instance.hereNow(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      assert.equal(xdrMock.args[0][0], undefined);
      assert.equal(xdrMock.args[0][1], undefined);
      assert.deepEqual(xdrMock.args[0][2], { disable_uuids: 1, state: 1 });
    });

    it('errors if callback is not passed', () => {
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let logSpy = sinon.spy(instance._l, 'error');
      instance.hereNow(args);
      assert.equal(logSpy.called, 1);
      assert.equal(logSpy.args[0][0], 'Missing Callback');
    });

    describe('on success', () => {
      it('calls the Responders.callback back on success with argument callback', () => {
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        instance.hereNow(args, callbackStub);

        xdrMock.args[0][3](null, 'success-response');
        assert.equal(callbackStub.called, 1);
        assert.deepEqual(callbackStub.args[0], [null, 'success-response']);
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        instance.hereNow(args, callbackStub);

        xdrMock.args[0][3]('fail-response', null);
        assert.equal(callbackStub.called, 1);
        assert.deepEqual(callbackStub.args[0], ['fail-response', null]);
      });
    });
  });

  describe('#WhereNow', () => {
    beforeEach(() => {
      xdrMock = sinon.stub(networking, 'fetchWhereNow');
    });

    it('calls networking #fetchWhereNow', () => {
      let args = {};
      instance.whereNow(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      assert.equal(xdrMock.args[0][0], undefined);
      assert.deepEqual(xdrMock.args[0][1], callbackStub);
    });

    it('uses passed uuid from args', () => {
      let args = { uuid: 'passed-uuid' };
      instance.whereNow(args, callbackStub);
      assert.equal(xdrMock.called, 1);
      assert.equal(xdrMock.args[0][0], 'passed-uuid');
      assert.deepEqual(xdrMock.args[0][1], callbackStub);
    });

    it('errors if callback is not passed', () => {
      let logSpy = sinon.spy(instance._l, 'error');
      instance.whereNow({});
      assert.equal(logSpy.called, 1);
      assert.equal(logSpy.args[0][0], 'Missing Callback');
    });

    describe('on success', () => {
      it('calls the Responders.callback back on success with argument callback', () => {
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        instance.whereNow(args, callbackStub);

        xdrMock.args[0][1](null, 'success-response');
        assert.equal(callbackStub.called, 1);
        assert.deepEqual(callbackStub.args[0], [null, 'success-response']);
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
        instance.whereNow(args, callbackStub);

        xdrMock.args[0][1]('error', null);
        assert.equal(callbackStub.called, 1);
        assert.deepEqual(callbackStub.args[0], ['error', null]);
      });
    });
  });
});
