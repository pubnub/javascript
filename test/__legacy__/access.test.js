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

describe.skip('access endpoints', () => {
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

    let proxy = proxyquire('../../../../../src/core/endpoints/access', {
      '../presenters/responders': respondersClass,
    }).default;

    instance = new proxy({ networking, state });
  });

  describe('#grant', () => {
    let clock;

    beforeEach(() => {
      xdrMock = sinon.stub(networking, 'performGrant');
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('errors if callback is not passed', () => {
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let logSpy = sinon.spy(instance._l, 'error');
      instance.grant(args);
      assert.equal(logSpy.called, 1);
      assert.equal(logSpy.args[0][0], 'Missing Callback');
    });

    it('calls with channel if passed', () => {
      let args = { channels: ['ch1'] };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, { channel: 'ch1', timestamp: 0, r: 0, w: 0 }, callbackStub]);
    });

    it('calls with channel as array if passed', () => {
      let args = { channels: ['ch1', 'ch2'] };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, { channel: 'ch1,ch2', timestamp: 0, r: 0, w: 0 }, callbackStub]);
    });

    it('calls with channel if passed', () => {
      let args = { channels: ['ch1'] };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, { channel: 'ch1', timestamp: 0, r: 0, w: 0 }, callbackStub]);
    });

    it('calls with channel group if passed', () => {
      let args = { channelGroups: ['cg1'] };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, { 'channel-group': 'cg1', timestamp: 0, r: 0, w: 0 }, callbackStub]);
    });

    it('calls with channel groups if passed', () => {
      let args = { channelGroups: ['cg1', 'cg2'] };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, { 'channel-group': 'cg1,cg2', timestamp: 0, r: 0, w: 0 }, callbackStub]);
    });

    it('adds authKey', () => {
      let args = { channelGroups: ['cg1'], authKeys: ['authKey'] };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], ['authKey', { 'channel-group': 'cg1', timestamp: 0, r: 0, w: 0 }, callbackStub]);
    });

    it('adds authKeys', () => {
      let args = { channelGroups: ['cg1'], authKeys: ['authKey', 'authKey2'] };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], ['authKey,authKey2', { 'channel-group': 'cg1', timestamp: 0, r: 0, w: 0 }, callbackStub]);
    });

    it('adds r=1 if read: true is passed', () => {
      let args = { channelGroups: ['cg1'], authKeys: ['authKey'], read: true };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], ['authKey', { 'channel-group': 'cg1', timestamp: 0, r: 1, w: 0 }, callbackStub]);
    });

    it('adds w=1 if write: true is passed', () => {
      let args = { channelGroups: ['cg1'], authKeys: ['authKey'], write: true };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], ['authKey', { 'channel-group': 'cg1', timestamp: 0, r: 0, w: 1 }, callbackStub]);
    });

    it('adds m=1 if manage: true is passed', () => {
      let args = { channelGroups: ['cg1'], authKeys: ['authKey'], manage: true };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], ['authKey', { 'channel-group': 'cg1', timestamp: 0, r: 0, w: 0, m: 1 }, callbackStub]);
    });

    it('adds m=0 if manage: false is passed', () => {
      let args = { channelGroups: ['cg1'], authKeys: ['authKey'], manage: false };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], ['authKey', { 'channel-group': 'cg1', timestamp: 0, r: 0, w: 0, m: 0 }, callbackStub]);
    });

    it('calls with both channel and channel group if passed', () => {
      let args = { channels: ['ch1'], channelGroups: ['cg1'] };
      instance.grant(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, { channel: 'ch1', 'channel-group': 'cg1', timestamp: 0, r: 0, w: 0 }, callbackStub]);
    });
  });

  describe('#audit', () => {
    let clock;

    beforeEach(() => {
      xdrMock = sinon.stub(networking, 'performAudit');
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('errors if callback is not passed', () => {
      let args = { uuid: 'passed-uuid', auth_key: 'custom-auth-key' };
      let logSpy = sinon.spy(instance._l, 'error');
      instance.audit(args);
      assert.equal(logSpy.called, 1);
      assert.equal(logSpy.args[0][0], 'Missing Callback');
    });

    it('calls with channel if passed', () => {
      let args = { channels: ['ch1'] };
      instance.audit(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, { channel: 'ch1', timestamp: 0 }, callbackStub]);
    });

    it('calls with multiple channels if passed', () => {
      let args = { channels: ['ch1', 'ch2'] };
      instance.audit(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, { channel: 'ch1,ch2', timestamp: 0 }, callbackStub]);
    });

    it('calls with channel group if passed', () => {
      let args = { channelGroups: ['cg1'] };
      instance.audit(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, { 'channel-group': 'cg1', timestamp: 0 }, callbackStub]);
    });

    it('calls with multiple channels if passed', () => {
      let args = { channelGroups: ['cg1', 'cg2'] };
      instance.audit(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, { 'channel-group': 'cg1,cg2', timestamp: 0 }, callbackStub]);
    });

    it('adds authKey', () => {
      let args = { channelGroups: ['cg1'], authKeys: ['authKey'] };
      instance.audit(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], ['authKey', { 'channel-group': 'cg1', timestamp: 0 }, callbackStub]);
    });

    it('adds authKeys', () => {
      let args = { channelGroups: ['cg1'], authKeys: ['authKey', 'authKey2'] };
      instance.audit(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], ['authKey,authKey2', { 'channel-group': 'cg1', timestamp: 0 }, callbackStub]);
    });

    it('calls with both channel and channel group if passed', () => {
      let args = { channels: ['ch1'], channelGroups: ['cg1'] };
      instance.audit(args, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, { channel: 'ch1', 'channel-group': 'cg1', timestamp: 0 }, callbackStub]);
    });
  });

  describe('#revoke', () => {
    it('calls #grant', () => {
      let grantStab = sinon.stub(instance, 'grant');
      instance.revoke({}, callbackStub);
      assert.deepEqual(grantStab.args[0], [{ read: false, write: false }, callbackStub]);
    });
  });
});
