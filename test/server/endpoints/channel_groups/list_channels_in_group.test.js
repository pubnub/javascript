/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../../src/node.js/index.js';

describe('channel groups // list all channels in groups', () => {
  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({ subscribeKey: 'subKey' });
  });

  it('returns a list of all channel groups', (done) => {
    utils.createNock().get('/v1/channel-registration/sub-key/subKey/channel-group/cg1')
      .query(true)
      .reply(200, '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "ChannelGroups"}');

    pubnub.channelGroups.listChannels({ channelGroup: 'cg1' }, (status, response) => {
      assert.equal(status.error, null);
      assert.deepEqual(response.channels, ['a', 'b']);
      done();
    });
  });
});
