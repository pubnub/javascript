import assert from 'assert';

import { GetAllChannelsMetadataRequest } from '../../../src/core/endpoints/objects/channel/get_all';
import { TransportMethod } from '../../../src/core/types/transport-request';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import * as AppContext from '../../../src/core/types/api/app-context';

describe('GetAllChannelsMetadataRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<AppContext.CustomData>> & { keySet: KeySet };

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
      const request = new GetAllChannelsMetadataRequest<AppContext.GetAllChannelMetadataResponse<AppContext.CustomData>>(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNGetAllChannelMetadataOperation);
    });
  });

  describe('default parameters', () => {
    it('should set default limit to 100', () => {
      const request = new GetAllChannelsMetadataRequest<AppContext.GetAllChannelMetadataResponse<AppContext.CustomData>>(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.limit, 100);
    });

    it('should set includeCustomFields to false by default', () => {
      const request = new GetAllChannelsMetadataRequest<AppContext.GetAllChannelMetadataResponse<AppContext.CustomData>>(defaultParameters);
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(!includeParam?.includes('custom'));
    });

    it('should set includeTotalCount to false by default', () => {
      const request = new GetAllChannelsMetadataRequest<AppContext.GetAllChannelMetadataResponse<AppContext.CustomData>>(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.count, 'false');
    });
  });

  describe('query parameters', () => {
    it('should handle custom limit parameter', () => {
      const request = new GetAllChannelsMetadataRequest<AppContext.GetAllChannelMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        limit: 50,
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.limit, 50);
    });

    it('should handle filter parameter', () => {
      const request = new GetAllChannelsMetadataRequest<AppContext.GetAllChannelMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        filter: 'name LIKE "test*"',
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.filter, 'name LIKE "test*"');
    });

    it('should handle pagination start cursor', () => {
      const request = new GetAllChannelsMetadataRequest<AppContext.GetAllChannelMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        page: { next: 'test-next-cursor' },
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.start, 'test-next-cursor');
    });

    it('should handle pagination end cursor', () => {
      const request = new GetAllChannelsMetadataRequest<AppContext.GetAllChannelMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        page: { prev: 'test-prev-cursor' },
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.end, 'test-prev-cursor');
    });
  });

  describe('sorting', () => {
    it('should handle string sort parameter', () => {
      const request = new GetAllChannelsMetadataRequest<AppContext.GetAllChannelMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        sort: 'name',
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.queryParameters?.sort, 'name');
    });

    it('should handle object sort with direction', () => {
      const request = new GetAllChannelsMetadataRequest<AppContext.GetAllChannelMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        sort: { name: 'desc', updated: 'asc' },
      });
      const transportRequest = request.request();
      const sortParams = transportRequest.queryParameters?.sort as string[];
      assert(sortParams.includes('name:desc'));
      assert(sortParams.includes('updated:asc'));
    });

    it('should handle object sort with null direction', () => {
      const request = new GetAllChannelsMetadataRequest<AppContext.GetAllChannelMetadataResponse<AppContext.CustomData>>({
        ...defaultParameters,
        sort: { name: null, updated: 'asc' },
      });
      const transportRequest = request.request();
      const sortParams = transportRequest.queryParameters?.sort as string[];
      assert(sortParams.includes('name'));
      assert(sortParams.includes('updated:asc'));
    });
  });
});
