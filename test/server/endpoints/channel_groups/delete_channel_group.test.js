/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../../src/node.js/index.js';

describe('channel groups // delete group', () => {
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

  it('supports deletion of group', (done) => {
    utils.createNock().get('/v1/channel-registration/sub-key/subKey/channel-group/cg1/remove')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion() })
      .reply(200, '{"status": 200, "message": "OK", "payload": {} , "service": "ChannelGroups"}');

    pubnub.channelGroups.deleteGroup({ channelGroup: 'cg1' }, (status) => {
      assert.equal(status.error, null);
      done();
    });
  });
});
