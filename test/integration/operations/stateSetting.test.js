/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../lib/node/index.js';

describe('setting state operation', () => {
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

  describe('#setState', () => {
    it('supports updating for one channel', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1/uuid/myUUID/data')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', state: '{"hello":"there"}' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online" }, "service": "Presence"}');


      pubnub.setState({ channels: ['ch1'], state: { hello: 'there' } }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.state, { age: 20, status: 'online' });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports updating for multiple channels', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/uuid/myUUID/data')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', state: '{"hello":"there"}' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online" }, "service": "Presence"}');


      pubnub.setState({ channels: ['ch1', 'ch2'], state: { hello: 'there' } }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.state, { age: 20, status: 'online' });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports updating for one channel group', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/,/uuid/myUUID/data')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', state: '{"hello":"there"}', 'channel-group': 'cg1' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online" }, "service": "Presence"}');


      pubnub.setState({ channelGroups: ['cg1'], state: { hello: 'there' } }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.state, { age: 20, status: 'online' });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports updating for multiple channel group', (done) => {
      const scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/,/uuid/myUUID/data')
        .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', state: '{"hello":"there"}', 'channel-group': 'cg1,cg2' })
        .reply(200, '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online" }, "service": "Presence"}');


      pubnub.setState({ channelGroups: ['cg1', 'cg2'], state: { hello: 'there' } }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.state, { age: 20, status: 'online' });
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });
});
