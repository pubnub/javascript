/* global describe, it, beforeEach */

import assert from 'assert';
import { BasePushNotificationChannelsRequest } from '../../../src/core/endpoints/push/push';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import { TransportMethod } from '../../../src/core/types/transport-request';
import { createMockResponse } from '../test-utils';

// Concrete implementation for testing the abstract base class
class TestPushNotificationRequest extends BasePushNotificationChannelsRequest<any, any> {
  constructor(parameters: any) {
    super(parameters);
  }

  operation(): RequestOperation {
    return RequestOperation.PNAddPushNotificationEnabledChannelsOperation;
  }

  async parse(response: any): Promise<any> {
    return this.deserializeResponse(response);
  }
}

describe('BasePushNotificationChannelsRequest', () => {
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
      action: 'add',
    };
  });

  describe('validation', () => {
    it('should validate required subscribeKey', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should validate missing subscribeKey', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: undefined },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should validate required device', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        device: '',
      });
      assert.equal(request.validate(), 'Missing Device ID (device)');
    });

    it('should validate missing device', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        device: undefined,
      });
      assert.equal(request.validate(), 'Missing Device ID (device)');
    });

    it('should validate required channels for add action', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'add',
        channels: [],
      });
      assert.equal(request.validate(), 'Missing Channels');
    });

    it('should validate required channels for remove action', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'remove',
        channels: [],
      });
      assert.equal(request.validate(), 'Missing Channels');
    });

    it('should not validate channels for list action', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'list',
        channels: undefined,
      });
      assert.equal(request.validate(), undefined);
    });

    it('should not validate channels for remove-device action', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'remove-device',
        channels: undefined,
      });
      assert.equal(request.validate(), undefined);
    });

    it('should validate required pushGateway', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: undefined,
      });
      assert.equal(request.validate(), 'Missing GW Type (pushGateway: gcm or apns2)');
    });

    it('should validate missing pushGateway', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: '',
      });
      assert.equal(request.validate(), 'Missing GW Type (pushGateway: gcm or apns2)');
    });

    it('should validate APNS2 topic when using apns2', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: undefined,
      });
      assert.equal(request.validate(), 'Missing APNS2 topic');
    });

    it('should validate missing APNS2 topic', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: '',
      });
      assert.equal(request.validate(), 'Missing APNS2 topic');
    });

    it('should pass validation with valid GCM parameters', () => {
      const request = new TestPushNotificationRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation for APNS2 with topic', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      assert.equal(request.validate(), undefined);
    });
  });

  describe('path construction', () => {
    it('should construct base path for GCM', () => {
      const request = new TestPushNotificationRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v1/push/sub-key/${defaultKeySet.subscribeKey}/devices/${defaultParameters.device}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct base path for APNS2', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/push/sub-key/${defaultKeySet.subscribeKey}/devices-apns2/${defaultParameters.device}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should append /remove for remove-device action', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'remove-device',
      });
      const transportRequest = request.request();
      const expectedPath = `/v1/push/sub-key/${defaultKeySet.subscribeKey}/devices/${defaultParameters.device}/remove`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should append /remove for remove-device action with APNS2', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
        action: 'remove-device',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/push/sub-key/${defaultKeySet.subscribeKey}/devices-apns2/${defaultParameters.device}/remove`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('query parameters', () => {
    it('should include type parameter for GCM', () => {
      const request = new TestPushNotificationRequest(defaultParameters);
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.type, 'gcm');
    });

    it('should include type parameter for APNS2', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.type, 'apns2');
    });

    it('should include channels for add action', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'add',
        channels: ['ch1', 'ch2'],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.add, 'ch1,ch2');
      assert.equal(transportRequest.queryParameters?.remove, undefined);
    });

    it('should include channels for remove action', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'remove',
        channels: ['ch1', 'ch2'],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.remove, 'ch1,ch2');
      assert.equal(transportRequest.queryParameters?.add, undefined);
    });

    it('should not include channels for list action', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'list',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.add, undefined);
      assert.equal(transportRequest.queryParameters?.remove, undefined);
    });

    it('should not include channels for remove-device action', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'remove-device',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.add, undefined);
      assert.equal(transportRequest.queryParameters?.remove, undefined);
    });

    it('should include APNS2 environment and topic', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
        environment: 'production',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, 'production');
      assert.equal(transportRequest.queryParameters?.topic, 'com.test.app');
    });

    it('should default APNS2 environment to development', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, 'development');
    });

    it('should not include environment for GCM', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'gcm',
        environment: 'production',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.environment, undefined);
    });

    it('should include start parameter when provided', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        start: 'start_token',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.start, 'start_token');
    });

    it('should not include start parameter when empty', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        start: '',
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.start, undefined);
    });

    it('should include count parameter when provided and positive', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        count: 50,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, 50);
    });

    it('should not include count parameter when zero', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        count: 0,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, undefined);
    });

    it('should not include count parameter when negative', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        count: -5,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, undefined);
    });
  });

  describe('count limits', () => {
    it('should limit count to maximum value', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        count: 2000, // Exceeds MAX_COUNT of 1000
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, 1000);
    });

    it('should preserve count when within limits', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        count: 500,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, 500);
    });

    it('should set count to maximum when exactly at limit', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        count: 1000,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.count, 1000);
    });
  });

  describe('environment handling', () => {
    it('should apply development environment default for APNS2', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
        // No environment specified
      });
      
      // Check that environment is set in parameters after construction
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.environment, 'development');
    });

    it('should preserve explicit environment for APNS2', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
        environment: 'production',
      });
      
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.environment, 'production');
    });

    it('should not apply environment default for GCM', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'gcm',
        // No environment specified
      });
      
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.environment, undefined);
    });
  });

  describe('request method', () => {
    it('should use GET method', () => {
      const request = new TestPushNotificationRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);
    });
  });

  describe('channel formatting', () => {
    it('should format single channel', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'add',
        channels: ['single_channel'],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.add, 'single_channel');
    });

    it('should format multiple channels with commas', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'add',
        channels: ['ch1', 'ch2', 'ch3'],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.add, 'ch1,ch2,ch3');
    });

    it('should handle empty channel names in array', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        action: 'add',
        channels: ['', 'valid_channel', ''],
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.add, ',valid_channel,');
    });
  });

  describe('abstract method requirements', () => {
    it('should throw error when operation() is not overridden in base class', () => {
      class IncompleteRequest extends BasePushNotificationChannelsRequest<any, any> {
        constructor(parameters: any) {
          super(parameters);
        }
        // Missing operation() implementation
      }

      const request = new IncompleteRequest(defaultParameters);
      assert.throws(() => request.operation(), /Should be implemented in subclass/);
    });
  });

  describe('response deserialization', () => {
    it('should deserialize valid response', async () => {
      const request = new TestPushNotificationRequest(defaultParameters);
      const mockResponse = createMockResponse([1, 'Success', 'Extra']);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, [1, 'Success', 'Extra']);
    });

    it('should handle error response', async () => {
      const request = new TestPushNotificationRequest(defaultParameters);
      const mockResponse = createMockResponse([0, 'Error Message']);
      
      const result = await request.parse(mockResponse);
      assert.deepEqual(result, [0, 'Error Message']);
    });
  });

  describe('parameter combinations', () => {
    it('should handle all parameters together', () => {
      const request = new TestPushNotificationRequest({
        ...defaultParameters,
        pushGateway: 'apns2',
        topic: 'com.test.app',
        environment: 'production',
        action: 'add',
        channels: ['ch1', 'ch2'],
        start: 'start_token',
        count: 100,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.queryParameters?.type, 'apns2');
      assert.equal(transportRequest.queryParameters?.topic, 'com.test.app');
      assert.equal(transportRequest.queryParameters?.environment, 'production');
      assert.equal(transportRequest.queryParameters?.add, 'ch1,ch2');
      assert.equal(transportRequest.queryParameters?.start, 'start_token');
      assert.equal(transportRequest.queryParameters?.count, 100);
    });
  });
});
