/* global describe, it, beforeEach */

import assert from 'assert';
import { ListDevicePushNotificationChannelsRequest } from '../../../src/core/endpoints/push/list_push_channels';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import { TransportMethod } from '../../../src/core/types/transport-request';
import { createMockResponse } from '../test-utils';

describe('ListDevicePushNotificationChannelsRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: any;

  beforeEach(() => {
    defaultKeySet = {
      subscribeKey: 'test_subscribe_key',
      publishKey: 'test_publish_key',
    };

    defaultParameters = {
      device: 'test_device_id',
      pushGateway: 'fcm',
      keySet: defaultKeySet,
    };
  });

  describe('validation', () => {
    it('should validate required subscribeKey', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should validate required device', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        device: '',
      });
      assert.equal(request.validate(), 'Missing Device ID (device)');
    });

    it('should validate required pushGateway', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: undefined,
      });
      assert.equal(request.validate(), 'Missing GW Type (pushGateway: fcm or apns2)');
    });

    it('should validate APNS2 topic when using apns2', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: undefined,
      });
      assert.equal(request.validate(), 'Missing APNS2 topic');
    });

    it('should pass validation with valid FCM parameters', () => {
      const request = new ListDevicePushNotificationChannelsRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation for APNS2 with topic', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      assert.equal(request.validate(), undefined);
    });

    it('should not require channels for list operation', () => {
      const request = new ListDevicePushNotificationChannelsRequest(defaultParameters);
      // Channels are not required for list operation
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return PNPushNotificationEnabledChannelsOperation', () => {
      const request = new ListDevicePushNotificationChannelsRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNPushNotificationEnabledChannelsOperation);
    });
  });

  describe('path construction', () => {
    it('should construct path for FCM', () => {
      const request = new ListDevicePushNotificationChannelsRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v1/push/sub-key/${defaultKeySet.subscribeKey}/devices/${defaultParameters.device}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct path for APNS2', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/push/sub-key/${defaultKeySet.subscribeKey}/devices-apns2/${defaultParameters.device}`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('query parameters', () => {
    it('should include required query parameters for FCM', () => {
      const request = new ListDevicePushNotificationChannelsRequest(defaultParameters);
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.type, 'fcm');
      assert.equal(transportRequest.queryParameters?.environment, undefined);
      assert.equal(transportRequest.queryParameters?.topic, undefined);
      assert.equal(transportRequest.queryParameters?.add, undefined);
      assert.equal(transportRequest.queryParameters?.remove, undefined);
    });

    it('should include environment and topic for APNS2', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
        environment: 'production',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.type, 'apns2');
      assert.equal(transportRequest.queryParameters?.environment, 'production');
      assert.equal(transportRequest.queryParameters?.topic, 'com.test.app');
    });

    it('should default APNS2 environment to development', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, 'development');
    });

    it('should include start and count parameters when provided', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        start: 'start_token',
        count: 50,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.start, 'start_token');
      assert.equal(transportRequest.queryParameters?.count, 50);
    });

    it('should limit count to maximum value', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        count: 2000, // Exceeds MAX_COUNT of 1000
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, 1000);
    });

    it('should not include count when zero', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        count: 0,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, undefined);
    });

    it('should not include start when empty', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        start: '',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.start, undefined);
    });
  });

  describe('request method', () => {
    it('should use GET method', () => {
      const request = new ListDevicePushNotificationChannelsRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);
    });
  });

  describe('response parsing', () => {
    it('should parse successful response with channels', async () => {
      const request = new ListDevicePushNotificationChannelsRequest(defaultParameters);
      const mockChannels = ['channel1', 'channel2', 'channel3'];
      const mockResponse = createMockResponse(mockChannels);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, { channels: mockChannels });
    });

    it('should parse successful response with empty channels', async () => {
      const request = new ListDevicePushNotificationChannelsRequest(defaultParameters);
      const mockChannels: string[] = [];
      const mockResponse = createMockResponse(mockChannels);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, { channels: mockChannels });
    });

    it('should parse response with single channel', async () => {
      const request = new ListDevicePushNotificationChannelsRequest(defaultParameters);
      const mockChannels = ['single_channel'];
      const mockResponse = createMockResponse(mockChannels);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, { channels: mockChannels });
    });

    it('should parse response with channels containing special characters', async () => {
      const request = new ListDevicePushNotificationChannelsRequest(defaultParameters);
      const mockChannels = ['channel-1', 'channel_2', 'channel.3'];
      const mockResponse = createMockResponse(mockChannels);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, { channels: mockChannels });
    });
  });

  describe('device handling', () => {
    it('should handle device ID with special characters', () => {
      const deviceId = 'device-123_abc.def';
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        device: deviceId,
      });
      const transportRequest = request.request();
      
      assert(transportRequest.path.includes(deviceId));
    });

    it('should handle long device IDs', () => {
      const longDeviceId = 'a'.repeat(200);
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        device: longDeviceId,
      });
      const transportRequest = request.request();
      
      assert(transportRequest.path.includes(longDeviceId));
    });
  });

  describe('pagination', () => {
    it('should handle pagination parameters', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        start: 'pagination_start_token',
        count: 100,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.start, 'pagination_start_token');
      assert.equal(transportRequest.queryParameters?.count, 100);
    });

    it('should handle maximum count limit', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        count: 1500, // Above 1000 limit
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, 1000);
    });
  });

  describe('environment defaults', () => {
    it('should not set environment for FCM', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'fcm',
        environment: 'production', // Should be ignored for FCM
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, undefined);
    });
  });

  describe('error conditions', () => {
    it('should handle missing device gracefully', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        device: undefined,
      });
      assert.equal(request.validate(), 'Missing Device ID (device)');
    });

    it('should handle null device gracefully', () => {
      const request = new ListDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        device: null as any,
      });
      assert.equal(request.validate(), 'Missing Device ID (device)');
    });
  });
});
