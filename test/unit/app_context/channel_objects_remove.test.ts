import assert from 'assert';

import { RemoveChannelMetadataRequest } from '../../../src/core/endpoints/objects/channel/remove';
import { TransportMethod } from '../../../src/core/types/transport-request';
import { KeySet } from '../../../src/core/types/api';
import * as AppContext from '../../../src/core/types/api/app-context';

describe('RemoveChannelMetadataRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: AppContext.RemoveChannelMetadataParameters & { keySet: KeySet };

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
    it('should return "Channel cannot be empty" when channel is empty', () => {
      const request = new RemoveChannelMetadataRequest({
        ...defaultParameters,
        channel: '',
      });
      assert.equal(request.validate(), 'Channel cannot be empty');
    });

    it('should return undefined when channel provided', () => {
      const request = new RemoveChannelMetadataRequest(defaultParameters);
      assert.equal(request.validate(), undefined);
    });
  });

  describe('HTTP method', () => {
    it('should use DELETE method', () => {
      const request = new RemoveChannelMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.DELETE);
    });
  });

  describe('URL construction', () => {
    it('should construct correct path', () => {
      const request = new RemoveChannelMetadataRequest(defaultParameters);
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/channels/${defaultParameters.channel}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode channel name in path', () => {
      const request = new RemoveChannelMetadataRequest({
        ...defaultParameters,
        channel: 'test-channel#1@2',
      });
      const transportRequest = request.request();
      const expectedPath = `/v2/objects/${defaultKeySet.subscribeKey}/channels/test-channel%231%402`;
      assert.equal(transportRequest.path, expectedPath);
    });
  });
});
