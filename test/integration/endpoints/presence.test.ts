/* global describe, beforeEach, it, before, after */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('presence endpoints', () => {
  let pubnub: PubNub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
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

  describe('#whereNow', () => {
    it('returns the requested data for user UUID', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(200, '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "Presence"}', {
          'content-type': 'text/javascript',
        });

      pubnub.whereNow({}, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, ["a", "b"]);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns the requested data for user encoded UUID', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID%231')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID#1',
        })
        .reply(200, '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "Presence"}', {
          'content-type': 'text/javascript',
        });

      const pubnubClient = new PubNub({
        subscribeKey: 'mySubscribeKey',
        publishKey: 'myPublishKey',
        uuid: 'myUUID#1',
        // @ts-expect-error Force override default value.
        useRequestId: false,
      });

      pubnubClient.whereNow({}, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, ["a", "b"]);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns the requested data for somebody elses UUID', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/otherUUID')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(200, '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "Presence"}', {
          'content-type': 'text/javascript',
        });

      pubnub.whereNow({ uuid: 'otherUUID' }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, ["a", "b"]);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns empty response object when serverResponse has no payload', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/uuid/')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}', {
          'content-type': 'text/javascript',
        });

      pubnub.whereNow({ uuid: '' }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, []);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('#setState', () => {
    it('sets presence data for user UUID', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/testChannel/uuid/myUUID/data')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          state: '{"new":"state"}',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.setState({ channels: ['testChannel'], state: { new: 'state' } }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.state, { age: 20, status: "online" });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('sets presence data for user encoded UUID and encoded channel', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/testChannel%231/uuid/myUUID%231/data')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID#1',
          state: '{"new":"state"}',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      const pubnubClient = new PubNub({
        subscribeKey: 'mySubscribeKey',
        publishKey: 'myPublishKey',
        uuid: 'myUUID#1',
        // @ts-expect-error Force override default value.
        useRequestId: false,
      });

      pubnubClient.setState({ channels: ['testChannel#1'], state: { new: 'state' } }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.state, { age: 20, status: "online" });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('sets presence data for multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/uuid/myUUID/data')

        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          state: '{"new":"state"}',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "ch1": { "age" : 20, "status" : "online"}, "ch2": { "age": 100, "status": "offline" } }, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.setState({ channels: ['ch1', 'ch2'], state: { new: 'state' } }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.state, {
            ch1: { age: 20, status: "online" },
            ch2: { age: 100, status: "offline" }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('sets state for multiple channels / channel groups', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/uuid/myUUID/data')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          'channel-group': 'cg1,cg2',
          state: '{"new":"state"}',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.setState(
        {
          channels: ['ch1', 'ch2'],
          channelGroups: ['cg1', 'cg2'],
          state: { new: 'state' },
        },
        (status, response) => {
          try {
            assert.equal(status.error, false);
            assert(response !== null);
            assert.deepEqual(response.state, { age: 20, status: "online" });
            assert.equal(scope.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });
  });

  describe('#getState', () => {
    it('returns the requested data for user UUID', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/testChannel/uuid/myUUID')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.getState({ channels: ['testChannel'] }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            testChannel: { age: 20, status: "online" }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns the requested data for another UUID', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/testChannel/uuid/otherUUID')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.getState({ uuid: 'otherUUID', channels: ['testChannel'] }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            testChannel: { age: 20, status: "online" }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns the requested for multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/uuid/myUUID')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "ch1": { "age" : 20, "status" : "online"}, "ch2": { "age": 100, "status": "offline" } }, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.getState({ channels: ['ch1', 'ch2'] }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            ch1: { age: 20, status: "online" },
            ch2: { age: 100, status: "offline" }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns the requested for multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2/uuid/myUUID')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          'channel-group': 'cg1,cg2',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "ch1": { "age" : 20, "status" : "online"}, "ch2": { "age": 100, "status": "offline" } }, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.getState({ channels: ['ch1', 'ch2'], channelGroups: ['cg1', 'cg2'] }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            ch1: { age: 20, status: "online" },
            ch2: { age: 100, status: "offline" }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('#hereNow', () => {
    it('returns response for a single channel', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/game1')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{"status": 200, "message": "OK", "uuids": ["a3ffd012-a3b9-478c-8705-64089f24d71e"], "occupancy": 1, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.hereNow({ channels: ['game1'] }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            game1: {
              name: "game1",
              occupancy: 1,
              occupants: [
                {
                  state: null,
                  uuid: "a3ffd012-a3b9-478c-8705-64089f24d71e"
                }
              ]
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns response for single channel when uuids not in response payload', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/game1')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(200, '{"status": 200, "message": "OK", "occupancy": 1, "service": "Presence"}', {
          'content-type': 'text/javascript',
        });

      pubnub.hereNow({ channels: ['game1'] }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            game1: {
              name: "game1",
              occupancy: 1,
              occupants: []
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns response for multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{"status": 200, "message": "OK", "payload": {"channels": {"game1": {"uuids": ["a3ffd012-a3b9-478c-8705-64089f24d71e"], "occupancy": 1}}, "total_channels": 1, "total_occupancy": 1}, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.hereNow({ channels: ['ch1', 'ch2'] }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            game1: {
              name: "game1",
              occupancy: 1,
              occupants: [
                {
                  state: null,
                  uuid: "a3ffd012-a3b9-478c-8705-64089f24d71e"
                }
              ]
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns response for multiple channel with state', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          state: 1,
        })
        .reply(
          200,
          '{"status":200,"message":"OK","payload":{"total_occupancy":3,"total_channels":2,"channels":{"ch1":{"occupancy":1,"uuids":[{"uuid":"user1"}]},"ch2":{"occupancy":2,"uuids":[{"uuid":"user1"},{"uuid":"user3"}]}}},"service":"Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.hereNow({ channels: ['ch1', 'ch2'], includeState: true }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            ch1: {
              name: "ch1",
              occupancy: 1,
              occupants: [
                {
                  uuid: "user1"
                }
              ]
            },
            ch2: {
              name: "ch2",
              occupancy: 2,
              occupants: [
                {
                  uuid: "user1"
                },
                {
                  uuid: "user3"
                }
              ]
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns response for multiple channel here now without UUIDS', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1,ch2')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          disable_uuids: 1,
        })
        .reply(
          200,
          '{"status":200,"message":"OK","payload":{"total_occupancy":3,"total_channels":2,"channels":{"ch1":{"occupancy":1,"uuids":[{"uuid":"user1"}]},"ch2":{"occupancy":2,"uuids":[{"uuid":"user1"},{"uuid":"user3"}]}}},"service":"Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.hereNow({ channels: ['ch1', 'ch2'], includeUUIDs: false }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            ch1: {
              name: "ch1",
              occupancy: 1,
              occupants: []
            },
            ch2: {
              name: "ch2",
              occupancy: 2,
              occupants: []
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns response for channel group', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/,')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          'channel-group': 'cg1',
        })
        .reply(
          200,
          ' {"status": 200, "message": "OK", "payload": {"channels": {"ch1": {"uuids": ["a581c974-e2f9-4088-9cc8-9632708e012d"], "occupancy": 1}}, "total_channels": 1, "total_occupancy": 1}, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.hereNow({ channelGroups: ['cg1'] }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            ch1: {
              name: "ch1",
              occupancy: 1,
              occupants: [
                {
                  state: null,
                  uuid: "a581c974-e2f9-4088-9cc8-9632708e012d"
                }
              ]
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns response for global here-now', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{"status": 200, "message": "OK", "payload": {"channels": {"ch10": {"uuids": ["2c3b136e-dc9e-4e97-939c-752dbb47acbd"], "occupancy": 1}, "bot_object": {"uuids": ["fb49e109-756f-483e-92dc-d966d73a119d"], "occupancy": 1}}, "total_channels": 2, "total_occupancy": 2}, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.hereNow({}, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            bot_object: {
              name: "bot_object",
              occupancy: 1,
              occupants: [
                {
                  state: null,
                  uuid: "fb49e109-756f-483e-92dc-d966d73a119d"
                }
              ]
            },
            ch10: {
              name: "ch10",
              occupancy: 1,
              occupants: [
                {
                  state: null,
                  uuid: "2c3b136e-dc9e-4e97-939c-752dbb47acbd"
                }
              ]
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns response for global here-now with uuids disabled', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          disable_uuids: 1,
        })
        .reply(
          200,
          '{"status": 200, "message": "OK", "payload": {"channels": {"ch10": {"occupancy": 1}, "bot_object": {"occupancy": 1}}, "total_channels": 2, "total_occupancy": 2}, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.hereNow({ includeUUIDs: false }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            bot_object: {
              name: "bot_object",
              occupancy: 1,
              occupants: []
            },
            ch10: {
              name: "ch10",
              occupancy: 1,
              occupants: []
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('recovers from false 200 via status', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          disable_uuids: 1,
        })
        .reply(200, '{"status": 503, "message": "Service Unavailable", "error": 1, "service": "Presence"}', {
          'content-type': 'text/javascript',
        });

      pubnub.hereNow({ includeUUIDs: false }, (status) => {
        try {
          assert.equal(status.error, true);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('reports proper error message from 402 status for GlobalHereNow', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{"status": 402, "error": 1, "message": "This feature is not turned on for this account. Contact support@pubnub.com to activate this feature.", "service": "Presence"}',
          {
            'content-type': 'text/javascript',
          },
        );

      let expected =
        'This feature is not turned on for this account. Contact support@pubnub.com to activate this feature.';
      pubnub.hereNow({ channels: [] }, (status) => {
        try {
          assert.equal(status.error, true);
          assert(status.errorData);
          // @ts-expect-error `errorData` may contain a dictionary (Payload) with an arbitrary set of fields.
          assert.equal(status.errorData.message, expected);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('passes arbitrary query parameters', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/game1')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          test: 'param',
        })
        .reply(
          200,
          '{"status": 200, "message": "OK", "uuids": ["a3ffd012-a3b9-478c-8705-64089f24d71e"], "occupancy": 1, "service": "Presence"}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.hereNow({ channels: ['game1'], queryParameters: { test: 'param' } }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, {
            game1: {
              name: "game1",
              occupancy: 1,
              occupants: [
                {
                  state: null,
                  uuid: "a3ffd012-a3b9-478c-8705-64089f24d71e"
                }
              ]
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
