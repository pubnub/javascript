/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import sinon from 'sinon';
import nock from 'nock';
import _ from 'underscore';

import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('#components/reconnection_manger', () => {
  let pubnub;
  let clock;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
    });
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    pubnub.stop();
    clock.restore();
  });

  it('reports when the network is unreachable', done => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query(true)
      .replyWithError({ message: 'Network unavailable', code: 'ENOTFOUND' });

    utils
      .createNock()
      .get('/v2/presence/sub-key/mySubKey/channel/ch1%2Cch2/heartbeat')
      .query(true)
      .replyWithError({ message: 'Network unavailable', code: 'ENOTFOUND' });

    pubnub.addListener({
      status(statusPayload) {
        if (statusPayload.operation !== 'PNSubscribeOperation') return;
        let statusWithoutError = _.omit(statusPayload, 'errorData');
        assert.deepEqual(
          {
            category: 'PNNetworkIssuesCategory',
            error: true,
            operation: 'PNSubscribeOperation',
          },
          statusWithoutError
        );
        done();
      },
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });
  });

  it('begins polling and reports reconnects when subscribe is again successful', done => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query(true)
      .replyWithError({ message: 'Network unavailable', code: 'ENOTFOUND' });

    utils
      .createNock()
      .get('/v2/presence/sub-key/mySubKey/channel/ch1%2Cch2/heartbeat')
      .query(true)
      .replyWithError({ message: 'Network unavailable', code: 'ENOTFOUND' });

    utils
      .createNock()
      .get('/time/0')
      .query(true)
      .reply(200, [14570763868573725]);

    pubnub.addListener({
      status(statusPayload) {
        if (statusPayload.category === 'PNNetworkIssuesCategory') {
          utils
            .createNock()
            .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
            .query(true)
            .reply(
              200,
              '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}'
            );

          utils
            .createNock()
            .get('/v2/presence/sub-key/mySubKey/channel/ch1%2Cch2/heartbeat')
            .query(true)
            .reply(
              200,
              '{"status": 200, "message": "OK", "service": "Presence"}'
            );

          // Advance the clock so that _performTimeLoop() executes
          clock.tick(3500);
          done();
        } else if (statusPayload.category === 'PNReconnectedCategory') {
          assert.deepEqual(
            {
              category: 'PNReconnectedCategory',
              operation: 'PNSubscribeOperation',
              currentTimetoken: 0,
              lastTimetoken: 0,
            },
            statusPayload
          );
          done();
        }
      },
    });

    pubnub.subscribe({
      channels: ['ch1', 'ch2'],
      withPresence: true,
      withHeathbeats: true,
    });
  });
});
