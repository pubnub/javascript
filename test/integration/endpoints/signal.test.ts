/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('signal endpoints', () => {
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
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      authKey: 'myAuthKey',
    });
  });

  describe('##validation', () => {
    it('fails if channel is missing', (done) => {
      const scope = utils
        .createNock()
        .get('/signal/*')
        .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

      // @ts-expect-error Intentionally don't include `channel`.
      pubnub.signal({ message: { such: 'object' } }).catch((err) => {
        try {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, "Missing 'channel'");
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  it('publishes a complex object via GET', (done) => {
    const scope = utils
      .createNock()
      .get('/signal/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D')
      .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID', auth: 'myAuthKey' })
      .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

    pubnub.signal({ message: { such: 'object' }, channel: 'ch1' }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.timetoken, '14647523059145592');
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('send signal and signal listener called', (done) => {
    const scope = utils
      .createNock()
      .get('/signal/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D')
      .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID', auth: 'myAuthKey' })
      .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

    pubnub.addListener({
      signal(signal) {
        try {
          done();
        } catch (error) {
          done(error);
        }
      },
    });

    pubnub.signal({ message: { such: 'object' }, channel: 'ch1' }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.timetoken, '14647523059145592');
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
