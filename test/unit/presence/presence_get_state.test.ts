import assert from 'assert';

import { TransportResponse } from '../../../src/core/types/transport-response';
import { GetPresenceStateRequest } from '../../../src/core/endpoints/presence/get_state';
import { KeySet, Payload } from '../../../src/core/types/api';
import * as Presence from '../../../src/core/types/api/presence';
import RequestOperation from '../../../src/core/constants/operations';
import { createMockResponse } from '../test-utils';

describe('GetPresenceStateRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: Presence.GetPresenceStateParameters & { keySet: KeySet; uuid: string };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };
    defaultParameters = {
      uuid: 'test_uuid',
      keySet: defaultKeySet,
    };
  });

  describe('validation', () => {
    it('should validate required subscribeKey', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should pass validation with minimal parameters', () => {
      const request = new GetPresenceStateRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with channels', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with channel groups', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channelGroups: ['group1'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with both channels and groups', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: ['group1'],
      });
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return correct operation type', () => {
      const request = new GetPresenceStateRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNGetStateOperation);
    });
  });

  describe('default parameter handling', () => {
    it('should handle default empty arrays', () => {
      const request = new GetPresenceStateRequest(defaultParameters);
      // Access private field for testing
      const params = (request as any).parameters;
      assert.deepEqual(params.channels, []);
      assert.deepEqual(params.channelGroups, []);
    });

    it('should preserve provided channels', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['ch1', 'ch2'],
      });
      const params = (request as any).parameters;
      assert.deepEqual(params.channels, ['ch1', 'ch2']);
    });

    it('should preserve provided channel groups', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channelGroups: ['cg1', 'cg2'],
      });
      const params = (request as any).parameters;
      assert.deepEqual(params.channelGroups, ['cg1', 'cg2']);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path with UUID and channels', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1/uuid/test_uuid`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct path for multiple channels', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1', 'channel2'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1,channel2/uuid/test_uuid`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in channel names', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel#1', 'channel@2'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel%231,channel%402/uuid/test_uuid`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in UUID', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        uuid: 'test#uuid@123',
        channels: ['channel1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1/uuid/test%23uuid%40123`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle empty channels array', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: [],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/,/uuid/test_uuid`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle undefined UUID', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        uuid: undefined as any, // Explicit type assertion for test case
        channels: ['channel1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1/uuid/`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('query parameters', () => {
    it('should not include channel-group when no channel groups provided', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1'],
      });
      const transportRequest = request.request();
      assert.deepEqual(transportRequest.queryParameters, {});
    });

    it('should include channel-group when provided', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channelGroups: ['group1', 'group2'],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'group1,group2');
    });

    it('should handle empty channel groups array', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channelGroups: [],
      });
      const transportRequest = request.request();
      assert.deepEqual(transportRequest.queryParameters, {});
    });

    it('should handle single channel group', () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channelGroups: ['single-group'],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'single-group');
    });
  });

  describe('response parsing', () => {
    it('should parse single channel response', async () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: [],
      });
      const mockState = { status: 'online', age: 25 };
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        uuid: 'test_uuid',
        payload: mockState,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.channels, {
        channel1: mockState,
      });
    });

    it('should parse multiple channels response', async () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['ch1', 'ch2'],
      });
      const mockStates = {
        ch1: { status: 'online' },
        ch2: { status: 'away', mood: 'happy' },
      };
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        uuid: 'test_uuid',
        payload: mockStates,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.channels, mockStates);
    });

    it('should handle empty state response', async () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: [],
      });
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        uuid: 'test_uuid',
        payload: {},
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.channels, {
        channel1: {},
      });
    });

    it('should handle null state response', async () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: [],
      });
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        uuid: 'test_uuid',
        payload: null,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.channels, {
        channel1: null,
      });
    });

    it('should handle complex state objects', async () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: [],
      });
      const complexState = {
        user: {
          name: 'John',
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
        location: {
          country: 'US',
          city: 'New York',
        },
        activity: ['typing', 'online'],
        metadata: null,
      };
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        uuid: 'test_uuid',
        payload: complexState,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.channels, {
        channel1: complexState,
      });
    });

    it('should determine single vs multiple channels correctly', async () => {
      // Test with exactly 1 channel and 0 channel groups
      const singleChannelRequest = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['only-channel'],
        channelGroups: [],
      });
      
      const mockState = { single: true };
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        uuid: 'test_uuid',
        payload: mockState,
        service: 'Presence',
      });
      const result = await singleChannelRequest.parse(mockResponse);
      
      assert.deepEqual(result.channels, {
        'only-channel': mockState,
      });
    });

    it('should handle multiple channels with groups', async () => {
      const request = new GetPresenceStateRequest({
        ...defaultParameters,
        channels: ['ch1'],
        channelGroups: ['group1'],
      });
      const mockStates = {
        ch1: { status: 'online' },
        'group1-ch1': { status: 'away' },
      };
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        uuid: 'test_uuid',
        payload: mockStates,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.channels, mockStates);
    });
  });
});
