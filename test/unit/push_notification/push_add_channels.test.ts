/* global describe, it, beforeEach */

import assert from 'assert';
import { AddDevicePushNotificationChannelsRequest } from '../../../src/core/endpoints/push/add_push_channels';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import { TransportMethod } from '../../../src/core/types/transport-request';
import { createMockResponse } from '../test-utils';

describe('AddDevicePushNotificationChannelsRequest', () => {
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
      channels: ['channel1', 'channel2'],
      keySet: defaultKeySet,
    };
  });

  describe('validation', () => {
    it('should validate required subscribeKey', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should validate required device', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        device: '',
      });
      assert.equal(request.validate(), 'Missing Device ID (device)');
    });

    it('should validate required channels', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        channels: [],
      });
      assert.equal(request.validate(), 'Missing Channels');
    });

    it('should validate required pushGateway', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: undefined,
      });
      assert.equal(request.validate(), 'Missing GW Type (pushGateway: fcm or apns2)');
    });

    it('should validate APNS2 topic when using apns2', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: undefined,
      });
      assert.equal(request.validate(), 'Missing APNS2 topic');
    });

    it('should pass validation with valid parameters', () => {
      const request = new AddDevicePushNotificationChannelsRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation for APNS2 with topic', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return PNAddPushNotificationEnabledChannelsOperation', () => {
      const request = new AddDevicePushNotificationChannelsRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNAddPushNotificationEnabledChannelsOperation);
    });
  });

  describe('path construction', () => {
    it('should construct path for FCM', () => {
      const request = new AddDevicePushNotificationChannelsRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v1/push/sub-key/${defaultKeySet.subscribeKey}/devices/${defaultParameters.device}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct path for APNS2', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
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
      const request = new AddDevicePushNotificationChannelsRequest(defaultParameters);
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.type, 'fcm');
      assert.equal(transportRequest.queryParameters?.add, 'channel1,channel2');
      assert.equal(transportRequest.queryParameters?.environment, undefined);
      assert.equal(transportRequest.queryParameters?.topic, undefined);
    });

    it('should include environment and topic for APNS2', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
        environment: 'production',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.type, 'apns2');
      assert.equal(transportRequest.queryParameters?.add, 'channel1,channel2');
      assert.equal(transportRequest.queryParameters?.environment, 'production');
      assert.equal(transportRequest.queryParameters?.topic, 'com.test.app');
    });

    it('should default APNS2 environment to development', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, 'development');
    });

    it('should include start and count parameters when provided', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        start: 'start_token',
        count: 50,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.start, 'start_token');
      assert.equal(transportRequest.queryParameters?.count, 50);
    });

    it('should limit count to maximum value', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        count: 2000, // Exceeds MAX_COUNT of 1000
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, 1000);
    });
  });

  describe('request method', () => {
    it('should use GET method', () => {
      const request = new AddDevicePushNotificationChannelsRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);
    });
  });

  describe('response parsing', () => {
    it('should parse successful response', async () => {
      const request = new AddDevicePushNotificationChannelsRequest(defaultParameters);
      const mockResponse = createMockResponse([1, 'Modified Channels']);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, {});
    });

    it('should parse error response', async () => {
      const request = new AddDevicePushNotificationChannelsRequest(defaultParameters);
      const mockResponse = createMockResponse([0, 'Error Message']);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, {});
    });
  });

  describe('channel handling', () => {
    it('should handle single channel', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        channels: ['single_channel'],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.add, 'single_channel');
    });

    it('should handle multiple channels', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        channels: ['ch1', 'ch2', 'ch3'],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.add, 'ch1,ch2,ch3');
    });

    it('should handle channels with special characters', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        channels: ['channel-1', 'channel_2', 'channel.3'],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.add, 'channel-1,channel_2,channel.3');
    });
  });

  describe('device handling', () => {
    it('should handle device ID with special characters', () => {
      const deviceId = 'device-123_abc.def';
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        device: deviceId,
      });
      const transportRequest = request.request();
      
      assert(transportRequest.path.includes(deviceId));
    });
  });

  describe('environment defaults', () => {
    it('should not set environment for GCM', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'fcm',
        environment: 'production', // Should be ignored for GCM
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, undefined);
    });
  });

  describe('error conditions', () => {
    it('should handle missing channels array', () => {
      const { channels, ...parametersWithoutChannels } = defaultParameters;
      const request = new AddDevicePushNotificationChannelsRequest(parametersWithoutChannels);
      assert.equal(request.validate(), 'Missing Channels');
    });

    it('should handle invalid pushGateway', () => {
      const request = new AddDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'invalid_gateway' as any,
      });
      // Should still validate since base validation only checks for presence
      assert.equal(request.validate(), undefined);
    });
  });
});
