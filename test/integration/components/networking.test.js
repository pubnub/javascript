/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../lib/node/index.js';
import packageJSON from '../../../package.json';

describe('#components/networking', () => {
  let pubnub;
  let pubnubPartner;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({ subscribeKey: 'mySubKey', publishKey: 'myPublishKey', uuid: 'myUUID' });
    pubnubPartner = new PubNub({ subscribeKey: 'mySubKey', publishKey: 'myPublishKey', uuid: 'myUUID', partnerId: 'alligator' });
  });

  describe('supports user-agent generation with partner', () => {
    it('returns a correct user-agent object', (done) => {
      utils.createNock().get('/time/0')
        .query({ uuid: 'myUUID', pnsdk: 'PubNub-JS-Nodejs-alligator/' + packageJSON.version })
        .reply(200, [14570763868573725]);

      pubnubPartner.time((status) => {
        assert.equal(status.error, false);
        assert.equal(status.statusCode, 200);
        done();
      });
    });
  });

  describe('callback handling', () => {
    it('returns a correct status object', (done) => {
      utils.createNock().get('/time/0')
        .query(true)
        .reply(200, [14570763868573725]);

      pubnub.time((status) => {
        assert.equal(status.error, false);
        assert.equal(status.statusCode, 200);
        done();
      });
    });

    it('returns a correct status object on 403', (done) => {
      utils.createNock().get('/time/0')
        .query(true)
        .reply(403, [14570763868573725]);

      pubnub.time((status) => {
        assert.equal(status.error, true);
        assert.equal(status.statusCode, 403);
        assert.equal(status.category, 'PNAccessDeniedCategory');
        done();
      });
    });

    it('returns a correct status object on 400', (done) => {
      utils.createNock().get('/time/0')
        .query(true)
        .reply(400, [14570763868573725]);

      pubnub.time((status) => {
        assert.equal(status.error, true);
        assert.equal(status.statusCode, 400);
        assert.equal(status.category, 'PNBadRequestCategory');
        done();
      });
    });
  });
});
