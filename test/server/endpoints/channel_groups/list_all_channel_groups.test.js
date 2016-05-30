/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../../src/node.js/index.js';

describe('channel groups // list all channel groups', () => {
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
    utils.createNock().get('/v1/channel-registration/sub-key/subKey/channel-group')
      .query(true)
      .reply(200, '{"status": 200, "message": "OK", "payload": {"groups": ["a","b"]}, "service": "ChannelGroups"}');

    pubnub.channelGroups.listAll((status, response) => {
      assert.equal(status.error, null);
      assert.deepEqual(response.groups, ['a', 'b']);
      done();
    });
  });
});
