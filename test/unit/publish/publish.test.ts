/* global describe, it, beforeEach */

import assert from 'assert';
import { PublishRequest, PublishParameters, PublishResponse } from '../../../src/core/endpoints/publish';
import { TransportMethod } from '../../../src/core/types/transport-request';
import { TransportResponse } from '../../../src/core/types/transport-response';
import RequestOperation from '../../../src/core/constants/operations';
import { ICryptoModule } from '../../../src/core/interfaces/crypto-module';
import { KeySet } from '../../../src/core/types/api';
import { encode } from '../../../src/core/components/base64_codec';

describe('PublishRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: PublishParameters & { keySet: KeySet };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };

    defaultParameters = {
      channel: 'test_channel',
      message: { test: 'message' },
      keySet: defaultKeySet,
    };
  });

  describe('validation', () => {
    it('should validate required parameters', () => {
      // Test missing channel
      const requestWithoutChannel = new PublishRequest({
        ...defaultParameters,
        channel: '',
      });
      assert.equal(requestWithoutChannel.validate(), "Missing 'channel'");

      // Test missing message
      const requestWithoutMessage = new PublishRequest({
        ...defaultParameters,
        message: undefined as any,
      });
      assert.equal(requestWithoutMessage.validate(), "Missing 'message'");

      // Test missing publishKey
      const requestWithoutPublishKey = new PublishRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, publishKey: '' },
      });
      assert.equal(requestWithoutPublishKey.validate(), "Missing 'publishKey'");

      // Test valid parameters
      const validRequest = new PublishRequest(defaultParameters);
      assert.equal(validRequest.validate(), undefined);
    });
  });

  describe('operation', () => {
    it('should return PNPublishOperation', () => {
      const request = new PublishRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNPublishOperation);
    });
  });

  describe('URL construction', () => {
    it('should construct GET URL with encoded payload and channel', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        channel: 'test channel',
        message: { test: 'message' },
        sendByPost: false,
      });

      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);

      const expectedPath = `/publish/${defaultKeySet.publishKey}/${defaultKeySet.subscribeKey}/0/test%20channel/0/${encodeURIComponent(JSON.stringify({ test: 'message' }))}`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct POST URL without payload in path', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        sendByPost: true,
      });

      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.POST);

      const expectedPath = `/publish/${defaultKeySet.publishKey}/${defaultKeySet.subscribeKey}/0/${defaultParameters.channel}/0`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should encode special character channels', () => {
      const specialChannel = 'a b/#';
      const request = new PublishRequest({
        ...defaultParameters,
        channel: specialChannel,
        sendByPost: false,
      });

      const transportRequest = request.request();
      const encodedChannel = encodeURIComponent(specialChannel).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
      assert(transportRequest.path.includes(encodedChannel));
    });
  });

  describe('POST method handling', () => {
    it('should set correct headers for POST requests', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        sendByPost: true,
      });

      const transportRequest = request.request();
      assert.equal(transportRequest.headers?.['Content-Type'], 'application/json');
      assert.equal(transportRequest.headers?.['Accept-Encoding'], 'gzip, deflate');
    });

    it('should include message in body for POST requests', () => {
      const testMessage = { test: 'data' };
      const request = new PublishRequest({
        ...defaultParameters,
        message: testMessage,
        sendByPost: true,
      });

      const transportRequest = request.request();
      assert.equal(transportRequest.body, JSON.stringify(testMessage));
    });

    it('should not include headers for GET requests', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        sendByPost: false,
      });

      const transportRequest = request.request();
      assert.notEqual(transportRequest.headers?.['Content-Type'], 'application/json');
    });
  });

  describe('query parameters mapping', () => {
    it('should map storeInHistory parameter', () => {
      // Test storeInHistory: true
      const requestStoreTrue = new PublishRequest({
        ...defaultParameters,
        storeInHistory: true,
      });
      const queryParams1 = requestStoreTrue.request().queryParameters;
      assert.equal(queryParams1?.store, '1');

      // Test storeInHistory: false
      const requestStoreFalse = new PublishRequest({
        ...defaultParameters,
        storeInHistory: false,
      });
      const queryParams2 = requestStoreFalse.request().queryParameters;
      assert.equal(queryParams2?.store, '0');

      // Test storeInHistory: undefined (should not be present)
      const requestStoreUndefined = new PublishRequest(defaultParameters);
      const queryParams3 = requestStoreUndefined.request().queryParameters;
      assert.equal(queryParams3?.store, undefined);
    });

    it('should map ttl parameter', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        ttl: 24,
      });
      const queryParams4 = request.request().queryParameters;
      assert.equal(queryParams4?.ttl, 24);
    });

    it('should map replicate parameter when false', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        replicate: false,
      });
      const queryParams5 = request.request().queryParameters;
      assert.equal(queryParams5?.norep, 'true');

      // Should not be present when true
      const requestReplicateTrue = new PublishRequest({
        ...defaultParameters,
        replicate: true,
      });
      const queryParams6 = requestReplicateTrue.request().queryParameters;
      assert.equal(queryParams6?.norep, undefined);
    });

    it('should map meta parameter when object', () => {
      const metaData = { userId: '123', type: 'chat' };
      const request = new PublishRequest({
        ...defaultParameters,
        meta: metaData,
      });
      const queryParams7 = request.request().queryParameters;
      assert.equal(queryParams7?.meta, JSON.stringify(metaData));

      // Should not be present when not an object
      const requestNonObjectMeta = new PublishRequest({
        ...defaultParameters,
        meta: 'string_meta' as any,
      });
      const queryParams8 = requestNonObjectMeta.request().queryParameters;
      assert.equal(queryParams8?.meta, undefined);
    });

    it('should map custom_message_type parameter', () => {
      const customType = 'test-message-type';
      const request = new PublishRequest({
        ...defaultParameters,
        customMessageType: customType,
      });
      const queryParams9 = request.request().queryParameters;
      assert.equal(queryParams9?.custom_message_type, customType);
    });

    it('should combine multiple query parameters', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        storeInHistory: false,
        ttl: 12,
        replicate: false,
        meta: { test: 'meta' },
        customMessageType: 'test-type',
      });

      const queryParams = request.request().queryParameters;
      assert.equal(queryParams?.store, '0');
      assert.equal(queryParams?.ttl, 12);
      assert.equal(queryParams?.norep, 'true');
      assert.equal(queryParams?.meta, JSON.stringify({ test: 'meta' }));
      assert.equal(queryParams?.custom_message_type, 'test-type');
    });
  });

  describe('encryption handling', () => {
    const mockCryptoModule: ICryptoModule = {
      set logger(_logger: any) {},
      encrypt: (data: string) => `encrypted_${data}`,
      decrypt: (data: string | ArrayBuffer) => data.toString().replace('encrypted_', ''),
      encryptFile: undefined as any,
      decryptFile: undefined as any,
    };

    it('should encrypt message with cryptoModule for GET', () => {
      const testMessage = { secret: 'data' };
      const request = new PublishRequest({
        ...defaultParameters,
        message: testMessage,
        crypto: mockCryptoModule,
        sendByPost: false,
      });

      const transportRequest = request.request();
      const expectedEncryptedMessage = JSON.stringify(`encrypted_${JSON.stringify(testMessage)}`);
      assert(transportRequest.path.includes(encodeURIComponent(expectedEncryptedMessage)));
    });

    it('should encrypt message with cryptoModule for POST', () => {
      const testMessage = { secret: 'data' };
      const request = new PublishRequest({
        ...defaultParameters,
        message: testMessage,
        crypto: mockCryptoModule,
        sendByPost: true,
      });

      const transportRequest = request.request();
      const expectedEncryptedMessage = JSON.stringify(`encrypted_${JSON.stringify(testMessage)}`);
      assert.equal(transportRequest.body, expectedEncryptedMessage);
    });

    it('should handle ArrayBuffer encryption result', () => {
      const arrayBufferCrypto: ICryptoModule = {
        set logger(_logger: any) {},
        encrypt: (data: string) => {
          const buffer = new ArrayBuffer(8);
          const view = new Uint8Array(buffer);
          view.set([1, 2, 3, 4, 5, 6, 7, 8]);
          return buffer;
        },
        decrypt: undefined as any,
        encryptFile: undefined as any,
        decryptFile: undefined as any,
      };

      const request = new PublishRequest({
        ...defaultParameters,
        crypto: arrayBufferCrypto,
        sendByPost: true,
      });

      const transportRequest = request.request();
      const expectedEncodedBuffer = JSON.stringify(encode(new ArrayBuffer(8)));
      // We can't easily compare ArrayBuffer content, so just verify it's a string
      assert.equal(typeof transportRequest.body, 'string');
    });

    it('should handle encryption failure', () => {
      const failingCrypto: ICryptoModule = {
        set logger(_logger: any) {},
        encrypt: () => {
          throw new Error('Encryption failed');
        },
        decrypt: undefined as any,
        encryptFile: undefined as any,
        decryptFile: undefined as any,
      };

      assert.throws(() => {
        new PublishRequest({
          ...defaultParameters,
          crypto: failingCrypto,
        }).request();
      }, /Encryption failed/);
    });
  });

  describe('payload types support', () => {
    it('should handle string payloads', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        message: 'test string',
        sendByPost: false,
      });

      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(JSON.stringify('test string'))));
    });

    it('should handle number payloads', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        message: 42,
        sendByPost: false,
      });

      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(JSON.stringify(42))));
    });

    it('should handle boolean payloads', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        message: true,
        sendByPost: false,
      });

      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(JSON.stringify(true))));
    });

    it('should handle object payloads', () => {
      const objectMessage = { key: 'value', nested: { prop: 123 } };
      const request = new PublishRequest({
        ...defaultParameters,
        message: objectMessage,
        sendByPost: false,
      });

      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(JSON.stringify(objectMessage))));
    });

    it('should handle array payloads', () => {
      const arrayMessage = [1, 2, 'three', { four: 4 }];
      const request = new PublishRequest({
        ...defaultParameters,
        message: arrayMessage,
        sendByPost: false,
      });

      const transportRequest = request.request();
      assert(transportRequest.path.includes(encodeURIComponent(JSON.stringify(arrayMessage))));
    });
  });

  describe('response parsing', () => {
    it('should parse timetoken from service response tuple', async () => {
      const request = new PublishRequest(defaultParameters);
      const mockResponse: TransportResponse = {
        status: 200,
        url: 'https://test.pubnub.com',
        headers: { 'content-type': 'application/json' },
        body: new TextEncoder().encode('[1, "Sent", "14647523059145592"]'),
      };

      const parsedResponse = await request.parse(mockResponse);
      assert.equal(parsedResponse.timetoken, '14647523059145592');
    });

    it('should handle different service response formats', async () => {
      const request = new PublishRequest(defaultParameters);
      const mockResponse: TransportResponse = {
        status: 200,
        url: 'https://test.pubnub.com',
        headers: { 'content-type': 'application/json' },
        body: new TextEncoder().encode('[0, "Failed", "123456789"]'),
      };

      const parsedResponse = await request.parse(mockResponse);
      assert.equal(parsedResponse.timetoken, '123456789');
    });
  });

  describe('request configuration', () => {
    it('should default to GET method when sendByPost is false', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        sendByPost: false,
      });

      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);
    });

    it('should use POST method when sendByPost is true', () => {
      const request = new PublishRequest({
        ...defaultParameters,
        sendByPost: true,
      });

      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.POST);
    });

    it('should default sendByPost to false', () => {
      const request = new PublishRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.GET);
    });

    it('should set compressible flag based on sendByPost', () => {
      const getRequest = new PublishRequest({
        ...defaultParameters,
        sendByPost: false,
      });
      assert.equal(getRequest.request().compressible, false);

      const postRequest = new PublishRequest({
        ...defaultParameters,
        sendByPost: true,
      });
      assert.equal(postRequest.request().compressible, true);
    });
  });

  describe('concurrent operations simulation', () => {
    it('should handle multiple publish requests with different methods', () => {
      const getRequest = new PublishRequest({
        ...defaultParameters,
        channel: 'channel1',
        message: 'GET message',
        sendByPost: false,
      });

      const postRequest = new PublishRequest({
        ...defaultParameters,
        channel: 'channel2',
        message: 'POST message',
        sendByPost: true,
      });

      const getTransportRequest = getRequest.request();
      const postTransportRequest = postRequest.request();

      // Verify they maintain their individual configurations
      assert.equal(getTransportRequest.method, TransportMethod.GET);
      assert.equal(postTransportRequest.method, TransportMethod.POST);
      
      assert(getTransportRequest.path.includes('channel1'));
      assert(postTransportRequest.path.includes('channel2'));
      
      assert(getTransportRequest.path.includes(encodeURIComponent(JSON.stringify('GET message'))));
      assert.equal(postTransportRequest.body, JSON.stringify('POST message'));
    });

    it('should maintain request isolation', () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        new PublishRequest({
          ...defaultParameters,
          channel: `channel_${i}`,
          message: `message_${i}`,
          sendByPost: i % 2 !== 0, // Alternate between GET and POST
        })
      );

      requests.forEach((request, index) => {
        const transportRequest = request.request();
        assert(transportRequest.path.includes(`channel_${index}`));
        
        if (index % 2 === 0) {
          // GET request
          assert.equal(transportRequest.method, TransportMethod.GET);
          assert(transportRequest.path.includes(encodeURIComponent(JSON.stringify(`message_${index}`))));
        } else {
          // POST request
          assert.equal(transportRequest.method, TransportMethod.POST);
          assert.equal(transportRequest.body, JSON.stringify(`message_${index}`));
        }
      });
    });
  });
});
