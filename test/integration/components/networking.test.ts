/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

// @ts-expect-error Loading package information.
import packageJSON from '../../../package.json';
import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('#components/networking', () => {
  let pubnub: PubNub;
  let pubnubPartner: PubNub;
  let pubnubSDKName: PubNub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
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
    pubnubPartner = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      partnerId: 'alligator',
      // @ts-expect-error Force override default value.
      useRequestId: false,
    });
    pubnubSDKName = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      sdkName: 'custom-sdk/1.0.0',
    });
  });

  describe('supports user-agent generation with partner', () => {
    it('returns a correct user-agent object', (done) => {
      utils
        .createNock()
        .get('/time/0')
        .query({
          uuid: 'myUUID',
          pnsdk: `PubNub-JS-Nodejs-alligator/${packageJSON.version}`,
        })
        .reply(200, ['14570763868573725'], { 'content-type': 'text/javascript' });

      pubnubPartner.time((status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(status.statusCode, 200);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('supports PNSDK generation with custom SDK name', () => {
    it('returns a correct response object', (done) => {
      utils
        .createNock()
        .get('/time/0')
        .query({ uuid: 'myUUID', pnsdk: 'custom-sdk/1.0.0' })
        .reply(200, ['14570763868573725'], { 'content-type': 'text/javascript' });

      pubnubSDKName.time((status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(status.statusCode, 200);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('callback handling', () => {
    it('returns a correct status object', (done) => {
      utils
        .createNock()
        .get('/time/0')
        .query(true)
        .reply(200, ['14570763868573725'], { 'content-type': 'text/javascript' });

      pubnub.time((status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(status.statusCode, 200);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns a correct status object on 403', (done) => {
      utils
        .createNock()
        .get('/time/0')
        .query(true)
        .reply(403, ['14570763868573725'], { 'content-type': 'text/javascript' });

      pubnub.time((status) => {
        try {
          assert.equal(status.error, true);
          assert.equal(status.statusCode, 403);
          assert.equal(status.category, 'PNAccessDeniedCategory');
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns a correct status object on 400', (done) => {
      utils
        .createNock()
        .get('/time/0')
        .query(true)
        .reply(400, ['14570763868573725'], { 'content-type': 'text/javascript' });

      pubnub.time((status) => {
        try {
          assert.equal(status.error, true);
          assert.equal(status.statusCode, 400);
          assert.equal(status.category, 'PNBadRequestCategory');
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
