import nock from 'nock';
import _ from 'underscore';

import utils from '../../utils';
import PubNub from '../../../src/node/index';

let pubnub;

describe('#listeners', () => {
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
      enableEventEngine: true,
      autoNetworkDetection: false,
    });
  });

  afterEach(() => {
    pubnub.stop();
  });

  it('should pass messages of subscribed channel to its listener', async () => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        state: '{}',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}');
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '3',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"10","r":1},"m":[{"a":"3","f":514,"i":"demo","p":{"t":"17069673079697201","r":33},"k":"demo","c":"ch1","d":{"message":"My message!"}}]}',
      );
    var channel = pubnub.channel('ch1');
    var subscription = channel.subscription();
    var messagePromise = new Promise((resolveMessage) =>
      subscription.addListener({
        message: (m) => resolveMessage(m),
      }),
    );
    subscription.subscribe();
    const actual = await messagePromise;
    expect(JSON.stringify(actual.message)).to.equal('{"message":"My message!"}');
  });
  it('should subscribed to channel and presence channels', async () => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch1-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        state: '{}',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}');
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch1-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '3',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"10","r":1},"m":[{"a":"3","f":514,"i":"demo","p":{"t":"17069673079697201","r":33},"k":"demo","c":"ch1","d":{"message":"My message!"}}]}',
      );

    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription({ receivePresenceEvents: true });
    const messagePromise = new Promise((resolveMessage) =>
      subscription.addListener({
        message: (m) => resolveMessage(m),
      }),
    );
    subscription.subscribe();
    const actual = await messagePromise;
    expect(JSON.stringify(actual.message)).to.equal('{"message":"My message!"}');
  });

  it('should work with subscriptionSet', async () => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        state: '{}',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}');
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '3',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"10","r":1},"m":[{"a":"3","f":514,"i":"demo","p":{"t":"17069673079697201","r":33},"k":"demo","c":"ch1","d":{"message":"My message!"}}]}',
      );

    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription();
    const subscriptionSet = subscription.addSubscription(pubnub.channel('ch2').subscription());
    const messagePromise = new Promise((resolveMessage) =>
      subscriptionSet.addListener({
        message: (m) => resolveMessage(m),
      }),
    );
    subscriptionSet.subscribe();
    const actual = await messagePromise;
    expect(JSON.stringify(actual.message)).to.equal('{"message":"My message!"}');
  });

  it('listener should route presence event to registered handler', async () => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch1-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        state: '{}',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}');
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch1-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '3',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"17070458535164862","r":31},"m":[{"a":"0","f":0,"p":{"t":"17070458535164862","r":31},"k":"mySubKey","c":"ch1-pnpres","u":{"pn_action":"join","pn_uuid":"dartClient","pn_timestamp":1707045853,"pn_precise_timestamp":1707045853513,"pn_occupancy":2,"pn_ispresence":1,"pn_channel":"ch1"},"d":{"action":"join","uuid":"p2","timestamp":1707045853,"precise_timestamp":1707045853513,"occupancy":2},"b":"ch1-pnpres"}]}',
      );

    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription({ receivePresenceEvents: true });
    const presencePromise = new Promise((resolvePresence) =>
      subscription.addListener({
        presence: (p) => resolvePresence(p),
      }),
    );
    subscription.subscribe();
    const actual = await presencePromise;
    expect(actual.action).to.equal('join');
    expect(actual.occupancy).to.equal(2);
  });

  it('add/remove listener should work on subscription', async () => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        state: '{}',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}');
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '3',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"10","r":1},"m":[{"a":"3","f":514,"i":"demo","p":{"t":"17069673079697201","r":33},"k":"demo","c":"ch1","d":{"message":"My message!"}}]}',
      );
    const messages = [];
    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription();
    const listener = { message: (m) => messages.push(m) };
    subscription.addListener(listener);
    const messagePromise = new Promise((resolveMessage) =>
      subscription.addListener({
        message: (m) => resolveMessage(m),
      }),
    );
    subscription.removeListener(listener);
    subscription.subscribe();
    const actual = await messagePromise;
    expect(JSON.stringify(actual.message)).to.equal('{"message":"My message!"}');
    expect(messages.length).to.equal(0);
  });

  it('should work with channel groups and their presence', async () => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/%2C/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        state: '{}',
        tt: 0,
        'channel-group': 'cg1,cg1-pnpres',
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}');
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/%2C/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '3',
        tr: 1,
        'channel-group': 'cg1,cg1-pnpres',
      })
      .reply(
        200,
        '{"t":{"t":"17070655215847224","r":33},"m":[{"a":"0","f":0,"i":"cl1","p":{"t":"17070655215847224","r":31},"k":"mySubKey","c":"ch1","d":{"message":"My message!"},"b":"cg1"}]}',
      );
    var channelGroup = pubnub.channelGroup('cg1');
    var subscription = channelGroup.subscription({ receivePresenceEvents: true });
    var messagePromise = new Promise((resolveMessage) =>
      subscription.addListener({
        message: (m) => resolveMessage(m),
      }),
    );
    subscription.subscribe();
    const actual = await messagePromise;
    expect(JSON.stringify(actual.message)).to.equal('{"message":"My message!"}');
  });
});
