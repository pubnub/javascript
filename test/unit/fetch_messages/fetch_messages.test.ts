/* global describe, beforeEach, it */

import assert from 'assert';

import { FetchMessagesRequest } from '../../../src/core/endpoints/fetch_messages';
import RequestOperation from '../../../src/core/constants/operations';
import { PubNubMessageType } from '../../../src/core/types/api/history';
import { KeySet } from '../../../src/core/types/api';

describe('FetchMessagesRequest', () => {
  let keySet: KeySet;
  let getFileUrl: (params: any) => string;

  beforeEach(() => {
    keySet = {
      subscribeKey: 'sub-key',
      publishKey: 'pub-key',
    };
    getFileUrl = (params: any) => `https://example.com/files/${params.id}/${params.name}`;
  });

  describe('validates required parameters', () => {
    it('should return error for missing subscribeKey', () => {
      const request = new FetchMessagesRequest({
        keySet: { subscribeKey: '', publishKey: 'pub-key' },
        channels: ['channel1'],
        getFileUrl,
      });

      const error = request.validate();
      assert.equal(error, 'Missing Subscribe Key');
    });

    it('should return error for missing channels', () => {
      // We can't test undefined/null channels because constructor accesses .length
      // But we can test the validate() method directly with a mock request
      const mockRequest = {
        parameters: {
          keySet: { subscribeKey: 'test-key' },
          channels: null,
          getFileUrl: () => '',
        },
        validate: FetchMessagesRequest.prototype.validate,
      };

      const error = mockRequest.validate();
      assert.equal(error, 'Missing channels');
    });

    it('should return error for includeMessageActions with multiple channels', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1', 'channel2'],
        includeMessageActions: true,
        getFileUrl,
      });

      const error = request.validate();
      assert.equal(
        error,
        'History can return actions data for a single channel only. Either pass a single channel or disable the includeMessageActions flag.'
      );
    });

    it('should return undefined for valid parameters', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        getFileUrl,
      });

      const error = request.validate();
      assert.equal(error, undefined);
    });
  });

  describe('applies correct default values', () => {
    it('should default count to 100 for single channel', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        getFileUrl,
      });

      // Access private parameters property via type assertion
      const parameters = (request as any).parameters;
      assert.equal(parameters.count, 100);
      assert.equal(parameters.includeUUID, true);
      assert.equal(parameters.includeMessageType, true);
      assert.equal(parameters.stringifiedTimeToken, false);
    });

    it('should default count to 25 for multiple channels', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1', 'channel2'],
        getFileUrl,
      });

      const parameters = (request as any).parameters;
      assert.equal(parameters.count, 25);
    });

    it('should default count to 25 when includeMessageActions is true', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        includeMessageActions: true,
        getFileUrl,
      });

      const parameters = (request as any).parameters;
      assert.equal(parameters.count, 25);
    });
  });

  describe('constructs correct path for regular history', () => {
    it('should build path without includeMessageActions', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        getFileUrl,
      });

      const path = (request as any).path;
      assert.equal(path, '/v3/history/sub-key/sub-key/channel/channel1');
    });

    it('should encode channel names with special characters', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel#1', 'channel/2', 'channel 3'],
        getFileUrl,
      });

      const path = (request as any).path;
      assert.equal(path, '/v3/history/sub-key/sub-key/channel/channel%231,channel%2F2,channel%203');
    });
  });

  describe('constructs correct path for history-with-actions', () => {
    it('should build path with includeMessageActions=true', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        includeMessageActions: true,
        getFileUrl,
      });

      const path = (request as any).path;
      assert.equal(path, '/v3/history-with-actions/sub-key/sub-key/channel/channel1');
    });
  });

  describe('builds query parameters correctly', () => {
    it('should include all optional parameters in query', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        count: 50,
        start: '12345',
        end: '67890',
        includeUUID: true,
        includeMessageType: true,
        includeMeta: true,
        includeCustomMessageType: true,
        stringifiedTimeToken: true,
        getFileUrl,
      });

      const queryParams = (request as any).queryParameters;
      assert.equal(queryParams.max, 50);
      assert.equal(queryParams.start, '12345');
      assert.equal(queryParams.end, '67890');
      assert.equal(queryParams.include_uuid, 'true');
      assert.equal(queryParams.include_message_type, 'true');
      assert.equal(queryParams.include_meta, 'true');
      assert.equal(queryParams.include_custom_message_type, 'true');
      assert.equal(queryParams.string_message_token, 'true');
    });

    it('should omit optional parameters when not provided', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        getFileUrl,
      });

      const queryParams = (request as any).queryParameters;
      assert.equal(queryParams.start, undefined);
      assert.equal(queryParams.end, undefined);
      assert.equal(queryParams.include_meta, undefined);
      assert.equal(queryParams.string_message_token, undefined);
    });

    it('should handle includeCustomMessageType false value', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        includeCustomMessageType: false,
        getFileUrl,
      });

      const queryParams = (request as any).queryParameters;
      assert.equal(queryParams.include_custom_message_type, 'false');
    });
  });

  describe('handles channel name encoding', () => {
    it('should properly encode special characters', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel#test', 'channel/test', 'channel test', 'channel@test', 'channel+test'],
        getFileUrl,
      });

      const path = (request as any).path;
      assert(path.includes('channel%23test')); // # encoded
      assert(path.includes('channel%2Ftest')); // / encoded
      assert(path.includes('channel%20test')); // space encoded
      assert(path.includes('channel%40test')); // @ encoded
      assert(path.includes('channel%2Btest')); // + encoded
    });

    it('should handle unicode characters', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['café', '测试'],
        getFileUrl,
      });

      const path = (request as any).path;
      // Unicode characters should be properly encoded
      assert(path.includes('caf%C3%A9'));
      assert(path.includes('%E6%B5%8B%E8%AF%95'));
    });
  });

  describe('enforces count limits correctly', () => {
    it('should clamp count to 100 for single channel', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        count: 150,
        getFileUrl,
      });

      const parameters = (request as any).parameters;
      assert.equal(parameters.count, 100);
    });

    it('should clamp count to 25 for multiple channels', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1', 'channel2'],
        count: 50,
        getFileUrl,
      });

      const parameters = (request as any).parameters;
      assert.equal(parameters.count, 25);
    });

    it('should clamp count to 25 when includeMessageActions is true', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        count: 50,
        includeMessageActions: true,
        getFileUrl,
      });

      const parameters = (request as any).parameters;
      assert.equal(parameters.count, 25);
    });
  });

  describe('handles backward compatibility for includeUuid', () => {
    it('should map includeUuid to includeUUID when truthy', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        includeUuid: true,
        getFileUrl,
      });

      const parameters = (request as any).parameters;
      assert.equal(parameters.includeUUID, true);
      assert.equal(parameters.includeUuid, true);
    });

    it('should use default includeUUID when includeUuid is falsy', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        includeUuid: false,
        getFileUrl,
      });

      const parameters = (request as any).parameters;
      assert.equal(parameters.includeUUID, true); // Should default to true
      assert.equal(parameters.includeUuid, false); // Original value preserved
    });

    it('should prefer includeUUID over includeUuid when both provided', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        includeUuid: false,
        includeUUID: true,
        getFileUrl,
      });

      const parameters = (request as any).parameters;
      assert.equal(parameters.includeUUID, true);
    });
  });

  describe('operation type', () => {
    it('should return correct operation type', () => {
      const request = new FetchMessagesRequest({
        keySet,
        channels: ['channel1'],
        getFileUrl,
      });

      assert.equal(request.operation(), RequestOperation.PNFetchMessagesOperation);
    });
  });
});
