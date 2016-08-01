/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../lib/node/index.js';

describe('unsubscribe', () => {
  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({ subscribeKey: 'mySubscribeKey', publishKey: 'myPublishKey', uuid: 'myUUID' });
  });

  afterEach(() => {
    pubnub.stop();
  });

  describe('#unsubscribe', () => {
    it('supports leaving for one channel', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1/leave')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      });

      pubnub.unsubscribe({ channels: ['ch1'] });
    });

    it('supports leaving for multiple channels', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2/leave')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
      .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      });

      pubnub.unsubscribe({ channels: ['ch1', 'ch2'] });
    });

    it('supports leaving for one channel group', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/%2C/leave')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', 'channel-group': 'cg1' })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      });

      pubnub.unsubscribe({ channelGroups: ['cg1'] });
    });

    it('supports leaving for multiple channel group', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/%2C/leave')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', 'channel-group': 'cg1,cg2' })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      });

      pubnub.unsubscribe({ channelGroups: ['cg1', 'cg2'] });
    });
  });
});
