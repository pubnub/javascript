/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('push endpoints', () => {
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
      // @ts-expect-error Force override default value.
      useRequestId: false,
      uuid: 'myUUID',
    });
  });

  describe('adding channels to device', () => {
    it('supports addition of multiple channels for apple', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({
          add: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'apns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]', { 'content-type': 'text/javascript' });

      pubnub.push.addChannels({ channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns' }, (status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('supports addition of multiple channels for apple (APNS2)', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/push/sub-key/mySubKey/devices-apns2/niceDevice')
        .query({
          add: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          environment: 'development',
          topic: 'com.test.apns',
          type: 'apns2',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]', { 'content-type': 'text/javascript' });

      pubnub.push.addChannels(
        { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns2', topic: 'com.test.apns' },
        (status) => {
          try {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('supports addition of multiple channels for google', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({
          add: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'gcm',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]', { 'content-type': 'text/javascript' });

      pubnub.push.addChannels({ channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'gcm' }, (status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('listing channels for device', () => {
    it('supports channel listing for apple', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/coolDevice')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'apns',
          uuid: 'myUUID',
        })
        .reply(200, '["ch1", "ch2", "ch3"]', { 'content-type': 'text/javascript' });

      pubnub.push.listChannels({ device: 'coolDevice', pushGateway: 'apns' }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, ["ch1", "ch2", "ch3"]);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('supports channel listing for apple (APNS2)', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/push/sub-key/mySubKey/devices-apns2/coolDevice')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          environment: 'production',
          topic: 'com.test.apns',
          type: 'apns2',
          uuid: 'myUUID',
        })
        .reply(200, '["ch1", "ch2", "ch3"]', { 'content-type': 'text/javascript' });

      pubnub.push.listChannels(
        { device: 'coolDevice', pushGateway: 'apns2', environment: 'production', topic: 'com.test.apns' },
        (status, response) => {
          try {
            assert.equal(status.error, false);
            assert(response !== null);
            assert.deepEqual(response.channels, ["ch1", "ch2", "ch3"]);
            assert.equal(scope.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('supports channel listing for google', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/coolDevice')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'gcm',
          uuid: 'myUUID',
        })
        .reply(200, '["ch1", "ch2", "ch3"]', { 'content-type': 'text/javascript' });

      pubnub.push.listChannels({ device: 'coolDevice', pushGateway: 'gcm' }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, ["ch1", "ch2", "ch3"]);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('supports deletion of channels', () => {
    it('supports removal of multiple channels for apple', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({
          remove: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'apns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]', { 'content-type': 'text/javascript' });

      pubnub.push.removeChannels({ channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns' }, (status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('supports removal of multiple channels for apple (APNS2)', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/push/sub-key/mySubKey/devices-apns2/niceDevice')
        .query({
          remove: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          environment: 'development',
          topic: 'com.test.apns',
          type: 'apns2',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]', { 'content-type': 'text/javascript' });

      pubnub.push.removeChannels(
        { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns2', topic: 'com.test.apns' },
        (status) => {
          try {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('supports removal of multiple channels for google', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({
          remove: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'gcm',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]', { 'content-type': 'text/javascript' });

      pubnub.push.removeChannels(
        {
          channels: ['a', 'b'],
          device: 'niceDevice',
          pushGateway: 'gcm',
        },
        (status) => {
          try {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });
  });

  describe('supports removal of device', () => {
    it('supports removal of device for apple', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice/remove')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'apns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]', { 'content-type': 'text/javascript' });

      pubnub.push.deleteDevice({ device: 'niceDevice', pushGateway: 'apns' }, (status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('supports removal of device for apple (APNS2)', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/push/sub-key/mySubKey/devices-apns2/niceDevice/remove')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          environment: 'production',
          topic: 'com.test.apns',
          type: 'apns2',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]', { 'content-type': 'text/javascript' });

      pubnub.push.deleteDevice(
        { device: 'niceDevice', pushGateway: 'apns2', environment: 'production', topic: 'com.test.apns' },
        (status) => {
          try {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('supports removal of device for google', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice/remove')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'gcm',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]', { 'content-type': 'text/javascript' });

      pubnub.push.deleteDevice({ device: 'niceDevice', pushGateway: 'gcm' }, (status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
