/* global describe, beforeEach, it, before, after */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('presence endpoints', () => {
  let pubnubOther;
  let pubnub;

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
        .reply(
          200,
          '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "Presence"}'
        );

      pubnub.whereNow({}, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, ['a', 'b']);
        assert.equal(scope.isDone(), true);
        done();
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
        .reply(
          200,
          '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "Presence"}'
        );

      const pubnubClient = new PubNub({
        subscribeKey: 'mySubscribeKey',
        publishKey: 'myPublishKey',
        uuid: 'myUUID#1',
      });

      pubnubClient.whereNow({}, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, ['a', 'b']);
        assert.equal(scope.isDone(), true);
        done();
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
        .reply(
          200,
          '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "Presence"}'
        );

      pubnub.whereNow({ uuid: 'otherUUID' }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, ['a', 'b']);
        assert.equal(scope.isDone(), true);
        done();
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
        .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}');

      pubnub.whereNow({ uuid: '' }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, []);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add where now API telemetry information', (done) => {
      let scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/uuid/myUUID').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '{"status": 200, "message": "OK", "payload": {"channels": ["a","b"]}, "service": "Presence"}',
        delays,
        (completion) => {
          pubnub.whereNow(
            {},
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_pres', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('#setState', () => {
    it('sets presence data for user UUID', (done) => {
      const scope = utils
        .createNock()
        .get(
          '/v2/presence/sub-key/mySubscribeKey/channel/testChannel/uuid/myUUID/data'
        )
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          state: '{"new":"state"}',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}'
        );

      pubnub.setState(
        { channels: ['testChannel'], state: { new: 'state' } },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.state, { age: 20, status: 'online' });
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('sets presence data for user encoded UUID and encoded channel', (done) => {
      const scope = utils
        .createNock()
        .get(
          '/v2/presence/sub-key/mySubscribeKey/channel/testChannel%231/uuid/myUUID%231/data'
        )
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID#1',
          state: '{"new":"state"}',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}'
        );

      const pubnubClient = new PubNub({
        subscribeKey: 'mySubscribeKey',
        publishKey: 'myPublishKey',
        uuid: 'myUUID#1',
      });

      pubnubClient.setState(
        { channels: ['testChannel#1'], state: { new: 'state' } },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.state, { age: 20, status: 'online' });
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('sets presence data for multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get(
          '/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2/uuid/myUUID/data'
        )
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          state: '{"new":"state"}',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "ch1": { "age" : 20, "status" : "online"}, "ch2": { "age": 100, "status": "offline" } }, "service": "Presence"}'
        );

      pubnub.setState(
        { channels: ['ch1', 'ch2'], state: { new: 'state' } },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.state, {
            ch1: { age: 20, status: 'online' },
            ch2: { age: 100, status: 'offline' },
          });
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('sets state for multiple channels / channel groups', (done) => {
      const scope = utils
        .createNock()
        .get(
          '/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2/uuid/myUUID/data'
        )
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          'channel-group': 'cg1,cg2',
          state: '{"new":"state"}',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}'
        );

      pubnub.setState(
        {
          channels: ['ch1', 'ch2'],
          channelGroups: ['cg1', 'cg2'],
          state: { new: 'state' },
        },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.state, { age: 20, status: 'online' });
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('should add set state API telemetry information', (done) => {
      let scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/testChannel/uuid/myUUID/data').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}',
        delays,
        (completion) => {
          pubnub.setState(
            { channels: ['testChannel'], state: { new: 'state' } },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_pres', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('#getState', () => {
    it('returns the requested data for user UUID', (done) => {
      const scope = utils
        .createNock()
        .get(
          '/v2/presence/sub-key/mySubscribeKey/channel/testChannel/uuid/myUUID'
        )
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}'
        );

      pubnub.getState({ channels: ['testChannel'] }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          testChannel: { age: 20, status: 'online' },
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns the requested data for another UUID', (done) => {
      const scope = utils
        .createNock()
        .get(
          '/v2/presence/sub-key/mySubscribeKey/channel/testChannel/uuid/otherUUID'
        )
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}'
        );

      pubnub.getState(
        { uuid: 'otherUUID', channels: ['testChannel'] },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.channels, {
            testChannel: { age: 20, status: 'online' },
          });
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('returns the requested for multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get(
          '/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2/uuid/myUUID'
        )
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "ch1": { "age" : 20, "status" : "online"}, "ch2": { "age": 100, "status": "offline" } }, "service": "Presence"}'
        );

      pubnub.getState({ channels: ['ch1', 'ch2'] }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          ch1: { age: 20, status: 'online' },
          ch2: { age: 100, status: 'offline' },
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns the requested for multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get(
          '/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2/uuid/myUUID'
        )
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          'channel-group': 'cg1,cg2',
        })
        .reply(
          200,
          '{ "status": 200, "message": "OK", "payload": { "ch1": { "age" : 20, "status" : "online"}, "ch2": { "age": 100, "status": "offline" } }, "service": "Presence"}'
        );

      pubnub.getState(
        { channels: ['ch1', 'ch2'], channelGroups: ['cg1', 'cg2'] },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.channels, {
            ch1: { age: 20, status: 'online' },
            ch2: { age: 100, status: 'offline' },
          });
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('should add get state API telemetry information', (done) => {
      let scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/testChannel/uuid/myUUID').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '{ "status": 200, "message": "OK", "payload": { "age" : 20, "status" : "online"}, "service": "Presence"}',
        delays,
        (completion) => {
          pubnub.getState(
            { channels: ['testChannel'] },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_pres', average, leeway);
          done();
        });
    }).timeout(60000);
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
          '{"status": 200, "message": "OK", "uuids": ["a3ffd012-a3b9-478c-8705-64089f24d71e"], "occupancy": 1, "service": "Presence"}'
        );

      pubnub.hereNow({ channels: ['game1'] }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          game1: {
            name: 'game1',
            occupancy: 1,
            occupants: [
              {
                state: null,
                uuid: 'a3ffd012-a3b9-478c-8705-64089f24d71e',
              },
            ],
          },
        });
        assert.equal(scope.isDone(), true);
        done();
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
        .reply(
          200,
          '{"status": 200, "message": "OK", "occupancy": 1, "service": "Presence"}'
        );

      pubnub.hereNow({ channels: ['game1'] }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          game1: {
            name: 'game1',
            occupancy: 1,
            occupants: [],
          },
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns response for multiple channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
        })
        .reply(
          200,
          '{"status": 200, "message": "OK", "payload": {"channels": {"game1": {"uuids": ["a3ffd012-a3b9-478c-8705-64089f24d71e"], "occupancy": 1}}, "total_channels": 1, "total_occupancy": 1}, "service": "Presence"}'
        );

      pubnub.hereNow({ channels: ['ch1', 'ch2'] }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          game1: {
            name: 'game1',
            occupancy: 1,
            occupants: [
              {
                state: null,
                uuid: 'a3ffd012-a3b9-478c-8705-64089f24d71e',
              },
            ],
          },
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('returns response for multiple channel with state', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          state: 1,
        })
        .reply(
          200,
          '{"status":200,"message":"OK","payload":{"total_occupancy":3,"total_channels":2,"channels":{"ch1":{"occupancy":1,"uuids":[{"uuid":"user1"}]},"ch2":{"occupancy":2,"uuids":[{"uuid":"user1"},{"uuid":"user3"}]}}},"service":"Presence"}'
        );

      pubnub.hereNow(
        { channels: ['ch1', 'ch2'], includeState: true },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.channels, {
            ch1: {
              name: 'ch1',
              occupancy: 1,
              occupants: [
                {
                  state: undefined,
                  uuid: 'user1',
                },
              ],
            },
            ch2: {
              name: 'ch2',
              occupancy: 2,
              occupants: [
                {
                  state: undefined,
                  uuid: 'user1',
                },
                {
                  state: undefined,
                  uuid: 'user3',
                },
              ],
            },
          });
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('returns response for multiple channel here now without UUIDS', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/ch1%2Cch2')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          disable_uuids: 1,
        })
        .reply(
          200,
          '{"status":200,"message":"OK","payload":{"total_occupancy":3,"total_channels":2,"channels":{"ch1":{"occupancy":1,"uuids":[{"uuid":"user1"}]},"ch2":{"occupancy":2,"uuids":[{"uuid":"user1"},{"uuid":"user3"}]}}},"service":"Presence"}'
        );

      pubnub.hereNow(
        { channels: ['ch1', 'ch2'], includeUUIDs: false },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.channels, {
            ch1: {
              name: 'ch1',
              occupancy: 1,
              occupants: [],
            },
            ch2: {
              name: 'ch2',
              occupancy: 2,
              occupants: [],
            },
          });
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('returns response for channel group', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/%2C')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          'channel-group': 'cg1',
        })
        .reply(
          200,
          ' {"status": 200, "message": "OK", "payload": {"channels": {"ch1": {"uuids": ["a581c974-e2f9-4088-9cc8-9632708e012d"], "occupancy": 1}}, "total_channels": 1, "total_occupancy": 1}, "service": "Presence"}'
        );

      pubnub.hereNow({ channelGroups: ['cg1'] }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          ch1: {
            name: 'ch1',
            occupancy: 1,
            occupants: [
              {
                state: null,
                uuid: 'a581c974-e2f9-4088-9cc8-9632708e012d',
              },
            ],
          },
        });
        assert.equal(scope.isDone(), true);
        done();
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
          '{"status": 200, "message": "OK", "payload": {"channels": {"ch10": {"uuids": ["2c3b136e-dc9e-4e97-939c-752dbb47acbd"], "occupancy": 1}, "bot_object": {"uuids": ["fb49e109-756f-483e-92dc-d966d73a119d"], "occupancy": 1}}, "total_channels": 2, "total_occupancy": 2}, "service": "Presence"}'
        );

      pubnub.hereNow({}, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          bot_object: {
            name: 'bot_object',
            occupancy: 1,
            occupants: [
              {
                state: null,
                uuid: 'fb49e109-756f-483e-92dc-d966d73a119d',
              },
            ],
          },
          ch10: {
            name: 'ch10',
            occupancy: 1,
            occupants: [
              {
                state: null,
                uuid: '2c3b136e-dc9e-4e97-939c-752dbb47acbd',
              },
            ],
          },
        });
        assert.equal(scope.isDone(), true);
        done();
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
          '{"status": 200, "message": "OK", "payload": {"channels": {"ch10": {"occupancy": 1}, "bot_object": {"occupancy": 1}}, "total_channels": 2, "total_occupancy": 2}, "service": "Presence"}'
        );

      pubnub.hereNow({ includeUUIDs: false }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          bot_object: {
            name: 'bot_object',
            occupancy: 1,
            occupants: [],
          },
          ch10: {
            name: 'ch10',
            occupancy: 1,
            occupants: [],
          },
        });
        assert.equal(scope.isDone(), true);
        done();
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
        .reply(
          200,
          '{"status": 503, "message": "Service Unavailable", "error": 1, "service": "Presence"}'
        );

      pubnub.hereNow({ includeUUIDs: false }, (status) => {
        assert.equal(status.error, true);
        assert.equal(scope.isDone(), true);
        done();
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
          '{"status": 402, "error": 1, "message": "This feature is not turned on for this account. Contact support@pubnub.com to activate this feature.", "service": "Presence"}'
        );
      let expected = 'You have tried to perform a Global Here Now operation, your keyset configuration does not support that. Please provide a channel, or enable the Global Here Now feature from the Portal.';
      pubnub.hereNow({channles: []}, (status) => {
        assert.equal(status.error, true);
        assert.equal(status.errorData.message, expected);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('passes arbitrary query parameters', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/presence/sub-key/mySubscribeKey/channel/game1')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          test: 'param'
        })
        .reply(
          200,
          '{"status": 200, "message": "OK", "uuids": ["a3ffd012-a3b9-478c-8705-64089f24d71e"], "occupancy": 1, "service": "Presence"}'
        );

      pubnub.hereNow({ channels: ['game1'], queryParameters: { test: 'param' } }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response.channels, {
          game1: {
            name: 'game1',
            occupancy: 1,
            occupants: [
              {
                state: null,
                uuid: 'a3ffd012-a3b9-478c-8705-64089f24d71e',
              },
            ],
          },
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add here now API telemetry information', (done) => {
      let scope = utils.createNock().get('/v2/presence/sub-key/mySubscribeKey/channel/game1').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '{"status": 200, "message": "OK", "uuids": ["a3ffd012-a3b9-478c-8705-64089f24d71e"], "occupancy": 1, "service": "Presence"}',
        delays,
        (completion) => {
          pubnub.hereNow(
            { channels: ['game1'] },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_pres', average, leeway);
          done();
        });
    }).timeout(60000);
  });
});
