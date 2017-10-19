/* global describe, it */
/* eslint no-console: 0, object-shorthand: 0 */

import assert from 'assert';
import sinon from 'sinon';
import lilUUID from 'lil-uuid';
import PubNub from '../../../src/core/pubnub-common';
import Networking from '../../../src/networking';
import { get, post } from '../../../src/networking/modules/web-node';
import { keepAlive, proxy } from '../../../src/networking/modules/node';

describe('components/config', () => {
  describe('AuthKey Storage', () => {
    let networking = new Networking({ keepAlive, get, post, proxy });
    let storageParams = { authKey: 'authKey1', networking: networking };
    const pubnub = new PubNub(storageParams);
    assert.equal(pubnub.getAuthKey(), 'authKey1');
    pubnub.setAuthKey('authKey2');
    assert.equal(pubnub.getAuthKey(), 'authKey2');
  });

  describe('UUID storage', () => {
    let database = () => {
      let db = {};
      return {
        get: key => db[key],
        set: (key, value) => { db[key] = value; }
      };
    };

    it('uses the UUID if it is provided in setup', () => {
      let networking = new Networking({ keepAlive, get, post, proxy });
      let storageParams = { uuid: 'customUUID', networking: networking };
      const pubnub = new PubNub(storageParams);
      assert.equal(pubnub.getUUID(), 'customUUID');
    });

    it('generates the UUID if it is not provided', () => {
      let networking = new Networking({ keepAlive, get, post, proxy });
      let storageParams = { networking: networking };
      const pubnub = new PubNub(storageParams);
      assert.equal(lilUUID.isUUID(pubnub.getUUID().replace('pn-', '')), true);
    });

    it('checks UUID from database if db object is provided', () => {
      let dbInstance = database();
      let networking = new Networking({ keepAlive, get, post, proxy });
      sinon.spy(dbInstance, 'get');
      sinon.spy(dbInstance, 'set');
      let storageParams = { subscribeKey: 'mySubKey', db: dbInstance, networking: networking };
      const pubnub = new PubNub(storageParams);
      assert.equal(dbInstance.get.callCount, 1);
      assert.equal(dbInstance.get.getCall(0).args[0], 'mySubKeyuuid');
      assert.equal(lilUUID.isUUID(pubnub.getUUID().replace('pn-', '')), true);
    });

    it('uses UUID from database if db object is provided', () => {
      let dbInstance = database();
      let networking = new Networking({ keepAlive, get, post, proxy });
      dbInstance.set('mySubKeyuuid', 'dbUUID');
      sinon.spy(dbInstance, 'get');
      sinon.spy(dbInstance, 'set');
      let storageParams = { subscribeKey: 'mySubKey', db: dbInstance, networking: networking };
      const pubnub = new PubNub(storageParams);
      assert.equal(dbInstance.get.callCount, 2);
      assert.equal(dbInstance.get.getCall(0).args[0], 'mySubKeyuuid');
      assert.equal(pubnub.getUUID(), 'dbUUID');
    });
  });
});
