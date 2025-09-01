import assert from 'assert';

import { TransportResponse } from '../../../src/core/types/transport-response';
import { HereNowRequest } from '../../../src/core/endpoints/presence/here_now';
import { KeySet, Payload } from '../../../src/core/types/api';
import * as Presence from '../../../src/core/types/api/presence';
import RequestOperation from '../../../src/core/constants/operations';
import { createMockResponse } from '../test-utils';

describe('HereNowRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: Presence.HereNowParameters & { keySet: KeySet };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };
    defaultParameters = {
      keySet: defaultKeySet,
    };
  });

  describe('validation', () => {
    it('should validate required subscribeKey', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(request.validate(), 'Missing Subscribe Key');
    });

    it('should pass validation with minimal parameters', () => {
      const request = new HereNowRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with channels', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: ['channel1', 'channel2'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with channel groups', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channelGroups: ['group1', 'group2'],
      });
      assert.equal(request.validate(), undefined);
    });

    it('should pass validation with both channels and groups', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: ['group1'],
      });
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return PNGlobalHereNowOperation for empty channels/groups', () => {
      const request = new HereNowRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNGlobalHereNowOperation);
    });

    it('should return PNGlobalHereNowOperation for empty arrays', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: [],
        channelGroups: [],
      });
      assert.equal(request.operation(), RequestOperation.PNGlobalHereNowOperation);
    });

    it('should return PNHereNowOperation for specific channels', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: ['channel1'],
      });
      assert.equal(request.operation(), RequestOperation.PNHereNowOperation);
    });

    it('should return PNHereNowOperation for specific channel groups', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channelGroups: ['group1'],
      });
      assert.equal(request.operation(), RequestOperation.PNHereNowOperation);
    });

    it('should return PNHereNowOperation for both channels and groups', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: ['channel1'],
        channelGroups: ['group1'],
      });
      assert.equal(request.operation(), RequestOperation.PNHereNowOperation);
    });
  });

  describe('URL construction', () => {
    it('should construct global here now path', () => {
      const request = new HereNowRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct path for single channel', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: ['channel1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct path for multiple channels', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: ['channel1', 'channel2'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel1,channel2`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in channel names', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: ['channel#1', 'channel@2'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/channel%231,channel%402`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct path for channel groups only', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channelGroups: ['group1'],
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/presence/sub-key/${defaultKeySet.subscribeKey}/channel/`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('query parameters', () => {
    it('should include includeUUIDs=true by default', () => {
      const request = new HereNowRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.disable_uuids, undefined);
    });

    it('should set disable_uuids when includeUUIDs is false', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        includeUUIDs: false,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.disable_uuids, '1');
    });

    it('should include state when includeState is true', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        includeState: true,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.state, '1');
    });

    it('should include channel groups in query', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channelGroups: ['group1', 'group2'],
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'group1,group2');
    });

    it('should include custom query parameters', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        queryParameters: { custom: 'value', test: 'param' },
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.custom, 'value');
      assert.equal(transportRequest.queryParameters?.test, 'param');
    });

    it('should combine all query parameters', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        includeUUIDs: false,
        includeState: true,
        channelGroups: ['group1'],
        queryParameters: { custom: 'value' },
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.disable_uuids, '1');
      assert.equal(transportRequest.queryParameters?.state, '1');
      assert.equal(transportRequest.queryParameters?.['channel-group'], 'group1');
      assert.equal(transportRequest.queryParameters?.custom, 'value');
    });
  });

  describe('response parsing', () => {
    it('should parse single channel response', async () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: ['channel1'],
      });
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        uuids: ['uuid1', 'uuid2'],
        occupancy: 2,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.equal(result.totalChannels, 1);
      assert.equal(result.totalOccupancy, 2);
      assert.deepEqual(result.channels, {
        channel1: {
          name: 'channel1',
          occupancy: 2,
          occupants: [
            { uuid: 'uuid1', state: null },
            { uuid: 'uuid2', state: null },
          ],
        },
      });
    });

    it('should parse single channel response without uuids', async () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: ['channel1'],
        includeUUIDs: false,
      });
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        occupancy: 2,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.equal(result.totalChannels, 1);
      assert.equal(result.totalOccupancy, 2);
      assert.deepEqual(result.channels, {
        channel1: {
          name: 'channel1',
          occupancy: 2,
          occupants: [],
        },
      });
    });

    it('should parse multiple channels response', async () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: ['ch1', 'ch2'],
      });
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: {
          total_channels: 2,
          total_occupancy: 3,
          channels: {
            ch1: { uuids: ['uuid1'], occupancy: 1 },
            ch2: { uuids: ['uuid2', 'uuid3'], occupancy: 2 },
          },
        },
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.equal(result.totalChannels, 2);
      assert.equal(result.totalOccupancy, 3);
      assert.deepEqual(result.channels, {
        ch1: {
          name: 'ch1',
          occupancy: 1,
          occupants: [{ uuid: 'uuid1', state: null }],
        },
        ch2: {
          name: 'ch2',
          occupancy: 2,
          occupants: [
            { uuid: 'uuid2', state: null },
            { uuid: 'uuid3', state: null },
          ],
        },
      });
    });

    it('should parse response with state data', async () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        channels: ['channel1'],
        includeState: true,
      });
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        uuids: [
          'uuid1',
          { uuid: 'uuid2', state: { status: 'online' } },
        ],
        occupancy: 2,
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.deepEqual(result.channels, {
        channel1: {
          name: 'channel1',
          occupancy: 2,
          occupants: [
            { uuid: 'uuid1', state: null },
            { uuid: 'uuid2', state: { status: 'online' } },
          ],
        },
      });
    });

    it('should handle empty channels response', async () => {
      const request = new HereNowRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: {
          total_channels: 0,
          total_occupancy: 0,
          channels: {},
        },
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.equal(result.totalChannels, 0);
      assert.equal(result.totalOccupancy, 0);
      assert.deepEqual(result.channels, {});
    });

    it('should handle response without payload channels', async () => {
      const request = new HereNowRequest(defaultParameters);
      const mockResponse = createMockResponse({
        status: 200,
        message: 'OK',
        payload: {
          total_channels: 0,
          total_occupancy: 0,
        },
        service: 'Presence',
      });
      const result = await request.parse(mockResponse);
      
      assert.equal(result.totalChannels, 0);
      assert.equal(result.totalOccupancy, 0);
      assert.deepEqual(result.channels, {});
    });
  });

  describe('defaults handling', () => {
    it('should apply default values for includeUUIDs and includeState', () => {
      const request = new HereNowRequest(defaultParameters);
      // Access private field for testing - this validates the defaults are applied
      const params = (request as any).parameters;
      assert.equal(params.includeUUIDs, true);
      assert.equal(params.includeState, false);
    });

    it('should preserve custom values over defaults', () => {
      const request = new HereNowRequest({
        ...defaultParameters,
        includeUUIDs: false,
        includeState: true,
      });
      const params = (request as any).parameters;
      assert.equal(params.includeUUIDs, false);
      assert.equal(params.includeState, true);
    });

    it('should initialize empty queryParameters if not provided', () => {
      const request = new HereNowRequest(defaultParameters);
      const params = (request as any).parameters;
      assert.deepEqual(params.queryParameters, {});
    });
  });
});
