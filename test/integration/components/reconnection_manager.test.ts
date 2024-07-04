/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import _ from 'underscore';
import sinon from 'sinon';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('#components/reconnection_manger', () => {
  let clock: sinon.SinonFakeTimers;
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
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      origin: 'ps.pndsn.com',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      heartbeatInterval: 149,
    });
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    pubnub.destroy();
    clock.restore();
  });

  it('reports when the network is unreachable', (done) => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch1-pnpres,ch2,ch2-pnpres/0')
      .query(true)
      .replyWithError({ message: 'Network unavailable', code: 'ENOTFOUND' });

    utils
      .createNock()
      .get('/v2/presence/sub-key/mySubKey/channel/ch1,ch2/heartbeat')
      .query(true)
      .replyWithError({ message: 'Network unavailable', code: 'ENOTFOUND' });

    pubnub.addListener({
      status(statusPayload) {
        if (statusPayload.operation !== PubNub.OPERATIONS.PNSubscribeOperation) return;
        const statusWithoutError = _.omit(statusPayload, ['errorData', 'statusCode']);
        try {
          assert.deepEqual(
            {
              category: PubNub.CATEGORIES.PNNetworkIssuesCategory,
              error: true,
              operation: PubNub.OPERATIONS.PNSubscribeOperation,
            },
            statusWithoutError,
          );

          utils
            .createNock()
            .get('/v2/presence/sub-key/mySubKey/channel/ch1,ch2/leave')
            .query(true)
            .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}', {
              'content-type': 'text/javascript',
            });

          done();
        } catch (error) {
          done(error);
        }
      },
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });
  });

  it('begins polling and reports reconnects when subscribe is again successful', (done) => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch1-pnpres,ch2,ch2-pnpres/0')
      .query(true)
      .replyWithError({ message: 'Network unavailable', code: 'ENOTFOUND' });

    utils
      .createNock()
      .get('/v2/presence/sub-key/mySubKey/channel/ch1,ch2/heartbeat')
      .query(true)
      .replyWithError({ message: 'Network unavailable', code: 'ENOTFOUND' });

    utils
      .createNock()
      .get('/time/0')
      .query(true)
      .reply(200, [14570763868573725], { 'content-type': 'text/javascript' });

    pubnub.addListener({
      status(statusPayload) {
        if (statusPayload.category === PubNub.CATEGORIES.PNNetworkIssuesCategory) {
          utils
            .createNock()
            .get('/v2/subscribe/mySubKey/ch1,ch1-pnpres,ch2,ch2-pnpres/0')
            .query(true)
            .reply(
              200,
              '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"coolChannel","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}',
              { 'content-type': 'text/javascript' },
            );

          utils
            .createNock()
            .get('/v2/presence/sub-key/mySubKey/channel/ch1,ch2/heartbeat')
            .query(true)
            .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}', {
              'content-type': 'text/javascript',
            });

          // Advance the clock so that _performTimeLoop() executes
          clock.tick(3500);
        } else if (statusPayload.category === PubNub.CATEGORIES.PNReconnectedCategory) {
          try {
            assert.deepEqual(
              {
                category: PubNub.CATEGORIES.PNReconnectedCategory,
                operation: PubNub.OPERATIONS.PNSubscribeOperation,
                currentTimetoken: 0,
                lastTimetoken: 0,
              },
              statusPayload,
            );

            utils
              .createNock()
              .get('/v2/presence/sub-key/mySubKey/channel/ch1,ch2/leave')
              .query(true)
              .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}', {
                'content-type': 'text/javascript',
              });

            done();
          } catch (error) {
            done(error);
          }
        }
      },
    });

    pubnub.subscribe({
      channels: ['ch1', 'ch2'],
      withPresence: true,
      withHeartbeats: true,
    });
  });
});
