/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../../src/node.js/index.js';

describe('push notifications // list channels', () => {
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

  it('supports channel listing for apple', (done) => {
    utils.createNock().get('/v1/push/sub-key/subKey/devices/coolDevice')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), type: 'apns' })
      .reply(200, '["ch1", "ch2", "ch3"]');

    pubnub.pushNotifications.listChannelsForDevice({ device: 'coolDevice', pushGateway: 'apns' }, (status, response) => {
      assert.equal(status.error, null);
      assert.deepEqual(response.channels, ['ch1', 'ch2', 'ch3']);
      done();
    });
  });

  it('supports channel listing for microsoft', (done) => {
    utils.createNock().get('/v1/push/sub-key/subKey/devices/coolDevice')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), type: 'mpns' })
      .reply(200, '["ch1", "ch2", "ch3"]');

    pubnub.pushNotifications.listChannelsForDevice({ device: 'coolDevice', pushGateway: 'mpns' }, (status, response) => {
      assert.equal(status.error, null);
      assert.deepEqual(response.channels, ['ch1', 'ch2', 'ch3']);
      done();
    });
  });

  it('supports channel listing for google', (done) => {
    utils.createNock().get('/v1/push/sub-key/subKey/devices/coolDevice')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), type: 'gcm' })
      .reply(200, '["ch1", "ch2", "ch3"]');

    pubnub.pushNotifications.listChannelsForDevice({ device: 'coolDevice', pushGateway: 'gcm' }, (status, response) => {
      assert.equal(status.error, null);
      assert.deepEqual(response.channels, ['ch1', 'ch2', 'ch3']);
      done();
    });
  });

});
