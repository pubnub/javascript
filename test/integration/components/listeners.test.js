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

  it('should pass messages of subscribed channel to its listener', (done) => {
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
    subscription.addListener({
      message: (m) => {
        expect(JSON.stringify(m.message)).to.equal('{"message":"My message!"}');
        done();
      },
    }),
      subscription.subscribe();
  });
  it('should subscribed to channel and presence channels', (done) => {
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

    subscription.addListener({
      message: (m) => {
        expect(JSON.stringify(m.message)).to.equal('{"message":"My message!"}');
        done();
      },
    }),
      subscription.subscribe();
  });

  it('should work with subscriptionSet', (done) => {
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
    subscriptionSet.addListener({
      message: (m) => {
        expect(JSON.stringify(m.message)).to.equal('{"message":"My message!"}');
        done();
      },
    }),
      subscriptionSet.subscribe();
  });

  it('listener should route presence event to registered handler', (done) => {
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

    subscription.addListener({
      presence: (p) => {
        expect(p.action).to.equal('join');
        expect(p.occupancy).to.equal(2);
        done();
      },
    }),
      subscription.subscribe();
  });

  it('add/remove listener should work on subscription', (done) => {
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

    subscription.addListener({
      message: (m) => {
        expect(JSON.stringify(m.message)).to.equal('{"message":"My message!"}');
        expect(messages.length).to.equal(0);
        done();
      },
    }),
      subscription.removeListener(listener);
    subscription.subscribe();
  });

  it('should work with channel groups and their presence', (done) => {
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
        message: (m) => {
          expect(JSON.stringify(m.message)).to.equal('{"message":"My message!"}');
          done();
        },
      }),
    );
    subscription.subscribe();
  });
});
