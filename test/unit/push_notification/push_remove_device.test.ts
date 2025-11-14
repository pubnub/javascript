/* global describe, it, beforeEach */

import assert from 'assert';
import { RemoveDevicePushNotificationRequest } from '../../../src/core/endpoints/push/remove_device';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import { TransportMethod } from '../../../src/core/types/transport-request';
import { createMockResponse } from '../test-utils';

describe('RemoveDevicePushNotificationRequest', () => {
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
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should validate required device', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        device: '',
      });
      assert.equal(request.validate(), 'Missing Device ID (device)');
    });

    it('should validate required pushGateway', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        pushGateway: undefined,
      });
      assert.equal(request.validate(), 'Missing GW Type (pushGateway: fcm or apns2)');
    });

    it('should validate APNS2 topic when using apns2', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: undefined,
      });
      assert.equal(request.validate(), 'Missing APNS2 topic');
    });

    it('should pass validation with valid FCM parameters', () => {
      const request = new RemoveDevicePushNotificationRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation for APNS2 with topic', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      assert.equal(request.validate(), undefined);
    });

    it('should not require channels for remove device operation', () => {
      const request = new RemoveDevicePushNotificationRequest(defaultParameters);
      // Channels are not required for remove device operation
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return PNRemoveAllPushNotificationsOperation', () => {
      const request = new RemoveDevicePushNotificationRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNRemoveAllPushNotificationsOperation);
    });
  });

  describe('path construction', () => {
    it('should construct path for FCM with /remove suffix', () => {
      const request = new RemoveDevicePushNotificationRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v1/push/sub-key/${defaultKeySet.subscribeKey}/devices/${defaultParameters.device}/remove`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct path for APNS2 with /remove suffix', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/push/sub-key/${defaultKeySet.subscribeKey}/devices-apns2/${defaultParameters.device}/remove`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should always include /remove suffix regardless of gateway', () => {
      const fcmRequest = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'fcm',
      });
      const fcmTransportRequest = fcmRequest.request();
      assert(fcmTransportRequest.path.endsWith('/remove'));

      const apnsRequest = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      const apnsTransportRequest = apnsRequest.request();
      assert(apnsTransportRequest.path.endsWith('/remove'));
    });
  });

  describe('query parameters', () => {
    it('should include required query parameters for FCM', () => {
      const request = new RemoveDevicePushNotificationRequest(defaultParameters);
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.type, 'fcm');
      assert.equal(transportRequest.queryParameters?.environment, undefined);
      assert.equal(transportRequest.queryParameters?.topic, undefined);
      assert.equal(transportRequest.queryParameters?.add, undefined);
      assert.equal(transportRequest.queryParameters?.remove, undefined);
    });

    it('should include environment and topic for APNS2', () => {
      const request = new RemoveDevicePushNotificationRequest({
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
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, 'development');
    });

    it('should include start and count parameters when provided', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        start: 'start_token',
        count: 50,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.start, 'start_token');
      assert.equal(transportRequest.queryParameters?.count, 50);
    });

    it('should limit count to maximum value', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        count: 2000, // Exceeds MAX_COUNT of 1000
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, 1000);
    });

    it('should not include channel-related parameters', () => {
      const request = new RemoveDevicePushNotificationRequest(defaultParameters);
      const transportRequest = request.request();
      
      // Remove device should not have add/remove parameters
      assert.equal(transportRequest.queryParameters?.add, undefined);
      assert.equal(transportRequest.queryParameters?.remove, undefined);
    });
  });

  describe('request method', () => {
    it('should use GET method', () => {
      const request = new RemoveDevicePushNotificationRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);
    });
  });

  describe('response parsing', () => {
    it('should parse successful response', async () => {
      const request = new RemoveDevicePushNotificationRequest(defaultParameters);
      const mockResponse = createMockResponse([1, 'Modified Channels']);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, {});
    });

    it('should parse error response', async () => {
      const request = new RemoveDevicePushNotificationRequest(defaultParameters);
      const mockResponse = createMockResponse([0, 'Error Message']);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, {});
    });

    it('should parse response with different status codes', async () => {
      const request = new RemoveDevicePushNotificationRequest(defaultParameters);
      
      // Success case
      const successResponse = createMockResponse([1, 'Success']);
      const successResult = await request.parse(successResponse);
      assert.deepEqual(successResult, {});
      
      // Failure case
      const failureResponse = createMockResponse([0, 'Device not found']);
      const failureResult = await request.parse(failureResponse);
      assert.deepEqual(failureResult, {});
    });
  });

  describe('device handling', () => {
    it('should handle device ID with special characters', () => {
      const deviceId = 'device-123_abc.def';
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        device: deviceId,
      });
      const transportRequest = request.request();
      
      assert(transportRequest.path.includes(deviceId));
      assert(transportRequest.path.endsWith('/remove'));
    });

    it('should handle long device IDs', () => {
      const longDeviceId = 'a'.repeat(200);
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        device: longDeviceId,
      });
      const transportRequest = request.request();
      
      assert(transportRequest.path.includes(longDeviceId));
    });

    it('should handle device ID with URL-encoded characters', () => {
      const deviceId = 'device%20with%20spaces';
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        device: deviceId,
      });
      const transportRequest = request.request();
      
      assert(transportRequest.path.includes(deviceId));
    });
  });

  describe('environment defaults', () => {
    it('should not set environment for FCM', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'fcm',
        environment: 'production', // Should be ignored for FCM
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, undefined);
    });

    it('should set development as default for APNS2', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
        // No environment specified
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, 'development');
    });
  });

  describe('error conditions', () => {
    it('should handle missing device gracefully', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        device: undefined,
      });
      assert.equal(request.validate(), 'Missing Device ID (device)');
    });

    it('should handle null device gracefully', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        device: null as any,
      });
      assert.equal(request.validate(), 'Missing Device ID (device)');
    });

    it('should handle empty string device', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        device: '',
      });
      assert.equal(request.validate(), 'Missing Device ID (device)');
    });
  });

  describe('difference from channel operations', () => {
    it('should use different path suffix than channel operations', () => {
      const request = new RemoveDevicePushNotificationRequest(defaultParameters);
      const transportRequest = request.request();
      
      // Should end with /remove, unlike channel operations
      assert(transportRequest.path.endsWith('/remove'));
      assert(!transportRequest.path.endsWith('/devices/test_device_id'));
    });

    it('should not include channel parameters', () => {
      const request = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        // These should be ignored since this is device removal
        channels: ['channel1', 'channel2'] as any,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.add, undefined);
      assert.equal(transportRequest.queryParameters?.remove, undefined);
    });
  });

  describe('consistency across gateways', () => {
    it('should use consistent structure for both FCM and APNS2', () => {
      const fcmRequest = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'fcm',
      });
      const fcmTransport = fcmRequest.request();

      const apnsRequest = new RemoveDevicePushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      const apnsTransport = apnsRequest.request();

      // Both should end with /remove
      assert(fcmTransport.path.endsWith('/remove'));
      assert(apnsTransport.path.endsWith('/remove'));
      
      // Both should have type parameter
      assert.equal(fcmTransport.queryParameters?.type, 'fcm');
      assert.equal(apnsTransport.queryParameters?.type, 'apns2');
    });
  });
});
