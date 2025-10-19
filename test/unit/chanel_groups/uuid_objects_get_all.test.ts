import assert from 'assert';

import { GetAllUUIDMetadataRequest } from '../../../src/core/endpoints/objects/uuid/get_all';
import { TransportMethod } from '../../../src/core/types/transport-request';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import * as AppContext from '../../../src/core/types/api/app-context';

describe('GetAllUUIDMetadataRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<AppContext.CustomData>> & { keySet: KeySet };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };

    defaultParameters = {
      keySet: defaultKeySet,
    };
  });

  describe('operation type', () => {
    it('should return correct operation type', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNGetAllUUIDMetadataOperation);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path with subscribeKey', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('default parameters', () => {
    it('should set default limit to 100', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.limit, 100);
    });

    it('should set includeCustomFields to false by default', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>(defaultParameters);
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(!includeParam?.includes('custom'));
    });

    it('should include status and type fields by default', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>(defaultParameters);
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(includeParam?.includes('status'));
      assert(includeParam?.includes('type'));
    });
  });

  describe('query parameters', () => {
    it('should handle custom limit parameter', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        limit: 50,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.limit, 50);
    });

    it('should handle filter parameter', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        filter: 'name == "test"',
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.filter, 'name == "test"');
    });

    it('should handle pagination start cursor', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        page: { next: 'next-cursor-token' },
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.start, 'next-cursor-token');
    });

    it('should handle pagination end cursor', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        page: { prev: 'prev-cursor-token' },
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.end, 'prev-cursor-token');
    });

    it('should include custom fields when include.customFields is true', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        include: { customFields: true },
      });
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(includeParam?.includes('custom'));
    });

    it('should handle totalCount include option', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        include: { totalCount: true },
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.count, 'true');
    });

    it('should not include count when totalCount is false', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        include: { totalCount: false },
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.count, 'false');
    });
  });

  describe('sorting', () => {
    it('should handle string sort parameter', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        sort: 'name',
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.sort, 'name');
    });

    it('should handle object sort with direction', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        sort: { name: 'asc', updated: 'desc' },
      });
      const transportRequest = request.request();
      const sortArray = transportRequest.queryParameters?.sort as string[];
      assert(Array.isArray(sortArray));
      assert(sortArray.includes('name:asc'));
      assert(sortArray.includes('updated:desc'));
    });

    it('should handle object sort with null direction', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        sort: { name: null },
      });
      const transportRequest = request.request();
      const sortArray = transportRequest.queryParameters?.sort as string[];
      assert(Array.isArray(sortArray));
      assert(sortArray.includes('name'));
    });

    it('should handle mixed sort directions', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        sort: { name: 'asc', updated: null, status: 'desc' },
      });
      const transportRequest = request.request();
      const sortArray = transportRequest.queryParameters?.sort as string[];
      assert(Array.isArray(sortArray));
      assert(sortArray.includes('name:asc'));
      assert(sortArray.includes('updated'));
      assert(sortArray.includes('status:desc'));
    });
  });

  describe('HTTP method', () => {
    it('should use GET method', () => {
      const request = new GetAllUUIDMetadataRequest<AppContext.GetAllUUIDMetadataResponse<AppContext.CustomData>>(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);
    });
  });
});




