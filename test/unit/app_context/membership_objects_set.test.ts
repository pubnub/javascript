/* global describe, it, beforeEach */

import assert from 'assert';
import { SetUUIDMembershipsRequest } from '../../../src/core/endpoints/objects/membership/set';
import { TransportMethod } from '../../../src/core/types/transport-request';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import * as AppContext from '../../../src/core/types/api/app-context';

describe('SetUUIDMembershipsRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: AppContext.SetMembershipsParameters<AppContext.CustomData> & { keySet: KeySet; type: 'set' };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };

    defaultParameters = {
      uuid: 'test_user_uuid',
      channels: ['channel1'],
      type: 'set',
      keySet: defaultKeySet,
    };
  });

  describe('parameter validation', () => {
    it("should return \"'uuid' cannot be empty\" when uuid is empty", () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        uuid: '',
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it('should return "Channels cannot be empty" when channels is empty array', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: [],
      });
      assert.equal(request.validate(), 'Channels cannot be empty');
    });

    it('should return "Channels cannot be empty" when channels is null', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: null as any,
      });
      assert.equal(request.validate(), 'Channels cannot be empty');
    });

    it('should return undefined when required parameters provided', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        uuid: 'test',
        channels: ['channel1'],
      });
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation type', () => {
    it('should return correct operation type', () => {
      const request = new SetUUIDMembershipsRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNSetMembershipsOperation);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path for set operation', () => {
      const request = new SetUUIDMembershipsRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/${defaultParameters.uuid}/channels`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('HTTP method', () => {
    it('should use PATCH method', () => {
      const request = new SetUUIDMembershipsRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.PATCH);
    });
  });

  describe('headers', () => {
    it('should set correct Content-Type header', () => {
      const request = new SetUUIDMembershipsRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.headers?.['Content-Type'], 'application/json');
    });
  });

  describe('request body', () => {
    it('should create proper body for string channels', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: ['channel1', 'channel2'],
        type: 'set',
      });
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      const expectedBody = {
        set: [
          { channel: { id: 'channel1' } },
          { channel: { id: 'channel2' } }
        ]
      };
      
      assert.deepEqual(body, expectedBody);
    });

    it('should create proper body for object channels', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: [{
          id: 'channel1',
          custom: { role: 'admin' },
          status: 'active',
          type: 'member'
        }],
        type: 'set',
      });
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      const expectedBody = {
        set: [{
          channel: { id: 'channel1' },
          status: 'active',
          type: 'member',
          custom: { role: 'admin' }
        }]
      };
      
      assert.deepEqual(body, expectedBody);
    });

    it('should handle mixed string and object channels', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: [
          'channel1',
          { id: 'channel2', status: 'active' }
        ],
        type: 'set',
      });
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      const expectedBody = {
        set: [
          { channel: { id: 'channel1' } },
          { 
            channel: { id: 'channel2' },
            status: 'active'
            // undefined values are omitted by JSON.stringify
          }
        ]
      };
      
      assert.deepEqual(body, expectedBody);
    });
  });

  describe('query parameters', () => {
    it('should include default include flags in query', () => {
      const request = new SetUUIDMembershipsRequest(defaultParameters);
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      
      // Default include flags as per source code
      const includeParam = queryParams?.include as string;
      assert(includeParam?.includes('channel.status'));
      assert(includeParam?.includes('channel.type'));
      assert(includeParam?.includes('status'));
    });

    it('should handle all include options', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        include: {
          customFields: true,
          totalCount: true,
          statusField: true,
          typeField: true,
          channelFields: true,
          customChannelFields: true,
          channelStatusField: true,
          channelTypeField: true,
        },
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      
      // Should contain all include flags
      const includeString = queryParams?.include as string;
      assert(includeString.includes('status'));
      assert(includeString.includes('type'));
      assert(includeString.includes('custom'));
      assert(includeString.includes('channel'));
      assert(includeString.includes('channel.status'));
      assert(includeString.includes('channel.type'));
      assert(includeString.includes('channel.custom'));
    });
  });

  describe('backward compatibility', () => {
    it('should map userId to uuid parameter', () => {
      const request = new SetUUIDMembershipsRequest({
        keySet: defaultKeySet,
        userId: 'test-user-id', // Using userId instead of uuid
        channels: ['channel1'],
        type: 'set',
        // uuid is not provided
      } as any);
      
      // The request should be valid as userId gets mapped to uuid internally
      assert.equal(request.validate(), undefined);
      
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/test-user-id/channels`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('channel object structure', () => {
    it('should preserve custom data in channel objects', () => {
      const customData = {
        role: 'moderator',
        level: 5,
        isActive: true
      };
      
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: [{
          id: 'channel1',
          custom: customData,
          status: 'active',
          type: 'premium'
        }],
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      assert.deepEqual(body.set[0].custom, customData);
      assert.equal(body.set[0].status, 'active');
      assert.equal(body.set[0].type, 'premium');
    });

    it('should handle partial channel objects', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: [
          { id: 'channel1' }, // minimal object
          { id: 'channel2', status: 'inactive' }, // with status only
          { id: 'channel3', custom: { note: 'test' } } // with custom only
        ],
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      // First channel - minimal (undefined values omitted by JSON.stringify)
      assert.deepEqual(body.set[0], {
        channel: { id: 'channel1' }
      });
      
      // Second channel - with status
      assert.deepEqual(body.set[1], {
        channel: { id: 'channel2' },
        status: 'inactive'
      });
      
      // Third channel - with custom
      assert.deepEqual(body.set[2], {
        channel: { id: 'channel3' },
        custom: { note: 'test' }
      });
    });
  });

  describe('large data handling', () => {
    it('should handle large channel lists', () => {
      const channels = Array.from({ length: 100 }, (_, i) => `channel_${i}`);
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels,
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      assert.equal(body.set.length, 100);
      assert.equal(body.set[0].channel.id, 'channel_0');
      assert.equal(body.set[99].channel.id, 'channel_99');
    });

    it('should handle large custom data objects', () => {
      const largeCustomData = {
        description: 'x'.repeat(1000),
        category: 'premium',
        priority: 10,
        isEnabled: true
      };
      
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: [{
          id: 'channel1',
          custom: largeCustomData
        }],
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      assert.deepEqual(body.set[0].custom, largeCustomData);
    });
  });

  describe('query parameter combinations', () => {
    it('should handle pagination parameters', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        page: {
          next: 'nextToken',
          prev: 'prevToken',
        },
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      // Both start and end can be present if both next and prev are provided
      assert.equal(queryParams?.start, 'nextToken');
      assert.equal(queryParams?.end, 'prevToken');
    });

    it('should handle filter and sort parameters', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        filter: 'channel.name like "*test*"',
        sort: { 'channel.updated': 'desc' },
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      assert.equal(queryParams?.filter, 'channel.name like "*test*"');
      const sortArray = queryParams?.sort as string[];
      assert(Array.isArray(sortArray));
      assert(sortArray.includes('channel.updated:desc'));
    });

    it('should handle limit parameter', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        limit: 25,
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      assert.equal(queryParams?.limit, 25);
    });
  });

  describe('edge cases', () => {
    it('should handle channels with special characters in id', () => {
      const specialChannels = [
        'channel#1@domain.com',
        'channel with spaces',
        'channel/with/slashes',
        'channel?with=query&params'
      ];
      
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: specialChannels,
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      specialChannels.forEach((channelId, index) => {
        assert.equal(body.set[index].channel.id, channelId);
      });
    });

    it('should handle uuid with special characters', () => {
      const specialUuid = 'user#1@domain.com';
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        uuid: specialUuid,
      });
      
      const transportRequest = request.request();
      // Should URL encode the uuid in path
      assert(transportRequest.path.includes(encodeURIComponent(specialUuid)));
    });
  });
});
