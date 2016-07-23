/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../lib/node/index.js';

describe('time endpoints', () => {
  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({});
  });

  it('calls the callback function when time is fetched', (done) => {
    utils.createNock().get('/time/0')
      .query(true)
      .reply(200, [14570763868573725]);

    pubnub.time((status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.timetoken, 14570763868573725);
      done();
    });
  });

  it('calls the callback function when fetch failed', (done) => {
    utils.createNock().get('/time/0')
      .query(true)
      .reply(500, null);

    pubnub.time((status, response) => {
      assert.equal(response, null);
      assert.equal(status.error, true);
      done();
    });
  });
});
