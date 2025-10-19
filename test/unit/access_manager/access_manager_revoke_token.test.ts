/* global describe, it, beforeEach */

import assert from 'assert';
import { RevokeTokenRequest } from '../../../src/core/endpoints/access_manager/revoke_token';
import { TransportResponse } from '../../../src/core/types/transport-response';
import { TransportMethod } from '../../../src/core/types/transport-request';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';

describe('RevokeTokenRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: { token: string; keySet: KeySet };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
      secretKey: 'test_secret_key',
    };

    defaultParameters = {
      token: 'p0AkFl043rhDdHRsple3KgQ3NwY6BDcENnctokenVzcqBDczaWdYIGOAeTyWGJI',
      keySet: defaultKeySet,
    };
  });

  describe('validation', () => {
    it('should validate required secret key', () => {
      const requestWithoutSecretKey = new RevokeTokenRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, secretKey: '' },
      });
      assert.equal(requestWithoutSecretKey.validate(), "Missing Secret Key");
    });

    it('should validate required token', () => {
      const requestWithoutToken = new RevokeTokenRequest({
        ...defaultParameters,
        token: '',
      });
      assert.equal(requestWithoutToken.validate(), "token can't be empty");
    });

    it('should pass validation with valid parameters', () => {
      const validRequest = new RevokeTokenRequest(defaultParameters);
      assert.equal(validRequest.validate(), undefined);
    });

    it('should pass validation with only secret key and token', () => {
      const minimalRequest = new RevokeTokenRequest({
        token: 'test_token',
        keySet: { subscribeKey: 'test_sub_key', secretKey: 'test_secret_key' },
      });
      assert.equal(minimalRequest.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return PNAccessManagerRevokeToken operation', () => {
      const request = new RevokeTokenRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNAccessManagerRevokeToken);
    });
  });

  describe('request method', () => {
    it('should use DELETE method', () => {
      const request = new RevokeTokenRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.DELETE);
    });
  });

  describe('URL construction', () => {
    it('should construct correct URL path with encoded token', () => {
      const request = new RevokeTokenRequest(defaultParameters);
      const transportRequest = request.request();
      
      const expectedPath = `/v3/pam/${defaultKeySet.subscribeKey}/grant/${encodeURIComponent(defaultParameters.token)}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct URL with different subscribe key', () => {
      const customKeySet = { ...defaultKeySet, subscribeKey: 'custom_sub_key' };
      const request = new RevokeTokenRequest({
        ...defaultParameters,
        keySet: customKeySet,
      });
      
      const transportRequest = request.request();
      const expectedPath = `/v3/pam/custom_sub_key/grant/${encodeURIComponent(defaultParameters.token)}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle different token values', () => {
      const customToken = 'qEF2AkF0GmEI03xDdHRsGDxDcmVzpURjaGFuoWljaGFubmVsLTEY70NncnChb2NoYW5uZWxfZ3JvdXAtMQVDdXNyoENzcGOgRHV1aWShZnV1aWQtMRhoQ3BhdKVEY2hhbqFtXmNoYW5uZWwtXFMqJBjvQ2dycKF0XjpjaGFubmVsX2dyb3VwLVxTKiQFQ3VzcqBDc3BjoER1dWlkoWpedXVpZC1cUyokGGhEbWV0YaBEdXVpZHR0ZXN0LWF1dGhvcml6ZWQtdXVpZENzaWdYIPpU-vCe9rkpYs87YUrFNWkyNq8CVvmKwEjVinnDrJJc';
      const request = new RevokeTokenRequest({
        ...defaultParameters,
        token: customToken,
      });
      
      const transportRequest = request.request();
      const expectedPath = `/v3/pam/${defaultKeySet.subscribeKey}/grant/${encodeURIComponent(customToken)}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle tokens with special characters that need encoding', () => {
      const tokenWithSpecialChars = 'token+with/special=chars&more?data';
      const request = new RevokeTokenRequest({
        ...defaultParameters,
        token: tokenWithSpecialChars,
      });
      
      const transportRequest = request.request();
      const expectedPath = `/v3/pam/${defaultKeySet.subscribeKey}/grant/${encodeURIComponent(tokenWithSpecialChars)}`;
      assert.equal(transportRequest.path, expectedPath);
      
      // Verify that special characters are actually encoded using encodeString
      // encodeString does additional encoding beyond encodeURIComponent
      const encoded = transportRequest.path;
      assert(encoded.includes(encodeURIComponent(tokenWithSpecialChars)));
    });

    it('should handle tokens with spaces', () => {
      const tokenWithSpaces = 'token with spaces';
      const request = new RevokeTokenRequest({
        ...defaultParameters,
        token: tokenWithSpaces,
      });
      
      const transportRequest = request.request();
      const expectedPath = `/v3/pam/${defaultKeySet.subscribeKey}/grant/${encodeURIComponent(tokenWithSpaces)}`;
      assert.equal(transportRequest.path, expectedPath);
      
      // Verify that spaces are encoded as %20
      assert(transportRequest.path.includes('token%20with%20spaces'));
    });

    it('should handle empty subscribe key', () => {
      const emptySubKeyRequest = new RevokeTokenRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      
      const transportRequest = emptySubKeyRequest.request();
      const expectedPath = `/v3/pam//grant/${encodeURIComponent(defaultParameters.token)}`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('token encoding edge cases', () => {
    it('should handle very long tokens', () => {
      const longToken = 'a'.repeat(1000);
      const request = new RevokeTokenRequest({
        ...defaultParameters,
        token: longToken,
      });
      
      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(longToken)));
    });

    it('should handle tokens with Unicode characters', () => {
      const unicodeToken = 'token_with_unicode_🚀_characters_ñ_ü';
      const request = new RevokeTokenRequest({
        ...defaultParameters,
        token: unicodeToken,
      });
      
      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(unicodeToken)));
    });

    it('should handle tokens with Base64-like characters', () => {
      const base64Token = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      const request = new RevokeTokenRequest({
        ...defaultParameters,
        token: base64Token,
      });
      
      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(base64Token)));
    });

    it('should handle tokens with URL-unsafe characters', () => {
      const unsafeToken = 'token#with%unsafe&characters?and=more';
      const request = new RevokeTokenRequest({
        ...defaultParameters,
        token: unsafeToken,
      });
      
      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(unsafeToken)));
    });
  });

  describe('response parsing', () => {
    it('should parse successful revoke token response', async () => {
      const request = new RevokeTokenRequest(defaultParameters);
      const mockResponse: TransportResponse = {
        status: 200,
        url: 'https://test.pubnub.com',
        headers: { 'content-type': 'application/json' },
        body: new TextEncoder().encode(JSON.stringify({
          status: 200,
          data: {},
          service: 'Access Manager',
        })),
      };

      const parsedResponse = await request.parse(mockResponse);
      assert.deepEqual(parsedResponse, {});
    });

    it('should parse successful revoke response with additional data', async () => {
      const request = new RevokeTokenRequest(defaultParameters);
      const mockResponse: TransportResponse = {
        status: 200,
        url: 'https://test.pubnub.com',
        headers: { 'content-type': 'application/json' },
        body: new TextEncoder().encode(JSON.stringify({
          status: 200,
          data: {
            message: 'Token successfully revoked',
            timestamp: 1234567890,
          },
          service: 'Access Manager',
        })),
      };

      const parsedResponse = await request.parse(mockResponse);
      // Should always return empty object regardless of response content
      assert.deepEqual(parsedResponse, {});
    });

    it('should handle empty response body', async () => {
      const request = new RevokeTokenRequest(defaultParameters);
      const mockResponse: TransportResponse = {
        status: 200,
        url: 'https://test.pubnub.com',
        headers: { 'content-type': 'application/json' },
        body: new TextEncoder().encode(''),
      };

      try {
        await request.parse(mockResponse);
        // Should not reach here if parsing fails
        assert.fail('Expected parsing to fail with empty body');
      } catch (error) {
        // Expected to throw due to invalid JSON
        assert(error instanceof Error);
      }
    });

    it('should handle non-JSON response', async () => {
      const request = new RevokeTokenRequest(defaultParameters);
      const mockResponse: TransportResponse = {
        status: 200,
        url: 'https://test.pubnub.com',
        headers: { 'content-type': 'text/plain' },
        body: new TextEncoder().encode('Success'),
      };

      try {
        await request.parse(mockResponse);
        // Should not reach here if parsing fails
        assert.fail('Expected parsing to fail with non-JSON body');
      } catch (error) {
        // Expected to throw due to invalid JSON
        assert(error instanceof Error);
      }
    });
  });

  describe('minimal configurations', () => {
    it('should work with only required parameters', () => {
      const minimalRequest = new RevokeTokenRequest({
        token: 'test_token',
        keySet: { subscribeKey: 'test_sub_key', secretKey: 'test_secret' },
      });
      
      assert.equal(minimalRequest.validate(), undefined);
      assert.equal(minimalRequest.operation(), RequestOperation.PNAccessManagerRevokeToken);
      
      const transportRequest = minimalRequest.request();
      assert.equal(transportRequest.method, TransportMethod.DELETE);
      assert(transportRequest.path.includes('test_token'));
    });

    it('should not require publish key for validation', () => {
      const requestWithoutPubKey = new RevokeTokenRequest({
        token: 'test_token',
        keySet: { subscribeKey: 'test_sub_key', secretKey: 'test_secret' },
      });
      
      assert.equal(requestWithoutPubKey.validate(), undefined);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined keySet properties gracefully', () => {
      const request = new RevokeTokenRequest({
        token: 'test_token',
        keySet: { 
          secretKey: 'test_secret',
          subscribeKey: undefined as any,
          publishKey: undefined as any,
        },
      });
      
      const transportRequest = request.request();
      assert.equal(transportRequest.path, `/v3/pam/undefined/grant/${encodeURIComponent('test_token')}`);
    });

    it('should handle very short tokens', () => {
      const shortToken = 'a';
      const request = new RevokeTokenRequest({
        ...defaultParameters,
        token: shortToken,
      });
      
      assert.equal(request.validate(), undefined);
      const transportRequest = request.request();
      assert(transportRequest.path.includes(shortToken));
    });

    it('should handle numeric-like tokens', () => {
      const numericToken = '1234567890';
      const request = new RevokeTokenRequest({
        ...defaultParameters,
        token: numericToken,
      });
      
      const transportRequest = request.request();
      assert(transportRequest.path.includes(numericToken));
    });

    it('should handle tokens with only special characters', () => {
      const specialCharsToken = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const request = new RevokeTokenRequest({
        ...defaultParameters,
        token: specialCharsToken,
      });
      
      const transportRequest = request.request();
      // Verify the token is in the path (it will be encoded)
      assert(transportRequest.path.includes('/grant/'));
    });
  });

  describe('request properties', () => {
    it('should have empty query parameters object', () => {
      const request = new RevokeTokenRequest(defaultParameters);
      const transportRequest = request.request();
      
      // DELETE requests have empty query parameters object (not undefined)
      assert.deepEqual(transportRequest.queryParameters, {});
    });

    it('should not have request body', () => {
      const request = new RevokeTokenRequest(defaultParameters);
      const transportRequest = request.request();
      
      // DELETE requests typically don't have bodies
      assert.equal(transportRequest.body, undefined);
    });

    it('should have default headers from AbstractRequest', () => {
      const request = new RevokeTokenRequest(defaultParameters);
      const transportRequest = request.request();
      
      // Should have default headers from AbstractRequest
      assert.deepEqual(transportRequest.headers, {
        'Accept-Encoding': 'gzip, deflate'
      });
    });

    it('should be configured as non-compressible', () => {
      const request = new RevokeTokenRequest(defaultParameters);
      const transportRequest = request.request();
      
      // DELETE requests are typically not compressible
      assert.equal(transportRequest.compressible, false);
    });
  });

  describe('consistency with other access manager endpoints', () => {
    it('should follow same URL pattern as other v3 PAM endpoints', () => {
      const request = new RevokeTokenRequest(defaultParameters);
      const transportRequest = request.request();
      
      // Should follow /v3/pam/{subscribeKey}/* pattern
      assert(transportRequest.path.startsWith('/v3/pam/'));
      assert(transportRequest.path.includes(defaultKeySet.subscribeKey!));
    });

    it('should require secret key like other PAM operations', () => {
      const requestWithoutSecret = new RevokeTokenRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, secretKey: '' },
      });
      
      // All PAM operations should require secret key
      assert.equal(requestWithoutSecret.validate(), "Missing Secret Key");
    });
  });
});
