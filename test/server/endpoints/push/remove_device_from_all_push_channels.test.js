/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../../src/node.js/index.js';

describe('push notifications // add device to channels', () => {
  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({ subscribeKey: 'subKey' });
  });

  it('supports removal of multiple channels for apple', (done) => {
    utils.createNock().get('/v1/push/sub-key/mySubscribeKey/devices/niceDevice/remove')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), type: 'apns' })
      .reply(200, '[1, "Modified Channels"]');

    pubnub.pushNotifications.removeDeviceFromChannels({ device: 'niceDevice', pushGateway: 'apns' }, (status) => {
      assert.equal(status.error, null);
      done();
    });
  });

  it('supports removal of multiple channels for microsoft', (done) => {
    utils.createNock().get('/v1/push/sub-key/mySubscribeKey/devices/niceDevice/remove')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), type: 'mpns' })
      .reply(200, '[1, "Modified Channels"]');

    pubnub.pushNotifications.removeDeviceFromChannels({ device: 'niceDevice', pushGateway: 'mpns' }, (status) => {
      assert.equal(status.error, null);
      done();
    });
  });

  it('supports removal of multiple channels for google', (done) => {
    utils.createNock().get('/v1/push/sub-key/mySubscribeKey/devices/niceDevice/remove')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), type: 'gcm' })
      .reply(200, '[1, "Modified Channels"]');

    pubnub.pushNotifications.removeDeviceFromChannels({ device: 'niceDevice', pushGateway: 'gcm' }, (status) => {
      assert.equal(status.error, null);
      done();
    });
  });
});
