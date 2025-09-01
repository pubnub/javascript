import assert from 'assert';

import { GetUUIDMetadataRequest } from '../../../src/core/endpoints/objects/uuid/get';
import { TransportMethod } from '../../../src/core/types/transport-request';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import * as AppContext from '../../../src/core/types/api/app-context';

describe('GetUUIDMetadataRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: AppContext.GetUUIDMetadataParameters & { keySet: KeySet };

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

  describe('parameter validation', () => {
    it('should return "\'uuid\' cannot be empty" when uuid is empty string', () => {
      const request = new GetUUIDMetadataRequest({
        ...defaultParameters,
        uuid: '',
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it('should return "\'uuid\' cannot be empty" when uuid is null', () => {
      const request = new GetUUIDMetadataRequest({
        ...defaultParameters,
        uuid: null as any,
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it('should return "\'uuid\' cannot be empty" when uuid is undefined', () => {
      const request = new GetUUIDMetadataRequest({
        ...defaultParameters,
        uuid: undefined as any,
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it('should return undefined when uuid is provided', () => {
      const request = new GetUUIDMetadataRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation type', () => {
    it('should return correct operation type', () => {
      const request = new GetUUIDMetadataRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNGetUUIDMetadataOperation);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path with subscribeKey and uuid', () => {
      const request = new GetUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/${defaultParameters.uuid}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in uuid', () => {
      const request = new GetUUIDMetadataRequest({
        ...defaultParameters,
        uuid: 'test-uuid#1@2',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/test-uuid%231%402`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('query parameters', () => {
    it('should include custom fields by default', () => {
      const request = new GetUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(includeParam?.includes('custom'));
    });

    it('should exclude custom fields when include.customFields is false', () => {
      const request = new GetUUIDMetadataRequest({
        ...defaultParameters,
        include: { customFields: false },
      });
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(!includeParam?.includes('custom'));
    });

    it('should include status and type fields', () => {
      const request = new GetUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(includeParam?.includes('status'));
      assert(includeParam?.includes('type'));
    });
  });

  describe('HTTP method', () => {
    it('should use GET method', () => {
      const request = new GetUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);
    });
  });

  describe('backward compatibility', () => {
    it('should map userId parameter to uuid', () => {
      const request = new GetUUIDMetadataRequest({
        ...defaultParameters,
        uuid: undefined as any,
        userId: 'legacy_user_id',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/legacy_user_id`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });
});




