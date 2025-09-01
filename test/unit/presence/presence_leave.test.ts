import assert from 'assert';

import { TransportResponse } from '../../../src/core/types/transport-response';
import { PresenceLeaveRequest } from '../../../src/core/endpoints/presence/leave';
import { KeySet } from '../../../src/core/types/api';
import * as Presence from '../../../src/core/types/api/presence';
import RequestOperation from '../../../src/core/constants/operations';
import { createMockResponse } from '../test-utils';
import { encodeString } from '../../../src/core/utils';

describe('PresenceLeaveRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: Presence.PresenceLeaveParameters & { keySet: KeySet };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };
    defaultParameters = {
      channels: ['channel1'],
      keySet: defaultKeySet,
    };
  });

  describe('validation', () => {
    it('should validate required subscribeKey', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should validate channels or channelGroups required', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: [],
        channelGroups: [],
      });
      assert.equal(request.validate(), 'At least one `channel` or `channel group` should be provided.');
    });

    it('should validate channels or channelGroups required when undefined', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: undefined,
        channelGroups: undefined,
      });
      assert.equal(request.validate(), 'At least one `channel` or `channel group` should be provided.');
    });

    it('should pass validation with channels only', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: undefined,
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with channel groups only', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: undefined,
        channelGroups: ['group1'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with both channels and groups', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: ['group1'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with empty channels but non-empty groups', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: [],
        channelGroups: ['group1'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with non-empty channels but empty groups', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: [],
      });
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return correct operation type', () => {
      const request = new PresenceLeaveRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNUnsubscribeOperation);
    });
  });

  describe('channel handling', () => {
    it('should deduplicate channels', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: ['channel1', 'channel1', 'channel2'],
        channelGroups: undefined,
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1,channel2/leave`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should deduplicate channel groups', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: undefined,
        channelGroups: ['group1', 'group1', 'group2'],
      });
      // Access private field for testing
      const params = (request as any).parameters;
      assert.deepEqual(params.channelGroups, ['group1', 'group2']);
    });

    it('should sort channels in path', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: ['channelZ', 'channelA', 'channelM'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channelA,channelM,channelZ/leave`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should sort channel groups in query', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: ['groupZ', 'groupA', 'groupM'],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'groupA,groupM,groupZ');
    });

    it('should handle complex deduplication and sorting', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: ['c', 'a', 'b', 'a', 'c'],
        channelGroups: ['g3', 'g1', 'g2', 'g1'],
      });
      const transportRequest = request.request();
      
      // Channels should be deduplicated and sorted
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/a,b,c/leave`;
      assert.equal(transportRequest.path, expectedPath);
      
      // Channel groups should be deduplicated and sorted
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'g1,g2,g3');
    });

    it('should preserve original arrays without mutation', () => {
      const originalChannels = ['channel1', 'channel1', 'channel2'];
      const originalGroups = ['group1', 'group1', 'group2'];
      
      new PresenceLeaveRequest({
        ...defaultParameters,
        channels: originalChannels,
        channelGroups: originalGroups,
      });
      
      // Original arrays should not be modified
      assert.deepEqual(originalChannels, ['channel1', 'channel1', 'channel2']);
      assert.deepEqual(originalGroups, ['group1', 'group1', 'group2']);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path with single channel', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: ['channel1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1/leave`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct path for multiple channels', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: ['channel1', 'channel2'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1,channel2/leave`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in channel names', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: ['channel#1', 'channel@2'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel%231,channel%402/leave`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle empty channels array with groups', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: [],
        channelGroups: ['group1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel//leave`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle undefined channels with groups', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: undefined,
        channelGroups: ['group1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel//leave`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle null channels with groups', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: null as any,
        channelGroups: ['group1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel//leave`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('query parameters', () => {
    it('should not include channel-group when no channel groups provided', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: ['channel1'],
      });
      const transportRequest = request.request();
      assert.deepEqual(transportRequest.queryParameters, {});
    });

    it('should include channel-group when provided', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channelGroups: ['group1', 'group2'],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'group1,group2');
    });

    it('should handle empty channel groups array', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channelGroups: [],
      });
      const transportRequest = request.request();
      assert.deepEqual(transportRequest.queryParameters, {});
    });

    it('should handle single channel group', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channelGroups: ['single-group'],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'single-group');
    });

    it('should handle undefined channel groups', () => {
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channelGroups: undefined,
      });
      const transportRequest = request.request();
      assert.deepEqual(transportRequest.queryParameters, {});
    });
  });

  describe('response parsing', () => {
    it('should parse successful response to empty object', async () => {
      const request = new PresenceLeaveRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        action: 'leave',
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result, {});
    });

    it('should parse successful response with payload to empty object', async () => {
      const request = new PresenceLeaveRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        action: 'leave',
        payload: { some: 'data' },
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      // Leave response should always return empty object regardless of payload
      assert.deepEqual(result, {});
    });

    it('should handle malformed response', async () => {
      const request = new PresenceLeaveRequest(defaultParameters);
      const mockResponse: TransportResponse = {
        url: 'test-url',
        status: 200,
        headers: {},
        body: new TextEncoder().encode('invalid json').buffer,
      };
      
      // Should throw error for invalid JSON
      await assert.rejects(async () => {
        await request.parse(mockResponse);
      });
    });

    it('should handle empty response body', async () => {
      const request = new PresenceLeaveRequest(defaultParameters);
      const mockResponse: TransportResponse = {
        url: 'test-url',
        status: 200,
        headers: {},
        body: new ArrayBuffer(0),
      };
      
      // Should throw error for empty body
      await assert.rejects(async () => {
        await request.parse(mockResponse);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very long channel names', () => {
      const longChannelName = 'a'.repeat(1000);
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: [longChannelName],
      });
      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(longChannelName)));
    });

    it('should handle many channels', () => {
      const manyChannels = Array.from({ length: 100 }, (_, i) => `channel-${i}`);
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: manyChannels,
      });
      const transportRequest = request.request();
      
      // Should be sorted
      const sortedChannels = [...manyChannels].sort();
      const expectedChannelsPart = sortedChannels.join(',');
      assert(transportRequest.path.includes(expectedChannelsPart));
    });

    it('should handle many channel groups', () => {
      const manyGroups = Array.from({ length: 50 }, (_, i) => `group-${i}`);
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channelGroups: manyGroups,
      });
      const transportRequest = request.request();
      
      // Should be sorted
      const sortedGroups = [...manyGroups].sort();
      const expectedGroupsPart = sortedGroups.join(',');
      assert.equal(transportRequest.queryParameters?.['channel-group'], expectedGroupsPart);
    });

    it('should handle channels with special characters requiring sorting', () => {
      const specialChannels = ['channel-!', 'channel-@', 'channel-#', 'channel-$'];
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: specialChannels,
      });
      const transportRequest = request.request();
      
      // Should be sorted lexicographically
      const sortedChannels = [...specialChannels].sort();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/${sortedChannels.map(c => encodeString(c)).join(',')}/leave`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle mixed case channel names', () => {
      const mixedCaseChannels = ['Channel-A', 'channel-b', 'CHANNEL-C', 'channel-D'];
      const request = new PresenceLeaveRequest({
        ...defaultParameters,
        channels: mixedCaseChannels,
      });
      const transportRequest = request.request();
      
      // Should maintain case but sort properly
      const sortedChannels = [...mixedCaseChannels].sort();
      const expectedChannelsPart = sortedChannels.join(',');
      assert(transportRequest.path.includes(expectedChannelsPart));
    });
  });
});
