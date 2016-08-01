/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0, object-shorthand: 0 */

import assert from 'assert';
import sinon from 'sinon';
import uuidGenerator from 'uuid';
import PubNub from '../../../lib/core/pubnub-common.js';

describe('components/config', () => {
  describe('AuthKey Storage', () => {
    let storageParams = { authKey: 'authKey1' };
    const pubnub = new PubNub(storageParams);
    assert.equal(pubnub.getAuthKey(), 'authKey1');
    pubnub.setAuthKey('authKey2');
    assert.equal(pubnub.getAuthKey(), 'authKey2');
  });

  describe('UUID storage', () => {
    let database = () => {
      let db = {};
      return {
        get: (key) => db[key],
        set: (key, value) => { db[key] = value; }
      };
    };

    beforeEach(() => {
      sinon.stub(uuidGenerator, 'v4').returns('uuidCustom');
    });

    afterEach(() => {
      uuidGenerator.v4.restore();
    });

    it('uses the UUID if it is provided in setup', () => {
      let storageParams = { uuid: 'customUUID' };
      const pubnub = new PubNub(storageParams);
      assert.equal(pubnub.getUUID(), 'customUUID');
    });

    it('generates the UUID if it is not provided', () => {
      let storageParams = {};
      const pubnub = new PubNub(storageParams);
      assert.equal(pubnub.getUUID(), 'uuidCustom');
    });

    it('checks UUID from database if db object is provided', () => {
      let dbInstance = database();
      sinon.spy(dbInstance, 'get');
      sinon.spy(dbInstance, 'set');
      let storageParams = { subscribeKey: 'mySubKey', db: dbInstance };
      const pubnub = new PubNub(storageParams);
      assert.equal(dbInstance.get.callCount, 1);
      assert.equal(dbInstance.get.getCall(0).args[0], 'mySubKeyuuid');
      assert.equal(pubnub.getUUID(), 'uuidCustom');
    });

    it('uses UUID from database if db object is provided', () => {
      let dbInstance = database();
      dbInstance.set('mySubKeyuuid', 'dbUUID');
      sinon.spy(dbInstance, 'get');
      sinon.spy(dbInstance, 'set');
      let storageParams = { subscribeKey: 'mySubKey', db: dbInstance };
      const pubnub = new PubNub(storageParams);
      assert.equal(dbInstance.get.callCount, 2);
      assert.equal(dbInstance.get.getCall(0).args[0], 'mySubKeyuuid');
      assert.equal(pubnub.getUUID(), 'dbUUID');
    });
  });
});
