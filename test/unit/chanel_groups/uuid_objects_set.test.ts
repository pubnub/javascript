import assert from 'assert';

import { SetUUIDMetadataRequest } from '../../../src/core/endpoints/objects/uuid/set';
import { TransportMethod } from '../../../src/core/types/transport-request';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import * as AppContext from '../../../src/core/types/api/app-context';

// Local type alias for UUIDMetadata since it's not exported
type UUIDMetadata<Custom extends AppContext.CustomData> = {
  name?: string;
  email?: string;
  externalId?: string;
  profileUrl?: string;
  type?: string;
  status?: string;
  custom?: Custom;
};

describe('SetUUIDMetadataRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: AppContext.SetUUIDMetadataParameters<AppContext.CustomData> & { keySet: KeySet };
  let testData: UUIDMetadata<AppContext.CustomData>;

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };

    testData = {
      name: 'Test User',
      email: 'test@example.com',
      custom: {
        age: 25,
        location: 'San Francisco',
      },
    };

    defaultParameters = {
      uuid: 'test_uuid',
      data: testData,
      keySet: defaultKeySet,
    };
  });

  describe('parameter validation', () => {
    it('should return "\'uuid\' cannot be empty" when uuid is empty', () => {
      const request = new SetUUIDMetadataRequest({
        ...defaultParameters,
        uuid: '',
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it('should return "\'uuid\' cannot be empty" when uuid is null', () => {
      const request = new SetUUIDMetadataRequest({
        ...defaultParameters,
        uuid: null as any,
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it('should return "\'uuid\' cannot be empty" when uuid is undefined', () => {
      const request = new SetUUIDMetadataRequest({
        ...defaultParameters,
        uuid: undefined as any,
      });
      assert.equal(request.validate(), "'uuid' cannot be empty");
    });

    it('should return "Data cannot be empty" when data is null', () => {
      const request = new SetUUIDMetadataRequest({
        ...defaultParameters,
        data: null as any,
      });
      assert.equal(request.validate(), 'Data cannot be empty');
    });

    it('should return "Data cannot be empty" when data is undefined', () => {
      const request = new SetUUIDMetadataRequest({
        ...defaultParameters,
        data: undefined as any,
      });
      assert.equal(request.validate(), 'Data cannot be empty');
    });

    it('should return undefined when all required parameters provided', () => {
      const request = new SetUUIDMetadataRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation type', () => {
    it('should return correct operation type', () => {
      const request = new SetUUIDMetadataRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNSetUUIDMetadataOperation);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path with subscribeKey and uuid', () => {
      const request = new SetUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/${defaultParameters.uuid}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in uuid', () => {
      const request = new SetUUIDMetadataRequest({
        ...defaultParameters,
        uuid: 'test-uuid#1@2',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/uuids/test-uuid%231%402`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('HTTP method and headers', () => {
    it('should use PATCH method', () => {
      const request = new SetUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.PATCH);
    });

    it('should set Content-Type header', () => {
      const request = new SetUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.headers?.['Content-Type'], 'application/json');
    });

    it('should set If-Match header when ifMatchesEtag provided', () => {
      const request = new SetUUIDMetadataRequest({
        ...defaultParameters,
        ifMatchesEtag: 'test-etag-value',
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.headers?.['If-Match'], 'test-etag-value');
    });

    it('should not set If-Match header when ifMatchesEtag not provided', () => {
      const request = new SetUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.headers?.['If-Match'], undefined);
    });
  });

  describe('query parameters', () => {
    it('should include custom fields by default', () => {
      const request = new SetUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(includeParam?.includes('custom'));
    });

    it('should exclude custom fields when include.customFields is false', () => {
      const request = new SetUUIDMetadataRequest({
        ...defaultParameters,
        include: { customFields: false },
      });
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(!includeParam?.includes('custom'));
    });

    it('should include status and type fields', () => {
      const request = new SetUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(includeParam?.includes('status'));
      assert(includeParam?.includes('type'));
    });
  });

  describe('body serialization', () => {
    it('should serialize data as JSON string', () => {
      const request = new SetUUIDMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.body, JSON.stringify(testData));
    });

    it('should handle complex nested data objects', () => {
      const complexData = {
        name: 'Complex User',
        email: 'complex@example.com',
        custom: {
          profile: {
            settings: {
              theme: 'dark',
              notifications: true,
            },
            preferences: ['option1', 'option2'],
          },
          metadata: {
            tags: ['tag1', 'tag2', 'tag3'],
            scores: { math: 95, science: 87 },
          },
        },
      };

      const request = new SetUUIDMetadataRequest({
        ...defaultParameters,
        data: complexData as any,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.body, JSON.stringify(complexData));
      
      // Verify that the serialized data can be parsed back correctly
      const parsedBody = JSON.parse(transportRequest.body as string);
      assert.deepEqual(parsedBody, complexData);
    });
  });

  describe('backward compatibility', () => {
    it('should map userId parameter to uuid', () => {
      const request = new SetUUIDMetadataRequest({
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




