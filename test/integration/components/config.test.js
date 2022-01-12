/* global describe, it */
/* eslint no-console: 0, object-shorthand: 0 */

import assert from 'assert';
import PubNub from '../../../src/node/index';

describe('components/config', () => {
  describe('AuthKey parameter', () => {
    it('get/set', () => {
    let pubnub = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      authKey: 'authKey1',
      uuid: 'myUUID'
    });
    assert.equal(pubnub.getAuthKey(), 'authKey1');
    pubnub.setAuthKey('authKey2');
    assert.equal(pubnub.getAuthKey(), 'authKey2');
    });
  });

  describe('uuid Parameter', () => {
    it('throws when not provided value', () => {
      let config = {
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        authKey: 'authKey1'
      };
      assert.throws(() => {
        new PubNub(config);
      });
    });

    it('get/set', () => {
      let pubnub = new PubNub({
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        uuid: 'uuid1'
      });
      assert.equal(pubnub.getUUID(), 'uuid1');
      pubnub.setUUID('uuid2');
      assert.equal(pubnub.getUUID(), 'uuid2');
    });

    it('throws when invalid value provided', () => {
      let config = {
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        uuid: ' '
      };
      assert.throws(() => {
        new PubNub(config);
      });
    });

    it('setUUID throws while trying to set invalid uuid', () => {
      let pubnub = new PubNub({
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        uuid: 'myUUID'
      });
      assert.throws(() => {
        pubnub.setUUID(' ');
      });
    });
  });
});
