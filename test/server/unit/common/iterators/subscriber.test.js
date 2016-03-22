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

describe('#iterators/subscriber', () => {
  let networking;
  let state;
  let instance;
  let validateResponderStub;
  let onStatusStub;
  let onMessageStub;
  let onPresenceStub;
  let subscribeStub;

  beforeEach(() => {
    onStatusStub = sinon.stub();
    onPresenceStub = sinon.stub();
    onMessageStub = sinon.stub();
    let callbacks = {
      onStatus: onStatusStub,
      onMessage: onMessageStub,
      onPresence: onPresenceStub
    };
    networking = new Networking({});
    state = new State();
    subscribeStub = sinon.stub(networking, 'performSubscribe');
    validateResponderStub = sinon.stub().returns('validationError');

    const respondersClass = Responders;
    respondersClass.prototype.validationError = validateResponderStub;

    const proxy = proxyquire('../../../../../src/core/iterators/subscriber', {
      '../presenters/responders': respondersClass,
    }).default;

    instance = new proxy({
      networking,
      callbacks,
      state
    });
  });

  describe('#start', () => {
    it('stops the existing execution', () => {
      let stopStub = sinon.stub(instance, 'stop');
      instance.start();
      assert.equal(stopStub.called, 1);
    });

    it('does not call subscribe if nothing was selected', () => {
      instance.start();
      assert.equal(subscribeStub.called, 0);
    });

    it('supports subscription to channel', () => {
      state.addChannel('ch1', { name: 'ch1' });
      instance.start();
      assert.deepEqual(subscribeStub.args[0][0], 'ch1');
      assert.deepEqual(subscribeStub.args[0][1], { tt: 0 });
    });
    it('supports subscription to channels', () => {
      state.addChannel('ch1', { name: 'ch1' });
      state.addChannel('ch2', { name: 'ch2' });
      instance.start();
      assert.deepEqual(subscribeStub.args[0][0], 'ch1,ch2');
      assert.deepEqual(subscribeStub.args[0][1], { tt: 0 });
    });
    it('supports subscription to channels w/ presence', () => {
      state.addChannel('ch1', { name: 'ch1', enablePresence: true });
      instance.start();
      assert.deepEqual(subscribeStub.args[0][0], 'ch1,ch1-pnpres');
      assert.deepEqual(subscribeStub.args[0][1], { tt: 0 });
    });
    it('supports subscription to channels group', () => {
      state.addChannelGroup('cg1', { name: 'cg1' });
      instance.start();
      assert.deepEqual(subscribeStub.args[0][0], ',');
      assert.deepEqual(subscribeStub.args[0][1], { tt: 0, 'channel-group': 'cg1' });
    });

    it('supports subscription to channels groups', () => {
      state.addChannelGroup('cg1', { name: 'cg1' });
      state.addChannelGroup('cg2', { name: 'cg2' });
      instance.start();
      assert.deepEqual(subscribeStub.args[0][0], ',');
      assert.deepEqual(subscribeStub.args[0][1], { tt: 0, 'channel-group': 'cg1,cg2' });
    });

    it('supports subscription to channels groups w/ presence', () => {
      state.addChannelGroup('cg1', { name: 'cg1', enablePresence: true });
      instance.start();
      assert.deepEqual(subscribeStub.args[0][0], ',');
      assert.deepEqual(subscribeStub.args[0][1], { tt: 0, 'channel-group': 'cg1,cg1-pnpres' });
    });
    it('supports subscription to channels and channel groups', () => {
      state.addChannel('ch1', { name: 'ch1' });
      state.addChannelGroup('cg1', { name: 'cg1' });
      instance.start();
      assert.deepEqual(subscribeStub.args[0][0], 'ch1');
      assert.deepEqual(subscribeStub.args[0][1], { tt: 0, 'channel-group': 'cg1' });
    });
    it('supports subscription to channels and channel groups w/ presence', () => {
      state.addChannel('ch1', { name: 'ch1', enablePresence: true });
      state.addChannelGroup('cg1', { name: 'cg1', enablePresence: true });
      instance.start();
      assert.deepEqual(subscribeStub.args[0][0], 'ch1,ch1-pnpres');
      assert.deepEqual(subscribeStub.args[0][1], { tt: 0, 'channel-group': 'cg1,cg1-pnpres' });
    });
    it('supports filterExpression', () => {
      state.filterExpression = 'testFilter';
      state.addChannel('ch1', { name: 'ch1' });
      instance.start();
      assert.deepEqual(subscribeStub.args[0][0], 'ch1');
      assert.deepEqual(subscribeStub.args[0][1], { tt: 0, 'filter-expr': 'testFilter' });
    });
    it('supports subscribeRegion', () => {
      state.subscribeRegion = 'subscribeRegion';
      state.addChannel('ch1', { name: 'ch1' });
      instance.start();
      assert.deepEqual(subscribeStub.args[0][0], 'ch1');
      assert.deepEqual(subscribeStub.args[0][1], { tt: 0, tr: 'subscribeRegion' });
    });
  });

  describe('#__handleSubscribeResponse', () => {
    it('raises an error if subscribe loop fails and restarts the loop', () => {
      let startStub = sinon.stub(instance, 'start');
      instance.__handleSubscribeResponse('bigError', {});
      assert.equal(startStub.called, true);
    });
    it('updates the timetoken inside the state', () => {
      instance.__handleSubscribeResponse(null, {
        t: { t: '14586859725823176', r: 1 },
        m:
         [{ a: '4',
             f: 512,
             p: 'some-payload',
             k: 'demo-36',
             c: 'max-channel1-pnpres',
             d: 'some-payload',
             b: 'max-channel1-pnpres'
          }]
      });

      assert.equal(state.getSubscribeTimeToken(), '14586859725823176');
    });
    it('strips the -pnpres from the channel name', () => {
      instance.__handleSubscribeResponse(null, {
        t: { t: '14586859725823176', r: 1 },
        m:
         [{ a: '4',
             f: 512,
             p: 'some-payload',
             k: 'demo-36',
             c: 'max-channel1-pnpres',
             d: 'some-payload',
             b: 'max-channel1-pnpres'
          }]
      });

      assert.deepEqual(onPresenceStub.args[0][0], {
        shard: '4',
        subscriptionMatch: 'max-channel1',
        channel: 'max-channel1',
        payload: 'some-payload',
        flags: 512,
        subscribeKey: 'demo-36',
        publishTimetoken: 'some-payload'
      });
    });
    it('calls on the onmessage and passes the recieved message', () => {
      instance.__handleSubscribeResponse(null, {
        t: { t: '14586859725823176', r: 1 },
        m:
         [{ a: '4',
             f: 512,
             p: 'some-payload',
             k: 'demo-36',
             c: 'max-channel1',
             d: 'some-payload',
             b: 'max-channel1'
          }]
      });

      assert.deepEqual(onMessageStub.args[0][0], {
        shard: '4',
        subscriptionMatch: 'max-channel1',
        channel: 'max-channel1',
        payload: 'some-payload',
        flags: 512,
        subscribeKey: 'demo-36',
        publishTimetoken: 'some-payload'
      });
    });
    it('restarts the loop', () => {
      let startStub = sinon.stub(instance, 'start');
      instance.__handleSubscribeResponse(null, { t: { t: '14586859725823176', r: 1 } });
      assert.equal(startStub.called, 1);
    });
  });

  describe('#stop', () => {
    it('stops the existing execution', () => {
      let abortStub = sinon.stub();
      instance._runningSuperagent = {
        abort: abortStub
      };
      instance.stop();
      assert.equal(abortStub.called, 1);
    });
  });
});

/*
*/
