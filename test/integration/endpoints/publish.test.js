/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../lib/node/index.js';

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
    pubnub = new PubNub({ subscribeKey: 'mySubKey', publishKey: 'myPublishKey', uuid: 'myUUID', authKey: 'myAuthKey' });
  });

  it('publishes a complex object via GET', (done) => {
    const scope = utils.createNock().get('/publish/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', auth: 'myAuthKey' })
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1' }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.timetoken, 14647523059145592);
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  it('publishes without replication via GET', (done) => {
    const scope = utils.createNock().get('/publish/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D')
    .query({ norep: true, pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', auth: 'myAuthKey' })
    .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1', replicate: false }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.timetoken, 14647523059145592);
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  it('publishes a complex object via GET with encryption', (done) => {
    const scope = utils.createNock().get('/publish/myPublishKey/mySubKey/0/ch1/0/%22toDEeIZkmIyoiLpSojGu7n3%2B2t1rn7%2FDsrEZ1r8JKR4%3D%22')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', auth: 'myAuthKey' })
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.setCipherKey('myCipherKey');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1' }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.timetoken, 14647523059145592);
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  it('publishes a complex object via POST', (done) => {
    const scope = utils.createNock().post('/publish/myPublishKey/mySubKey/0/ch1/0', '{"such":"object"}')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', auth: 'myAuthKey' })
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1', sendByPost: true }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.timetoken, 14647523059145592);
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  it('publishes a complex object via POST with encryption', (done) => {
    const scope = utils.createNock().post('/publish/myPublishKey/mySubKey/0/ch1/0', '"toDEeIZkmIyoiLpSojGu7n3+2t1rn7/DsrEZ1r8JKR4="')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', auth: 'myAuthKey' })
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.setCipherKey('myCipherKey');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1', sendByPost: true }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.timetoken, 14647523059145592);
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  describe('#fire', () => {
    it('publishes a complex object via GET', (done) => {
      const scope = utils.createNock().get('/publish/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D')
        .query({ norep: true, store: 0, pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', auth: 'myAuthKey' })
        .reply(200, '[1,"Sent","14647523059145592"]');

      pubnub.fire({ message: { such: 'object' }, channel: 'ch1' }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.timetoken, 14647523059145592);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });
});
