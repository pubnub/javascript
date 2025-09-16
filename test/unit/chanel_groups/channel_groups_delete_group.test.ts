/* global describe, beforeEach, it */

import assert from 'assert';
import { DeleteChannelGroupRequest } from '../../../src/core/endpoints/channel_groups/delete_group';
import RequestOperation from '../../../src/core/constants/operations';

describe('DeleteChannelGroupRequest', () => {
  let request: DeleteChannelGroupRequest;
  const keySet = {
    subscribeKey: 'mySubKey',
    publishKey: 'myPublishKey',
    secretKey: 'mySecretKey'
  };

  describe('Parameter validation', () => {
    it('should return "Missing Subscribe Key" when subscribeKey is missing', () => {
      const requestWithoutSubKey = new DeleteChannelGroupRequest({
        keySet: { subscribeKey: '', publishKey: 'myPublishKey', secretKey: 'mySecretKey' },
        channelGroup: 'test-group'
      });

      const result = requestWithoutSubKey.validate();
      assert.strictEqual(result, 'Missing Subscribe Key');
    });

    it('should return "Missing Channel Group" when channelGroup is missing', () => {
      const requestWithoutChannelGroup = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: ''
      });

      const result = requestWithoutChannelGroup.validate();
      assert.strictEqual(result, 'Missing Channel Group');
    });

    it('should return undefined when all required parameters are provided', () => {
      request = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: 'test-group'
      });

      const result = request.validate();
      assert.strictEqual(result, undefined);
    });
  });

  describe('Operation type', () => {
    beforeEach(() => {
      request = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: 'test-group'
      });
    });

    it('should return correct operation type', () => {
      const operation = request.operation();
      assert.strictEqual(operation, RequestOperation.PNRemoveGroupOperation);
    });
  });

  describe('URL path construction', () => {
    beforeEach(() => {
      request = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: 'test-group'
      });
    });

    it('should construct correct REST endpoint path with /remove suffix', () => {
      const path = (request as any).path;
      const expectedPathComponents = [
        '/v1/channel-registration',
        'sub-key',
        keySet.subscribeKey,
        'channel-group',
        'test-group',
        'remove'
      ];
      
      // Split path and verify components
      const pathComponents = path.split('/').filter((component: string) => component !== '');
      // Expected path: /v1/channel-registration/sub-key/mySubKey/channel-group/test-group/remove
      // Components: ['v1', 'channel-registration', 'sub-key', 'mySubKey', 'channel-group', 'test-group', 'remove']
      assert.strictEqual(pathComponents.length, 7);
      assert.strictEqual(pathComponents[0], 'v1');
      assert.strictEqual(pathComponents[1], 'channel-registration');
      assert.strictEqual(pathComponents[2], 'sub-key');
      assert.strictEqual(pathComponents[3], keySet.subscribeKey);
      assert.strictEqual(pathComponents[4], 'channel-group');
      assert.strictEqual(pathComponents[5], 'test-group');
      assert.strictEqual(pathComponents[6], 'remove');
      
      // Verify the exact path structure
      assert.strictEqual(path, `/v1/channel-registration/sub-key/${keySet.subscribeKey}/channel-group/test-group/remove`);
    });
  });

  describe('Response parsing', () => {
    beforeEach(() => {
      request = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: 'test-group'
      });
    });

    it('should parse empty service response correctly', async () => {
      const mockResponse = {
        status: 200,
        url: '',
        headers: {},
        body: new ArrayBuffer(0)
      };

      // Mock the deserializeResponse method to return expected service response
      (request as any).deserializeResponse = () => ({
        status: 200,
        message: 'OK',
        service: 'ChannelGroups',
        error: false
      });

      const result = await request.parse(mockResponse);
      assert.deepStrictEqual(result, {});
    });
  });

  describe('Channel group encoding', () => {
    it('should handle channel group names with special characters', () => {
      const specialGroupRequest = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: 'test group with spaces'
      });

      const path = (specialGroupRequest as any).path;
      
      // Split path and verify encoded channel group name
      const pathComponents = path.split('/').filter((component: string) => component !== '');
      assert.strictEqual(pathComponents[5], 'test%20group%20with%20spaces');
      assert.strictEqual(pathComponents[6], 'remove');
    });

    it('should handle channel group names with unicode characters', () => {
      const unicodeGroupRequest = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: 'test-group-éñ中文🚀'
      });

      const path = (unicodeGroupRequest as any).path;
      
      // Verify the unicode characters are properly encoded in the path
      assert(path.includes('test-group-%C3%A9%C3%B1%E4%B8%AD%E6%96%87%F0%9F%9A%80'));
      assert(path.endsWith('/remove'));
    });

    it('should handle channel group names with symbols', () => {
      const symbolGroupRequest = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: 'test-group!@#$%^&*()'
      });

      const path = (symbolGroupRequest as any).path;
      
      // Verify the symbols are properly URL encoded in the path
      assert(path.includes('test-group%21%40%23%24%25%5E%26%2A%28%29'));
      assert(path.endsWith('/remove'));
    });
  });

  describe('Non-existent group', () => {
    it('should handle deleting non-existent group gracefully', () => {
      const nonExistentGroupRequest = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: 'non-existent-group'
      });

      // Validation should succeed even for non-existent groups
      const result = nonExistentGroupRequest.validate();
      assert.strictEqual(result, undefined);

      // Path should be constructed correctly
      const path = (nonExistentGroupRequest as any).path;
      assert.strictEqual(path, `/v1/channel-registration/sub-key/${keySet.subscribeKey}/channel-group/non-existent-group/remove`);
    });
  });

  describe('Path components validation', () => {
    beforeEach(() => {
      request = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: 'test-group'
      });
    });

    it('should have exactly the required path components in correct order', () => {
      const path = (request as any).path;
      const pathSegments = path.split('/').filter((segment: string) => segment !== '');
      
      assert.strictEqual(pathSegments.length, 7);
      assert.strictEqual(pathSegments[0], 'v1');
      assert.strictEqual(pathSegments[1], 'channel-registration');
      assert.strictEqual(pathSegments[2], 'sub-key');
      assert.strictEqual(pathSegments[3], keySet.subscribeKey);
      assert.strictEqual(pathSegments[4], 'channel-group');
      assert.strictEqual(pathSegments[5], 'test-group');
      assert.strictEqual(pathSegments[6], 'remove');
    });

    it('should construct path correctly with different subscribeKey and channelGroup values', () => {
      const differentKeySet = {
        subscribeKey: 'different-sub-key-123',
        publishKey: 'myPublishKey',
        secretKey: 'mySecretKey'
      };

      const requestWithDifferentValues = new DeleteChannelGroupRequest({
        keySet: differentKeySet,
        channelGroup: 'different-channel-group'
      });

      const path = (requestWithDifferentValues as any).path;
      assert.strictEqual(path, `/v1/channel-registration/sub-key/${differentKeySet.subscribeKey}/channel-group/different-channel-group/remove`);
    });
  });

  describe('Query parameters', () => {
    beforeEach(() => {
      request = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: 'test-group'
      });
    });

    it('should not have any query parameters for delete group request', () => {
      const queryParams = (request as any).queryParameters;
      
      // DeleteChannelGroupRequest doesn't override queryParameters, so it should be undefined or empty
      assert(queryParams === undefined || Object.keys(queryParams).length === 0);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long channel group names', () => {
      const longGroupName = 'a'.repeat(100);
      const longGroupRequest = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: longGroupName
      });

      const result = longGroupRequest.validate();
      assert.strictEqual(result, undefined);

      const path = (longGroupRequest as any).path;
      assert(path.includes(longGroupName));
      assert(path.endsWith('/remove'));
    });

    it('should handle channel group names with forward slashes', () => {
      const slashGroupRequest = new DeleteChannelGroupRequest({
        keySet,
        channelGroup: 'group/with/slashes'
      });

      const path = (slashGroupRequest as any).path;
      
      // Forward slashes should be encoded in URL
      assert(path.includes('group%2Fwith%2Fslashes'));
      assert(path.endsWith('/remove'));
    });
  });
});
