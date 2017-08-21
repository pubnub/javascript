/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

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
    pubnub.setHeartbeatInterval(0);
  });

  afterEach(() => {
    pubnub.removeAllListeners();
    pubnub.stop();
  });

  describe('#unsubscribe', () => {
    it('supports leaving for one channel', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1/leave')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          assert.deepEqual(status.affectedChannels, ['ch1']);
          assert.deepEqual(status.affectedChannelGroups, []);
          done();
        }
      });

      pubnub.subscribe({ channels: ['ch1'] });
      pubnub.unsubscribe({ channels: ['ch1'] });
    });

    it('supports leaving for multiple channels', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2/leave')
      .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
      .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          assert.deepEqual(status.affectedChannels, ['ch1', 'ch2']);
          assert.deepEqual(status.affectedChannelGroups, []);
          done();
        }
      });

      pubnub.subscribe({ channels: ['ch1', 'ch2'] });
      pubnub.unsubscribe({ channels: ['ch1', 'ch2'] });
    });

    it('supports leaving for one channel group', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/%2C/leave')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID', 'channel-group': 'cg1' })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          assert.deepEqual(status.affectedChannels, []);
          assert.deepEqual(status.affectedChannelGroups, ['cg1']);
          done();
        }
      });

      pubnub.subscribe({ channelGroups: ['cg1'] });
      pubnub.unsubscribe({ channelGroups: ['cg1'] });
    });

    it('supports leaving for multiple channel group', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/%2C/leave')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID', 'channel-group': 'cg1,cg2' })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          assert.deepEqual(status.affectedChannels, []);
          assert.deepEqual(status.affectedChannelGroups, ['cg1', 'cg2']);
          done();
        }
      });

      pubnub.subscribe({ channelGroups: ['cg1', 'cg2'] });
      pubnub.unsubscribe({ channelGroups: ['cg1', 'cg2'] });
    });

    it('supports partial leaving for channels', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1/leave')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          if (status.operation !== 'PNUnsubscribeOperation') return;
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          assert.deepEqual(status.affectedChannels, ['ch1']);
          assert.deepEqual(status.affectedChannelGroups, []);
          done();
        }
      });

      pubnub.subscribe({ channels: ['ch1', 'ch2'] });
      pubnub.unsubscribe({ channels: ['ch1', 'ch3'] });
    });

    it('supports partial leaving for channel groups', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/%2C/leave')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID', 'channel-group': 'cg1' })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          if (status.operation !== 'PNUnsubscribeOperation') return;
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          assert.deepEqual(status.affectedChannels, []);
          assert.deepEqual(status.affectedChannelGroups, ['cg1']);
          done();
        }
      });

      pubnub.subscribe({ channelGroups: ['cg1', 'cg2'] });
      pubnub.unsubscribe({ channelGroups: ['cg1', 'cg3'] });
    });
  });

  describe('#unsubscribeAll', () => {
    it('supports leaving channels / channel groups', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2/leave')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID', 'channel-group': 'cg1,cg2' })
        .reply(200, '{ "status": 200, "message": "OK", "service": "Presence"}');

      pubnub.addListener({
        status(status) {
          if (status.operation !== 'PNUnsubscribeOperation') return;
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          assert.deepEqual(status.affectedChannels, ['ch1', 'ch2']);
          assert.deepEqual(status.affectedChannelGroups, ['cg1', 'cg2']);
          done();
        }
      });

      pubnub.subscribe({ channels: ['ch1', 'ch2'], channelGroups: ['cg1', 'cg2'] });
      pubnub.unsubscribeAll();
    });
  });
});
