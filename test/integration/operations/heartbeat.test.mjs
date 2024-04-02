/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('heartbeat', () => {
  let pubnub;

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
      heartbeatInterval	:1, // for quick test of heartbeat calls
      announceSuccessfulHeartbeats: true,
    });
  });

  afterEach(() => {
    pubnub.removeAllListeners();
    pubnub.stop();
  });

  describe('#heartbeat', () => {
    it('heartbeat loop should not get started when heartbeatInterval not set', async () => {
      pubnub = new PubNub({
        subscribeKey: 'mySubscribeKey',
        publishKey: 'myPublishKey',
        uuid: 'myUUID',
        announceSuccessfulHeartbeats: true,
      });
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2/heartbeat')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: '300',
          state: '{}',
        })
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}');
      pubnub.subscribe({ channels: ['ch1', 'ch2'], withHeartbeats: true });
      await expect(scope).to.have.not.been.requested;
    });
    
    it('supports heartbeating for one channel', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1/heartbeat')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: '300',
          state: '{}',
        })
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          if (status.operation === 'PNHeartbeatOperation' && !status.error) {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          }
        },
      });

      pubnub.subscribe({ channels: ['ch1'], withHeartbeats: true });
    });

    it('supports heartbeating for multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2/heartbeat')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: '300',
          state: '{}',
        })
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          if (status.operation === 'PNHeartbeatOperation' && !status.error) {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          }
        },
      });

      pubnub.subscribe({ channels: ['ch1', 'ch2'], withHeartbeats: true });
    });

    it('supports heartbeating for one channel group', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/%2C/heartbeat')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: '300',
          state: '{}',
          'channel-group': 'cg1',
        })
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          if (status.operation === 'PNHeartbeatOperation' && !status.error) {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          }
        },
      });

      pubnub.subscribe({ channelGroups: ['cg1'], withHeartbeats: true });
    });

    it('supports heartbeating for multiple channel group', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/%2C/heartbeat')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: '300',
          state: '{}',
          'channel-group': 'cg1,cg2',
        })
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          if (status.operation === 'PNHeartbeatOperation' && !status.error) {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          }
        },
      });

      pubnub.subscribe({ channelGroups: ['cg1', 'cg2'], withHeartbeats: true });
    });
  });
});
