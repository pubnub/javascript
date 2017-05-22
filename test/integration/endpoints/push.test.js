/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('push endpoints', () => {
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

  describe('adding channels to device', () => {
    it('supports addition of multiple channels for apple', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({ add: 'a,b', pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'apns', uuid: 'myUUID' })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.addChannels({ channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports addition of multiple channels for microsoft', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({ add: 'a,b', pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'mpns', uuid: 'myUUID' })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.addChannels({ channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'mpns' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports addition of multiple channels for google', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({ add: 'a,b', pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'gcm', uuid: 'myUUID' })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.addChannels({ channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'gcm' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('listing channels for device', () => {
    it('supports channel listing for apple', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/coolDevice')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'apns', uuid: 'myUUID' })
        .reply(200, '["ch1", "ch2", "ch3"]');

      pubnub.push.listChannels({ device: 'coolDevice', pushGateway: 'apns' }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, ['ch1', 'ch2', 'ch3']);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports channel listing for microsoft', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/coolDevice')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'mpns', uuid: 'myUUID' })
        .reply(200, '["ch1", "ch2", "ch3"]');

      pubnub.push.listChannels({ device: 'coolDevice', pushGateway: 'mpns' }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, ['ch1', 'ch2', 'ch3']);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports channel listing for google', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/coolDevice')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'gcm', uuid: 'myUUID' })
        .reply(200, '["ch1", "ch2", "ch3"]');

      pubnub.push.listChannels({ device: 'coolDevice', pushGateway: 'gcm' }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, ['ch1', 'ch2', 'ch3']);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('supports deletion of channels', () => {
    it('supports removal of multiple channels for apple', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({ remove: 'a,b', pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'apns', uuid: 'myUUID' })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.removeChannels({ channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports removal of multiple channels for microsoft', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({ remove: 'a,b', pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'mpns', uuid: 'myUUID' })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.removeChannels({ channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'mpns' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports removal of multiple channels for google', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({ remove: 'a,b', pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'gcm', uuid: 'myUUID' })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.removeChannels({ channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'gcm', uuid: 'myUUID' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('supports removal of device', () => {
    it('supports removal of device for apple', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice/remove')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'apns', uuid: 'myUUID' })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.deleteDevice({ device: 'niceDevice', pushGateway: 'apns' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports removal of device for microsoft', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice/remove')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'mpns', uuid: 'myUUID' })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.deleteDevice({ device: 'niceDevice', pushGateway: 'mpns' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('supports removal of device for google', (done) => {
      const scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice/remove')
        .query({ pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, type: 'gcm', uuid: 'myUUID' })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.deleteDevice({ device: 'niceDevice', pushGateway: 'gcm' }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });
});
