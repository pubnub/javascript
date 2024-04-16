/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import { PubNubError } from '../../../src/errors/pubnub-error';
import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('time endpoints', () => {
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
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      keepAlive: true,
    });
  });

  it('calls the callback function when time is fetched', (done) => {
    utils.createNock().get('/time/0').query(true).reply(200, ['14570763868573725']);

    pubnub.time((status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.timetoken, "14570763868573725");
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('calls the callback function when time is fetched via promise', (done) => {
    utils.createNock().get('/time/0').query(true).reply(200, ['14570763868573725']);

    pubnub.time().then((response) => {
      try {
        assert.deepEqual(response.timetoken, '14570763868573725');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('calls the callback function when fetch failed', (done) => {
    utils.createNock().get('/time/0').query(true).reply(500, undefined);

    pubnub.time((status, response) => {
      try {
        assert.equal(response, null);
        assert.equal(status.error, true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('calls the callback function when fetch failed', (done) => {
    utils.createNock().get('/time/0').query(true).reply(500, undefined);

    pubnub.time().catch((ex) => {
      try {
        assert(ex instanceof PubNubError);
        assert.equal(ex.message, "REST API request processing error, check status for details");
        assert.equal(ex.status!.error, true);
        assert.equal(ex.status!.statusCode, 500);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
