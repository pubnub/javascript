/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('signal endpoints', () => {
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
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      authKey: 'myAuthKey',
    });
  });

  describe('##validation', () => {
    it('fails if channel is missing', done => {
      const scope = utils
        .createNock()
        .get('/v1/signal/*')
        .reply(200, '[1,"Sent","14647523059145592"]');

      pubnub.signal({ message: { such: 'object' } }).catch(err => {
        assert.equal(scope.isDone(), false);
        assert.equal(err.status.message, 'Missing Channel');
        done();
      });
    });
  });

  it('publishes a complex object via POST', done => {
    const scope = utils
      .createNock()
      .post('/v1/signal/myPublishKey/mySubKey/ch1', '{"such":"object"}')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        auth: 'myAuthKey',
      })
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.signal(
      { message: { such: 'object' }, channel: 'ch1', sendByPost: true },
      (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.timetoken, 14647523059145592);
        assert.equal(scope.isDone(), true);
        done();
      }
    );
  });

  it('publishes a complex object via POST with encryption', done => {
    const scope = utils
      .createNock()
      .post(
        '/v1/signal/myPublishKey/mySubKey/ch1',
        '"toDEeIZkmIyoiLpSojGu7n3+2t1rn7/DsrEZ1r8JKR4="'
      )
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        auth: 'myAuthKey',
      })
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.setCipherKey('myCipherKey');

    pubnub.signal(
      { message: { such: 'object' }, channel: 'ch1', sendByPost: true },
      (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.timetoken, 14647523059145592);
        assert.equal(scope.isDone(), true);
        done();
      }
    );
  });
});
