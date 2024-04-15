import { expect } from 'chai';
import nock from 'nock';

import * as Subscription from '../../../src/core/types/api/subscription';
import PubNub from '../../../src/node/index';
import utils from '../../utils';

let pubnub: PubNub;

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
      origin: 'ps.pndsn.com',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      enableEventEngine: true,
      autoNetworkDetection: false,
    });
  });

  afterEach(() => {
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
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query((object) => object.tt === '3')
      .reply(
        200,
        '{"t":{"t":"10","r":1},"m":[{"a":"3","f":514,"i":"demo","p":{"t":"17069673079697201","r":33},"k":"demo","c":"ch1","d":{"message":"My message!"}}]}',
        { 'content-type': 'text/javascript' },
      );
    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription();
    const messagePromise = new Promise<Subscription.Message>((resolveMessage) =>
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
      .get('/v2/subscribe/mySubKey/ch1,ch1-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch1-pnpres/0')
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
        { 'content-type': 'text/javascript' },
      );
    nock.enableNetConnect();

    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription({ receivePresenceEvents: true });
    const messagePromise = new Promise<Subscription.Message>((resolveMessage) =>
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
      .get('/v2/subscribe/mySubKey/ch1,ch2/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch2/0')
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
        { 'content-type': 'text/javascript' },
      );

    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription();
    const subscriptionSet = subscription.addSubscription(pubnub.channel('ch2').subscription());
    const messagePromise = new Promise<Subscription.Message>((resolveMessage) =>
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
      .get('/v2/subscribe/mySubKey/ch1,ch2/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch2/0')
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
        { 'content-type': 'text/javascript' },
      );

    const subscriptionSet = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });

    const messagePromise = new Promise<Subscription.Message>((resolveMessage) =>
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
      .get('/v2/subscribe/mySubKey/ch3,ch4/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch3,ch4/0')
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
        { 'content-type': 'text/javascript' },
      );

    const subscriptionSetCh34 = pubnub.subscriptionSet({ channels: ['ch3', 'ch4'] });

    const subscriptionSetCh12 = pubnub
      .channel('ch1')
      .subscription()
      .addSubscription(pubnub.channel('ch2').subscription());

    subscriptionSetCh34.addSubscriptionSet(subscriptionSetCh12);
    subscriptionSetCh34.removeSubscriptionSet(subscriptionSetCh12);

    const messagePromise = new Promise<Subscription.Message>((resolveMessage) =>
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
      .get('/v2/subscribe/mySubKey/ch1,ch1-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch1-pnpres/0')
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
        { 'content-type': 'text/javascript' },
      );

    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription({ receivePresenceEvents: true });
    const presencePromise = new Promise<Subscription.Presence>((resolvePresence) =>
      subscription.addListener({
        presence: (p) => resolvePresence(p),
      }),
    );
    subscription.subscribe();
    const actual = await presencePromise;
    if (actual.action === 'join') {
      expect(actual.occupancy).to.equal(2);
    } else throw new Error('Unexpected presence event');
  });

  it('add/remove listener should work on subscription', async () => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}', { 'content-type': 'text/javascript' });
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
        { 'content-type': 'text/javascript' },
      );
    const messages: Subscription.Message[] = [];
    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription();
    const listener = { message: (m: Subscription.Message) => messages.push(m) };
    subscription.addListener(listener);
    const messagePromise = new Promise<Subscription.Message>((resolveMessage) =>
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
      .get('/v2/subscribe/mySubKey/,/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
        'channel-group': 'cg1,cg1-pnpres',
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/,/0')
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
        { 'content-type': 'text/javascript' },
      );
    const channelGroup = pubnub.channelGroup('cg1');
    const subscription = channelGroup.subscription({ receivePresenceEvents: true });
    const messagePromise = new Promise<Subscription.Message>((resolveMessage) =>
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
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}', { 'content-type': 'text/javascript' });
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
        { 'content-type': 'text/javascript' },
      );
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query((object) => object.tt === '10')
      .reply(
        200,
        '{"t":{"t":"10","r":1},"m":[{"a":"3","f":514,"i":"demo","p":{"t":"17069673079697201","r":33},"k":"demo","c":"ch1","d":{"message":"My message!"}}]}',
        { 'content-type': 'text/javascript' },
      );
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch2/0')
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
        { 'content-type': 'text/javascript' },
      );
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch2,ch3/0')
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
        { 'content-type': 'text/javascript' },
      );
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch2,ch3/0')
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
        { 'content-type': 'text/javascript' },
      );
    const messages: Subscription.Message[] = [];
    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription();
    const listener = { message: (m: Subscription.Message) => messages.push(m) };
    subscription.addListener(listener);
    const messagePromise = new Promise<Subscription.Message>((resolveMessage) =>
      subscription.addListener({
        message: (m) => resolveMessage(m),
      }),
    );
    subscription.removeListener(listener);
    subscription.subscribe();
    const actual = await messagePromise;
    expect(JSON.stringify(actual.message)).to.equal('{"message":"My message!"}');
    expect(messages.length).to.equal(0);
    const subscriptionCh2 = pubnub.channel('ch2').subscription();
    subscriptionCh2.subscribe();
    const subscriptionCh3 = pubnub.channel('ch3').subscription();
    const subscriptionSetCh23 = subscriptionCh3.addSubscription(pubnub.channel('ch2').subscription());
    const messagePromiseChannel2 = new Promise<Subscription.Message>((resolveMessage) =>
      subscriptionSetCh23.addListener({
        message: (m) => resolveMessage(m),
      }),
    );
    subscriptionSetCh23.subscribe();
    subscription.unsubscribe();
    subscriptionCh2.unsubscribe();
    const actualChannel2MessageAfterOneUnsubCh2 = await messagePromiseChannel2;
    pubnub.destroy();
    expect(JSON.stringify(actualChannel2MessageAfterOneUnsubCh2.message)).to.equal('{"ch2":"My message!"}');
  });

  it('should work with event type specific listener registraction', async () => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}', { 'content-type': 'text/javascript' });
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
        { 'content-type': 'text/javascript' },
      );
    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription();
    const messagePromise = new Promise<Subscription.Message>(
      (resolveMessage) => (subscription.onMessage = (m) => resolveMessage(m)),
    );
    subscription.subscribe();
    const actual = await messagePromise;
    expect(JSON.stringify(actual.message)).to.equal('{"message":"My message!"}');
  });

  it('with presence should work with event type specific listener registration', async () => {
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch1-pnpres/0')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        ee: '',
        tt: 0,
      })
      .reply(200, '{"t":{"t":"3","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch1-pnpres/0')
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
        { 'content-type': 'text/javascript' },
      );

    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription({ receivePresenceEvents: true });
    const presencePromise = new Promise<Subscription.Presence>(
      (resolvePresenceEvent) => (subscription.onPresence = (p) => resolvePresenceEvent(p)),
    );
    subscription.subscribe();
    const actual = await presencePromise;
    expect(actual).to.deep.equal({
      channel: 'ch1',
      subscription: 'ch1-pnpres',
      action: 'join',
      occupancy: 1,
      uuid: 'testid',
      timestamp: 1461451222,
      actualChannel: 'ch1',
      subscribedChannel: 'ch1-pnpres',
      timetoken: '8',
    });
  });
});
