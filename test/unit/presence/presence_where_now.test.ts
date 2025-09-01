import assert from 'assert';

import { TransportResponse } from '../../../src/core/types/transport-response';
import { WhereNowRequest } from '../../../src/core/endpoints/presence/where_now';
import { KeySet } from '../../../src/core/types/api';
import * as Presence from '../../../src/core/types/api/presence';
import RequestOperation from '../../../src/core/constants/operations';

import { createMockResponse } from '../test-utils';

describe('WhereNowRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: Required<Presence.WhereNowParameters> & { keySet: KeySet };

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
      const request = new WhereNowRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should pass validation with valid parameters', () => {
      const request = new WhereNowRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return correct operation type', () => {
      const request = new WhereNowRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNWhereNowOperation);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path with UUID', () => {
      const request = new WhereNowRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/uuid/test_uuid`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in UUID', () => {
      const request = new WhereNowRequest({
        ...defaultParameters,
        uuid: 'test#uuid@123',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/uuid/test%23uuid%40123`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle empty UUID', () => {
      const request = new WhereNowRequest({
        ...defaultParameters,
        uuid: '',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/uuid/`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should handle UUID with spaces', () => {
      const request = new WhereNowRequest({
        ...defaultParameters,
        uuid: 'test uuid with spaces',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/uuid/test%20uuid%20with%20spaces`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('response parsing', () => {
    it('should parse response with channels', async () => {
      const request = new WhereNowRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: { channels: ['channel1', 'channel2'] },
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      assert.deepEqual(result.channels, ['channel1', 'channel2']);
    });

    it('should handle empty payload', async () => {
      const request = new WhereNowRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      assert.deepEqual(result.channels, []);
    });

    it('should handle payload without channels', async () => {
      const request = new WhereNowRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: {},
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      assert.deepEqual(result.channels, []);
    });

    it('should handle single channel', async () => {
      const request = new WhereNowRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: { channels: ['single-channel'] },
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      assert.deepEqual(result.channels, ['single-channel']);
      assert.equal(result.channels.length, 1);
    });

    it('should handle many channels', async () => {
      const request = new WhereNowRequest(defaultParameters);
      const manyChannels = Array.from({ length: 100 }, (_, i) => `channel-${i}`);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: { channels: manyChannels },
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      assert.deepEqual(result.channels, manyChannels);
      assert.equal(result.channels.length, 100);
    });
  });

  describe('query parameters', () => {
    it('should not include any query parameters by default', () => {
      const request = new WhereNowRequest(defaultParameters);
      const transportRequest = request.request();
      assert.deepEqual(transportRequest.queryParameters, {});
    });
  });
});
