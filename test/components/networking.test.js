/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../utils';
import PubNub from '../../lib/node/index.js';

describe('history endpoints', () => {
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

  describe('callback handling', () => {
    it('returns a correct status object', (done) => {
      utils.createNock().get('/time/0')
        .query(true)
        .reply(200, [14570763868573725]);

      pubnub.time((status) => {
        assert.deepEqual(status, { error: null, statusCode: 200 });
        done();
      });
    });
  });
});
