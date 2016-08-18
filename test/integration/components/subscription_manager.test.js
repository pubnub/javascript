/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../lib/node/index.js';
import _ from 'underscore';

describe('#components/subscription_manger', () => {
  let pubnub;
  let pubnubWithPassingHeartbeats;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({ subscribeKey: 'mySubKey', publishKey: 'myPublishKey', uuid: 'myUUID' });
    pubnubWithPassingHeartbeats = new PubNub({ subscribeKey: 'mySubKey', publishKey: 'myPublishKey', uuid: 'myUUID', announceSuccessfulHeartbeats: true });
  });

  afterEach(() => {
    pubnub.stop();
    pubnubWithPassingHeartbeats.stop();
  });

  it('passes the correct message information', (done) => {
    const scope1 = utils.createNock().get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', heartbeat: 300 })
      .reply(200, '{"t":{"t":"3","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message"},"b":"coolChan-bnel"}]}');

    const scope2 = utils.createNock().get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', heartbeat: 300, tt: 3, tr: 1 })
      .reply(200, '{"t":{"t":"10","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message3"},"b":"coolChan-bnel"}]}');

    const scope3 = utils.createNock().get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', heartbeat: 300, tt: 10, tr: 1 })
      .reply(200, '{"t":{"t":"20","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message10"},"b":"coolChan-bnel"}]}');

    let incomingPayloads = [];

    pubnub.addListener({
      message(messagePayload) {
        incomingPayloads.push(messagePayload);

        if (incomingPayloads.length === 3) {
          assert.equal(scope1.isDone(), true);
          assert.equal(scope2.isDone(), true);
          assert.equal(scope3.isDone(), true);
          assert.deepEqual(incomingPayloads, [
            {
              actualChannel: 'coolChannel',
              message: {
                text: 'Message'
              },
              subscribedChannel: 'coolChan-bnel',
              timetoken: '14607577960925503',
            },
            {
              actualChannel: 'coolChannel',
              message: {
                text: 'Message3',
              },
              subscribedChannel: 'coolChan-bnel',
              timetoken: '14607577960925503',
            },
            {
              actualChannel: 'coolChannel',
              message: {
                text: 'Message10',
              },
              subscribedChannel: 'coolChan-bnel',
              timetoken: '14607577960925503',
            }
          ]);
          done();
        }
      }
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });
  });

  it('passes the correct presence information', (done) => {
    const scope = utils.createNock().get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', heartbeat: 300 })
      .reply(200, '{"t":{"t":"14614512228786519","r":1},"m":[{"a":"4","f":0,"p":{"t":"14614512228418349","r":2},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel-pnpres","d":{"action": "join", "timestamp": 1461451222, "uuid": "4a6d5df7-e301-4e73-a7b7-6af9ab484eb0", "occupancy": 1},"b":"coolChannel-pnpres"}]}');

    pubnub.addListener({
      presence(presencePayload) {
        assert.equal(scope.isDone(), true);
        assert.deepEqual({
          actualChannel: null,
          occupancy: 1,
          subscribedChannel: 'coolChannel-pnpres',
          timestamp: 1461451222,
          timetoken: '14614512228418349',
          uuid: '4a6d5df7-e301-4e73-a7b7-6af9ab484eb0',
          action: 'join',
          state: undefined
        }, presencePayload);
        done();
      }
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });
  });

  it('passes the correct presence information when state is changed', (done) => {
    const scope = utils.createNock().get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', heartbeat: 300 })
      .reply(200, '{"t":{"t":"14637536741734954","r":1},"m":[{"a":"4","f":512,"p":{"t":"14637536740940378","r":1},"k":"demo-36","c":"ch10-pnpres","d":{"action": "join", "timestamp": 1463753674, "uuid": "24c9bb19-1fcd-4c40-a6f1-522a8a1329ef", "occupancy": 3},"b":"ch10-pnpres"},{"a":"4","f":512,"p":{"t":"14637536741726901","r":1},"k":"demo-36","c":"ch10-pnpres","d":{"action": "state-change", "timestamp": 1463753674, "data": {"state": "cool"}, "uuid": "24c9bb19-1fcd-4c40-a6f1-522a8a1329ef", "occupancy": 3},"b":"ch10-pnpres"}]}');

    pubnub.addListener({
      presence(presencePayload) {
        if (presencePayload.action !== 'state-change') return;

        assert.equal(scope.isDone(), true);
        assert.deepEqual({
          actualChannel: null,
          occupancy: 3,
          subscribedChannel: 'ch10-pnpres',
          timestamp: 1463753674,
          timetoken: '14637536741726901',
          uuid: '24c9bb19-1fcd-4c40-a6f1-522a8a1329ef',
          action: 'state-change',
          state: { state: 'cool' }
        }, presencePayload);
        done();
      }
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });
  });

  it('reports when heartbeats failed', (done) => {
    pubnub.addListener({
      status(statusPayload) {
        let statusWithoutError = _.omit(statusPayload, 'errorData');
        assert.deepEqual({
          category: 'PNUnknownCategory',
          error: true,
          operation: 'PNHeartbeatOperation',
        }, statusWithoutError);
        done();
      }
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });
  });

  it('reports when heartbeats fail with error code', (done) => {
    const scope = utils.createNock().get('/v2/presence/sub-key/mySubKey/channel/ch1%2Cch2/heartbeat')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', heartbeat: 300, state: '{}' })
      .reply(400, '{"status": 400, "message": "OK", "service": "Presence"}');

    pubnub.addListener({
      status(statusPayload) {
        let statusWithoutError = _.omit(statusPayload, 'errorData');
        assert.equal(scope.isDone(), true);
        assert.deepEqual({
          category: 'PNBadRequestCategory',
          error: true,
          operation: 'PNHeartbeatOperation',
          statusCode: 400
        }, statusWithoutError);
        done();
      }
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });
  });


  it('reports when heartbeats pass', (done) => {
    const scope = utils.createNock().get('/v2/presence/sub-key/mySubKey/channel/ch1%2Cch2/heartbeat')
      .query({ pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID', heartbeat: 300, state: '{}' })
      .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}');

    pubnubWithPassingHeartbeats.addListener({
      status(statusPayload) {
        if (statusPayload.operation !== 'PNHeartbeatOperation') return;

        assert.equal(scope.isDone(), true);
        assert.deepEqual({
          error: false,
          operation: 'PNHeartbeatOperation',
          statusCode: 200
        }, statusPayload);
        done();
      }
    });

    pubnubWithPassingHeartbeats.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });
  });
});
