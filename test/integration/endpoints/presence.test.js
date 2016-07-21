/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../lib/node/index.js';

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
        assert.equal(status.error, false);
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
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, ['a', 'b']);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('#setState', () => {
    it('sets presence data for user UUID', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/testChannel/uuid/myUUID/data')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', state: '%7B%22new%22%3A%22state%22%7D' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}');


      pubnub.setState({ channels: ['testChannel'], state: { new: 'state' } }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.state, { age: 20, status: 'online' });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('sets presence data for multiple channels', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/uuid/myUUID/data')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', state: '%7B%22new%22%3A%22state%22%7D' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "ch1": { "age" : 20, "status" : "online"}, "ch2": { "age": 100, "status": "offline" } }, "service": "Presence"}');


      pubnub.setState({ channels: ['ch1', 'ch2'], state: { new: 'state' } }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.state, { ch1: { age: 20, status: 'online' }, ch2: { age: 100, status: 'offline' } });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('sets state for multiple channels / channel groups', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/uuid/myUUID/data')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', 'channel-group': 'cg1%2Ccg2', state: '%7B%22new%22%3A%22state%22%7D' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}');


      pubnub.setState({ channels: ['ch1', 'ch2'], channelGroups: ['cg1', 'cg2'], state: { new: 'state' } }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.state, { age: 20, status: 'online' });
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
        assert.equal(status.error, false);
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
        assert.equal(status.error, false);
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
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, { ch1: { age: 20, status: 'online' }, ch2: { age: 100, status: 'offline' } });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns the requested for multiple channels', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/uuid/myUUID')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', 'channel-group': 'cg1%2Ccg2' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "ch1": { "age" : 20, "status" : "online"}, "ch2": { "age": 100, "status": "offline" } }, "service": "Presence"}');


      pubnub.getState({ channels: ['ch1', 'ch2'], channelGroups: ['cg1', 'cg2'] }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, { ch1: { age: 20, status: 'online' }, ch2: { age: 100, status: 'offline' } });
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('#hereNow', () => {
    it('returns response for multiple channel here now', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
        .reply(200, '{"status":200,"message":"OK","payload":{"total_occupancy":3,"total_channels":2,"channels":{"ch1":{"occupancy":1,"uuids":[{"uuid":"user1","state":{"age":10}}]},"ch2":{"occupancy":2,"uuids":[{"uuid":"user1","state":{"age":10}},{"uuid":"user3","state":{"age":30}}]}}},"service":"Presence"}');

      pubnub.hereNow({ channels: ['ch1', 'ch2'] }, (status, response) => {
        assert.deepEqual(response.channels, {
          ch1: {
            name: 'ch1',
            occupancy: 1,
            occupants: [
              {
                state: null,
                uuid: 'user1'
              },
            ]
          },
          ch2: {
            name: 'ch2',
            occupancy: 2,
            occupants: [
              {
                state: null,
                uuid: 'user1'
              },
              {
                state: null,
                uuid: 'user3'
              }
            ]
          }
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns response for multiple channel here now with state', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', state: 1 })
        .reply(200, '{"status":200,"message":"OK","payload":{"total_occupancy":3,"total_channels":2,"channels":{"ch1":{"occupancy":1,"uuids":[{"uuid":"user1"}]},"ch2":{"occupancy":2,"uuids":[{"uuid":"user1"},{"uuid":"user3"}]}}},"service":"Presence"}');

      pubnub.hereNow({ channels: ['ch1', 'ch2'], includeState: true }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          ch1: {
            name: 'ch1',
            occupancy: 1,
            occupants: [
              {
                state: null,
                uuid: 'user1'
              },
            ]
          },
          ch2: {
            name: 'ch2',
            occupancy: 2,
            occupants: [
              {
                state: null,
                uuid: 'user1'
              },
              {
                state: null,
                uuid: 'user3'
              }
            ]
          }
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns response for multiple channel here now without UUIDS', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', disable_uuids: 1 })
        .reply(200, '{"status":200,"message":"OK","payload":{"total_occupancy":3,"total_channels":2,"channels":{"ch1":{"occupancy":1,"uuids":[{"uuid":"user1"}]},"ch2":{"occupancy":2,"uuids":[{"uuid":"user1"},{"uuid":"user3"}]}}},"service":"Presence"}');

      pubnub.hereNow({ channels: ['ch1', 'ch2'], includeUUIDs: false }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          ch1: {
            name: 'ch1',
            occupancy: 1,
            occupants: []
          },
          ch2: {
            name: 'ch2',
            occupancy: 2,
            occupants: []
          }
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns response for multiple channel here now without UUIDS', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', disable_uuids: 1 })
        .reply(200, '{"status":200,"message":"OK","payload":{"total_occupancy":3,"total_channels":2,"channels":{"ch1":{"occupancy":1,"uuids":[{"uuid":"user1"}]},"ch2":{"occupancy":2,"uuids":[{"uuid":"user1"},{"uuid":"user3"}]}}},"service":"Presence"}');

      pubnub.hereNow({ channels: ['ch1', 'ch2'], includeUUIDs: false }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          ch1: {
            name: 'ch1',
            occupancy: 1,
            occupants: []
          },
          ch2: {
            name: 'ch2',
            occupancy: 2,
            occupants: []
          }
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });
});
