/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../src/core/components/networking';
import State from '../../../../../src/core/components/state';
import Responders from '../../../../../src/core/presenters/responders';

import assert from 'assert';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import loglevel from 'loglevel';

loglevel.disableAll();

describe('subscribe endpoints', () => {
  let networking;
  let leaveStub;
  let state;
  let instance;
  let validateResponderStub;
  let onStatusStub;

  beforeEach(() => {
    onStatusStub = sinon.stub();
    let callbacks = { onStatus: onStatusStub };
    networking = new Networking({});
    state = new State();
    leaveStub = sinon.stub(networking, 'performLeave');
    validateResponderStub = sinon.stub().returns('validationError');

    const respondersClass = Responders;
    respondersClass.prototype.validationError = validateResponderStub;

    const proxy = proxyquire('../../../../../src/core/endpoints/subscribe', {
      '../presenters/responders': respondersClass,
    }).default;

    instance = new proxy({ networking, callbacks, state });
  });

  describe('#unsubscribe', () => {
    it('errors out if both channel and channel groups are not passed', () => {
      instance.unsubscribe({});
      assert.equal(onStatusStub.args[0][0], 'validationError');
      assert.equal(validateResponderStub.args[0][0], 'Missing Channel or Channel Group');
    });

    it('errors out if there is nothing to unsubscribe from channels', () => {
      instance.unsubscribe({ channels: ['a', 'b', 'c'] });
      assert.equal(onStatusStub.args[0][0], 'validationError');
      assert.equal(validateResponderStub.args[0][0], 'already unsubscribed from all channel / channel groups');
    });

    it('errors out if there is nothing to unsubscribe from channel groups', () => {
      instance.unsubscribe({ channelGroups: ['a', 'b', 'c'] });
      assert.equal(onStatusStub.args[0][0], 'validationError');
      assert.equal(validateResponderStub.args[0][0], 'already unsubscribed from all channel / channel groups');
    });

    it('prepares a list from channel which are subscribed to be sent to networking', () => {
      state.addChannel('a', {});
      instance.unsubscribe({ channels: ['a', 'b', 'c'] });
      assert.equal(leaveStub.args[0][0], 'a');
      assert.deepEqual(leaveStub.args[0][1], {});
    });

    it('prepares a list from channels which are subscribed to be sent to networking', () => {
      state.addChannel('a', {});
      state.addChannel('b', {});
      instance.unsubscribe({ channels: ['a', 'b', 'c'] });
      assert.equal(leaveStub.args[0][0], 'a,b');
      assert.deepEqual(leaveStub.args[0][1], {});
    });

    it('sends , if the channel list is empty', () => {
      state.addChannelGroup('a', {});
      instance.unsubscribe({ channelGroups: ['a', 'b', 'c'] });
      assert.equal(leaveStub.args[0][0], ',');
      assert.deepEqual(leaveStub.args[0][1], { 'channel-group': 'a' });
    });

    it('prepares a list from channel groups which are subscribed to be sent to networking', () => {
      state.addChannelGroup('a', {});
      state.addChannelGroup('b', {});
      instance.unsubscribe({ channelGroups: ['a', 'b', 'c'] });
      assert.equal(leaveStub.args[0][0], ',');
      assert.deepEqual(leaveStub.args[0][1], { 'channel-group': 'a,b' });
    });

    describe('on callback', () => {
      let cleanupStub;

      beforeEach(() => {
        cleanupStub = sinon.stub(instance, '_postUnsubscribeCleanup');
      })

      it('on error, calls callback without any modifications', () => {
        state.addChannelGroup('a', {});
        instance.unsubscribe({ channelGroups: ['a', 'b', 'c'] });
        leaveStub.args[0][2]('error', null);
        assert.deepEqual(onStatusStub.args[0], ['error', null]);
        assert.equal(cleanupStub.callCount, 0);
      });
      it('on success, calls #_postUnsubscribeCleanup', () => {
        state.addChannelGroup('a', {});
        state.addChannel('ch1', {});
        instance.unsubscribe({ channelGroups: ['a'], channels: ['ch1'] });
        leaveStub.args[0][2](null, null);
        assert.deepEqual(cleanupStub.args[0], [['ch1'], ['a']]);
      });
      it('on success, sets the timetoken to 0', () => {
        sinon.spy(state, 'setSubscribeTimeToken');
        state.addChannel('ch1', {});
        instance.unsubscribe({ channelGroups: ['a'], channels: ['ch1'] });
        leaveStub.args[0][2](null, null);
        assert.equal(state.setSubscribeTimeToken.args[0][0], 0);
      });
      it('on success, announces subscription change', () => {
        sinon.spy(state, 'announceSubscriptionChange');
        state.addChannel('ch1', {});
        instance.unsubscribe({ channelGroups: ['a'], channels: ['ch1'] });
        leaveStub.args[0][2](null, null);
        assert.equal(state.announceSubscriptionChange.called, true);
      });
      it('on success, calls the callback', () => {
        state.addChannelGroup('a', {});
        state.addChannel('ch1', {});
        instance.unsubscribe({ channelGroups: ['a'], channels: ['ch1'] });
        leaveStub.args[0][2](null, null);
        assert.deepEqual(onStatusStub.args[0], [null, { action: 'unsubscribe', response: null, status: 'finished' }]);
      });
    });
  });

  describe('#_postUnsubscribeCleanup', () => {
    it('removes channels and channel presence from state', () => {
      state.addChannel('ch1', {});
      state.addToPresenceState('ch1-pnpres', {});
      state.addChannel('ch2', {});
      state.addToPresenceState('ch2-pnpres', {});

      instance._postUnsubscribeCleanup(['ch1'], []);

      assert.equal(state.containsChannel('ch1'), false);
      assert.equal(state.containsChannel('ch2'), true);
      assert.equal(state.isInPresenceState('ch1-pnpres'), false);
      assert.equal(state.isInPresenceState('ch2-pnpres'), true);
    });
    it('removes channel groups and channel group presence from state', () => {
      state.addChannelGroup('cg1', {});
      state.addToPresenceState('cg1-pnpres', {});
      state.addChannelGroup('cg2', {});
      state.addToPresenceState('cg2-pnpres', {});

      instance._postUnsubscribeCleanup([], ['cg1']);

      assert.equal(state.containsChannelGroup('cg1'), false);
      assert.equal(state.containsChannelGroup('cg2'), true);
      assert.equal(state.isInPresenceState('cg1-pnpres'), false);
      assert.equal(state.isInPresenceState('cg2-pnpres'), true);
    });
  });
});
