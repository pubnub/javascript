/* global describe, it, beforeEach */

import assert from 'assert';
import { GrantRequest } from '../../../src/core/endpoints/access_manager/grant';
import { TransportResponse } from '../../../src/core/types/transport-response';
import { KeySet } from '../../../src/core/types/api';
import * as PAM from '../../../src/core/types/api/access-manager';

describe('GrantRequest', () => {
  let defaultKeySet: KeySet;

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
      secretKey: 'test_secret_key',
    };
  });

  describe('categories', () => {
    it('should encode category enumeration as a comma-separated query value', () => {
      const request = new GrantRequest({
        keySet: defaultKeySet,
        authKeys: ['auth_key', 'auth_key_2'],
        categories: ['channels', 'uuids'],
        get: true,
      });

      assert.equal(request.validate(), undefined);

      const { queryParameters } = request.request();
      assert.equal(queryParameters!.category, 'channels,uuids');
      assert.equal(queryParameters!.auth, 'auth_key,auth_key_2');
      assert.equal(queryParameters!.g, '1');
      assert.equal(queryParameters!.r, '0');
      assert.equal(queryParameters!.w, '0');
      assert.equal(queryParameters!.m, '0');
      assert.equal(queryParameters!.d, '0');
      assert.equal(queryParameters!.u, '0');
      assert.equal(queryParameters!.j, '0');
    });

    it('should omit category when none are granted', () => {
      const request = new GrantRequest({
        keySet: defaultKeySet,
        channels: ['ch1'],
        authKeys: ['auth_key'],
      });

      const { queryParameters } = request.request();
      assert.equal(queryParameters!.category, undefined);
      assert.equal(queryParameters!.channel, 'ch1');
    });

    it('should encode a category revoke as g=0', () => {
      const request = new GrantRequest({
        keySet: defaultKeySet,
        authKeys: ['auth_key'],
        categories: ['channels'],
        get: false,
      });

      assert.equal(request.validate(), undefined);
      assert.equal(request.request().queryParameters!.category, 'channels');
      assert.equal(request.request().queryParameters!.g, '0');
    });

    it('should require authKeys for categories', () => {
      const request = new GrantRequest({
        keySet: defaultKeySet,
        categories: ['channels'],
        get: true,
      });

      assert.equal(request.validate(), 'authKeys are required for grant request on categories');
    });

    it('should reject a permission other than get', () => {
      const request = new GrantRequest({
        keySet: defaultKeySet,
        authKeys: ['auth_key'],
        categories: ['uuids'],
        get: true,
        read: true,
      });

      assert.equal(request.validate(), 'Category permissions must be exactly the get permission');
    });

    it('should reject a one-minute category grant', () => {
      const request = new GrantRequest({
        keySet: defaultKeySet,
        authKeys: ['auth_key'],
        categories: ['channels'],
        get: true,
        ttl: 1,
      });

      assert.equal(request.validate(), 'One-minute category grants are not supported');
    });

    it('should allow a one-minute category revoke', () => {
      const request = new GrantRequest({
        keySet: defaultKeySet,
        authKeys: ['auth_key'],
        categories: ['channels'],
        get: false,
        ttl: 1,
      });

      assert.equal(request.validate(), undefined);
    });

    it('should reject an unsupported category name', () => {
      const request = new GrantRequest({
        keySet: defaultKeySet,
        authKeys: ['auth_key'],
        categories: ['users' as 'channels'],
        get: true,
      });

      assert.equal(request.validate(), 'Invalid category: only channels and uuids are supported');
    });

    it('should encode categories alongside channels when only get is set', () => {
      const request = new GrantRequest({
        keySet: defaultKeySet,
        authKeys: ['auth_key'],
        channels: ['ch1'],
        categories: ['uuids'],
        get: true,
      });

      assert.equal(request.validate(), undefined);

      const { queryParameters } = request.request();
      assert.equal(queryParameters!.channel, 'ch1');
      assert.equal(queryParameters!.category, 'uuids');
      assert.equal(queryParameters!.g, '1');
    });

    it('should reject categories alongside channels when another permission is set', () => {
      const request = new GrantRequest({
        keySet: defaultKeySet,
        authKeys: ['auth_key'],
        channels: ['ch1'],
        categories: ['channels'],
        read: true,
      });

      assert.equal(request.validate(), 'Category permissions must be exactly the get permission');
    });

    it('should return category permissions from the service payload', async () => {
      const request = new GrantRequest({
        keySet: defaultKeySet,
        authKeys: ['auth_key'],
        categories: ['channels'],
        get: true,
      });
      const payload: PAM.PermissionsResponse = {
        level: 'category',
        subscribe_key: 'test_subscribe_key',
        ttl: 1440,
        categories: {
          channels: { auths: { auth_key: { r: 0, w: 0, m: 0, d: 0, g: 1, u: 0, j: 0 } } },
          uuids: { auths: { auth_key: { r: 0, w: 0, m: 0, d: 0, g: 1, u: 0, j: 0 } } },
        },
      };
      const response: TransportResponse = {
        status: 200,
        url: 'https://test.pubnub.com',
        headers: { 'content-type': 'application/json' },
        body: new TextEncoder().encode(
          JSON.stringify({
            status: 200,
            message: 'Success',
            payload,
            service: 'Access Manager',
          }),
        ),
      };

      const parsed = await request.parse(response);
      assert.equal(parsed.level, 'category');
      if (parsed.level !== 'category') return;
      assert.deepEqual(parsed.categories.channels.auths.auth_key, payload.categories.channels.auths.auth_key);
    });
  });
});
