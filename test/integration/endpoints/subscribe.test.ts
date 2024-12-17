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

  after(() => {
    nock.enableNetConnect();
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
      logVerbosity: true,
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
    });
  });

  afterEach(() => {
    pubnub.stop();
    pubnubWithFiltering.stop();
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
    const scope0 = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/c1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(
        200,
        '{"t":{"t":"14523669555221452","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"coolChannel","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}',
        { 'content-type': 'text/javascript' },
      );
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/c1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '1234567890',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"146075779609322","r":1},"m":[{"a":"4","f":0,"cmt":"test-message-type","i":"test","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"c1","d":{"text":"customttresponse"},"b":"c1"}]}',
        { 'content-type': 'text/javascript' },
      );

    pubnubWithEE.addListener({
      message(message) {
        try {
          assert.equal(message.customMessageType, 'test-message-type');
          assert.deepEqual(message.message, { text: 'customttresponse' });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      },
    });
    const channel = pubnubWithEE.channel('c1');
    const subscription = channel.subscription();
    subscription.subscribe({ timetoken: '1234567890' });
  });

  it('signal listener called for string signal', (done) => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/c1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"14523669555221452","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/c1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '14523669555221452',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"14523669555221453","r":1},"m":[{"a":"3","f":0,"e":1,"cmt":"test-message-type","i":"myUniqueUserId","p":{"t":"17200339136465528","r":41},"k":"mySubKey","c":"c1","d":"typing:start"}]}',
        { 'content-type': 'text/javascript' },
      );

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
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/c1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"14523669555221452","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/c1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '14523669555221452',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"14523669555221453","r":1},"m":[{"a":"3","f":0,"e":4,"cmt":"test-message-type","i":"myUniqueUserId","p":{"t":"17200339136465528","r":41},"k":"mySubKey","c":"c1","d":{"message":"Hello","file":{"id":"file-id","name":"file-name"}}}]}',
        { 'content-type': 'text/javascript' },
      );

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

  it('supports subscribe() with presence channelnames', () => {
    const scope0 = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/c1,c2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(
        200,
        '{"t":{"t":"14523669555221452","r":1},"m":[{"a":"4","f":0,"i":"Client-g5d4g","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"c1","d":{"text":"Enter Message Here"},"b":"coolChan-bnel"}]}',
        { 'content-type': 'text/javascript' },
      );
    const scope = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/c1,c2-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '1234567890',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"146075779609322","r":1},"m":[{"a":"4","f":0,"i":"test","p":{"t":"14607577960925503","r":1},"k":"mySubKey","c":"c1","d":{"text":"customttresponse"},"b":"c1"}]}',
        { 'content-type': 'text/javascript' },
      );

    const subsripptionSetWithPresenceChannels = pubnubWithEE.subscriptionSet({
      channels: ['c1', 'c2-pnpres'],
    });

    subsripptionSetWithPresenceChannels.subscribe();

    assert.deepEqual(pubnubWithEE.getSubscribedChannels(), ['c1', 'c2-pnpres']);

    subsripptionSetWithPresenceChannels.unsubscribe();
    assert.deepEqual(pubnubWithEE.getSubscribedChannels(), []);
  });
});
