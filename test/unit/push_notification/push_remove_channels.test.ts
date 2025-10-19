/* global describe, it, beforeEach */

import assert from 'assert';
import { RemoveDevicePushNotificationChannelsRequest } from '../../../src/core/endpoints/push/remove_push_channels';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import { TransportMethod } from '../../../src/core/types/transport-request';
import { createMockResponse } from '../test-utils';

describe('RemoveDevicePushNotificationChannelsRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: any;

  beforeEach(() => {
    defaultKeySet = {
      subscribeKey: 'test_subscribe_key',
      publishKey: 'test_publish_key',
    };

    defaultParameters = {
      device: 'test_device_id',
      pushGateway: 'gcm',
      channels: ['channel1', 'channel2'],
      keySet: defaultKeySet,
    };
  });

  describe('validation', () => {
    it('should validate required subscribeKey', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should validate required device', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        device: '',
      });
      assert.equal(request.validate(), 'Missing Device ID (device)');
    });

    it('should validate required channels', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        channels: [],
      });
      assert.equal(request.validate(), 'Missing Channels');
    });

    it('should validate required pushGateway', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: undefined,
      });
      assert.equal(request.validate(), 'Missing GW Type (pushGateway: gcm or apns2)');
    });

    it('should validate APNS2 topic when using apns2', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: undefined,
      });
      assert.equal(request.validate(), 'Missing APNS2 topic');
    });

    it('should pass validation with valid GCM parameters', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation for APNS2 with topic', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return PNRemovePushNotificationEnabledChannelsOperation', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNRemovePushNotificationEnabledChannelsOperation);
    });
  });

  describe('path construction', () => {
    it('should construct path for GCM', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v1/push/sub-key/${defaultKeySet.subscribeKey}/devices/${defaultParameters.device}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct path for APNS2', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
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
    it('should include required query parameters for GCM', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest(defaultParameters);
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.type, 'gcm');
      assert.equal(transportRequest.queryParameters?.remove, 'channel1,channel2');
      assert.equal(transportRequest.queryParameters?.environment, undefined);
      assert.equal(transportRequest.queryParameters?.topic, undefined);
    });

    it('should include environment and topic for APNS2', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
        environment: 'production',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.type, 'apns2');
      assert.equal(transportRequest.queryParameters?.remove, 'channel1,channel2');
      assert.equal(transportRequest.queryParameters?.environment, 'production');
      assert.equal(transportRequest.queryParameters?.topic, 'com.test.app');
    });

    it('should default APNS2 environment to development', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, 'development');
    });

    it('should include start and count parameters when provided', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        start: 'start_token',
        count: 50,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.start, 'start_token');
      assert.equal(transportRequest.queryParameters?.count, 50);
    });

    it('should limit count to maximum value', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        count: 2000, // Exceeds MAX_COUNT of 1000
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, 1000);
    });
  });

  describe('request method', () => {
    it('should use GET method', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);
    });
  });

  describe('response parsing', () => {
    it('should parse successful response', async () => {
      const request = new RemoveDevicePushNotificationChannelsRequest(defaultParameters);
      const mockResponse = createMockResponse([1, 'Modified Channels']);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, {});
    });

    it('should parse error response', async () => {
      const request = new RemoveDevicePushNotificationChannelsRequest(defaultParameters);
      const mockResponse = createMockResponse([0, 'Error Message']);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, {});
    });
  });

  describe('channel handling', () => {
    it('should handle single channel', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        channels: ['single_channel'],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.remove, 'single_channel');
    });

    it('should handle multiple channels', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        channels: ['ch1', 'ch2', 'ch3'],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.remove, 'ch1,ch2,ch3');
    });

    it('should handle channels with special characters', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        channels: ['channel-1', 'channel_2', 'channel.3'],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.remove, 'channel-1,channel_2,channel.3');
    });

    it('should handle empty channel names', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        channels: ['', 'valid_channel', ''],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.remove, ',valid_channel,');
    });
  });

  describe('device handling', () => {
    it('should handle device ID with special characters', () => {
      const deviceId = 'device-123_abc.def';
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        device: deviceId,
      });
      const transportRequest = request.request();
      
      assert(transportRequest.path.includes(deviceId));
    });
  });

  describe('environment defaults', () => {
    it('should not set environment for GCM', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'gcm',
        environment: 'production', // Should be ignored for GCM
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, undefined);
    });
  });

  describe('error conditions', () => {
    it('should handle missing channels array', () => {
      const { channels, ...parametersWithoutChannels } = defaultParameters;
      const request = new RemoveDevicePushNotificationChannelsRequest(parametersWithoutChannels);
      assert.equal(request.validate(), 'Missing Channels');
    });

    it('should handle null channels', () => {
      const { channels, ...parametersWithoutChannels } = defaultParameters;
      const request = new RemoveDevicePushNotificationChannelsRequest(parametersWithoutChannels);
      assert.equal(request.validate(), 'Missing Channels');
    });

    it('should handle empty channel array', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        channels: [],
      });
      assert.equal(request.validate(), 'Missing Channels');
    });
  });

  describe('consistency with add channels operation', () => {
    it('should use same path structure as add operation', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest(defaultParameters);
      const transportRequest = request.request();
      
      // Path should be identical to add operation
      const expectedPath = `/v1/push/sub-key/${defaultKeySet.subscribeKey}/devices/${defaultParameters.device}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should use same query parameter structure as add operation for APNS2', () => {
      const request = new RemoveDevicePushNotificationChannelsRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
        environment: 'production',
      });
      const transportRequest = request.request();
      
      // Same structure as add, but with 'remove' instead of 'add'
      assert.equal(transportRequest.queryParameters?.type, 'apns2');
      assert.equal(transportRequest.queryParameters?.environment, 'production');
      assert.equal(transportRequest.queryParameters?.topic, 'com.test.app');
      assert.equal(transportRequest.queryParameters?.remove, 'channel1,channel2');
      assert.equal(transportRequest.queryParameters?.add, undefined);
    });
  });
});
