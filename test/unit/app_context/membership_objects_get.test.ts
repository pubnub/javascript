/* global describe, it, beforeEach */

import assert from 'assert';
import { GetUUIDMembershipsRequest } from '../../../src/core/endpoints/objects/membership/get';
import { TransportMethod } from '../../../src/core/types/transport-request';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import * as AppContext from '../../../src/core/types/api/app-context';

describe('GetUUIDMembershipsRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: AppContext.GetMembershipsParameters & { keySet: KeySet };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };

    defaultParameters = {
      uuid: 'test_user_uuid',
      keySet: defaultKeySet,
    };
  });

  describe('parameter validation', () => {
    it("should return \"'uuid' cannot be empty\" when uuid is empty string", () => {
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        uuid: '',
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it("should return \"'uuid' cannot be empty\" when uuid is null", () => {
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        uuid: null as any,
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it("should return \"'uuid' cannot be empty\" when uuid is undefined", () => {
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        uuid: undefined,
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it('should return undefined when uuid is provided', () => {
      const request = new GetUUIDMembershipsRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation type', () => {
    it('should return correct operation type', () => {
      const request = new GetUUIDMembershipsRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNGetMembershipsOperation);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path with subscribeKey and uuid', () => {
      const request = new GetUUIDMembershipsRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/${defaultParameters.uuid}/channels`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in uuid', () => {
      const specialUuid = 'test-uuid#1@2';
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        uuid: specialUuid,
      });
      const transportRequest = request.request();
      const expectedEncodedUuid = 'test-uuid%231%402';
      assert(transportRequest.path.includes(expectedEncodedUuid));
    });
  });

  describe('HTTP method', () => {
    it('should use GET method', () => {
      const request = new GetUUIDMembershipsRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);
    });
  });

  describe('query parameters', () => {
    it('should construct query parameters with all include options', () => {
      const request = new GetUUIDMembershipsRequest({
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
      assert.equal(queryParams?.include, 'status,type,custom,channel,channel.status,channel.type,channel.custom');
    });

    it('should handle pagination parameters', () => {
      const request = new GetUUIDMembershipsRequest({
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

    it('should handle filter parameter', () => {
      const filterString = 'name == "test"';
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        filter: filterString,
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      assert.equal(queryParams?.filter, filterString);
    });

    it('should handle sort parameter as string', () => {
      const sortString = 'updated:desc';
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        sort: 'updated' as any,
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      assert.equal(queryParams?.sort, 'updated');
    });

    it('should handle sort parameter as object', () => {
      const sortObject = { updated: 'desc', status: 'asc' };
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        sort: sortObject as any,
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      // Should contain both sort fields as array
      assert(Array.isArray(queryParams?.sort));
      const sortArray = queryParams?.sort as string[];
      assert(sortArray.includes('updated:desc'));
      assert(sortArray.includes('status:asc'));
    });

    it('should handle limit parameter', () => {
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        limit: 50,
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      assert.equal(queryParams?.limit, 50);
    });
  });

  describe('default values', () => {
    it('should apply default values for include options', () => {
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        // No include specified
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      // By default, all include flags should be false, so include should not be present
      assert.equal(queryParams?.include, undefined);
    });

    it('should apply default limit', () => {
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        // No limit specified  
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      assert.equal(queryParams?.limit, 100); // Default limit from the source code
    });
  });

  describe('backward compatibility', () => {
    it('should map userId to uuid parameter', () => {
      const request = new GetUUIDMembershipsRequest({
        keySet: defaultKeySet,
        userId: 'test-user-id', // Using userId instead of uuid
        // uuid is not provided
      } as any);
      
      // The request should be valid as userId gets mapped to uuid internally
      assert.equal(request.validate(), undefined);
      
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/test-user-id/channels`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('query parameter combinations', () => {
    it('should handle multiple query parameters together', () => {
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        include: {
          customFields: true,
          statusField: true,
          channelFields: true,
        },
        limit: 25,
        filter: 'channel.name like "*test*"',
        sort: 'channel.name',
        page: {
          next: 'token123',
        },
      });

      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;

      assert.equal(queryParams?.include, 'status,custom,channel');
      assert.equal(queryParams?.limit, 25);
      assert.equal(queryParams?.filter, 'channel.name like "*test*"');
      assert.equal(queryParams?.sort, 'channel.name');
      assert.equal(queryParams?.start, 'token123');
      assert.equal(queryParams?.count, 'false'); // totalCount default
    });

    it('should handle page prev without next', () => {
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        page: {
          prev: 'prevToken',
          // no next token
        },
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      assert.equal(queryParams?.end, 'prevToken');
      assert.equal(queryParams?.start, undefined);
    });

    it('should handle totalCount flag', () => {
      const requestWithCount = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        include: {
          totalCount: true,
        },
      });
      const transportRequestWithCount = requestWithCount.request();
      const queryParamsWithCount = transportRequestWithCount.queryParameters;
      assert.equal(queryParamsWithCount?.count, 'true');

      const requestWithoutCount = new GetUUIDMembershipsRequest(defaultParameters);
      const transportRequestWithoutCount = requestWithoutCount.request();
      const queryParamsWithoutCount = transportRequestWithoutCount.queryParameters;
      assert.equal(queryParamsWithoutCount?.count, 'false');
    });
  });

  describe('edge cases', () => {
    it('should handle empty sort object', () => {
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        sort: {} as any,
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      // Empty sort object results in no sort parameter in query (undefined)
      assert.equal(queryParams?.sort, undefined);
    });

    it('should handle null sort values in object', () => {
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        sort: { updated: null, created: 'asc' } as any,
      });
      const transportRequest = request.request();
      const queryParams = transportRequest.queryParameters;
      const sortArray = queryParams?.sort as string[];
      assert(sortArray.includes('updated')); // null becomes just the field name
      assert(sortArray.includes('created:asc'));
    });

    it('should handle very long uuid', () => {
      const longUuid = 'a'.repeat(100);
      const request = new GetUUIDMembershipsRequest({
        ...defaultParameters,
        uuid: longUuid,
      });
      const transportRequest = request.request();
      assert(transportRequest.path.includes(longUuid));
    });
  });
});
