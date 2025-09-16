/* global describe, beforeEach, it */

import assert from 'assert';
import { RemoveChannelGroupChannelsRequest } from '../../../src/core/endpoints/channel_groups/remove_channels';
import RequestOperation from '../../../src/core/constants/operations';

describe('RemoveChannelGroupChannelsRequest', () => {
  let request: RemoveChannelGroupChannelsRequest;
  const keySet = {
    subscribeKey: 'mySubKey',
    publishKey: 'myPublishKey',
    secretKey: 'mySecretKey'
  };

  describe('Parameter validation', () => {
    it('should return "Missing Subscribe Key" when subscribeKey is missing', () => {
      const requestWithoutSubKey = new RemoveChannelGroupChannelsRequest({
        keySet: { subscribeKey: '', publishKey: 'myPublishKey', secretKey: 'mySecretKey' },
        channelGroup: 'test-group',
        channels: ['channel1', 'channel2']
      });

      const result = requestWithoutSubKey.validate();
      assert.strictEqual(result, 'Missing Subscribe Key');
    });

    it('should return "Missing Channel Group" when channelGroup is missing', () => {
      const requestWithoutChannelGroup = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: '',
        channels: ['channel1', 'channel2']
      });

      const result = requestWithoutChannelGroup.validate();
      assert.strictEqual(result, 'Missing Channel Group');
    });

    it('should return "Missing channels" when channels array is missing', () => {
      const requestWithoutChannels = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: 'test-group',
        // @ts-expect-error Testing missing channels
        channels: undefined
      });

      const result = requestWithoutChannels.validate();
      assert.strictEqual(result, 'Missing channels');
    });

    it('should return undefined when all required parameters are provided', () => {
      request = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: 'test-group',
        channels: ['channel1', 'channel2']
      });

      const result = request.validate();
      assert.strictEqual(result, undefined);
    });
  });

  describe('Operation type', () => {
    beforeEach(() => {
      request = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: 'test-group',
        channels: ['channel1', 'channel2']
      });
    });

    it('should return correct operation type', () => {
      const operation = request.operation();
      assert.strictEqual(operation, RequestOperation.PNRemoveChannelsFromGroupOperation);
    });
  });

  describe('URL path construction', () => {
    beforeEach(() => {
      request = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: 'test-group',
        channels: ['channel1', 'channel2']
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

  describe('Query parameters', () => {
    beforeEach(() => {
      request = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: 'test-group',
        channels: ['channel1', 'channel2']
      });
    });

    it('should format channels correctly in remove query string', () => {
      const queryParams = (request as any).queryParameters;
      assert.deepStrictEqual(queryParams, { remove: 'channel1,channel2' });
    });

    it('should handle single channel correctly', () => {
      const singleChannelRequest = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: 'test-group',
        channels: ['single-channel']
      });

      const queryParams = (singleChannelRequest as any).queryParameters;
      assert.deepStrictEqual(queryParams, { remove: 'single-channel' });
    });
  });

  describe('Channel encoding', () => {
    it('should handle channels with special characters', () => {
      const specialChannelsRequest = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: 'test group with spaces',
        channels: ['channel with spaces', 'channel/with/slashes', 'channel?with=query&params']
      });

      const path = (specialChannelsRequest as any).path;
      const queryParams = (specialChannelsRequest as any).queryParameters;
      
      // Verify the channel group is URL encoded in path
      assert(path.includes('test%20group%20with%20spaces'));
      
      // Verify channels are properly formatted in query parameters
      assert.strictEqual(queryParams.remove, 'channel with spaces,channel/with/slashes,channel?with=query&params');
    });

    it('should handle channels with unicode characters', () => {
      const unicodeChannelsRequest = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: 'test-group',
        channels: ['channel-éñ', 'channel-中文', 'channel-🚀']
      });

      const queryParams = (unicodeChannelsRequest as any).queryParameters;
      assert.strictEqual(queryParams.remove, 'channel-éñ,channel-中文,channel-🚀');
    });
  });

  describe('Response parsing', () => {
    beforeEach(() => {
      request = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: 'test-group',
        channels: ['channel1', 'channel2']
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

  describe('Multiple channels', () => {
    it('should format array of multiple channels correctly', () => {
      const multiChannelRequest = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: 'test-group',
        channels: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5']
      });

      const queryParams = (multiChannelRequest as any).queryParameters;
      assert.strictEqual(queryParams.remove, 'ch1,ch2,ch3,ch4,ch5');
    });
  });

  describe('Non-existent channels', () => {
    it('should handle removing non-existent channels gracefully', () => {
      const nonExistentChannelsRequest = new RemoveChannelGroupChannelsRequest({
        keySet,
        channelGroup: 'test-group',
        channels: ['non-existent-channel1', 'non-existent-channel2']
      });

      // Validation should succeed even for non-existent channels
      const result = nonExistentChannelsRequest.validate();
      assert.strictEqual(result, undefined);

      // Query parameters should be formatted correctly
      const queryParams = (nonExistentChannelsRequest as any).queryParameters;
      assert.strictEqual(queryParams.remove, 'non-existent-channel1,non-existent-channel2');
    });
  });
});
