import assert from 'assert';

import { GetChannelMetadataRequest } from '../../../src/core/endpoints/objects/channel/get';
import { TransportMethod } from '../../../src/core/types/transport-request';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import * as AppContext from '../../../src/core/types/api/app-context';

describe('GetChannelMetadataRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: AppContext.GetChannelMetadataParameters & { keySet: KeySet };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };

    defaultParameters = {
      channel: 'test_channel',
      keySet: defaultKeySet,
    };
  });

  describe('parameter validation', () => {
    it('should return "Channel cannot be empty" when channel is empty string', () => {
      const request = new GetChannelMetadataRequest({
        ...defaultParameters,
        channel: '',
      });
      assert.equal(request.validate(), 'Channel cannot be empty');
    });

    it('should return "Channel cannot be empty" when channel is null', () => {
      const request = new GetChannelMetadataRequest({
        ...defaultParameters,
        channel: null as any,
      });
      assert.equal(request.validate(), 'Channel cannot be empty');
    });

    it('should return "Channel cannot be empty" when channel is undefined', () => {
      const request = new GetChannelMetadataRequest({
        ...defaultParameters,
        channel: undefined as any,
      });
      assert.equal(request.validate(), 'Channel cannot be empty');
    });

    it('should return undefined when channel is provided', () => {
      const request = new GetChannelMetadataRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });
  });

  describe('operation type', () => {
    it('should return correct operation type', () => {
      const request = new GetChannelMetadataRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNGetChannelMetadataOperation);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path with subscribeKey and channel', () => {
      const request = new GetChannelMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/channels/${defaultParameters.channel}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special characters in channel name', () => {
      const request = new GetChannelMetadataRequest({
        ...defaultParameters,
        channel: 'test-channel#1@2',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/channels/test-channel%231%402`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });

  describe('query parameters', () => {
    it('should include custom fields by default', () => {
      const request = new GetChannelMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(includeParam?.includes('custom'));
    });

    it('should exclude custom fields when include.customFields is false', () => {
      const request = new GetChannelMetadataRequest({
        ...defaultParameters,
        include: { customFields: false },
      });
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(!includeParam?.includes('custom'));
    });

    it('should include status and type fields', () => {
      const request = new GetChannelMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      const includeParam = transportRequest.queryParameters?.include as string;
      assert(includeParam?.includes('status'));
      assert(includeParam?.includes('type'));
    });
  });

  describe('HTTP method', () => {
    it('should use GET method', () => {
      const request = new GetChannelMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);
    });
  });
});
