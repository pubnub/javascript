/* global describe, beforeEach, it */

import assert from 'assert';

import { AddMessageActionRequest } from '../../../src/core/endpoints/actions/add_message_action';
import { GetMessageActionsRequest } from '../../../src/core/endpoints/actions/get_message_actions';
import { RemoveMessageAction } from '../../../src/core/endpoints/actions/remove_message_action';
import { TransportMethod } from '../../../src/core/types/transport-request';
import { TransportResponse } from '../../../src/core/types/transport-response';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import * as MessageAction from '../../../src/core/types/api/message-action';

describe('Message Actions Request Classes', () => {
  let defaultKeySet: KeySet;

  beforeEach(() => {
    defaultKeySet = {
      subscribeKey: 'test_subscribe_key',
      publishKey: 'test_publish_key',
    };
  });

  describe('AddMessageActionRequest', () => {
    let defaultParameters: MessageAction.AddMessageActionParameters & { keySet: KeySet };

    beforeEach(() => {
      defaultParameters = {
        channel: 'test_channel',
        messageTimetoken: '1234567890',
        action: {
          type: 'reaction',
          value: 'smiley_face',
        },
        keySet: defaultKeySet,
      };
    });

    describe('validation', () => {
      it('should validate required subscribeKey', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          keySet: { ...defaultKeySet, subscribeKey: '' },
        });
        assert.equal(request.validate(), 'Missing Subscribe Key');
      });

      it('should validate required channel', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          channel: '',
        });
        assert.equal(request.validate(), 'Missing message channel');
      });

      it('should validate required messageTimetoken', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          messageTimetoken: '',
        });
        assert.equal(request.validate(), 'Missing message timetoken');
      });

      it('should validate required action', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          action: undefined as any,
        });
        assert.equal(request.validate(), 'Missing Action');
      });

      it('should validate required action.type', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          action: { value: 'test' } as any,
        });
        assert.equal(request.validate(), 'Missing Action.type');
      });

      it('should validate required action.value', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          action: { type: 'reaction' } as any,
        });
        assert.equal(request.validate(), 'Missing Action.value');
      });

      it('should validate action.type length limit', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          action: {
            type: '1234567890123456', // 16 characters (over limit)
            value: 'test',
          },
        });
        assert.equal(request.validate(), 'Action.type value exceed maximum length of 15');
      });

      it('should allow action.type at maximum length', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          action: {
            type: '123456789012345', // 15 characters (exactly at limit)
            value: 'test',
          },
        });
        assert.equal(request.validate(), undefined);
      });

      it('should pass validation with valid parameters', () => {
        const request = new AddMessageActionRequest(defaultParameters);
        assert.equal(request.validate(), undefined);
      });
    });

    describe('operation', () => {
      it('should return PNAddMessageActionOperation', () => {
        const request = new AddMessageActionRequest(defaultParameters);
        assert.equal(request.operation(), RequestOperation.PNAddMessageActionOperation);
      });
    });

    describe('URL construction', () => {
      it('should construct correct path', () => {
        const request = new AddMessageActionRequest(defaultParameters);
        const transportRequest = request.request();
        
        const expectedPath = `/v1/message-actions/${defaultKeySet.subscribeKey}/channel/${defaultParameters.channel}/message/${defaultParameters.messageTimetoken}`;
        assert.equal(transportRequest.path, expectedPath);
      });

      it('should encode special characters in channel name', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          channel: 'test channel#1/2',
        });
        const transportRequest = request.request();
        
        assert(transportRequest.path.includes('test%20channel%231%2F2'));
      });

      it('should encode Unicode characters in channel name', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          channel: 'café测试',
        });
        const transportRequest = request.request();
        
        assert(transportRequest.path.includes('caf%C3%A9%E6%B5%8B%E8%AF%95'));
      });
    });

    describe('HTTP method and headers', () => {
      it('should use POST method', () => {
        const request = new AddMessageActionRequest(defaultParameters);
        const transportRequest = request.request();
        
        assert.equal(transportRequest.method, TransportMethod.POST);
      });

      it('should set correct Content-Type header', () => {
        const request = new AddMessageActionRequest(defaultParameters);
        const transportRequest = request.request();
        
        assert.equal(transportRequest.headers?.['Content-Type'], 'application/json');
      });
    });

    describe('request body', () => {
      it('should serialize action to JSON in body', () => {
        const request = new AddMessageActionRequest(defaultParameters);
        const transportRequest = request.request();
        
        const expectedBody = JSON.stringify(defaultParameters.action);
        assert.equal(transportRequest.body, expectedBody);
      });

      it('should handle action with Unicode characters', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          action: {
            type: 'emoji',
            value: '😀🎉',
          },
        });
        const transportRequest = request.request();
        
        const expectedBody = JSON.stringify({ type: 'emoji', value: '😀🎉' });
        assert.equal(transportRequest.body, expectedBody);
      });
    });

    describe('response parsing', () => {
      it('should parse successful response', async () => {
        const request = new AddMessageActionRequest(defaultParameters);
        const mockResponse: TransportResponse = {
          status: 200,
          url: 'https://test.pubnub.com',
          headers: { 'content-type': 'application/json' },
          body: new TextEncoder().encode(JSON.stringify({
            status: 200,
            data: {
              type: 'reaction',
              value: 'smiley_face',
              uuid: 'test_user',
              actionTimetoken: '15610547826970050',
              messageTimetoken: '1234567890',
            },
          })),
        };

        const parsedResponse = await request.parse(mockResponse);
        assert.equal(parsedResponse.data.type, 'reaction');
        assert.equal(parsedResponse.data.value, 'smiley_face');
        assert.equal(parsedResponse.data.uuid, 'test_user');
        assert.equal(parsedResponse.data.actionTimetoken, '15610547826970050');
        assert.equal(parsedResponse.data.messageTimetoken, '1234567890');
      });
    });

    describe('edge cases', () => {
      it('should handle empty string action.type', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          action: { type: '', value: 'test' },
        });
        assert.equal(request.validate(), 'Missing Action.type');
      });

      it('should handle empty string action.value', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          action: { type: 'reaction', value: '' },
        });
        assert.equal(request.validate(), 'Missing Action.value');
      });

      it('should handle null action', () => {
        const request = new AddMessageActionRequest({
          ...defaultParameters,
          action: null as any,
        });
        assert.equal(request.validate(), 'Missing Action');
      });
    });
  });

  describe('GetMessageActionsRequest', () => {
    let defaultParameters: MessageAction.GetMessageActionsParameters & { keySet: KeySet };

    beforeEach(() => {
      defaultParameters = {
        channel: 'test_channel',
        keySet: defaultKeySet,
      };
    });

    describe('validation', () => {
      it('should validate required subscribeKey', () => {
        const request = new GetMessageActionsRequest({
          ...defaultParameters,
          keySet: { ...defaultKeySet, subscribeKey: '' },
        });
        assert.equal(request.validate(), 'Missing Subscribe Key');
      });

      it('should validate required channel', () => {
        const request = new GetMessageActionsRequest({
          ...defaultParameters,
          channel: '',
        });
        assert.equal(request.validate(), 'Missing message channel');
      });

      it('should pass validation with valid parameters', () => {
        const request = new GetMessageActionsRequest(defaultParameters);
        assert.equal(request.validate(), undefined);
      });
    });

    describe('operation', () => {
      it('should return PNGetMessageActionsOperation', () => {
        const request = new GetMessageActionsRequest(defaultParameters);
        assert.equal(request.operation(), RequestOperation.PNGetMessageActionsOperation);
      });
    });

    describe('URL construction', () => {
      it('should construct correct path', () => {
        const request = new GetMessageActionsRequest(defaultParameters);
        const transportRequest = request.request();
        
        const expectedPath = `/v1/message-actions/${defaultKeySet.subscribeKey}/channel/${defaultParameters.channel}`;
        assert.equal(transportRequest.path, expectedPath);
      });

      it('should encode special characters in channel name', () => {
        const request = new GetMessageActionsRequest({
          ...defaultParameters,
          channel: 'test channel#1/2',
        });
        const transportRequest = request.request();
        
        assert(transportRequest.path.includes('test%20channel%231%2F2'));
      });

      it('should use GET method by default', () => {
        const request = new GetMessageActionsRequest(defaultParameters);
        const transportRequest = request.request();
        
        assert.equal(transportRequest.method, TransportMethod.GET);
      });
    });

    describe('query parameters', () => {
      it('should include start parameter when provided', () => {
        const request = new GetMessageActionsRequest({
          ...defaultParameters,
          start: '1234567890',
        });
        const transportRequest = request.request();
        
        assert.equal(transportRequest.queryParameters?.start, '1234567890');
      });

      it('should include end parameter when provided', () => {
        const request = new GetMessageActionsRequest({
          ...defaultParameters,
          end: '9876543210',
        });
        const transportRequest = request.request();
        
        assert.equal(transportRequest.queryParameters?.end, '9876543210');
      });

      it('should include limit parameter when provided', () => {
        const request = new GetMessageActionsRequest({
          ...defaultParameters,
          limit: 50,
        });
        const transportRequest = request.request();
        
        assert.equal(transportRequest.queryParameters?.limit, 50);
      });

      it('should include all parameters when provided', () => {
        const request = new GetMessageActionsRequest({
          ...defaultParameters,
          start: '1234567890',
          end: '9876543210',
          limit: 25,
        });
        const transportRequest = request.request();
        
        assert.equal(transportRequest.queryParameters?.start, '1234567890');
        assert.equal(transportRequest.queryParameters?.end, '9876543210');
        assert.equal(transportRequest.queryParameters?.limit, 25);
      });

      it('should not include optional parameters when not provided', () => {
        const request = new GetMessageActionsRequest(defaultParameters);
        const transportRequest = request.request();
        
        assert.equal(transportRequest.queryParameters?.start, undefined);
        assert.equal(transportRequest.queryParameters?.end, undefined);
        assert.equal(transportRequest.queryParameters?.limit, undefined);
      });
    });

    describe('response parsing', () => {
      it('should parse response with data', async () => {
        const request = new GetMessageActionsRequest(defaultParameters);
        const mockResponse: TransportResponse = {
          status: 200,
          url: 'https://test.pubnub.com',
          headers: { 'content-type': 'application/json' },
          body: new TextEncoder().encode(JSON.stringify({
            status: 200,
            data: [
              {
                type: 'reaction',
                value: 'smiley_face',
                uuid: 'user1',
                actionTimetoken: '15610547826970050',
                messageTimetoken: '1234567890',
              },
              {
                type: 'reaction',
                value: 'thumbs_up',
                uuid: 'user2',
                actionTimetoken: '15610547826970051',
                messageTimetoken: '1234567890',
              },
            ],
          })),
        };

        const parsedResponse = await request.parse(mockResponse);
        assert.equal(parsedResponse.data.length, 2);
        assert.equal(parsedResponse.start, '15610547826970050');
        assert.equal(parsedResponse.end, '15610547826970051');
        assert.equal(parsedResponse.data[0].type, 'reaction');
        assert.equal(parsedResponse.data[1].value, 'thumbs_up');
      });

      it('should handle empty response', async () => {
        const request = new GetMessageActionsRequest(defaultParameters);
        const mockResponse: TransportResponse = {
          status: 200,
          url: 'https://test.pubnub.com',
          headers: { 'content-type': 'application/json' },
          body: new TextEncoder().encode(JSON.stringify({
            status: 200,
            data: [],
          })),
        };

        const parsedResponse = await request.parse(mockResponse);
        assert.equal(parsedResponse.data.length, 0);
        assert.equal(parsedResponse.start, null);
        assert.equal(parsedResponse.end, null);
      });

      it('should handle response with more data', async () => {
        const request = new GetMessageActionsRequest(defaultParameters);
        const mockResponse: TransportResponse = {
          status: 200,
          url: 'https://test.pubnub.com',
          headers: { 'content-type': 'application/json' },
          body: new TextEncoder().encode(JSON.stringify({
            status: 200,
            data: [
              {
                type: 'reaction',
                value: 'smiley_face',
                uuid: 'user1',
                actionTimetoken: '15610547826970050',
                messageTimetoken: '1234567890',
              },
            ],
            more: {
              url: '/v1/message-actions/test_subscribe_key/channel/test_channel?start=15610547826970049',
              start: '15610547826970049',
              end: '15610547826970000',
              limit: 100,
            },
          })),
        };

        const parsedResponse = await request.parse(mockResponse);
        assert.equal(parsedResponse.data.length, 1);
        assert.equal(parsedResponse.start, '15610547826970050');
        assert.equal(parsedResponse.end, '15610547826970050');
        assert(parsedResponse.more);
        assert.equal(parsedResponse.more?.start, '15610547826970049');
        assert.equal(parsedResponse.more?.limit, 100);
      });
    });
  });

  describe('RemoveMessageAction', () => {
    let defaultParameters: MessageAction.RemoveMessageActionParameters & { keySet: KeySet };

    beforeEach(() => {
      defaultParameters = {
        channel: 'test_channel',
        messageTimetoken: '1234567890',
        actionTimetoken: '15610547826970050',
        keySet: defaultKeySet,
      };
    });

    describe('validation', () => {
      it('should validate required subscribeKey', () => {
        const request = new RemoveMessageAction({
          ...defaultParameters,
          keySet: { ...defaultKeySet, subscribeKey: '' },
        });
        assert.equal(request.validate(), 'Missing Subscribe Key');
      });

      it('should validate required channel', () => {
        const request = new RemoveMessageAction({
          ...defaultParameters,
          channel: '',
        });
        assert.equal(request.validate(), 'Missing message action channel');
      });

      it('should validate required messageTimetoken', () => {
        const request = new RemoveMessageAction({
          ...defaultParameters,
          messageTimetoken: '',
        });
        assert.equal(request.validate(), 'Missing message timetoken');
      });

      it('should validate required actionTimetoken', () => {
        const request = new RemoveMessageAction({
          ...defaultParameters,
          actionTimetoken: '',
        });
        assert.equal(request.validate(), 'Missing action timetoken');
      });

      it('should pass validation with valid parameters', () => {
        const request = new RemoveMessageAction(defaultParameters);
        assert.equal(request.validate(), undefined);
      });
    });

    describe('operation', () => {
      it('should return PNRemoveMessageActionOperation', () => {
        const request = new RemoveMessageAction(defaultParameters);
        assert.equal(request.operation(), RequestOperation.PNRemoveMessageActionOperation);
      });
    });

    describe('URL construction', () => {
      it('should construct correct path', () => {
        const request = new RemoveMessageAction(defaultParameters);
        const transportRequest = request.request();
        
        const expectedPath = `/v1/message-actions/${defaultKeySet.subscribeKey}/channel/${defaultParameters.channel}/message/${defaultParameters.messageTimetoken}/action/${defaultParameters.actionTimetoken}`;
        assert.equal(transportRequest.path, expectedPath);
      });

      it('should encode special characters in channel name', () => {
        const request = new RemoveMessageAction({
          ...defaultParameters,
          channel: 'test channel#1/2',
        });
        const transportRequest = request.request();
        
        assert(transportRequest.path.includes('test%20channel%231%2F2'));
      });

      it('should use DELETE method', () => {
        const request = new RemoveMessageAction(defaultParameters);
        const transportRequest = request.request();
        
        assert.equal(transportRequest.method, TransportMethod.DELETE);
      });
    });

    describe('response parsing', () => {
      it('should parse successful response', async () => {
        const request = new RemoveMessageAction(defaultParameters);
        const mockResponse: TransportResponse = {
          status: 200,
          url: 'https://test.pubnub.com',
          headers: { 'content-type': 'application/json' },
          body: new TextEncoder().encode(JSON.stringify({
            status: 200,
            data: {},
          })),
        };

        const parsedResponse = await request.parse(mockResponse);
        assert(parsedResponse.data);
        assert.equal(typeof parsedResponse.data, 'object');
      });
    });

    describe('edge cases', () => {
      it('should handle undefined channel', () => {
        const request = new RemoveMessageAction({
          ...defaultParameters,
          channel: undefined as any,
        });
        assert.equal(request.validate(), 'Missing message action channel');
      });

      it('should handle null messageTimetoken', () => {
        const request = new RemoveMessageAction({
          ...defaultParameters,
          messageTimetoken: null as any,
        });
        assert.equal(request.validate(), 'Missing message timetoken');
      });

      it('should handle null actionTimetoken', () => {
        const request = new RemoveMessageAction({
          ...defaultParameters,
          actionTimetoken: null as any,
        });
        assert.equal(request.validate(), 'Missing action timetoken');
      });
    });
  });

  describe('boundary value testing', () => {
    it('should handle minimum valid action.type length', () => {
      const request = new AddMessageActionRequest({
        channel: 'test',
        messageTimetoken: '1234567890',
        action: { type: 'a', value: 'test' },
        keySet: defaultKeySet,
      });
      assert.equal(request.validate(), undefined);
    });

    it('should handle special characters in action values', () => {
      const request = new AddMessageActionRequest({
        channel: 'test',
        messageTimetoken: '1234567890',
        action: { type: 'reaction', value: '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`' },
        keySet: defaultKeySet,
      });
      assert.equal(request.validate(), undefined);
    });

    it('should handle very long action values', () => {
      const longValue = 'a'.repeat(1000);
      const request = new AddMessageActionRequest({
        channel: 'test',
        messageTimetoken: '1234567890',
        action: { type: 'reaction', value: longValue },
        keySet: defaultKeySet,
      });
      assert.equal(request.validate(), undefined);
    });

    it('should handle numeric strings as timetoken', () => {
      const request = new AddMessageActionRequest({
        channel: 'test',
        messageTimetoken: '999999999999999999',
        action: { type: 'reaction', value: 'test' },
        keySet: defaultKeySet,
      });
      assert.equal(request.validate(), undefined);
    });
  });

  describe('concurrent request isolation', () => {
    it('should maintain isolated configurations across multiple requests', () => {
      const request1 = new AddMessageActionRequest({
        channel: 'channel1',
        messageTimetoken: '1111111111',
        action: { type: 'reaction', value: 'value1' },
        keySet: defaultKeySet,
      });

      const request2 = new AddMessageActionRequest({
        channel: 'channel2',
        messageTimetoken: '2222222222',
        action: { type: 'custom', value: 'value2' },
        keySet: { subscribeKey: 'different_key', publishKey: 'pub' },
      });

      const transport1 = request1.request();
      const transport2 = request2.request();

      assert(transport1.path.includes('channel1'));
      assert(transport1.path.includes('1111111111'));
      assert.equal(transport1.body, JSON.stringify({ type: 'reaction', value: 'value1' }));

      assert(transport2.path.includes('channel2'));
      assert(transport2.path.includes('2222222222'));
      assert(transport2.path.includes('different_key'));
      assert.equal(transport2.body, JSON.stringify({ type: 'custom', value: 'value2' }));
    });
  });
});
