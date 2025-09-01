import assert from 'assert';

import { TransportResponse } from '../../../src/core/types/transport-response';
import { HeartbeatRequest } from '../../../src/core/endpoints/presence/heartbeat';
import { KeySet } from '../../../src/core/types/api';
import * as Presence from '../../../src/core/types/api/presence';
import RequestOperation from '../../../src/core/constants/operations';
import { createMockResponse } from '../test-utils';

describe('HeartbeatRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: Presence.PresenceHeartbeatParameters & { keySet: KeySet };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };
    defaultParameters = {
      heartbeat: 300,
      channels: ['channel1'],
      keySet: defaultKeySet,
    };
  });

  describe('validation', () => {
    it('should validate required subscribeKey', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should validate channels or channelGroups required', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: [],
        channelGroups: [],
      });
      assert.equal(request.validate(), 'Please provide a list of channels and/or channel-groups');
    });

    it('should validate channels or channelGroups required when undefined', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: undefined,
        channelGroups: undefined,
      });
      assert.equal(request.validate(), 'Please provide a list of channels and/or channel-groups');
    });

    it('should pass validation with channels only', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: undefined,
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with channel groups only', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: undefined,
        channelGroups: ['group1'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with both channels and groups', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: ['group1'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with empty channels but non-empty groups', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: [],
        channelGroups: ['group1'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with non-empty channels but empty groups', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: [],
      });
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return correct operation type', () => {
      const request = new HeartbeatRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNHeartbeatOperation);
    });
  });

  describe('constructor options', () => {
    it('should set cancellable option', () => {
      const request = new HeartbeatRequest(defaultParameters);
      // Check that the request was created with cancellable: true
      // This is validated by checking the generated transport request
      const transportRequest = request.request();
      assert.equal(transportRequest.cancellable, true);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path with single channel', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: ['channel1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1/heartbeat`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct path for multiple channels', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: ['channel1', 'channel2'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1,channel2/heartbeat`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in channel names', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: ['channel#1', 'channel@2'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel%231,channel%402/heartbeat`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle empty channels array', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: [],
        channelGroups: ['group1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel//heartbeat`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle undefined channels', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: undefined,
        channelGroups: ['group1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel//heartbeat`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('query parameters', () => {
    it('should include heartbeat parameter', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        heartbeat: 300,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.heartbeat, '300');
    });

    it('should include heartbeat parameter with different values', () => {
      const testValues = [60, 120, 300, 600, 1800];
      
      testValues.forEach(heartbeatValue => {
        const request = new HeartbeatRequest({
          ...defaultParameters,
          heartbeat: heartbeatValue,
        });
        const transportRequest = request.request();
        assert.equal(transportRequest.queryParameters?.heartbeat, heartbeatValue.toString());
      });
    });

    it('should include state when provided', () => {
      const state = { status: 'online' };
      const request = new HeartbeatRequest({
        ...defaultParameters,
        state,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.state, JSON.stringify(state));
    });

    it('should not include state when not provided', () => {
      const request = new HeartbeatRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.state, undefined);
    });

    it('should include channel groups when provided', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channelGroups: ['group1', 'group2'],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'group1,group2');
    });

    it('should not include channel-group when empty', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channelGroups: [],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.['channel-group'], undefined);
    });

    it('should handle single channel group', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channelGroups: ['single-group'],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'single-group');
    });

    it('should serialize complex state objects', () => {
      const complexState = {
        user: {
          name: 'Alice',
          activity: 'typing',
        },
        preferences: {
          notifications: true,
        },
        location: 'US',
        timestamp: 1234567890,
      };
      const request = new HeartbeatRequest({
        ...defaultParameters,
        state: complexState,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.state, JSON.stringify(complexState));
    });

    it('should serialize null state', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        state: null as any, // Cast to bypass TypeScript restriction while testing runtime behavior
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.state, 'null');
    });

    it('should serialize empty state object', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        state: {},
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.state, '{}');
    });

    it('should combine all query parameters', () => {
      const state = { active: true };
      const request = new HeartbeatRequest({
        ...defaultParameters,
        heartbeat: 450,
        channelGroups: ['cg1', 'cg2'],
        state,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.heartbeat, '450');
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'cg1,cg2');
      assert.equal(transportRequest.queryParameters?.state, JSON.stringify(state));
    });

    it('should handle zero heartbeat value', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        heartbeat: 0,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.heartbeat, '0');
    });

    it('should handle large heartbeat value', () => {
      const request = new HeartbeatRequest({
        ...defaultParameters,
        heartbeat: 86400, // 24 hours in seconds
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.heartbeat, '86400');
    });
  });

  describe('response parsing', () => {
    it('should parse successful response to empty object', async () => {
      const request = new HeartbeatRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result, {});
    });

    it('should parse successful response with payload to empty object', async () => {
      const request = new HeartbeatRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: { some: 'data' },
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      // Heartbeat response should always return empty object regardless of payload
      assert.deepEqual(result, {});
    });

    it('should handle empty response body', async () => {
      const request = new HeartbeatRequest(defaultParameters);
      const encoder = new TextEncoder();
      const mockResponse: TransportResponse = {
        url: 'https://ps.pndsn.com/v2/presence/sub-key/test/channel/test/heartbeat',
        status: 200,
        headers: { 'content-type': 'text/javascript' },
        body: encoder.encode(''),
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
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: [longChannelName],
      });
      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(longChannelName)));
    });

    it('should handle many channels', () => {
      const manyChannels = Array.from({ length: 100 }, (_, i) => `channel-${i}`);
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channels: manyChannels,
      });
      const transportRequest = request.request();
      const expectedChannelsPart = manyChannels.join(',');
      assert(transportRequest.path.includes(expectedChannelsPart));
    });

    it('should handle many channel groups', () => {
      const manyGroups = Array.from({ length: 50 }, (_, i) => `group-${i}`);
      const request = new HeartbeatRequest({
        ...defaultParameters,
        channelGroups: manyGroups,
      });
      const transportRequest = request.request();
      const expectedGroupsPart = manyGroups.join(',');
      assert.equal(transportRequest.queryParameters?.['channel-group'], expectedGroupsPart);
    });
  });
});
