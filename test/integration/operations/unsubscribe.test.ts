/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('unsubscribe', () => {
  let pubnub: PubNub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
    });
    pubnub.setHeartbeatInterval(0);
  });

  afterEach(() => {
    pubnub.removeAllListeners();
    pubnub.stop();
  });

  describe('#unsubscribe', () => {
    it('supports leaving for one channel', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/subscribe/mySubscribeKey/ch1/0')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: 300,
        })
        .reply(
          200,
          '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"coolChannel","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}',
          { 'content-type': 'text/javascript' },
        )
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1/leave')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}', { 'content-type': 'text/javascript' });

      pubnub.addListener({
        status(status) {
          if (status.category !== PubNub.CATEGORIES.PNConnectedCategory) {
            try {
              assert.equal(status.error, false);
              assert.equal(scope.isDone(), true);
              assert.deepEqual(status.affectedChannels, ['ch1']);
              assert.deepEqual(status.affectedChannelGroups, []);
              done();
            } catch (error) {
              done(error);
            }
          } else pubnub.unsubscribe({ channels: ['ch1'] });
        },
      });

      pubnub.subscribe({ channels: ['ch1'] });
    });

    it('supports leaving for multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/subscribe/mySubscribeKey/ch1,ch2/0')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: 300,
        })
        .reply(
          200,
          '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"coolChannel","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}',
          { 'content-type': 'text/javascript' },
        )
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/leave')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}', { 'content-type': 'text/javascript' });

      pubnub.addListener({
        status(status) {
          if (status.category !== PubNub.CATEGORIES.PNConnectedCategory) {
            try {
              assert.equal(status.error, false);
              assert.equal(scope.isDone(), true);
              assert.deepEqual(status.affectedChannels, ['ch1', 'ch2']);
              assert.deepEqual(status.affectedChannelGroups, []);
              done();
            } catch (error) {
              done(error);
            }
          } else pubnub.unsubscribe({ channels: ['ch1', 'ch2'] });
        },
      });

      pubnub.subscribe({ channels: ['ch1', 'ch2'] });
    });

    it('supports leaving for one channel group', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/subscribe/mySubscribeKey/,/0')
        .query({
          'channel-group': 'cg1',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: 300,
        })
        .reply(
          200,
          '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"coolChannel","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}',
          { 'content-type': 'text/javascript' },
        )
        .get('/v2/presence/sub-key/mySubscribeKey/channel/,/leave')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          'channel-group': 'cg1',
        })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}', { 'content-type': 'text/javascript' });

      pubnub.addListener({
        status(status) {
          if (status.category !== PubNub.CATEGORIES.PNConnectedCategory) {
            try {
              assert.equal(status.error, false);
              assert.equal(scope.isDone(), true);
              assert.deepEqual(status.affectedChannels, []);
              assert.deepEqual(status.affectedChannelGroups, ['cg1']);
              done();
            } catch (error) {
              done(error);
            }
          } else pubnub.unsubscribe({ channelGroups: ['cg1'] });
        },
      });

      pubnub.subscribe({ channelGroups: ['cg1'] });
    });

    it('supports leaving for multiple channel group', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/subscribe/mySubscribeKey/,/0')
        .query({
          'channel-group': 'cg1,cg2',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: 300,
        })
        .reply(
          200,
          '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"coolChannel","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}',
          { 'content-type': 'text/javascript' },
        )
        .get('/v2/presence/sub-key/mySubscribeKey/channel/,/leave')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          'channel-group': 'cg1,cg2',
        })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}', { 'content-type': 'text/javascript' });

      pubnub.addListener({
        status(status) {
          if (status.category !== PubNub.CATEGORIES.PNConnectedCategory) {
            try {
              assert.equal(status.error, false);
              assert.equal(scope.isDone(), true);
              assert.deepEqual(status.affectedChannels, []);
              assert.deepEqual(status.affectedChannelGroups, ['cg1', 'cg2']);
              done();
            } catch (error) {
              done(error);
            }
          } else pubnub.unsubscribe({ channelGroups: ['cg1', 'cg2'] });
        },
      });

      pubnub.subscribe({ channelGroups: ['cg1', 'cg2'] });
    });

    it('supports partial leaving for channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1/leave')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}', { 'content-type': 'text/javascript' });

      pubnub.addListener({
        status(status) {
          if (status.operation !== PubNub.OPERATIONS.PNUnsubscribeOperation) {
            pubnub.unsubscribe({ channels: ['ch1', 'ch3'] });
            return;
          }

          try {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            assert.deepEqual(status.affectedChannels, ['ch1']);
            assert.deepEqual(status.affectedChannelGroups, []);
            done();
          } catch (error) {
            done(error);
          }
        },
      });

      pubnub.subscribe({ channels: ['ch1', 'ch2'] });
    });

    it('supports partial leaving for channel groups', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/,/leave')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          'channel-group': 'cg1',
        })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}', { 'content-type': 'text/javascript' });

      pubnub.addListener({
        status(status) {
          if (status.operation !== PubNub.OPERATIONS.PNUnsubscribeOperation) {
            pubnub.unsubscribe({ channelGroups: ['cg1', 'cg3'] });
            return;
          }
          try {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            assert.deepEqual(status.affectedChannels, []);
            assert.deepEqual(status.affectedChannelGroups, ['cg1']);
            done();
          } catch (error) {
            done(error);
          }
        },
      });

      pubnub.subscribe({ channelGroups: ['cg1', 'cg2'] });
    });
  });

  describe('#unsubscribeAll', () => {
    it('supports leaving channels / channel groups', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/leave')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          'channel-group': 'cg1,cg2',
        })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}', { 'content-type': 'text/javascript' });

      pubnub.addListener({
        status(status) {
          if (status.operation !== PubNub.OPERATIONS.PNUnsubscribeOperation) return;
          try {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            assert.deepEqual(status.affectedChannels, ['ch1', 'ch2']);
            assert.deepEqual(status.affectedChannelGroups, ['cg1', 'cg2']);
            done();
          } catch (error) {
            done(error);
          }
        },
      });

      pubnub.subscribe({
        channels: ['ch1', 'ch2'],
        channelGroups: ['cg1', 'cg2'],
      });
      pubnub.unsubscribeAll();
    });
  });
});
