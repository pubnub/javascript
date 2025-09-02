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

  afterEach(() => {
    pubnub.destroy(true);
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
          assert.deepEqual(response.groups, ['a', 'b']);
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
          assert.deepEqual(response.channels, ['a', 'b']);
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

  describe('edge cases and Promise-based execution', () => {
    describe('addChannels - Promise-based API', () => {
      it('should resolve with correct response', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/test-group')
          .query({
            add: 'ch1,ch2',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const result = await pubnub.channelGroups.addChannels({
          channelGroup: 'test-group',
          channels: ['ch1', 'ch2']
        });

        assert.deepEqual(result, {});
        assert.equal(scope.isDone(), true);
      });

      it('should reject on HTTP errors', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/test-group')
          .query({
            add: 'ch1,ch2',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(403, '{"status": 403, "message": "Forbidden", "error": true, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        try {
          await pubnub.channelGroups.addChannels({
            channelGroup: 'test-group',
            channels: ['ch1', 'ch2']
          });
          assert.fail('Should have thrown error');
        } catch (error) {
          assert(error);
          assert.equal(scope.isDone(), true);
        }
      });

      it('should handle large channel list', async () => {
        const largeChannelList = Array.from({ length: 100 }, (_, i) => `channel${i + 1}`);
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/large-group')
          .query({
            add: largeChannelList.join(','),
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const result = await pubnub.channelGroups.addChannels({
          channelGroup: 'large-group',
          channels: largeChannelList
        });

        assert.deepEqual(result, {});
        assert.equal(scope.isDone(), true);
      });

      it('should handle special characters in names', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/group%20with%20spaces')
          .query({
            add: 'channel with spaces,channel/with/slashes',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const result = await pubnub.channelGroups.addChannels({
          channelGroup: 'group with spaces',
          channels: ['channel with spaces', 'channel/with/slashes']
        });

        assert.deepEqual(result, {});
        assert.equal(scope.isDone(), true);
      });

      it('should handle validation errors', async () => {
        try {
          await pubnub.channelGroups.addChannels({
            channelGroup: '',
            channels: ['ch1']
          });
          assert.fail('Should have thrown validation error');
        } catch (error) {
          // Just verify that an error was thrown for invalid parameters
          assert(error);
          assert(typeof error.message === 'string' && error.message.length > 0);
        }
      });
    });

    describe('removeChannels - Promise-based API', () => {
      it('should resolve with correct response', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/test-group')
          .query({
            remove: 'ch1,ch2',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const result = await pubnub.channelGroups.removeChannels({
          channelGroup: 'test-group',
          channels: ['ch1', 'ch2']
        });

        assert.deepEqual(result, {});
        assert.equal(scope.isDone(), true);
      });

      it('should handle removing from empty group', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/empty-group')
          .query({
            remove: 'ch1,ch2',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const result = await pubnub.channelGroups.removeChannels({
          channelGroup: 'empty-group',
          channels: ['ch1', 'ch2']
        });

        assert.deepEqual(result, {});
        assert.equal(scope.isDone(), true);
      });

      it('should handle removing non-existent channels', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/test-group')
          .query({
            remove: 'non-existent1,non-existent2',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const result = await pubnub.channelGroups.removeChannels({
          channelGroup: 'test-group',
          channels: ['non-existent1', 'non-existent2']
        });

        assert.deepEqual(result, {});
        assert.equal(scope.isDone(), true);
      });
    });

    describe('listChannels - Promise-based API', () => {
      it('should resolve with channels array', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/test-group')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(
            200,
            '{"status": 200, "message": "OK", "payload": {"channels": ["channel1", "channel2"]}, "service": "ChannelGroups"}',
            {
              'content-type': 'text/javascript',
            }
          );

        const result = await pubnub.channelGroups.listChannels({ channelGroup: 'test-group' });
        assert.deepEqual(result.channels, ['channel1', 'channel2']);
        assert.equal(scope.isDone(), true);
      });

      it('should handle empty channel group', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/empty-group')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(
            200,
            '{"status": 200, "message": "OK", "payload": {"channels": []}, "service": "ChannelGroups"}',
            {
              'content-type': 'text/javascript',
            }
          );

        const result = await pubnub.channelGroups.listChannels({ channelGroup: 'empty-group' });
        assert.deepEqual(result.channels, []);
        assert.equal(scope.isDone(), true);
      });

      it('should handle large channel list', async () => {
        const largeChannelList = Array.from({ length: 100 }, (_, i) => `channel${i + 1}`);
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/large-group')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(
            200,
            `{"status": 200, "message": "OK", "payload": {"channels": ${JSON.stringify(largeChannelList)}}, "service": "ChannelGroups"}`,
            {
              'content-type': 'text/javascript',
            }
          );

        const result = await pubnub.channelGroups.listChannels({ channelGroup: 'large-group' });
        assert.deepEqual(result.channels, largeChannelList);
        assert.equal(scope.isDone(), true);
      });
    });

    describe('listGroups - Promise-based API', () => {
      it('should resolve with groups array', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(
            200,
            '{"status": 200, "message": "OK", "payload": {"groups": ["group1", "group2"]}, "service": "ChannelGroups"}',
            {
              'content-type': 'text/javascript',
            }
          );

        const result = await pubnub.channelGroups.listGroups();
        assert.deepEqual(result.groups, ['group1', 'group2']);
        assert.equal(scope.isDone(), true);
      });

      it('should handle empty account', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(
            200,
            '{"status": 200, "message": "OK", "payload": {"groups": []}, "service": "ChannelGroups"}',
            {
              'content-type': 'text/javascript',
            }
          );

        const result = await pubnub.channelGroups.listGroups();
        assert.deepEqual(result.groups, []);
        assert.equal(scope.isDone(), true);
      });
    });

    describe('deleteGroup - Promise-based API', () => {
      it('should resolve with correct response', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/test-group/remove')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const result = await pubnub.channelGroups.deleteGroup({ channelGroup: 'test-group' });
        assert.deepEqual(result, {});
        assert.equal(scope.isDone(), true);
      });

      it('should handle deleting group with channels', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/group-with-channels/remove')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const result = await pubnub.channelGroups.deleteGroup({ channelGroup: 'group-with-channels' });
        assert.deepEqual(result, {});
        assert.equal(scope.isDone(), true);
      });

      it('should handle deleting non-existent group', async () => {
        const scope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/non-existent-group/remove')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(404, '{"status": 404, "message": "Not Found", "error": true, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        try {
          await pubnub.channelGroups.deleteGroup({ channelGroup: 'non-existent-group' });
          assert.fail('Should have thrown error');
        } catch (error) {
          assert(error);
          assert.equal(scope.isDone(), true);
        }
      });
    });

    describe('Concurrent operations', () => {
      it('should handle multiple addChannels calls independently', async () => {
        const scope1 = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/group1')
          .query({
            add: 'ch1,ch2',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const scope2 = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/group2')
          .query({
            add: 'ch3,ch4',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const [result1, result2] = await Promise.all([
          pubnub.channelGroups.addChannels({ channelGroup: 'group1', channels: ['ch1', 'ch2'] }),
          pubnub.channelGroups.addChannels({ channelGroup: 'group2', channels: ['ch3', 'ch4'] })
        ]);

        assert.deepEqual(result1, {});
        assert.deepEqual(result2, {});
        assert.equal(scope1.isDone(), true);
        assert.equal(scope2.isDone(), true);
      });

      it('should handle mixed operations concurrently', async () => {
        const addScope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/group1')
          .query({
            add: 'ch1',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const listScope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/group2')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(
            200,
            '{"status": 200, "message": "OK", "payload": {"channels": ["ch2", "ch3"]}, "service": "ChannelGroups"}',
            {
              'content-type': 'text/javascript',
            }
          );

        const deleteScope = utils
          .createNock()
          .get('/v1/channel-registration/sub-key/mySubKey/channel-group/group3/remove')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
          })
          .reply(200, '{"status": 200, "message": "OK", "payload": {}, "service": "ChannelGroups"}', {
            'content-type': 'text/javascript',
          });

        const [addResult, listResult, deleteResult] = await Promise.all([
          pubnub.channelGroups.addChannels({ channelGroup: 'group1', channels: ['ch1'] }),
          pubnub.channelGroups.listChannels({ channelGroup: 'group2' }),
          pubnub.channelGroups.deleteGroup({ channelGroup: 'group3' })
        ]);

        assert.deepEqual(addResult, {});
        assert.deepEqual(listResult.channels, ['ch2', 'ch3']);
        assert.deepEqual(deleteResult, {});
        assert.equal(addScope.isDone(), true);
        assert.equal(listScope.isDone(), true);
        assert.equal(deleteScope.isDone(), true);
      });
    });
  });
});
