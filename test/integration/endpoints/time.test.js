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
      uuid: 'myUUID',
      keepAlive: true,
    });
  });

  it('calls the callback function when time is fetched', (done) => {
    utils
      .createNock()
      .get('/time/0')
      .query(true)
      .reply(200, [14570763868573725]);

    pubnub.time((status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.timetoken, 14570763868573725);
      done();
    });
  });

  it('calls the callback function when time is fetched via promise', (done) => {
    utils
      .createNock()
      .get('/time/0')
      .query(true)
      .reply(200, [14570763868573725]);

    pubnub.time().then((response) => {
      assert.deepEqual(response.timetoken, 14570763868573725);
      done();
    });
  });

  it('calls the callback function when fetch failed', (done) => {
    utils
      .createNock()
      .get('/time/0')
      .query(true)
      .reply(500, null);

    pubnub.time((status, response) => {
      assert.equal(response, null);
      assert.equal(status.error, true);
      done();
    });
  });

  it('calls the callback function when fetch failed', (done) => {
    utils
      .createNock()
      .get('/time/0')
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

  it('should add time API telemetry information', (done) => {
    let scope = utils.createNock().get('/time/0').query(true);
    const delays = [100, 200, 300, 400];
    const countedDelays = delays.slice(0, delays.length - 1);
    const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
    const leeway = 50;

    utils.runAPIWithResponseDelays(scope,
      200,
      [14570763868573725],
      delays,
      (completion) => {
        pubnub.time(() => {
          completion();
        });
      })
      .then((lastRequest) => {
        utils.verifyRequestTelemetry(lastRequest.path, 'l_time', average, leeway);
        done();
      });
  }).timeout(60000);
});
