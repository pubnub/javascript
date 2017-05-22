/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('channel group endpoints', () => {
  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({ subscribeKey: 'mySubKey', publishKey: 'myPublishKey', uuid: 'myUUID' });
  });

  describe('adding channels to channel group', () => {
    it('supports addition of multiple channels', (done) => {
      const scope = utils.createNock().get('/v1/channel-registration/sub-key/mySubKey/channel-group/cg1')
        .query({ add: 'a,b', pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
        .reply(200, '{"status": 200, "message": "OK", "payload": {} , "service": "ChannelGroups"}');

      pubnub.channelGroups.addChannels({ channels: ['a', 'b'], channelGroup: 'cg1' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('removal of channel group', () => {
    it('supports deletion of group', (done) => {
      const scope = utils.createNock().get('/v1/channel-registration/sub-key/mySubKey/channel-group/cg1/remove')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
        .reply(200, '{"status": 200, "message": "OK", "payload": {} , "service": "ChannelGroups"}');

      pubnub.channelGroups.deleteGroup({ channelGroup: 'cg1' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('listing of channel groups', () => {
    it('returns a list of all channel groups', (done) => {
      const scope = utils.createNock().get('/v1/channel-registration/sub-key/mySubKey/channel-group')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
        .reply(200, '{"status": 200, "message": "OK", "payload": {"groups": ["a","b"]}, "service": "ChannelGroups"}');

      pubnub.channelGroups.listGroups((status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.groups, ['a', 'b']);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('listing of channels inside channel group', () => {
    it('returns a list of all channel groups', (done) => {
      const scope = utils.createNock().get('/v1/channel-registration/sub-key/mySubKey/channel-group/cg1')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
        .reply(200, '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "ChannelGroups"}');

      pubnub.channelGroups.listChannels({ channelGroup: 'cg1' }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, ['a', 'b']);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('deletion of channels from channel group', () => {
    it('works as expected', (done) => {
      const scope = utils.createNock().get('/v1/channel-registration/sub-key/mySubKey/channel-group/cg1')
        .query({ remove: 'a,b', pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
        .reply(200, '{"status": 200, "message": "OK", "payload": {} , "service": "ChannelGroups"}');

      pubnub.channelGroups.removeChannels({ channels: ['a', 'b'], channelGroup: 'cg1' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });
});
