/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import _ from 'underscore';

import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('#components/subscription_manager', () => {
  let pubnub;
  let pubnubWithPassingHeartbeats;
  let pubnubWithLimitedQueue;
  let pubnubWithCrypto;

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
      autoNetworkDetection: false,
      heartbeatInterval: 149,
    });
    pubnubWithPassingHeartbeats = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      announceSuccessfulHeartbeats: true,
      autoNetworkDetection: false,
      heartbeatInterval: 149,
    });
    pubnubWithLimitedQueue = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      requestMessageCountThreshold: 1,
      autoNetworkDetection: false,
      heartbeatInterval: 149,
    });
    pubnubWithCrypto = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      cryptoModule: PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'cipherKey' }),
    });
  });

  afterEach(() => {
    pubnub.stop();
    pubnubWithPassingHeartbeats.stop();
    pubnubWithLimitedQueue.stop();
  });

  it('passes the correct message information', (done) => {
    const scope1 = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"3","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1}, "i": "client1", "k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message"},"b":"coolChan-bnel"}]}'
      );

    const scope2 = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
        tt: 3,
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"10","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"i": "client2", "k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message3"},"b":"coolChan-bnel"}]}'
      );

    const scope3 = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
        tt: 10,
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"20","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"i": "client3", "k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message10"},"b":"coolChan-bnel", "u": {"cool": "meta"}}]}'
      );

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
                text: 'Message',
              },
              subscribedChannel: 'coolChan-bnel',
              channel: 'coolChannel',
              subscription: 'coolChan-bnel',
              timetoken: '14607577960925503',
              publisher: 'client1',
            },
            {
              actualChannel: 'coolChannel',
              message: {
                text: 'Message3',
              },
              subscribedChannel: 'coolChan-bnel',
              channel: 'coolChannel',
              subscription: 'coolChan-bnel',
              timetoken: '14607577960925503',
              publisher: 'client2',
            },
            {
              actualChannel: 'coolChannel',
              message: {
                text: 'Message10',
              },
              userMetadata: {
                cool: 'meta',
              },
              subscribedChannel: 'coolChan-bnel',
              channel: 'coolChannel',
              subscription: 'coolChan-bnel',
              timetoken: '14607577960925503',
              publisher: 'client3',
            },
          ]);
          done();
        }
      },
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });
  });

  it('passes the correct presence information', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"14614512228786519","r":1},"m":[{"a":"4","f":0,"p":{"t":"14614512228418349","r":2},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel-pnpres","d":{"action": "join", "timestamp": 1461451222, "uuid": "4a6d5df7-e301-4e73-a7b7-6af9ab484eb0", "occupancy": 1},"b":"coolChannel-pnpres"}]}'
      );

    pubnub.addListener({
      presence(presencePayload) {
        assert.equal(scope.isDone(), true);
        assert.deepEqual(
          {
            channel: 'coolChannel',
            subscription: null,
            actualChannel: null,
            occupancy: 1,
            subscribedChannel: 'coolChannel-pnpres',
            timestamp: 1461451222,
            timetoken: '14614512228418349',
            uuid: '4a6d5df7-e301-4e73-a7b7-6af9ab484eb0',
            action: 'join',
            state: undefined,
          },
          presencePayload
        );
        done();
      },
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });
  });

  it('Unknown category status returned when user trigger TypeError in subscription handler', (done) => {
    const scope1 = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch1-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"3","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1}, "i": "client1", "k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"ch1","d":{"text":"Message"},"b":"ch1"}]}'
      );
    const scope2 = utils
      .createNock()
      .get(/heartbeat$/)
      .query(true)
      .reply(200, '{"status": 200,"message":"OK","service":"Presence"}');
    const scope3 = utils
      .createNock()
      .get(/leave$/)
      .query(true)
      .reply(200, '{"status": 200,"message":"OK","action":"leave","service":"Presence"}');
    const scope4 = utils
      .createNock()
      .get('/publish/myPublishKey/mySubKey/0/ch1/0/%7B%22such%22%3A%22object%22%7D')
      .query(true)
      .reply(200, '[1,"Sent","14647523059145592"]');

    pubnub.addListener({
      message(message) {
        null.test;
      },
      status(status) {
        if (status.category === "PNUnknownCategory") {
          assert.equal(status.errorData instanceof Error, true);
          done();
        } else if (status.category === "PNConnectedCategory") {
          pubnub.publish(
            { message: { such: 'object' }, channel: 'ch1' },
            (status, response) => { }
          );
        }
      }
    });

    pubnub.subscribe({ channels: ['ch1'], withPresence: true });
  });

  it('passes the correct presence information when state is changed', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"14637536741734954","r":1},"m":[{"a":"4","f":512,"p":{"t":"14637536740940378","r":1},"k":"demo-36","c":"ch10-pnpres","d":{"action": "join", "timestamp": 1463753674, "uuid": "24c9bb19-1fcd-4c40-a6f1-522a8a1329ef", "occupancy": 3},"b":"ch10-pnpres"},{"a":"4","f":512,"p":{"t":"14637536741726901","r":1},"k":"demo-36","c":"ch10-pnpres","d":{"action": "state-change", "timestamp": 1463753674, "data": {"state": "cool"}, "uuid": "24c9bb19-1fcd-4c40-a6f1-522a8a1329ef", "occupancy": 3},"b":"ch10-pnpres"}]}'
      );

    pubnub.addListener({
      presence(presencePayload) {
        if (presencePayload.action !== 'state-change') return;

        assert.equal(scope.isDone(), true);
        assert.deepEqual(
          {
            channel: 'ch10',
            subscription: null,
            actualChannel: null,
            occupancy: 3,
            subscribedChannel: 'ch10-pnpres',
            timestamp: 1463753674,
            timetoken: '14637536741726901',
            uuid: '24c9bb19-1fcd-4c40-a6f1-522a8a1329ef',
            action: 'state-change',
            state: { state: 'cool' },
          },
          presencePayload
        );
        done();
      },
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });
  });

  it('reports when heartbeats failed', (done) => {
    pubnub.addListener({
      status(statusPayload) {
        if (
          statusPayload.operation !== PubNub.OPERATIONS.PNHeartbeatOperation
        ) {
          return;
        }
        let statusWithoutError = _.omit(statusPayload, 'errorData');
        assert.deepEqual(
          {
            category: 'PNUnknownCategory',
            error: true,
            operation: 'PNHeartbeatOperation',
          },
          statusWithoutError
        );
        done();
      },
    });

    pubnub.subscribe({
      channels: ['ch1', 'ch2'],
      withPresence: true,
      withHeartbeats: true,
    });
  });

  it('reports when heartbeats fail with error code', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/presence/sub-key/mySubKey/channel/ch1%2Cch2/heartbeat')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
        state: '{}',
      })
      .reply(400, '{"status": 400, "message": "OK", "service": "Presence"}');

    pubnub.addListener({
      status(statusPayload) {
        if (
          statusPayload.operation !== PubNub.OPERATIONS.PNHeartbeatOperation
        ) {
          return;
        }
        let statusWithoutError = _.omit(statusPayload, 'errorData');
        assert.equal(scope.isDone(), true);
        assert.deepEqual(
          {
            category: 'PNBadRequestCategory',
            error: true,
            operation: 'PNHeartbeatOperation',
            statusCode: 400,
          },
          statusWithoutError
        );
        done();
      },
    });

    pubnub.subscribe({
      channels: ['ch1', 'ch2'],
      withPresence: true,
      withHeartbeats: true,
    });
  });

  it('reports when heartbeats pass', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/presence/sub-key/mySubKey/channel/ch1%2Cch2/heartbeat')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
        state: '{}',
      })
      .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}');

    pubnubWithPassingHeartbeats.addListener({
      status(statusPayload) {
        if (
          statusPayload.operation !== PubNub.OPERATIONS.PNHeartbeatOperation
        ) {
          return;
        }

        assert.equal(scope.isDone(), true);
        assert.deepEqual(
          {
            error: false,
            operation: 'PNHeartbeatOperation',
            statusCode: 200,
          },
          statusPayload
        );
        done();
      },
    });

    pubnubWithPassingHeartbeats.subscribe({
      channels: ['ch1', 'ch2'],
      withPresence: true,
      withHeartbeats: true,
    });
  });

  it('reports when heartbeats pass with heartbeatChannels', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/presence/sub-key/mySubKey/channel/ch1%2Cch2/heartbeat')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
        state: '{}',
      })
      .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}');

    pubnubWithPassingHeartbeats.addListener({
      status(statusPayload) {
        if (
          statusPayload.operation !== PubNub.OPERATIONS.PNHeartbeatOperation
        ) {
          return;
        }

        assert.equal(scope.isDone(), true);
        assert.deepEqual(
          {
            error: false,
            operation: 'PNHeartbeatOperation',
            statusCode: 200,
          },
          statusPayload
        );
        done();
      },
    });

    pubnubWithPassingHeartbeats.presence({
      channels: ['ch1', 'ch2'],
      connected: true,
    });
  });

  it('reports when heartbeats pass with heartbeatChannelGroups', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/presence/sub-key/mySubKey/channel/%2C/heartbeat')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
        state: '{}',
        'channel-group': 'cg1',
      })
      .reply(200, '{"status": 200, "message": "OK", "service": "Presence"}');

    pubnubWithPassingHeartbeats.addListener({
      status(statusPayload) {
        if (
          statusPayload.operation !== PubNub.OPERATIONS.PNHeartbeatOperation
        ) {
          return;
        }

        assert.equal(scope.isDone(), true);
        assert.deepEqual(
          {
            error: false,
            operation: 'PNHeartbeatOperation',
            statusCode: 200,
          },
          statusPayload
        );
        done();
      },
    });

    pubnubWithPassingHeartbeats.presence({
      channelGroups: ['cg1'],
      connected: true,
    });
  });

  it('reports when the queue is beyond set threshold', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"14614512228786519","r":1},"m":[{"a":"4","f":0,"p":{"t":"14614512228418349","r":2},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel-pnpres","d":{"action": "join", "timestamp": 1461451222, "uuid": "4a6d5df7-e301-4e73-a7b7-6af9ab484eb0", "occupancy": 1},"b":"coolChannel-pnpres"}]}'
      );

    pubnubWithLimitedQueue.addListener({
      status(statusPayload) {
        if (
          statusPayload.category !==
          PubNub.CATEGORIES.PNRequestMessageCountExceededCategory
        ) {
          return;
        }

        assert.equal(scope.isDone(), true);
        assert.equal(
          statusPayload.category,
          PubNub.CATEGORIES.PNRequestMessageCountExceededCategory
        );
        assert.equal(
          statusPayload.operation,
          PubNub.OPERATIONS.PNSubscribeOperation
        );
        done();
      },
    });

    pubnubWithLimitedQueue.subscribe({
      channels: ['ch1', 'ch2'],
      withPresence: true,
    });
  });

  it('supports deduping on duplicates', (done) => {
    pubnub._config.dedupeOnSubscribe = true;
    let messageCount = 0;

    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"3","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1}, "i": "client1", "k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message"},"b":"coolChan-bnel"}]}'
      );

    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
        tt: 3,
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Publisher-A","p":{"t":"14607577960925503","r":1},"o":{"t":"14737141991877032","r":2},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message"},"b":"coolChannel"},{"a":"4","f":0,"i":"Publisher-A","p":{"t":"14607577960925503","r":1},"o":{"t":"14737141991877032","r":2},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message"},"b":"coolChannel"}]}'
      );

    pubnub.addListener({
      message() {
        messageCount += 1;
      },
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });

    setTimeout(() => {
      if (messageCount === 1) {
        done();
      }
    }, 250);
  });

  it('no deduping on duplicates ', (done) => {
    let messageCount = 0;

    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"3","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1}, "i": "client1", "k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message"},"b":"coolChan-bnel"}]}'
      );

    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
        tt: 3,
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Publisher-A","p":{"t":"14607577960925503","r":1},"o":{"t":"14737141991877032","r":2},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message"},"b":"coolChannel"},{"a":"4","f":0,"i":"Publisher-A","p":{"t":"14607577960925503","r":1},"o":{"t":"14737141991877032","r":2},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message"},"b":"coolChannel"}]}'
      );

    pubnub.addListener({
      message() {
        messageCount += 1;
      },
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });

    setTimeout(() => {
      if (messageCount === 3) {
        done();
      }
    }, 250);
  });

  it('supports deduping on shallow queue', (done) => {
    pubnub._config.dedupeOnSubscribe = true;
    pubnub._config.maximumCacheSize = 1;
    let messageCount = 0;

    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"3","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1}, "i": "client1", "k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message"},"b":"coolChan-bnel"}]}'
      );

    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch1-pnpres%2Cch2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
        tt: 3,
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Publisher-A","p":{"t":"14607577960925503","r":1},"o":{"t":"14737141991877032","r":2},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message1"},"b":"coolChannel"},{"a":"4","f":0,"i":"Publisher-A","p":{"t":"14607577960925503","r":1},"o":{"t":"14737141991877032","r":2},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message2"},"b":"coolChannel"}, {"a":"4","f":0,"i":"Publisher-A","p":{"t":"14607577960925503","r":1},"o":{"t":"14737141991877032","r":2},"k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":{"text":"Message1"},"b":"coolChannel"}]}'
      );

    pubnub.addListener({
      message() {
        messageCount += 1;
      },
    });

    pubnub.subscribe({ channels: ['ch1', 'ch2'], withPresence: true });

    setTimeout(() => {
      if (messageCount === 4) {
        done();
      }
    }, 250);
  });
  
  it('handles unencrypted message when cryptoModule is configured', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"3","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1}, "i": "client1", "k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":"hello","b":"coolChan-bnel"}]}',
      );

    let incomingPayloads = [];

    pubnubWithCrypto.addListener({
      message(messagePayload) {
        incomingPayloads.push(messagePayload);
        if (incomingPayloads.length === 1) {
          assert.equal(scope.isDone(), true);
          assert.deepEqual(incomingPayloads, [
            {
              actualChannel: 'coolChannel',
              message: 'hello',
              subscribedChannel: 'coolChan-bnel',
              channel: 'coolChannel',
              subscription: 'coolChan-bnel',
              timetoken: '14607577960925503',
              publisher: 'client1',
              error: 'Error while decrypting message content: decryption error. invalid header version',
            },
          ]);
          done();
        }
      },
    });

    pubnubWithCrypto.subscribe({ channels: ['ch1'] });
  });

  it('handles unencrypted message when `setCipherKey()` is used', (done) => {
    pubnub.setCipherKey('hello');
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"3","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1}, "i": "client1", "k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":"hello","b":"coolChan-bnel"}]}',
      );

    let incomingPayloads = [];

    pubnubWithCrypto.addListener({
      message(messagePayload) {
        incomingPayloads.push(messagePayload);
        console.log('\n\n\n incomingpayload = ', JSON.stringify(incomingPayloads));
        if (incomingPayloads.length === 1) {
          assert.equal(scope.isDone(), true);
          assert.deepEqual(incomingPayloads, [
            {
              actualChannel: 'coolChannel',
              message: 'hello',
              subscribedChannel: 'coolChan-bnel',
              channel: 'coolChannel',
              subscription: 'coolChan-bnel',
              timetoken: '14607577960925503',
              publisher: 'client1',
              error: 'Error while decrypting message content: decryption error. invalid header version',
            },
          ]);
          done();
        }
      },
    });

    pubnubWithCrypto.subscribe({ channels: ['ch1'] });
  });

  it('handles encryped messages when cryptoModule is configured', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"3","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1}, "i": "client1", "k":"sub-c-4cec9f8e-01fa-11e6-8180-0619f8945a4f","c":"coolChannel","d":"UE5FRAFBQ1JIEIocqA6BfaybN/3U0WJRam0v3bPwfAXezgeCeGp+MztQ","b":"coolChan-bnel"}]}',
      );

    let incomingPayloads = [];

    pubnubWithCrypto.addListener({
      message(messagePayload) {
        incomingPayloads.push(messagePayload);
        if (incomingPayloads.length === 1) {
          assert.equal(scope.isDone(), true);
          assert.deepEqual(incomingPayloads, [
            {
              actualChannel: 'coolChannel',
              message: 'hello',
              subscribedChannel: 'coolChan-bnel',
              channel: 'coolChannel',
              subscription: 'coolChan-bnel',
              timetoken: '14607577960925503',
              publisher: 'client1',
            },
          ]);
          done();
        }
      },
    });

    pubnubWithCrypto.subscribe({ channels: ['ch1'] });
  });
});
