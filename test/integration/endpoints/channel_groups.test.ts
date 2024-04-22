/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';


describe('channel group endpoints', () => {
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
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
    });
  });

  describe('adding channels to channel group', () => {
    it('supports addition of multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/channel-registration/sub-key/mySubKey/channel-group/cg1')
        .query({
          add: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(200, '{"status": 200, "message": "OK", "payload": {} , "service": "ChannelGroups"}', {
          'content-type': 'text/javascript',
        });

      pubnub.channelGroups.addChannels({ channels: ['a', 'b'], channelGroup: 'cg1' }, (status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('removal of channel group', () => {
    it('supports deletion of group', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/channel-registration/sub-key/mySubKey/channel-group/cg1/remove')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(200, '{"status": 200, "message": "OK", "payload": {} , "service": "ChannelGroups"}', {
          'content-type': 'text/javascript',
        });

      pubnub.channelGroups.deleteGroup({ channelGroup: 'cg1' }, (status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('listing of channel groups', () => {
    it('returns a list of all channel groups', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/channel-registration/sub-key/mySubKey/channel-group')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(200, '{"status": 200, "message": "OK", "payload": {"groups": ["a","b"]}, "service": "ChannelGroups"}', {
          'content-type': 'text/javascript',
        });

      pubnub.channelGroups.listGroups((status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.groups, ["a", "b"]);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('listing of channels inside channel group', () => {
    it('returns a list of all channel groups', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/channel-registration/sub-key/mySubKey/channel-group/cg1')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "ChannelGroups"}',
          {
            'content-type': 'text/javascript',
          },
        );

      pubnub.channelGroups.listChannels({ channelGroup: 'cg1' }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, ["a", "b"]);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('deletion of channels from channel group', () => {
    it('works as expected', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/channel-registration/sub-key/mySubKey/channel-group/cg1')
        .query({
          remove: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(200, '{"status": 200, "message": "OK", "payload": {} , "service": "ChannelGroups"}', {
          'content-type': 'text/javascript',
        });

      pubnub.channelGroups.removeChannels({ channels: ['a', 'b'], channelGroup: 'cg1' }, (status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
