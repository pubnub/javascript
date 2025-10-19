/* global describe, beforeEach, it */

import assert from 'assert';
import { ListChannelGroupChannels } from '../../../src/core/endpoints/channel_groups/list_channels';
import RequestOperation from '../../../src/core/constants/operations';

describe('ListChannelGroupChannels', () => {
  let request: ListChannelGroupChannels;
  const keySet = {
    subscribeKey: 'mySubKey',
    publishKey: 'myPublishKey',
    secretKey: 'mySecretKey'
  };

  describe('Parameter validation', () => {
    it('should return "Missing Subscribe Key" when subscribeKey is missing', () => {
      const requestWithoutSubKey = new ListChannelGroupChannels({
        keySet: { subscribeKey: '', publishKey: 'myPublishKey', secretKey: 'mySecretKey' },
        channelGroup: 'test-group'
      });

      const result = requestWithoutSubKey.validate();
      assert.strictEqual(result, 'Missing Subscribe Key');
    });

    it('should return "Missing Channel Group" when channelGroup is missing', () => {
      const requestWithoutChannelGroup = new ListChannelGroupChannels({
        keySet,
        channelGroup: ''
      });

      const result = requestWithoutChannelGroup.validate();
      assert.strictEqual(result, 'Missing Channel Group');
    });

    it('should return undefined when all required parameters are provided', () => {
      request = new ListChannelGroupChannels({
        keySet,
        channelGroup: 'test-group'
      });

      const result = request.validate();
      assert.strictEqual(result, undefined);
    });
  });

  describe('Operation type', () => {
    beforeEach(() => {
      request = new ListChannelGroupChannels({
        keySet,
        channelGroup: 'test-group'
      });
    });

    it('should return correct operation type', () => {
      const operation = request.operation();
      assert.strictEqual(operation, RequestOperation.PNChannelsForGroupOperation);
    });
  });

  describe('URL path construction', () => {
    beforeEach(() => {
      request = new ListChannelGroupChannels({
        keySet,
        channelGroup: 'test-group'
      });
    });

    it('should construct correct REST endpoint path', () => {
      const path = (request as any).path;
      const expectedPathComponents = [
        '/v1/channel-registration',
        'sub-key',
        keySet.subscribeKey,
        'channel-group',
        'test-group'
      ];
      
      // Split path and verify components
      const pathComponents = path.split('/').filter((component: string) => component !== '');
      // Expected path: /v1/channel-registration/sub-key/mySubKey/channel-group/test-group
      // Components: ['v1', 'channel-registration', 'sub-key', 'mySubKey', 'channel-group', 'test-group']
      assert.strictEqual(pathComponents.length, 6);
      assert.strictEqual(pathComponents[0], 'v1');
      assert.strictEqual(pathComponents[1], 'channel-registration');
      assert.strictEqual(pathComponents[2], 'sub-key');
      assert.strictEqual(pathComponents[3], keySet.subscribeKey);
      assert.strictEqual(pathComponents[4], 'channel-group');
      assert.strictEqual(pathComponents[5], 'test-group');
    });
  });

  describe('Response parsing with channels', () => {
    beforeEach(() => {
      request = new ListChannelGroupChannels({
        keySet,
        channelGroup: 'test-group'
      });
    });

    it('should parse service response with channels correctly', async () => {
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
          channels: ['channel1', 'channel2']
        }
      });

      const result = await request.parse(mockResponse);
      assert.deepStrictEqual(result, { channels: ['channel1', 'channel2'] });
    });
  });

  describe('Response parsing empty channels', () => {
    beforeEach(() => {
      request = new ListChannelGroupChannels({
        keySet,
        channelGroup: 'test-group'
      });
    });

    it('should parse service response with empty channels array correctly', async () => {
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
          channels: []
        }
      });

      const result = await request.parse(mockResponse);
      assert.deepStrictEqual(result, { channels: [] });
    });
  });

  describe('Channel group encoding', () => {
    it('should handle channel group names with special characters', () => {
      const specialGroupRequest = new ListChannelGroupChannels({
        keySet,
        channelGroup: 'test group with spaces'
      });

      const path = (specialGroupRequest as any).path;
      
      // Split path and verify encoded channel group name
      const pathComponents = path.split('/').filter((component: string) => component !== '');
      assert.strictEqual(pathComponents[pathComponents.length - 1], 'test%20group%20with%20spaces');
    });

    it('should handle channel group names with unicode characters', () => {
      const unicodeGroupRequest = new ListChannelGroupChannels({
        keySet,
        channelGroup: 'test-group-éñ中文🚀'
      });

      const path = (unicodeGroupRequest as any).path;
      
      // Verify the unicode characters are properly encoded in the path
      assert(path.includes('test-group-éñ中文🚀') || path.includes('test-group-%C3%A9%C3%B1%E4%B8%AD%E6%96%87%F0%9F%9A%80'));
    });

    it('should handle channel group names with symbols', () => {
      const symbolGroupRequest = new ListChannelGroupChannels({
        keySet,
        channelGroup: 'test-group!@#$%^&*()'
      });

      const path = (symbolGroupRequest as any).path;
      
      // Verify the symbols are properly URL encoded in the path
      assert(path.includes('test-group%21%40%23%24%25%5E%26%2A%28%29'));
    });
  });

  describe('Large channel list parsing', () => {
    beforeEach(() => {
      request = new ListChannelGroupChannels({
        keySet,
        channelGroup: 'test-group'
      });
    });

    it('should parse response with many channels correctly', async () => {
      const mockResponse = {
        status: 200,
        url: '',
        headers: {},
        body: new ArrayBuffer(0)
      };

      // Create a large array of channels
      const largeChannelList = Array.from({ length: 100 }, (_, i) => `channel${i + 1}`);

      // Mock the deserializeResponse method to return expected service response
      (request as any).deserializeResponse = () => ({
        status: 200,
        message: 'OK',
        service: 'ChannelGroups',
        error: false,
        payload: {
          channels: largeChannelList
        }
      });

      const result = await request.parse(mockResponse);
      
      // Verify all channels in payload.channels array are returned
      assert.deepStrictEqual(result, { channels: largeChannelList });
      assert.strictEqual(result.channels.length, 100);
      assert.strictEqual(result.channels[0], 'channel1');
      assert.strictEqual(result.channels[99], 'channel100');
    });

    it('should handle response with mixed channel name types', async () => {
      const mockResponse = {
        status: 200,
        url: '',
        headers: {},
        body: new ArrayBuffer(0)
      };

      const mixedChannels = [
        'simple-channel',
        'channel with spaces',
        'channel/with/slashes',
        'channel-éñ',
        'channel-中文',
        'channel-🚀',
        'channel!@#$%^&*()'
      ];

      // Mock the deserializeResponse method to return expected service response
      (request as any).deserializeResponse = () => ({
        status: 200,
        message: 'OK',
        service: 'ChannelGroups',
        error: false,
        payload: {
          channels: mixedChannels
        }
      });

      const result = await request.parse(mockResponse);
      assert.deepStrictEqual(result, { channels: mixedChannels });
    });
  });

  describe('Query parameters', () => {
    beforeEach(() => {
      request = new ListChannelGroupChannels({
        keySet,
        channelGroup: 'test-group'
      });
    });

    it('should not have any query parameters for list channels request', () => {
      const queryParams = (request as any).queryParameters;
      
      // ListChannelGroupChannels doesn't override queryParameters, so it should be undefined or empty
      assert(queryParams === undefined || Object.keys(queryParams).length === 0);
    });
  });
});
