/* global describe, beforeEach, it */

import assert from 'assert';
import { ListChannelGroupsRequest } from '../../../src/core/endpoints/channel_groups/list_groups';
import RequestOperation from '../../../src/core/constants/operations';

describe('ListChannelGroupsRequest', () => {
  let request: ListChannelGroupsRequest;
  const keySet = {
    subscribeKey: 'mySubKey',
    publishKey: 'myPublishKey',
    secretKey: 'mySecretKey'
  };

  describe('Parameter validation', () => {
    it('should return "Missing Subscribe Key" when subscribeKey is missing', () => {
      const requestWithoutSubKey = new ListChannelGroupsRequest({
        keySet: { subscribeKey: '', publishKey: 'myPublishKey', secretKey: 'mySecretKey' }
      });

      const result = requestWithoutSubKey.validate();
      assert.strictEqual(result, 'Missing Subscribe Key');
    });

    it('should return undefined when valid parameters are provided', () => {
      request = new ListChannelGroupsRequest({
        keySet
      });

      const result = request.validate();
      assert.strictEqual(result, undefined);
    });
  });

  describe('Operation type', () => {
    beforeEach(() => {
      request = new ListChannelGroupsRequest({
        keySet
      });
    });

    it('should return correct operation type', () => {
      const operation = request.operation();
      assert.strictEqual(operation, RequestOperation.PNChannelGroupsOperation);
    });
  });

  describe('URL path construction', () => {
    beforeEach(() => {
      request = new ListChannelGroupsRequest({
        keySet
      });
    });

    it('should construct correct REST endpoint path', () => {
      const path = (request as any).path;
      const expectedPathComponents = [
        '/v1/channel-registration',
        'sub-key',
        keySet.subscribeKey,
        'channel-group'
      ];
      
      // Split path and verify components
      const pathComponents = path.split('/').filter((component: string) => component !== '');
      // Expected path: /v1/channel-registration/sub-key/mySubKey/channel-group
      // Components: ['v1', 'channel-registration', 'sub-key', 'mySubKey', 'channel-group']
      assert.strictEqual(pathComponents.length, 5);
      assert.strictEqual(pathComponents[0], 'v1');
      assert.strictEqual(pathComponents[1], 'channel-registration');
      assert.strictEqual(pathComponents[2], 'sub-key');
      assert.strictEqual(pathComponents[3], keySet.subscribeKey);
      assert.strictEqual(pathComponents[4], 'channel-group');
      
      // Verify the exact path structure
      assert.strictEqual(path, `/v1/channel-registration/sub-key/${keySet.subscribeKey}/channel-group`);
    });
  });

  describe('Response parsing with groups', () => {
    beforeEach(() => {
      request = new ListChannelGroupsRequest({
        keySet
      });
    });

    it('should parse service response with groups correctly', async () => {
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
        error: false,
        payload: {
          groups: ['group1', 'group2']
        }
      });

      const result = await request.parse(mockResponse);
      assert.deepStrictEqual(result, { groups: ['group1', 'group2'] });
    });
  });

  describe('Response parsing empty groups', () => {
    beforeEach(() => {
      request = new ListChannelGroupsRequest({
        keySet
      });
    });

    it('should parse service response with empty groups array correctly', async () => {
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
        error: false,
        payload: {
          groups: []
        }
      });

      const result = await request.parse(mockResponse);
      assert.deepStrictEqual(result, { groups: [] });
    });
  });

  describe('Large groups list parsing', () => {
    beforeEach(() => {
      request = new ListChannelGroupsRequest({
        keySet
      });
    });

    it('should parse response with many groups correctly', async () => {
      const mockResponse = {
        status: 200,
        url: '',
        headers: {},
        body: new ArrayBuffer(0)
      };

      // Create a large array of groups
      const largeGroupList = Array.from({ length: 50 }, (_, i) => `group${i + 1}`);

      // Mock the deserializeResponse method to return expected service response
      (request as any).deserializeResponse = () => ({
        status: 200,
        message: 'OK',
        service: 'ChannelGroups',
        error: false,
        payload: {
          groups: largeGroupList
        }
      });

      const result = await request.parse(mockResponse);
      
      // Verify all groups in payload.groups array are returned
      assert.deepStrictEqual(result, { groups: largeGroupList });
      assert.strictEqual(result.groups.length, 50);
      assert.strictEqual(result.groups[0], 'group1');
      assert.strictEqual(result.groups[49], 'group50');
    });

    it('should handle response with mixed group name types', async () => {
      const mockResponse = {
        status: 200,
        url: '',
        headers: {},
        body: new ArrayBuffer(0)
      };

      const mixedGroups = [
        'simple-group',
        'group with spaces',
        'group/with/slashes',
        'group-éñ',
        'group-中文',
        'group-🚀',
        'group!@#$%^&*()'
      ];

      // Mock the deserializeResponse method to return expected service response
      (request as any).deserializeResponse = () => ({
        status: 200,
        message: 'OK',
        service: 'ChannelGroups',
        error: false,
        payload: {
          groups: mixedGroups
        }
      });

      const result = await request.parse(mockResponse);
      assert.deepStrictEqual(result, { groups: mixedGroups });
    });
  });

  describe('Query parameters', () => {
    beforeEach(() => {
      request = new ListChannelGroupsRequest({
        keySet
      });
    });

    it('should not have any query parameters for list groups request', () => {
      const queryParams = (request as any).queryParameters;
      
      // ListChannelGroupsRequest doesn't override queryParameters, so it should be undefined or empty
      assert(queryParams === undefined || Object.keys(queryParams).length === 0);
    });
  });

  describe('Path components validation', () => {
    beforeEach(() => {
      request = new ListChannelGroupsRequest({
        keySet
      });
    });

    it('should have exactly the required path components in correct order', () => {
      const path = (request as any).path;
      const pathSegments = path.split('/').filter((segment: string) => segment !== '');
      
      assert.strictEqual(pathSegments.length, 5);
      assert.strictEqual(pathSegments[0], 'v1');
      assert.strictEqual(pathSegments[1], 'channel-registration');
      assert.strictEqual(pathSegments[2], 'sub-key');
      assert.strictEqual(pathSegments[3], keySet.subscribeKey);
      assert.strictEqual(pathSegments[4], 'channel-group');
    });

    it('should construct path correctly with different subscribeKey values', () => {
      const differentKeySet = {
        subscribeKey: 'different-sub-key-123',
        publishKey: 'myPublishKey',
        secretKey: 'mySecretKey'
      };

      const requestWithDifferentKey = new ListChannelGroupsRequest({
        keySet: differentKeySet
      });

      const path = (requestWithDifferentKey as any).path;
      assert.strictEqual(path, `/v1/channel-registration/sub-key/${differentKeySet.subscribeKey}/channel-group`);
    });
  });

  describe('Edge cases', () => {
    it('should handle null or undefined in service response', async () => {
      const request = new ListChannelGroupsRequest({
        keySet
      });

      const mockResponse = {
        status: 200,
        url: '',
        headers: {},
        body: new ArrayBuffer(0)
      };

      // Mock the deserializeResponse method to return null groups
      (request as any).deserializeResponse = () => ({
        status: 200,
        message: 'OK',
        service: 'ChannelGroups',
        error: false,
        payload: {
          groups: null
        }
      });

      const result = await request.parse(mockResponse);
      assert.deepStrictEqual(result, { groups: null });
    });
  });
});
