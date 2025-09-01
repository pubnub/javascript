import assert from 'assert';

import { TransportResponse } from '../../../src/core/types/transport-response';
import { SetPresenceStateRequest } from '../../../src/core/endpoints/presence/set_state';
import { KeySet, Payload } from '../../../src/core/types/api';
import * as Presence from '../../../src/core/types/api/presence';
import RequestOperation from '../../../src/core/constants/operations';
import { createMockResponse } from '../test-utils';

describe('SetPresenceStateRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: Presence.SetPresenceStateParameters & { uuid: string; keySet: KeySet };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };
    defaultParameters = {
      uuid: 'test_uuid',
      state: { status: 'online' },
      channels: ['channel1'],
      keySet: defaultKeySet,
    };
  });

  describe('validation', () => {
    it('should validate required subscribeKey', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should validate required state', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        state: undefined as any,
      });
      assert.equal(request.validate(), 'Missing State');
    });

    it('should validate channels or channelGroups required', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channels: [],
        channelGroups: [],
      });
      assert.equal(request.validate(), 'Please provide a list of channels and/or channel-groups');
    });

    it('should validate channels or channelGroups required when undefined', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channels: undefined,
        channelGroups: undefined,
      });
      assert.equal(request.validate(), 'Please provide a list of channels and/or channel-groups');
    });

    it('should pass validation with channels only', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: undefined,
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with channel groups only', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channels: undefined,
        channelGroups: ['group1'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with both channels and groups', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: ['group1'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with empty state object', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        state: {},
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with null state', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        state: null as any,
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with complex state', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        state: {
          user: { name: 'John', age: 30 },
          preferences: { theme: 'dark' },
          activities: ['typing', 'online'],
        },
      });
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return correct operation type', () => {
      const request = new SetPresenceStateRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNSetStateOperation);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path with single channel', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1/uuid/test_uuid/data`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct path for multiple channels', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel1', 'channel2'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1,channel2/uuid/test_uuid/data`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in channel names', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channels: ['channel#1', 'channel@2'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel%231,channel%402/uuid/test_uuid/data`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in UUID', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        uuid: 'test#uuid@123',
        channels: ['channel1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1/uuid/test%23uuid%40123/data`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle empty channels array', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channels: [],
        channelGroups: ['group1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel//uuid/test_uuid/data`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle undefined channels', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channels: undefined,
        channelGroups: ['group1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel//uuid/test_uuid/data`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('query parameters', () => {
    it('should include serialized state', () => {
      const state = { status: 'online', mood: 'happy' };
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        state,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.state, JSON.stringify(state));
    });

    it('should include channel groups when provided', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channelGroups: ['group1', 'group2'],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'group1,group2');
      assert.equal(transportRequest.queryParameters?.state, JSON.stringify(defaultParameters.state));
    });

    it('should not include channel-group when empty', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        channelGroups: [],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.['channel-group'], undefined);
    });

    it('should handle single channel group', () => {
      const request = new SetPresenceStateRequest({
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
          details: {
            age: 25,
            location: 'NYC',
          },
        },
        preferences: {
          notifications: true,
          theme: 'dark',
        },
        activities: ['typing', 'online'],
        metadata: null,
        timestamp: 1234567890,
      };
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        state: complexState,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.state, JSON.stringify(complexState));
    });

    it('should serialize null state', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        state: null as any,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.state, 'null');
    });

    it('should serialize empty state object', () => {
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        state: {},
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.state, '{}');
    });

    it('should combine state and channel groups', () => {
      const state = { active: true };
      const request = new SetPresenceStateRequest({
        ...defaultParameters,
        state,
        channelGroups: ['cg1', 'cg2'],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.state, JSON.stringify(state));
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'cg1,cg2');
    });
  });

  describe('response parsing', () => {
    it('should parse successful response', async () => {
      const request = new SetPresenceStateRequest(defaultParameters);
      const returnedState = { status: 'online', updated: true };
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: returnedState,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.state, returnedState);
    });

    it('should handle empty payload response', async () => {
      const request = new SetPresenceStateRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: {},
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.state, {});
    });

    it('should handle null payload response', async () => {
      const request = new SetPresenceStateRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: null,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.state, null);
    });

    it('should handle complex payload response', async () => {
      const request = new SetPresenceStateRequest(defaultParameters);
      const complexState = {
        user: {
          name: 'Bob',
          profile: {
            avatar: 'url',
            status: 'premium',
          },
        },
        settings: {
          privacy: 'public',
          notifications: {
            email: true,
            push: false,
          },
        },
        lastActivity: {
          action: 'message_sent',
          timestamp: 1234567890,
          channel: 'general',
        },
        metadata: ['tag1', 'tag2'],
      };
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: complexState,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.state, complexState);
    });

    it('should handle array payload response', async () => {
      const request = new SetPresenceStateRequest(defaultParameters);
      const arrayState = ['active', 'typing', 'away'];
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: arrayState,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.state, arrayState);
    });

    it('should handle string payload response', async () => {
      const request = new SetPresenceStateRequest(defaultParameters);
      const stringState = 'online';
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: stringState,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.state, stringState);
    });

    it('should handle number payload response', async () => {
      const request = new SetPresenceStateRequest(defaultParameters);
      const numberState = 42;
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: numberState,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.state, numberState);
    });

    it('should handle boolean payload response', async () => {
      const request = new SetPresenceStateRequest(defaultParameters);
      const booleanState = true;
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: booleanState,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.state, booleanState);
    });
  });
});
