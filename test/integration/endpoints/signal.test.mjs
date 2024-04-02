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
    it('fails if channel is missing', (done) => {
      const scope = utils
        .createNock()
        .get('/signal/*')
        .reply(200, '[1,"Sent","14647523059145592"]');

      pubnub.signal({ message: { such: 'object' } }).catch((err) => {
        assert.equal(scope.isDone(), false);
        assert.equal(err.status.message, 'Missing Channel');
        done();
      });
    });
  });

  it('publishes a complex object via GET', (done) => {
    const scope = utils.createNock().get('/signal/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D')
      .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID', auth: 'myAuthKey' })
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.signal({ message: { such: 'object' }, channel: 'ch1' }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.timetoken, 14647523059145592);
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  it('should add signal API telemetry information', (done) => {
    let scope = utils.createNock().get('/signal/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D').query(true);
    const delays = [100, 200, 300, 400];
    const countedDelays = delays.slice(0, delays.length - 1);
    const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
    const leeway = 50;

    utils.runAPIWithResponseDelays(scope,
      200,
      '[1,"Sent","14647523059145592"]',
      delays,
      (completion) => {
        pubnub.signal(
          { message: { such: 'object' }, channel: 'ch1' },
          () => { completion(); }
        );
      })
      .then((lastRequest) => {
        utils.verifyRequestTelemetry(lastRequest.path, 'l_sig', average, leeway);
        done();
      });
  }).timeout(60000);
});
