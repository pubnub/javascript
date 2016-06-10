/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../utils';
import PubNub from '../../../src/node.js/index.js';

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


      pubnub.presence.whereNow({}, (status, response) => {
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


      pubnub.presence.whereNow({ uuid: 'otherUUID' }, (status, response) => {
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


      pubnub.presence.getState({ channels: ['testChannel'] }, (status, response) => {
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


      pubnub.presence.getState({ uuid: 'otherUUID', channels: ['testChannel'] }, (status, response) => {
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


      pubnub.presence.getState({ channels: ['ch1', 'ch2'] }, (status, response) => {
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


      pubnub.presence.getState({ channels: ['ch1', 'ch2'], channelGroups: ['cg1', 'cg2'] }, (status, response) => {
        assert.equal(status.error, null);
        assert.deepEqual(response.channels, { ch1: { age: 20, status: 'online' }, ch2: { age: 100, status: 'offline' } });
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('#setState', () => {
    it('supports updating for one channel', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1/uuid/myUUID/data')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', state: '%7B%22hello%22%3A%22there%22%7D' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online" }, "service": "Presence"}');


      pubnub.presence.setState({ channels: ['ch1'], state: { hello: 'there' } }, (status, response) => {
        assert.equal(status.error, null);
        assert.deepEqual(response.state, { age: 20, status: 'online' });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports updating for multiple channels', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/uuid/myUUID/data')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', state: '%7B%22hello%22%3A%22there%22%7D' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online" }, "service": "Presence"}');


      pubnub.presence.setState({ channels: ['ch1', 'ch2'], state: { hello: 'there' } }, (status, response) => {
        assert.equal(status.error, null);
        assert.deepEqual(response.state, { age: 20, status: 'online' });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports updating for one channel group', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/,/uuid/myUUID/data')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', state: '%7B%22hello%22%3A%22there%22%7D', 'channel-group': 'cg1' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online" }, "service": "Presence"}');


      pubnub.presence.setState({ channelGroups: ['cg1'], state: { hello: 'there' } }, (status, response) => {
        assert.equal(status.error, null);
        assert.deepEqual(response.state, { age: 20, status: 'online' });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports updating for multiple channel group', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/,/uuid/myUUID/data')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', state: '%7B%22hello%22%3A%22there%22%7D', 'channel-group': 'cg1,cg2' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online" }, "service": "Presence"}');


      pubnub.presence.setState({ channelGroups: ['cg1', 'cg2'], state: { hello: 'there' } }, (status, response) => {
        assert.equal(status.error, null);
        assert.deepEqual(response.state, { age: 20, status: 'online' });
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });
});
