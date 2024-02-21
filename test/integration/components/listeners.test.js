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
    pubnub.destroy();
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

  it('should able to create subscriptionSet', async () => {
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

    const subscriptionSet = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });

    const messagePromise = new Promise((resolveMessage) =>
      subscriptionSet.addListener({
        message: (m) => resolveMessage(m),
      }),
    );
    subscriptionSet.subscribe();
    const actual = await messagePromise;
    expect(JSON.stringify(actual.message)).to.equal('{"message":"My message!"}');
  });

  it('subscriptionSet works with add/remove with set', async () => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch3%2Cch4/0')
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
      .get('/v2/subscribe/mySubKey/ch3%2Cch4/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '3',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"10","r":1},"m":[{"a":"3","f":514,"i":"demo","p":{"t":"17069673079697201","r":33},"k":"demo","c":"ch3","d":{"message":"My message!"}}]}',
      );

    const subscriptionSetCh34 = pubnub.subscriptionSet({ channels: ['ch3', 'ch4'] });

    const subscriptionSetCh12 = pubnub
      .channel('ch1')
      .subscription()
      .addSubscription(pubnub.channel('ch2').subscription());

    subscriptionSetCh34.addSubscriptionSet(subscriptionSetCh12);
    subscriptionSetCh34.removeSubscriptionSet(subscriptionSetCh12);

    const messagePromise = new Promise((resolveMessage) =>
      subscriptionSetCh34.addListener({
        message: (m) => resolveMessage(m),
      }),
    );
    subscriptionSetCh34.subscribe();
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

  it('subscribe/unsubscribe handle edge case of having overlaping channel/group set', async () => {
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
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '10',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"10","r":1},"m":[{"a":"3","f":514,"i":"demo","p":{"t":"17069673079697201","r":33},"k":"demo","c":"ch1","d":{"message":"My message!"}}]}',
      );
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '10',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"10","r":1},"m":[{"a":"3","f":514,"i":"demo","p":{"t":"17069673079697201","r":33},"k":"demo","c":"ch1","d":{"message":"My message!"}}]}',
      );
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1%2Cch2%2Cch3/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '10',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"10","r":1},"m":[{"a":"3","f":514,"i":"demo","p":{"t":"17069673079697201","r":33},"k":"demo","c":"ch1","d":{"message":"My message!"}}]}',
      );
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch2%2Cch3/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: '10',
        tr: 1,
      })
      .reply(
        200,
        '{"t":{"t":"12","r":1},"m":[{"a":"3","f":514,"i":"demo","p":{"t":"17069673079697201","r":33},"k":"demo","c":"ch2","d":{"ch2":"My message!"}}]}',
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
    expect(pubnub.getSubscribedChannels()).to.deep.equal(['ch1']);
    const actual = await messagePromise;
    expect(JSON.stringify(actual.message)).to.equal('{"message":"My message!"}');
    expect(messages.length).to.equal(0);

    const subscriptionCh2 = pubnub.channel('ch2').subscription();
    subscriptionCh2.subscribe();
    expect(pubnub.getSubscribedChannels()).to.deep.equal(['ch1', 'ch2']);

    const subscriptionCh3 = pubnub.channel('ch3').subscription();
    const subscriptionSetCh23 = subscriptionCh3.addSubscription(pubnub.channel('ch2').subscription());
    subscriptionSetCh23.subscribe();
    expect(pubnub.getSubscribedChannels()).to.deep.equal(['ch1', 'ch2', 'ch3']);

    subscription.unsubscribe();
    expect(pubnub.getSubscribedChannels()).to.deep.equal(['ch2', 'ch3']);

    subscriptionCh2.unsubscribe();
    expect(pubnub.getSubscribedChannels()).to.deep.equal(['ch2', 'ch3']);
    pubnub.destroy();
  });

  it('should work with event type specific listener registraction', async () => {
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
    var messagePromise = new Promise((resolveMessage) => (subscription.onMessage = (m) => resolveMessage(m)));
    subscription.subscribe();
    const actual = await messagePromise;
    expect(JSON.stringify(actual.message)).to.equal('{"message":"My message!"}');
  });

  it('with presence should work with event type specific listener registraction', async () => {
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
        '{"t":{"t":"10","r":1},"m":[{"a":"4","f":0,"p":{"t":"8","r":2},"k":"subKey","c":"ch1-pnpres","d":{"action": "join", "timestamp": 1461451222, "uuid": "testid", "occupancy": 1},"b":"ch1-pnpres"}]}',
      );

    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription({ receivePresenceEvents: true });
    const presencePromise = new Promise(
      (resolvePresenceEvent) => (subscription.onPresence = (p) => resolvePresenceEvent(p)),
    );
    subscription.subscribe();
    const actual = await presencePromise;
    expect(JSON.stringify(actual)).to.equal(
      '{"channel":"ch1","subscription":null,"action":"join","occupancy":1,"uuid":"testid","timestamp":1461451222,"actualChannel":null,"subscribedChannel":"ch1-pnpres"}',
    );
  });
});
