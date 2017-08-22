/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

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
    pubnub = new PubNub({
      keepAlive: true
    });
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

  it('calls the callback function when time is fetched via promise', (done) => {
    utils.createNock().get('/time/0')
      .query(true)
      .reply(200, [14570763868573725]);

    pubnub.time().then((response) => {
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

  it('calls the callback function when fetch failed', (done) => {
    utils.createNock().get('/time/0')
      .query(true)
      .reply(500, null);

    pubnub.time().catch((ex) => {
      assert(ex instanceof Error);
      assert.equal(ex.message, 'PubNub call failed, check status for details');
      assert.equal(ex.status.error, true);
      assert.equal(ex.status.statusCode, 500);
      done();
    });
  });
});
