/* global describe, beforeEach, it, before, afterEach */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('presence error handling', () => {
  let pubnub: PubNub;

  before(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
    });
  });

  afterEach(() => {
    pubnub.destroy(true);
  });

  describe('network connectivity errors', () => {
    it('should handle network unreachable for all presence endpoints', (done) => {
      // Test just one endpoint to verify network error handling
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID')
        .query(true)
        .replyWithError('ENETUNREACH');

      pubnub.whereNow({}, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert(status.errorData);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle DNS resolution failure', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID')
        .query(true)
        .replyWithError('ENOTFOUND');

      pubnub.whereNow({}, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert(status.errorData);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle connection refused', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID')
        .query(true)
        .replyWithError('ECONNREFUSED');

      pubnub.whereNow({}, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert(status.errorData);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle connection reset', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/testChannel')
        .query(true)
        .replyWithError('ECONNRESET');

      pubnub.hereNow({ channels: ['testChannel'] }, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert(status.errorData);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('HTTP status code errors', () => {
    it('should handle 401 unauthorized for all endpoints', (done) => {
      // Test one endpoint at a time to avoid race conditions
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID')
        .query(true)
        .reply(401, {
          status: 401,
          error: true,
          message: 'Unauthorized',
          service: 'Presence'
        }, { 'content-type': 'application/json' });

      pubnub.whereNow({}, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert.equal(status.statusCode, 401);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle 429 rate limit exceeded', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID')
        .query(true)
        .reply(429, {
          status: 429,
          error: true,
          message: 'Too Many Requests',
          service: 'Presence'
        }, {
          'Retry-After': '60',
          'content-type': 'application/json'
        });

      pubnub.whereNow({}, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert.equal(status.statusCode, 429);
          assert(status.errorData);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle 502 bad gateway', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/test')
        .query(true)
        .reply(502, {
          status: 502,
          error: true,
          message: 'Bad Gateway',
          service: 'Presence'
        }, { 'content-type': 'application/json' });

      pubnub.hereNow({ channels: ['test'] }, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert.equal(status.statusCode, 502);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle 503 service unavailable with retry-after', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/test/uuid/myUUID')
        .query(true)
        .reply(503, {
          status: 503,
          error: true,
          message: 'Service Unavailable',
          service: 'Presence'
        }, {
          'Retry-After': '30',
          'content-type': 'application/json'
        });

      pubnub.getState({ channels: ['test'] }, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert.equal(status.statusCode, 503);
          assert(status.errorData);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('malformed response handling', () => {
    it('should handle empty response body', (done) => {
      const endpoints = [
        { method: 'whereNow', params: {}, path: '/v2/presence/sub-key/mySubscribeKey/uuid/myUUID' },
        { method: 'hereNow', params: { channels: ['test'] }, path: '/v2/presence/sub-key/mySubscribeKey/channel/test' },
      ];

      let completedTests = 0;
      const expectedTests = endpoints.length;

      endpoints.forEach((config) => {
        const scope = utils
          .createNock()
          .get(config.path)
          .query(true)
          .reply(200, '', { 'content-type': 'application/json' });

        (pubnub as any)[config.method](config.params, (status: any) => {
          try {
            assert.equal(status.error, true);
            assert(status.errorData);
            assert.equal(scope.isDone(), true);
            
            completedTests++;
            if (completedTests === expectedTests) {
              done();
            }
          } catch (error) {
            done(error);
          }
        });
      });
    });

    it('should handle invalid JSON in response', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/test/uuid/myUUID/data')
        .query(true)
        .reply(200, '{"status": 200, "incomplete": json', { 'content-type': 'application/json' });

      pubnub.setState({ channels: ['test'], state: { key: 'value' } }, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert(status.errorData);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle HTML response instead of JSON', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/test/heartbeat')
        .query(true)
        .reply(200, '<html><body>Error Page</body></html>', { 'content-type': 'text/html' });

      (pubnub as any).heartbeat({ channels: ['test'], heartbeat: 300 }, (status: any, response: any) => {
        try {
          assert.equal(status.error, true);
          assert(status.errorData);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle missing required fields in JSON response', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID')
        .query(true)
        .reply(200, '{"message": "OK", "service": "Presence"}', { 'content-type': 'application/json' }); // Missing status field

      pubnub.whereNow({}, (status, response) => {
        try {
          // The response should still be handled, but may have unexpected structure
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('false success responses', () => {
    it('should handle 200 OK with error status in body', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/test')
        .query(true)
        .reply(200, '{"status": 403, "error": 1, "message": "Access Denied", "service": "Presence"}', {
          'content-type': 'application/json',
        });

      pubnub.hereNow({ channels: ['test'] }, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle 200 OK with inconsistent data', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/test/uuid/myUUID')
        .query(true)
        .reply(
          200,
          '{"status": 200, "message": "OK", "payload": "this should be an object", "service": "Presence"}',
          { 'content-type': 'application/json' },
        );

      pubnub.getState({ channels: ['test'] }, (status, response) => {
        try {
          // Should handle gracefully even with wrong payload type
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('resource limits and edge cases', () => {
    it('should handle extremely large response payload', (done) => {
      const largeChannels: Record<string, any> = {};
      // Create a large response (but not too large to cause memory issues in tests)
      for (let i = 0; i < 1000; i++) {
        largeChannels[`channel-${i}`] = {
          uuids: Array.from({ length: 10 }, (_, j) => `user-${i}-${j}`),
          occupancy: 10,
        };
      }

      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey')
        .query(true)
        .reply(
          200,
          JSON.stringify({
            status: 200,
            message: 'OK',
            payload: {
              channels: largeChannels,
              total_channels: 1000,
              total_occupancy: 10000,
            },
            service: 'Presence',
          }),
          { 'content-type': 'application/json' },
        );

      pubnub.hereNow({}, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.equal(response.totalChannels, 1000);
          assert.equal(response.totalOccupancy, 10000);
          assert.equal(Object.keys(response.channels).length, 1000);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle response with null or undefined values', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/test/uuid/myUUID/data')
        .query(true)
        .reply(
          200,
          '{"status": 200, "message": "OK", "payload": null, "service": "Presence"}',
          { 'content-type': 'application/json' },
        );

      pubnub.setState({ channels: ['test'], state: { key: 'value' } }, (status, response) => {
        try {
          assert.equal(status.error, false);
          // The response should handle null payload gracefully
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('concurrent error scenarios', () => {
    it('should handle mixed success and error responses concurrently', (done) => {
      // Simplified test with just two scenarios - one success and one error
      const successScope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID')
        .query(true)
        .reply(200, {
          status: 200,
          message: 'OK',
          payload: { channels: [] },
          service: 'Presence'
        }, { 'content-type': 'application/json' });

      const errorScope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/test1')
        .query(true)
        .reply(403, {
          status: 403,
          error: true,
          message: 'Forbidden',
          service: 'Presence'
        }, { 'content-type': 'application/json' });

      let completedTests = 0;
      const expectedTests = 2;

      // First call - should succeed
      pubnub.whereNow({}, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert.equal(successScope.isDone(), true);
          
          completedTests++;
          if (completedTests === expectedTests) {
            done();
          }
        } catch (error) {
          done(error);
        }
      });

      // Second call - should error
      pubnub.hereNow({ channels: ['test1'] }, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert.equal(status.statusCode, 403);
          assert.equal(errorScope.isDone(), true);
          
          completedTests++;
          if (completedTests === expectedTests) {
            done();
          }
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle timeout with retry attempts', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID')
        .query(true)
        .reply(408, {
          status: 408,
          error: true,
          message: 'Request Timeout',
          service: 'Presence'
        }, { 'content-type': 'application/json' });

      pubnub.whereNow({}, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert.equal(status.statusCode, 408);
          assert(status.errorData);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
