import assert from 'assert';

import { SetChannelMetadataRequest } from '../../../src/core/endpoints/objects/channel/set';
import { TransportMethod } from '../../../src/core/types/transport-request';
import { KeySet } from '../../../src/core/types/api';
import * as AppContext from '../../../src/core/types/api/app-context';

describe('SetChannelMetadataRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: AppContext.SetChannelMetadataParameters<AppContext.CustomData> & { keySet: KeySet };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };

    defaultParameters = {
      channel: 'test_channel',
      data: {
        name: 'Test Channel',
        description: 'A test channel',
        custom: {
          category: 'test',
          priority: 1,
        },
      },
      keySet: defaultKeySet,
    };
  });

  describe('parameter validation', () => {
    it('should return "Channel cannot be empty" when channel is empty', () => {
      const request = new SetChannelMetadataRequest({
        ...defaultParameters,
        channel: '',
      });
      assert.equal(request.validate(), 'Channel cannot be empty');
    });

    it('should return "Data cannot be empty" when data is null', () => {
      const request = new SetChannelMetadataRequest({
        ...defaultParameters,
        data: null as any,
      });
      assert.equal(request.validate(), 'Data cannot be empty');
    });

    it('should return "Data cannot be empty" when data is undefined', () => {
      const request = new SetChannelMetadataRequest({
        ...defaultParameters,
        data: undefined as any,
      });
      assert.equal(request.validate(), 'Data cannot be empty');
    });

    it('should return undefined when all required parameters provided', () => {
      const request = new SetChannelMetadataRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });
  });

  describe('HTTP method and headers', () => {
    it('should use PATCH method', () => {
      const request = new SetChannelMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.PATCH);
    });

    it('should set Content-Type header', () => {
      const request = new SetChannelMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.headers?.['Content-Type'], 'application/json');
    });

    it('should set If-Match header when ifMatchesEtag provided', () => {
      const request = new SetChannelMetadataRequest({
        ...defaultParameters,
        ifMatchesEtag: 'test-etag-123',
      });
      const transportRequest = request.request();
      assert.equal(transportRequest.headers?.['If-Match'], 'test-etag-123');
    });

    it('should not set If-Match header when ifMatchesEtag not provided', () => {
      const request = new SetChannelMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.headers?.['If-Match'], undefined);
    });
  });

  describe('body serialization', () => {
    it('should serialize data as JSON string', () => {
      const request = new SetChannelMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.body, JSON.stringify(defaultParameters.data));
    });

    it('should handle complex nested data objects', () => {
      const complexData = {
        name: 'Complex Channel',
        description: 'A complex test channel',
        custom: {
          metadata: {
            tags: ['test', 'complex'],
            settings: {
              notifications: true,
              theme: 'dark',
            },
          },
          permissions: {
            read: ['user1', 'user2'],
            write: ['admin'],
          },
        },
      };

      const request = new SetChannelMetadataRequest({
        ...defaultParameters,
        data: complexData as any,
      });
      const transportRequest = request.request();
      
      assert.equal(transportRequest.body, JSON.stringify(complexData));
      const parsedBody = JSON.parse(transportRequest.body as string);
      assert.deepEqual(parsedBody, complexData);
    });
  });
});
