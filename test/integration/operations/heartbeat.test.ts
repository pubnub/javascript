/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import { expect } from 'chai';
import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('heartbeat', () => {
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
      // @ts-expect-error This configuration option normally is hidden.
      useRequestId: false,
      announceSuccessfulHeartbeats: true,
      heartbeatInterval: 1, // for quick test of heartbeat calls
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
        // @ts-expect-error This configuration option normally is hidden.
        announceSuccessfulHeartbeats: true,
      });
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/heartbeat')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: '300',
          state: '{}',
        })
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}', {
          'content-type': 'text/javascript',
        });
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
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}', {
          'content-type': 'text/javascript',
        });

      pubnub.addListener({
        status(status) {
          if (status.operation === 'PNHeartbeatOperation' && !status.error) {
            try {
              assert.equal(status.error, false);
              assert.equal(scope.isDone(), true);
              done();
            } catch (error) {
              done(error);
            }
          }
        },
      });

      pubnub.subscribe({ channels: ['ch1'], withHeartbeats: true });
    });

    it('supports heartbeating for multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/heartbeat')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: '300',
          state: '{}',
        })
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}', {
          'content-type': 'text/javascript',
        });

      pubnub.addListener({
        status(status) {
          if (status.operation === 'PNHeartbeatOperation' && !status.error) {
            try {
              assert.equal(status.error, false);
              assert.equal(scope.isDone(), true);
              done();
            } catch (error) {
              done(error);
            }
          }
        },
      });

      pubnub.subscribe({ channels: ['ch1', 'ch2'], withHeartbeats: true });
    });

    it('supports heartbeating for one channel group', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/,/heartbeat')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: '300',
          state: '{}',
          'channel-group': 'cg1',
        })
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}', {
          'content-type': 'text/javascript',
        });

      pubnub.addListener({
        status(status) {
          if (status.operation === 'PNHeartbeatOperation' && !status.error) {
            try {
              assert.equal(status.error, false);
              assert.equal(scope.isDone(), true);
              done();
            } catch (error) {
              done(error);
            }
          }
        },
      });

      pubnub.subscribe({ channelGroups: ['cg1'], withHeartbeats: true });
    });

    it('supports heartbeating for multiple channel group', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/,/heartbeat')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          heartbeat: '300',
          state: '{}',
          'channel-group': 'cg1,cg2',
        })
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}', {
          'content-type': 'text/javascript',
        });

      pubnub.addListener({
        status(status) {
          if (status.operation === 'PNHeartbeatOperation' && !status.error) {
            try {
              assert.equal(status.error, false);
              assert.equal(scope.isDone(), true);
              done();
            } catch (error) {
              done(error);
            }
          }
        },
      });

      pubnub.subscribe({ channelGroups: ['cg1', 'cg2'], withHeartbeats: true });
    });
  });
});
