/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('subscribe endpoints', () => {
  let pubnubWithFiltering: PubNub;
  let pubnub: PubNub;
  let pubnubWithEE: PubNub;

  before(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      autoNetworkDetection: false,
    });
    pubnubWithFiltering = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      filterExpression: 'hello!',
      autoNetworkDetection: false,
    });
    pubnubWithEE = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      enableEventEngine: true,
      // logVerbosity: true,
    });
  });

  afterEach(() => {
    pubnub.destroy(true);
    pubnubWithFiltering.destroy(true);
    pubnubWithEE.destroy(true);
  });

  it('supports addition of multiple channels', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/coolChannel,coolChannel2/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"coolChannel","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}',
        { 'content-type': 'text/javascript' },
      );

    pubnub.addListener({
      status(status) {
        if (status.category === 'PNConnectedCategory') {
          try {
            assert.equal(scope.isDone(), true);
            assert.deepEqual(pubnub.getSubscribedChannels(), ['coolChannel', 'coolChannel2']);
            assert.deepEqual(pubnub.getSubscribedChannelGroups(), []);
            assert.deepEqual(status.affectedChannels, ['coolChannel', 'coolChannel2']);
            assert.deepEqual(status.affectedChannelGroups, []);
            done();
          } catch (error) {
            done(error);
          }
        }
      },
    });

    pubnub.subscribe({ channels: ['coolChannel', 'coolChannel2'] });
  });

  it('supports addition of multiple channels / channel groups', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/coolChannel,coolChannel2/0')
      .query({
        'channel-group': 'cg1,cg2',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"coolChannel","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}',
        { 'content-type': 'text/javascript' },
      );

    pubnub.addListener({
      status(status) {
        if (status.category === 'PNConnectedCategory') {
          try {
            assert.equal(scope.isDone(), true);
            assert.deepEqual(pubnub.getSubscribedChannels(), ['coolChannel', 'coolChannel2']);
            assert.deepEqual(pubnub.getSubscribedChannelGroups(), ['cg1', 'cg2']);
            assert.deepEqual(status.affectedChannels, ['coolChannel', 'coolChannel2']);
            assert.deepEqual(status.affectedChannelGroups, ['cg1', 'cg2']);
            done();
          } catch (error) {
            done(error);
          }
        }
      },
    });

    pubnub.subscribe({
      channels: ['coolChannel', 'coolChannel2'],
      channelGroups: ['cg1', 'cg2'],
    });
  });

  it('supports just channel group', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/,/0')
      .query({
        'channel-group': 'cg1,cg2',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"coolChannel","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}',
        { 'content-type': 'text/javascript' },
      );

    pubnub.addListener({
      status(status) {
        if (status.category === 'PNConnectedCategory') {
          try {
            assert.equal(scope.isDone(), true);
            assert.deepEqual(pubnub.getSubscribedChannels(), []);
            assert.deepEqual(pubnub.getSubscribedChannelGroups(), ['cg1', 'cg2']);
            assert.deepEqual(status.affectedChannels, []);
            assert.deepEqual(status.affectedChannelGroups, ['cg1', 'cg2']);
            done();
          } catch (error) {
            done(error);
          }
        }
      },
    });

    pubnub.subscribe({ channelGroups: ['cg1', 'cg2'] });
  });

  it('supports filter expression', (done) => {
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/coolChannel,coolChannel2/0')
      .query({
        'filter-expr': 'hello!',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"14607577960932487","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"coolChannel","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}',
        { 'content-type': 'text/javascript' },
      );

    pubnubWithFiltering.addListener({
      status(status) {
        if (status.category === 'PNConnectedCategory') {
          try {
            assert.equal(scope.isDone(), true);
            assert.deepEqual(pubnubWithFiltering.getSubscribedChannels(), ['coolChannel', 'coolChannel2']);
            assert.deepEqual(pubnubWithFiltering.getSubscribedChannelGroups(), []);
            assert.deepEqual(status.affectedChannels, ['coolChannel', 'coolChannel2']);
            assert.deepEqual(status.affectedChannelGroups, []);
            done();
          } catch (error) {
            done(error);
          }
        }
      },
    });

    pubnubWithFiltering.subscribe({
      channels: ['coolChannel', 'coolChannel2'],
    });
  });

  it('supports timetoken', (done) => {
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['c1'] }],
    });
    const subscribeMockScopes = utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['c1'], messages: [{ channel: 'c1', message: { text: 'Enter Message Here' } }] },
        {
          channels: ['c1'],
          timetoken: '14523669555221452',
          messages: [{ channel: 'c1', customMessageType: 'test-message-type', message: { text: 'customttresponse' } }],
        },
        { channels: ['c1'], messages: [], replyDelay: 500 },
      ],
    });

    pubnubWithEE.addListener({
      message(message) {
        try {
          assert.equal(message.customMessageType, 'test-message-type');
          assert.deepEqual(message.message, { text: 'customttresponse' });
          assert.equal(subscribeMockScopes[subscribeMockScopes.length - 2].isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      },
    });
    const channel = pubnubWithEE.channel('c1');
    const subscription = channel.subscription();
    subscription.subscribe({ timetoken: '14523669555221452' });
  });

  it('signal listener called for string signal', (done) => {
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['c1'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        {
          channels: ['c1'],
          messages: [{ channel: 'c1', type: 1, customMessageType: 'test-message-type', message: 'typing:start' }],
        },
        { channels: ['c1'], messages: [], replyDelay: 500 },
      ],
    });

    pubnubWithEE.addListener({
      signal(signal) {
        try {
          assert.equal(signal.customMessageType, 'test-message-type');
          done();
        } catch (error) {
          done(error);
        }
      },
    });

    const channel = pubnubWithEE.channel('c1');
    const subscription = channel.subscription();
    subscription.subscribe();
  });

  it('file listener called for shared file', (done) => {
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['c1'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        {
          channels: ['c1'],
          messages: [
            {
              channel: 'c1',
              type: 4,
              customMessageType: 'test-message-type',
              message: { message: 'Hello', file: { id: 'file-id', name: 'file-name' } },
            },
          ],
        },
        { channels: ['c1'], messages: [], replyDelay: 500 },
      ],
    });

    pubnubWithEE.addListener({
      file(sharedFile) {
        try {
          assert.equal(sharedFile.customMessageType, 'test-message-type');
          assert.equal(sharedFile.message, 'Hello');
          assert.notEqual(sharedFile.file, undefined);
          assert(sharedFile.file !== undefined);
          assert.equal(sharedFile.file.id, 'file-id');
          assert.equal(sharedFile.file.name, 'file-name');
          done();
        } catch (error) {
          done(error);
        }
      },
    });

    const channel = pubnubWithEE.channel('c1');
    const subscription = channel.subscription();
    subscription.subscribe();
  });

  it('presence listener called for interval / delta update', (done) => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/c1,c1-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        heartbeat: 300,
      })
      .reply(200, '{"t":{"t":"14523669555221452","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/c1,c1-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        tt: '14523669555221452',
        tr: 1,
        heartbeat: 300,
      })
      .reply(
        200,
        '{"t":{"t":"14523669555221453","r":1},"m":[{"a":"3","f":0,"i":"myUniqueUserId","p":{"t":"17200339136465528","r":41},"k":"mySubKey","c":"c1-pnpres","d":{"action":"interval","timestamp":"1720033913","occupancy":0,"here_now_refresh":true}}]}',
        { 'content-type': 'text/javascript' },
      );

    pubnub.addListener({
      presence(presence) {
        try {
          assert.equal(presence.action, 'interval');
          if (presence.action === 'interval') {
            assert.equal(presence.hereNowRefresh, true);
            done();
          }
        } catch (error) {
          done(error);
        }
      },
    });

    const channel = pubnub.channel('c1');
    const subscription = channel.subscription({ receivePresenceEvents: true });
    subscription.subscribe();
  });

  it('supports subscribe() with presence channelnames', async () => {
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['c1'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['c1', 'c2-pnpres'], messages: [{ channel: 'c1', message: { text: 'Enter Message Here' } }] },
        {
          channels: ['c1', 'c2-pnpres'],
          messages: [{ channel: 'c1', message: { text: 'customttresponse' } }],
        },
        { channels: ['c1', 'c2-pnpres'], messages: [], replyDelay: 500 },
      ],
    });

    const subscriptionSetWithPresenceChannels = pubnubWithEE.subscriptionSet({
      channels: ['c1', 'c2-pnpres'],
    });

    const connectionPromise = new Promise<void>((resolve) => {
      pubnubWithEE.onStatus = (status) => {
        if (status.category === PubNub.CATEGORIES.PNConnectedCategory) {
          pubnubWithEE.onStatus = undefined;
          resolve();
        }
      };
    });

    subscriptionSetWithPresenceChannels.subscribe();
    await connectionPromise;

    assert.deepEqual(pubnubWithEE.getSubscribedChannels(), ['c1', 'c2-pnpres']);

    const disconnectionPromise = new Promise<void>((resolve) => {
      pubnubWithEE.onStatus = (status) => {
        if (status.category === PubNub.CATEGORIES.PNDisconnectedCategory) {
          pubnubWithEE.onStatus = undefined;
          resolve();
        }
      };
    });

    subscriptionSetWithPresenceChannels.unsubscribe();

    await disconnectionPromise;
    assert.deepEqual(pubnubWithEE.getSubscribedChannels(), []);
  });
});
