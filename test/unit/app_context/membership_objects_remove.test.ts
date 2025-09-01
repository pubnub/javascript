/* global describe, it, beforeEach */

import assert from 'assert';
import { SetUUIDMembershipsRequest } from '../../../src/core/endpoints/objects/membership/set';
import { TransportMethod } from '../../../src/core/types/transport-request';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import * as AppContext from '../../../src/core/types/api/app-context';

describe('SetUUIDMembershipsRequest (Remove Operation)', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: AppContext.SetMembershipsParameters<AppContext.CustomData> & { keySet: KeySet; type: 'delete' };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };

    defaultParameters = {
      uuid: 'test_user_uuid',
      channels: ['channel1'],
      type: 'delete',
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
    it('should construct correct path for remove operation', () => {
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
    it('should create proper body for remove operation', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: ['channel1', 'channel2'],
        type: 'delete',
      });
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      const expectedBody = {
        delete: [
          { channel: { id: 'channel1' } },
          { channel: { id: 'channel2' } }
        ]
      };
      
      assert.deepEqual(body, expectedBody);
    });

    it('should create proper body for object channels in remove operation', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: [{
          id: 'channel1',
          custom: { role: 'admin' },
          status: 'active',
          type: 'member'
        }],
        type: 'delete',
      });
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      const expectedBody = {
        delete: [{
          channel: { id: 'channel1' },
          status: 'active',
          type: 'member',
          custom: { role: 'admin' }
        }]
      };
      
      assert.deepEqual(body, expectedBody);
    });

    it('should handle mixed string and object channels for delete', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: [
          'channel1',
          { id: 'channel2', status: 'active' }
        ],
        type: 'delete',
      });
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      const expectedBody = {
        delete: [
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

  describe('backward compatibility', () => {
    it('should map userId to uuid parameter', () => {
      const request = new SetUUIDMembershipsRequest({
        keySet: defaultKeySet,
        userId: 'test-user-id', // Using userId instead of uuid
        channels: ['channel1'],
        type: 'delete',
        // uuid is not provided
      } as any);
      
      // The request should be valid as userId gets mapped to uuid internally
      assert.equal(request.validate(), undefined);
      
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/test-user-id/channels`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('remove operation specifics', () => {
    it('should use delete key in request body', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: ['channel1', 'channel2', 'channel3'],
        type: 'delete',
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      assert(body.hasOwnProperty('delete'));
      assert(!body.hasOwnProperty('set'));
      assert.equal(body.delete.length, 3);
    });

    it('should handle single channel removal', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: ['single-channel'],
        type: 'delete',
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      assert.equal(body.delete.length, 1);
      assert.equal(body.delete[0].channel.id, 'single-channel');
    });

    it('should handle bulk channel removal', () => {
      const channels = Array.from({ length: 50 }, (_, i) => `channel_${i}`);
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels,
        type: 'delete',
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      assert.equal(body.delete.length, 50);
      channels.forEach((channel, index) => {
        assert.equal(body.delete[index].channel.id, channel);
      });
    });
  });

  describe('query parameters for delete operation', () => {
    it('should include default include flags', () => {
      const request = new SetUUIDMembershipsRequest(defaultParameters);
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      
      // Default include flags as per source code
      const includeParam = queryParams?.include as string;
      assert(includeParam?.includes('channel.status'));
      assert(includeParam?.includes('channel.type'));
      assert(includeParam?.includes('status'));
    });

    it('should handle pagination parameters with delete', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        page: {
          next: 'nextToken',
        },
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      assert.equal(queryParams?.start, 'nextToken');
    });

    it('should handle include options with delete', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        include: {
          customFields: true,
          channelFields: true,
          totalCount: true,
        },
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      
      const includeString = queryParams?.include as string;
      assert(includeString.includes('custom'));
      assert(includeString.includes('channel'));
      assert.equal(queryParams?.count, 'true');
    });
  });

  describe('channel removal edge cases', () => {
    it('should handle channels with special characters', () => {
      const specialChannels = [
        'channel#1@domain.com',
        'channel with spaces',
        'channel/with/slashes',
      ];
      
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: specialChannels,
        type: 'delete',
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      specialChannels.forEach((channelId, index) => {
        assert.equal(body.delete[index].channel.id, channelId);
      });
    });

    it('should handle empty custom objects in remove', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: [{
          id: 'channel1',
          custom: {},
          status: 'inactive'
        }],
        type: 'delete',
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      assert.deepEqual(body.delete[0].custom, {});
      assert.equal(body.delete[0].status, 'inactive');
    });

    it('should handle null values in channel objects for delete', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: [{
          id: 'channel1',
          custom: null as any,
          status: null as any
        }],
        type: 'delete',
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      assert.equal(body.delete[0].custom, null);
      assert.equal(body.delete[0].status, null);
    });
  });

  describe('comprehensive validation tests', () => {
    it('should handle uuid with special characters for delete', () => {
      const specialUuid = 'user@domain.com#123';
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        uuid: specialUuid,
      });
      
      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(specialUuid)));
    });

    it('should maintain request isolation between set and delete', () => {
      const setRequest = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        type: 'set',
      });
      
      const deleteRequest = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        type: 'delete',
      });
      
      const setBody = JSON.parse(setRequest.request().body as string);
      const deleteBody = JSON.parse(deleteRequest.request().body as string);
      
      assert(setBody.hasOwnProperty('set'));
      assert(!setBody.hasOwnProperty('delete'));
      assert(deleteBody.hasOwnProperty('delete'));
      assert(!deleteBody.hasOwnProperty('set'));
    });
  });

  describe('large dataset handling', () => {
    it('should handle removal of many channels', () => {
      const manyChannels = Array.from({ length: 100 }, (_, i) => ({
        id: `channel_${i}`,
        status: i % 2 === 0 ? 'active' : 'inactive',
        custom: { index: i }
      }));
      
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        channels: manyChannels,
        type: 'delete',
      });
      
      const transportRequest = request.request();
      const body = JSON.parse(transportRequest.body as string);
      
      assert.equal(body.delete.length, 100);
      assert.equal(body.delete[0].channel.id, 'channel_0');
      assert.equal(body.delete[99].channel.id, 'channel_99');
      assert.deepEqual(body.delete[50].custom, { index: 50 });
    });
  });

  describe('filter and sort parameters for delete', () => {
    it('should handle filter parameter with delete operation', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        filter: 'channel.status == "active"',
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      assert.equal(queryParams?.filter, 'channel.status == "active"');
    });

    it('should handle sort parameter with delete operation', () => {
      const request = new SetUUIDMembershipsRequest({
        ...defaultParameters,
        sort: { 'channel.updated': 'desc' },
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      const sortArray = queryParams?.sort as string[];
      assert(Array.isArray(sortArray));
      assert(sortArray.includes('channel.updated:desc'));
    });
  });
});
