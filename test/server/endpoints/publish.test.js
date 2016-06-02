/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../utils';
import PubNub from '../../../src/node.js/index.js';

describe('publish endpoints', () => {
  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({ subscribeKey: 'mySubKey', publishKey: 'myPublishKey' });
  });

  it('publishes a complex object via GET', (done) => {
    utils.createNock().get('/publish/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D')
      .query(true)
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1' }, (status, response) => {
      assert.equal(status.error, null);
      assert.deepEqual(response.timetoken, 14647523059145592);
      done();
    });
  });

  it('publishes a complex object via GET with encryption', (done) => {
    utils.createNock().get('/publish/myPublishKey/mySubKey/0/ch1/0/%22toDEeIZkmIyoiLpSojGu7n3%2B2t1rn7%2FDsrEZ1r8JKR4%3D%22')
      .query(true)
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.setCipherKey('myCipherKey');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1' }, (status, response) => {
      assert.equal(status.error, null);
      assert.deepEqual(response.timetoken, 14647523059145592);
      done();
    });
  });

  it('publishes a complex object via POST', (done) => {
    utils.createNock().post('/publish/myPublishKey/mySubKey/0/ch1/0', '{"such":"object"}')
      .query(true)
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1', sendByPost: true }, (status, response) => {
      assert.equal(status.error, null);
      assert.deepEqual(response.timetoken, 14647523059145592);
      done();
    });
  });

  it('publishes a complex object via POST with encryption', (done) => {
    utils.createNock().post('/publish/myPublishKey/mySubKey/0/ch1/0', '"toDEeIZkmIyoiLpSojGu7n3+2t1rn7/DsrEZ1r8JKR4="')
      .query(true)
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.setCipherKey('myCipherKey');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1', sendByPost: true }, (status, response) => {
      assert.equal(status.error, null);
      assert.deepEqual(response.timetoken, 14647523059145592);
      done();
    });
  });

});
