/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('publish endpoints', () => {
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
      authKey: 'myAuthKey',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      useRandomIVs: false,
    });
  });

  describe('##validation', () => {
    it('fails if channel is missing', (done) => {
      const scope = utils
        .createNock()
        .get('/publish/*')
        .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

      // @ts-expect-error Intentionally don't include `channel`.
      pubnub.publish({ message: { such: 'object' } }).catch((err) => {
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
      .get('/publish/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        auth: 'myAuthKey',
      })
      .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1' }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.timetoken, "14647523059145592");
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('publishes without replication via GET', (done) => {
    const scope = utils
      .createNock()
      .get('/publish/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D')
      .query({
        norep: true,
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        auth: 'myAuthKey',
      })
      .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1', replicate: false }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.timetoken, "14647523059145592");
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('publishes a complex object via GET with encryption', (done) => {
    const scope = utils
      .createNock()
      .get('/publish/myPublishKey/mySubKey/0/ch1/0/%22toDEeIZkmIyoiLpSojGu7n3%2B2t1rn7%2FDsrEZ1r8JKR4%3D%22')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        auth: 'myAuthKey',
      })
      .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

    pubnub.setCipherKey('myCipherKey');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1' }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.timetoken, "14647523059145592");
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('supports ttl param', (done) => {
    const scope = utils
      .createNock()
      .get('/publish/myPublishKey/mySubKey/0/ch1/0/%22toDEeIZkmIyoiLpSojGu7n3%2B2t1rn7%2FDsrEZ1r8JKR4%3D%22')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        auth: 'myAuthKey',
        ttl: '10',
      })
      .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

    pubnub.setCipherKey('myCipherKey');
    pubnub.publish({ message: { such: 'object' }, channel: 'ch1', ttl: 10 }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.timetoken, "14647523059145592");
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('supports storeInHistory=0', (done) => {
    const scope = utils
      .createNock()
      .get('/publish/myPublishKey/mySubKey/0/ch1/0/%22toDEeIZkmIyoiLpSojGu7n3%2B2t1rn7%2FDsrEZ1r8JKR4%3D%22')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        auth: 'myAuthKey',
        store: '0',
      })
      .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

    pubnub.setCipherKey('myCipherKey');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1', storeInHistory: false }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.timetoken, "14647523059145592");
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('supports storeInHistory=1', (done) => {
    const scope = utils
      .createNock()
      .get('/publish/myPublishKey/mySubKey/0/ch1/0/%22toDEeIZkmIyoiLpSojGu7n3%2B2t1rn7%2FDsrEZ1r8JKR4%3D%22')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        auth: 'myAuthKey',
        store: '1',
      })
      .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

    pubnub.setCipherKey('myCipherKey');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1', storeInHistory: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.timetoken, "14647523059145592");
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('publishes a complex object via POST', (done) => {
    const scope = utils
      .createNock()
      .post('/publish/myPublishKey/mySubKey/0/ch1/0', '{"such":"object"}')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        auth: 'myAuthKey',
      })
      .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1', sendByPost: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.timetoken, "14647523059145592");
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('publishes a complex object via POST with encryption', (done) => {
    const scope = utils
      .createNock()
      .post('/publish/myPublishKey/mySubKey/0/ch1/0', '"toDEeIZkmIyoiLpSojGu7n3+2t1rn7/DsrEZ1r8JKR4="')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        auth: 'myAuthKey',
      })
      .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

    pubnub.setCipherKey('myCipherKey');

    pubnub.publish({ message: { such: 'object' }, channel: 'ch1', sendByPost: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.timetoken, "14647523059145592");
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  describe('#fire', () => {
    it('publishes a complex object via GET', (done) => {
      const scope = utils
        .createNock()
        .get('/publish/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D')
        .query({
          norep: true,
          store: 0,
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

      pubnub.fire({ message: { such: 'object' }, channel: 'ch1' }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.timetoken, "14647523059145592");
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
