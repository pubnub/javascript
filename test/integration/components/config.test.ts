/* global describe, it */
/* eslint no-console: 0, object-shorthand: 0 */

import assert from 'assert';
import PubNub from '../../../src/node/index';
import { PrivateClientConfiguration } from '../../../src/core/interfaces/configuration';

describe('components/config', () => {
  describe('AuthKey parameter', () => {
    it('get/set', () => {
      const pubnub = new PubNub({
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        authKey: 'authKey1',
        userId: 'myUUID',
      });
      assert.equal(pubnub.getAuthKey(), 'authKey1');
      pubnub.setAuthKey('authKey2');
      assert.equal(pubnub.getAuthKey(), 'authKey2');
    });
  });

  describe('uuid Parameter', () => {
    it('throws when not provided value', () => {
      const config = {
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        authKey: 'authKey1',
      };
      assert.throws(() => {
        new PubNub(config);
      });
    });

    it('get/set', () => {
      const pubnub = new PubNub({
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        uuid: 'uuid1',
      });
      assert.equal(pubnub.getUUID(), 'uuid1');
      pubnub.setUUID('uuid2');
      assert.equal(pubnub.getUUID(), 'uuid2');
    });

    it('get/set userId', () => {
      const pubnub = new PubNub({
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        userId: 'userId1',
      });
      assert.equal(pubnub.getUserId(), 'userId1');
      pubnub.setUserId('userId2');
      assert.equal(pubnub.getUserId(), 'userId2');
    });

    it('throws when both userId and uuid are provided', () => {
      const config = { subscribeKey: 'demo', publishKey: 'demo', uuid: 'myUuid', userId: 'myUserId' };

      assert.throws(() => {
        new PubNub(config);
      });
    });

    it('throws when invalid value provided', () => {
      const config = {
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        uuid: ' ',
      };
      assert.throws(() => {
        new PubNub(config);
      });
    });

    it('setUUID throws while trying to set invalid uuid', () => {
      const pubnub = new PubNub({
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        uuid: 'myUUID',
      });
      assert.throws(() => {
        pubnub.setUUID(' ');
      });
    });

    it('heartbeatInterval not set if presenceTimeout not set', () => {
      const pubnub = new PubNub({
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        uuid: 'myUUID',
      });
      assert.equal((pubnub.configuration as PrivateClientConfiguration).getPresenceTimeout(), 300);
      assert.equal((pubnub.configuration as PrivateClientConfiguration).getHeartbeatInterval(), undefined);
    });

    it('heartbeatInterval is set by formula when presenceTimeout is set', () => {
      const pubnub = new PubNub({
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        presenceTimeout: 30,
        uuid: 'myUUID',
      });
      assert.equal((pubnub.configuration as PrivateClientConfiguration).getPresenceTimeout(), 30);
      assert.equal((pubnub.configuration as PrivateClientConfiguration).getHeartbeatInterval(), 30 / 2 - 1);
    });
  });
});
