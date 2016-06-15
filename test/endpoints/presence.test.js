/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../utils';
import PubNub from '../../lib/node/index.js';

describe('presence endpoints', () => {
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

  describe('#whereNow', () => {
    it('returns the requested data for user UUID', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
        .reply(200, '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "Presence"}');


      pubnub.whereNow({}, (status, response) => {
        assert.equal(status.error, null);
        assert.deepEqual(response.channels, ['a', 'b']);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns the requested data for somebody elses UUID', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/uuid/otherUUID')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
        .reply(200, '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "Presence"}');


      pubnub.whereNow({ uuid: 'otherUUID' }, (status, response) => {
        assert.equal(status.error, null);
        assert.deepEqual(response.channels, ['a', 'b']);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('#getState', () => {
    it('returns the requested data for user UUID', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/testChannel/uuid/myUUID')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}');


      pubnub.getState({ channels: ['testChannel'] }, (status, response) => {
        assert.equal(status.error, null);
        assert.deepEqual(response.channels, { testChannel: { age: 20, status: 'online' } });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns the requested data for another UUID', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/testChannel/uuid/otherUUID')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}');


      pubnub.getState({ uuid: 'otherUUID', channels: ['testChannel'] }, (status, response) => {
        assert.equal(status.error, null);
        assert.deepEqual(response.channels, { testChannel: { age: 20, status: 'online' } });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns the requested for multiple channels', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/uuid/myUUID')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "ch1": { "age" : 20, "status" : "online"}, "ch2": { "age": 100, "status": "offline" } }, "service": "Presence"}');


      pubnub.getState({ channels: ['ch1', 'ch2'] }, (status, response) => {
        assert.equal(status.error, null);
        assert.deepEqual(response.channels, { ch1: { age: 20, status: 'online' }, ch2: { age: 100, status: 'offline' } });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns the requested for multiple channels', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/uuid/myUUID')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', 'channel-group': 'cg1,cg2' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "ch1": { "age" : 20, "status" : "online"}, "ch2": { "age": 100, "status": "offline" } }, "service": "Presence"}');


      pubnub.getState({ channels: ['ch1', 'ch2'], channelGroups: ['cg1', 'cg2'] }, (status, response) => {
        assert.equal(status.error, null);
        assert.deepEqual(response.channels, { ch1: { age: 20, status: 'online' }, ch2: { age: 100, status: 'offline' } });
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });
});
