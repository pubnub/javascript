import assert from 'assert';

import { RemoveUUIDMetadataRequest } from '../../../src/core/endpoints/objects/uuid/remove';
import { TransportMethod } from '../../../src/core/types/transport-request';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import * as AppContext from '../../../src/core/types/api/app-context';

describe('RemoveUUIDMetadataRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: AppContext.RemoveUUIDMetadataParameters & { keySet: KeySet };

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
    it('should return "\'uuid\' cannot be empty" when uuid is empty', () => {
      const request = new RemoveUUIDMetadataRequest({
        ...defaultParameters,
        uuid: '',
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it('should return "\'uuid\' cannot be empty" when uuid is null', () => {
      const request = new RemoveUUIDMetadataRequest({
        ...defaultParameters,
        uuid: null as any,
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it('should return "\'uuid\' cannot be empty" when uuid is undefined', () => {
      const request = new RemoveUUIDMetadataRequest({
        ...defaultParameters,
        uuid: undefined as any,
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it('should return undefined when uuid provided', () => {
      const request = new RemoveUUIDMetadataRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation type', () => {
    it('should return correct operation type', () => {
      const request = new RemoveUUIDMetadataRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNRemoveUUIDMetadataOperation);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path', () => {
      const request = new RemoveUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/${defaultParameters.uuid}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode uuid name in path', () => {
      const request = new RemoveUUIDMetadataRequest({
        ...defaultParameters,
        uuid: 'test-uuid#1@2',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/test-uuid%231%402`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('HTTP method', () => {
    it('should use DELETE method', () => {
      const request = new RemoveUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.DELETE);
    });
  });

  describe('query parameters', () => {
    it('should not include any query parameters', () => {
      const request = new RemoveUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      
      // RemoveUUIDMetadataRequest doesn't define any query parameters
      // The request should either have no queryParameters or empty queryParameters
      const queryParams = transportRequest.queryParameters;
      if (queryParams) {
        // If queryParameters exist, they should be empty or contain no meaningful parameters
        assert.equal(Object.keys(queryParams).length, 0);
      }
    });
  });

  describe('headers', () => {
    it('should not set any custom headers', () => {
      const request = new RemoveUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      
      // RemoveUUIDMetadataRequest doesn't define custom headers
      // Check that no application-specific headers are set
      const headers = transportRequest.headers;
      if (headers) {
        assert.equal(headers['Content-Type'], undefined);
        assert.equal(headers['If-Match'], undefined);
      }
    });
  });

  describe('body', () => {
    it('should not have a request body', () => {
      const request = new RemoveUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      
      // DELETE requests typically don't have a body
      assert.equal(transportRequest.body, undefined);
    });
  });

  describe('backward compatibility', () => {
    it('should map userId parameter to uuid', () => {
      const request = new RemoveUUIDMetadataRequest({
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




