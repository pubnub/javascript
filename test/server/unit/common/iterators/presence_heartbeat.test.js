/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import State from '../../../../../src/core/components/state';
import Responders from '../../../../../src/core/presenters/responders';
import PresenceEndpoints from '../../../../../src/core/endpoints/presence';

import assert from 'assert';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import loglevel from 'loglevel';

loglevel.disableAll();

describe('#iterators/presence_heartbeat', () => {
  let presence;
  let state;
  let instance;
  let validateResponderStub;
  let onStatusStub;
  let onMessageStub;
  let onPresenceStub;

  let presenceHeartbeatStub;

  let onPresenceConfigChangeStub;
  let onSubscriptionChangeStub;
  let onStateChangeStub;

  let timers;

  beforeEach(() => {
    onStatusStub = sinon.stub();
    onPresenceStub = sinon.stub();
    onMessageStub = sinon.stub();
    let callbacks = {
      onStatus: onStatusStub,
      onMessage: onMessageStub,
      onPresence: onPresenceStub
    };
    presence = new PresenceEndpoints({});
    state = new State();
    validateResponderStub = sinon.stub().returns('validationError');

    presenceHeartbeatStub = sinon.stub(presence, 'heartbeat');

    onStateChangeStub = sinon.stub(state, 'onStateChange');
    onSubscriptionChangeStub = sinon.stub(state, 'onSubscriptionChange');
    onPresenceConfigChangeStub = sinon.stub(state, 'onPresenceConfigChange');

    const respondersClass = Responders;
    respondersClass.prototype.validationError = validateResponderStub;

    const proxy = proxyquire('../../../../../src/core/iterators/presence_heartbeat', {
      '../presenters/responders': respondersClass,
    }).default;

    instance = new proxy({
      presence,
      callbacks,
      state
    });

    timers = sinon.useFakeTimers();
  });

  afterEach(() => {
    timers.restore();
  });

  it('restarts the subscribe loop when channel mix is modified', () => {
    let heartbeatStub = sinon.stub(instance, '__periodicHeartbeat');
    let stopStub = sinon.stub(instance, 'stop');
    onSubscriptionChangeStub.args[0][0]();
    assert.equal(heartbeatStub.called, 1);
    assert.equal(stopStub.called, 1);
  });
  it('restarts the subscribe loop when presence state is modified', () => {
    let heartbeatStub = sinon.stub(instance, '__periodicHeartbeat');
    let stopStub = sinon.stub(instance, 'stop');
    onStateChangeStub.args[0][0]();
    assert.equal(heartbeatStub.called, 1);
    assert.equal(stopStub.called, 1);
  });
  it('restarts the subscribe loop when heartbeat intervals are modified', () => {
    let heartbeatStub = sinon.stub(instance, '__periodicHeartbeat');
    let stopStub = sinon.stub(instance, 'stop');
    onPresenceConfigChangeStub.args[0][0]();
    assert.equal(heartbeatStub.called, 1);
    assert.equal(stopStub.called, 1);
  });
  it('aborts if interval is higher than 500', () => {
    state.setPresenceAnnounceInterval(502);
    instance.__periodicHeartbeat();
    assert.equal(presenceHeartbeatStub.called, 0);
  });
  it('aborts if interval is lower than 1', () => {
    state.setPresenceAnnounceInterval(-10);
    instance.__periodicHeartbeat();
    assert.equal(presenceHeartbeatStub.called, 0);
  });
  it('aborts if no channels or channel groups', () => {
    state.setPresenceAnnounceInterval(50);
    instance.__periodicHeartbeat();
    assert.equal(presenceHeartbeatStub.called, 0);
  });
  it('executes a call to the heartbeat networking when channels have presence', () => {
    sinon.stub(state, 'getChannelsWithPresence').returns(['a', 'b', 'c']);
    state.setPresenceAnnounceInterval(60);
    instance.__periodicHeartbeat();
    assert.equal(presenceHeartbeatStub.called, 1);
  });

  it('executes a call to the heartbeat networking when channel groups have presence', () => {
    sinon.stub(state, 'getChannelGroupsWithPresence').returns(['a', 'b', 'c']);
    state.setPresenceAnnounceInterval(60);
    instance.__periodicHeartbeat();
    assert.equal(presenceHeartbeatStub.called, 1);
  });

  it('uses setTimeout to prepare for the next call', () => {
    sinon.stub(state, 'getChannelGroupsWithPresence').returns(['a', 'b', 'c']);
    state.setPresenceAnnounceInterval(60);
    instance.__periodicHeartbeat();
    let heartbeatStub = sinon.stub(instance, '__periodicHeartbeat');
    presenceHeartbeatStub.args[0][0](null, null);
    timers.tick(60000);
    assert.equal(heartbeatStub.called, 1);
  });

  it('on error, calls a onStatus', () => {
    sinon.stub(state, 'getChannelGroupsWithPresence').returns(['a', 'b', 'c']);
    state.setPresenceAnnounceInterval(60);
    instance.__periodicHeartbeat();
    presenceHeartbeatStub.args[0][0]('bigError', null);
    assert.deepEqual(onStatusStub.args[0], [{
      type: 'heartbeatFailure',
      message: 'Presence Heartbeat unable to reach Pubnub servers',
      rawError: 'bigError'
    }]);
  });
});
