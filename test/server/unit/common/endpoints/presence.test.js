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
  let announceStateChangeStub;

  beforeEach(() => {
    networking = new Networking({});
    state = new State();
    callbackStub = sinon.stub();

    validateResponderStub = sinon.stub().returns('validationError');
    announceStateChangeStub = sinon.stub(state, 'announceStateChange');

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

  describe('#getState', () => {
    beforeEach(() => {
      xdrMock = sinon.stub(networking, 'fetchState');
    });

    it('errors if callback is not passed', () => {
      let logSpy = sinon.spy(instance._l, 'error');
      instance.getState({});
      assert.equal(logSpy.called, 1);
      assert.equal(logSpy.args[0][0], 'Missing Callback');
    });

    it('errors if no channels, channel groups are passed', () => {
      instance.getState({}, callbackStub);
      assert.equal(callbackStub.args[0][0], 'validationError');
      assert.equal(validateResponderStub.args[0][0], 'Channel or Channel Group must be supplied');
    });

    it('supports passing of channels', () => {
      instance.getState({ channel: 'ch1' }, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, 'ch1', {}, callbackStub]);
    });

    it('supports passing of channel groups', () => {
      instance.getState({ channelGroup: 'cg1' }, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, ',', { 'channel-group': 'cg1' }, callbackStub]);
    });

    it('supports passing of channels and channel groups', () => {
      instance.getState({ channel: 'ch1', channelGroup: 'cg1' }, callbackStub);
      assert.deepEqual(xdrMock.args[0], [null, 'ch1', { 'channel-group': 'cg1' }, callbackStub]);
    });

    it('supports passing of uuid', () => {
      instance.getState({ uuid: 'my-uuid', channel: 'ch1', channelGroup: 'cg1' }, callbackStub);
      assert.deepEqual(xdrMock.args[0], ['my-uuid', 'ch1', { 'channel-group': 'cg1' }, callbackStub]);
    });

    describe('on success', () => {
      it('calls the Responders.callback back on success with argument callback', () => {
        instance.getState({ channelGroup: 'cg1' }, callbackStub);
        xdrMock.args[0][3](null, 'success-response');
        assert.equal(callbackStub.called, 1);
        assert.deepEqual(callbackStub.args[0], [null, 'success-response']);
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        instance.getState({ channelGroup: 'cg1' }, callbackStub);

        xdrMock.args[0][3]('error', null);
        assert.equal(callbackStub.called, 1);
        assert.deepEqual(callbackStub.args[0], ['error', null]);
      });
    });
  });

  describe('#heartbeat', () => {
    beforeEach(() => {
      xdrMock = sinon.stub(networking, 'performHeartbeat');
    });

    it('pushes heartbeat and state information into the data', () => {
      sinon.stub(state, 'getPresenceState').returns({ some: 'state' });
      sinon.stub(state, 'getPresenceTimeout').returns(123);
      instance.heartbeat(callbackStub);
      assert.deepEqual(xdrMock.args[0], [',', { state: '{"some":"state"}', heartbeat: 123 }, callbackStub]);
    });

    it('includes channels if they exist', () => {
      sinon.stub(state, 'getPresenceState').returns({ some: 'state' });
      sinon.stub(state, 'getPresenceTimeout').returns(123);
      sinon.stub(state, 'getSubscribedChannels').returns(['a', 'b', 'c']);
      instance.heartbeat(callbackStub);
      assert.deepEqual(xdrMock.args[0], ['a,b,c', { state: '{"some":"state"}', heartbeat: 123 }, callbackStub]);
    });

    it('includes channel groups if they exist', () => {
      sinon.stub(state, 'getPresenceState').returns({ some: 'state' });
      sinon.stub(state, 'getPresenceTimeout').returns(123);
      sinon.stub(state, 'getSubscribedChannelGroups').returns(['a', 'b', 'c']);
      instance.heartbeat(callbackStub);
      assert.deepEqual(xdrMock.args[0], [',', { 'channel-group': 'a,b,c', state: '{"some":"state"}', heartbeat: 123 }, callbackStub]);
    });
  });

  describe('#setState', () => {
    beforeEach(() => {
      xdrMock = sinon.stub(networking, 'setState');
    });

    it('errors if callback is not passed', () => {
      let logSpy = sinon.spy(instance._l, 'error');
      instance.setState({});
      assert.equal(logSpy.called, 1);
      assert.equal(logSpy.args[0][0], 'Missing Callback');
    });

    it('errors if no channels, channel groups are passed', () => {
      instance.setState({}, callbackStub);
      assert.equal(callbackStub.args[0][0], 'validationError');
      assert.equal(validateResponderStub.args[0][0], 'Channel or Channel Group must be supplied');
    });

    it('errors if state is not passed', () => {
      instance.setState({ channel: 'ch1' }, callbackStub);
      assert.equal(callbackStub.args[0][0], 'validationError');
      assert.equal(validateResponderStub.args[0][0], 'State must be supplied');
    });

    it('errors if channel is not in state', () => {
      instance.setState({ channel: 'ch1', state: { my: 'state' } }, callbackStub);
      assert.equal(callbackStub.args[0][0], 'validationError');
      assert.equal(validateResponderStub.args[0][0], 'No subscriptions exists for the states');
    });

    it('supports passing of channel', () => {
      state.addChannel('ch1', {});
      instance.setState({ channel: 'ch1', state: { my: 'state' } }, callbackStub);
      assert.equal(xdrMock.args[0][0], 'ch1');
      assert.deepEqual(xdrMock.args[0][1], { state: { my: 'state' } });
    });

    it('supports passing of channels which do not exist', () => {
      state.addChannel('ch1', {});
      instance.setState({ channel: 'ch1,ch2', state: { my: 'state' } }, callbackStub);
      assert.equal(xdrMock.args[0][0], 'ch1');
      assert.deepEqual(xdrMock.args[0][1], { state: { my: 'state' } });
    });

    it('supports passing of channels', () => {
      state.addChannel('ch1', {});
      state.addChannel('ch2', {});
      instance.setState({ channel: 'ch1,ch2', state: { my: 'state' } }, callbackStub);
      assert.equal(xdrMock.args[0][0], 'ch1,ch2');
      assert.deepEqual(xdrMock.args[0][1], { state: { my: 'state' } });
    });

    it('supports passing of channel group', () => {
      state.addChannelGroup('cg1', {});
      instance.setState({ channelGroup: 'cg1', state: { my: 'state' } }, callbackStub);
      assert.equal(xdrMock.args[0][0], ',');
      assert.deepEqual(xdrMock.args[0][1], { state: { my: 'state' }, 'channel-group': 'cg1' });
    });

    it('supports passing of channel groups with some non existing', () => {
      state.addChannelGroup('cg1', {});
      instance.setState({ channelGroup: 'cg1,cg2', state: { my: 'state' } }, callbackStub);
      assert.equal(xdrMock.args[0][0], ',');
      assert.deepEqual(xdrMock.args[0][1], { state: { my: 'state' }, 'channel-group': 'cg1' });
    });

    it('supports passing of channel groups', () => {
      state.addChannelGroup('cg1', {});
      state.addChannelGroup('cg2', {});
      instance.setState({ channelGroup: 'cg1,cg2', state: { my: 'state' } }, callbackStub);
      assert.equal(xdrMock.args[0][0], ',');
      assert.deepEqual(xdrMock.args[0][1], { state: { my: 'state' }, 'channel-group': 'cg1,cg2' });
    });

    it('supports passing of channel groups and channels', () => {
      state.addChannelGroup('cg1', {});
      state.addChannelGroup('cg2', {});
      state.addChannel('ch1', {});
      state.addChannel('ch2', {});
      instance.setState({ channel: 'ch1,ch2', channelGroup: 'cg1,cg2', state: { my: 'state' } }, callbackStub);
      assert.equal(xdrMock.args[0][0], 'ch1,ch2');
      assert.deepEqual(xdrMock.args[0][1], { state: { my: 'state' }, 'channel-group': 'cg1,cg2' });
    });

    describe('on success', () => {
      it('calls callback and asks state to announce presence update', () => {
        state.addChannel('ch1', {});
        instance.setState({ channel: 'ch1', state: { my: 'state' } }, callbackStub);
        xdrMock.args[0][2](null, 'success-response');
        assert.equal(callbackStub.called, 1);
        assert.equal(announceStateChangeStub.callCount, 1);
        assert.deepEqual(callbackStub.args[0], [null, 'success-response']);
      });
    });

    describe('on error', () => {
      it('uses the error function provided in args', () => {
        state.addChannel('ch1', {});
        instance.setState({ channel: 'ch1', state: { my: 'state' } }, callbackStub);
        xdrMock.args[0][2]('error', null);
        assert.equal(callbackStub.called, 1);
        assert.equal(announceStateChangeStub.callCount, 0);
        assert.deepEqual(callbackStub.args[0], ['error', null]);
      });
    });
  });
});
