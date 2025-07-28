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
      // logLevel: PubNub.LogLevel.Trace,
    });
  });

  afterEach(() => {
    pubnub.destroy(true);
  });

  it('should pass messages of subscribed channel to its listener', async () => {
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch1'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['ch1'], messages: [{ channel: 'ch1', message: { message: 'My message!' } }] },
        { channels: ['ch1'], messages: [], replyDelay: 500 },
      ],
    });

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
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch1'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['ch1', 'ch1-pnpres'], messages: [{ channel: 'ch1', message: { message: 'My message!' } }] },
        { channels: ['ch1', 'ch1-pnpres'], messages: [], replyDelay: 500 },
      ],
    });
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
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch1', 'ch2'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['ch1', 'ch2'], messages: [{ channel: 'ch2', message: { message: 'My message!' } }] },
        { channels: ['ch1', 'ch2'], messages: [], replyDelay: 500 },
      ],
    });

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
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch1', 'ch2'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['ch1', 'ch2'], messages: [{ channel: 'ch2', message: { message: 'My message!' } }] },
        { channels: ['ch1', 'ch2'], messages: [], replyDelay: 500 },
      ],
    });

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
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch3', 'ch4'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['ch3', 'ch4'], messages: [{ channel: 'ch3', message: { message: 'My message!' } }] },
        { channels: ['ch3', 'ch4'], messages: [], replyDelay: 500 },
      ],
    });

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
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch1'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        {
          channels: ['ch1', 'ch1-pnpres'],
          messages: [{ channel: 'ch1-pnpres', presenceAction: 'join', presenceOccupancy: 2 }],
        },
        { channels: ['ch1', 'ch1-pnpres'], messages: [], replyDelay: 500 },
      ],
    });

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
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch1'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['ch1'], messages: [{ channel: 'ch1', message: { message: 'My message!' } }] },
        { channels: ['ch1'], messages: [], replyDelay: 500 },
      ],
    });

    const messages: Subscription.Message[] = [];
    const subscription = pubnub.channel('ch1').subscription();
    const listener = { message: (m: Subscription.Message) => messages.push(m) };
    subscription.addListener(listener);
    const messagePromise = new Promise<Subscription.Message>((resolveMessage) => {
      subscription.removeListener(listener);
      subscription.addListener({
        message: (m) => resolveMessage(m),
      });
    });
    subscription.subscribe();
    const actual = await messagePromise;
    expect(JSON.stringify(actual.message)).to.equal('{"message":"My message!"}');
    expect(messages.length).to.equal(0);
  });

  it('should work with channel groups and their presence', async () => {
    utils.createPresenceMockScopes({ subKey: 'mySubKey', presenceType: 'heartbeat', requests: [{ groups: ['cg1'] }] });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        {
          groups: ['cg1', 'cg1-pnpres'],
          messages: [{ channel: 'ch1', group: 'cg1', message: { message: 'My message!' } }],
        },
        { groups: ['cg1', 'cg1-pnpres'], messages: [], replyDelay: 500 },
      ],
    });

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

  it('subscribe/unsubscribe handle edge case of having overlying channel/group set', async () => {
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch1'] }, { channels: ['ch1', 'ch2'] }, { channels: ['ch1', 'ch2', 'ch3'] }],
    });
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'leave',
      requests: [{ channels: ['ch1'] }, { channels: ['ch2', 'ch3'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['ch1'], messages: [{ channel: 'ch1', message: { message: 'My message!' } }] },
        { channels: ['ch1'], messages: [{ channel: 'ch1', message: { message: 'My message!' } }] },
        { channels: ['ch1', 'ch2'], messages: [{ channel: 'ch1', message: { message: 'My message!' } }] },
        { channels: ['ch1', 'ch2', 'ch3'], messages: [{ channel: 'ch1', message: { message: 'My message!' } }] },
        {
          channels: ['ch2', 'ch3'],
          messages: [{ channel: 'ch2', message: { ch2: 'My message!' }, timetokenAdjust: '10000000' }],
        },
        { channels: ['ch2', 'ch3'], messages: [], replyDelay: 500 },
      ],
    });

    const messages: Subscription.Message[] = [];
    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription();
    const listener = { message: (m: Subscription.Message) => messages.push(m) };
    subscription.addListener(listener);
    const messagePromise = new Promise<Subscription.Message>((resolveMessage) => {
      subscription.removeListener(listener);
      subscription.addListener({
        message: (m) => resolveMessage(m),
      });
    });
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

  it("subscribe and don't deliver old messages", async () => {
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch1'] }, { channels: ['ch1', 'ch2'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['ch1'], messages: [{ channel: 'ch1', message: { message: 'My message!' } }] },
        {
          channels: ['ch1', 'ch2'],
          messages: [
            { channel: 'ch1', message: { message: 'My message!' } },
            { channel: 'ch2', message: { ch2: 'My old message!' }, timetokenAdjust: '-5000000' },
          ],
        },
        {
          channels: ['ch1', 'ch2'],
          messages: [{ channel: 'ch2', message: { ch2: 'My new message!' }, timetokenAdjust: '10000000' }],
        },
        { channels: ['ch1', 'ch2'], messages: [], replyDelay: 500 },
      ],
    });

    const messages: Subscription.Message[] = [];
    const subscriptionCh1 = pubnub.channel('ch1').subscription();
    subscriptionCh1.onMessage = () => {};

    const connectionPromise = new Promise<void>((resolve) => {
      pubnub.onStatus = (status) => {
        if (status.category === PubNub.CATEGORIES.PNConnectedCategory) resolve();
      };
    });

    // Wait for connection.
    subscriptionCh1.subscribe();
    await connectionPromise;

    const subscriptionCh2 = pubnub.channel('ch2').subscription();
    const messagePromise = new Promise<void>((resolveMessage) => {
      subscriptionCh2.onMessage = (message) => messages.push(message);
      setTimeout(() => resolveMessage(), 500);
    });

    // Wait for messages.
    subscriptionCh2.subscribe();
    await messagePromise;

    expect(messages.length).to.equal(1);
    expect(JSON.stringify(messages[0].message)).to.equal('{"ch2":"My new message!"}');
  });

  /// `17525257097772389` and `17525257156893384` used on purpose because this combination
  /// was the root of the issue (when catch up timetoken is larger than the one provided by service response).
  it('subscribe and deliver messages when server returns old timetoken', async () => {
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch1'] }, { channels: ['ch1'] }, { channels: ['ch1', 'ch2'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [{ channels: ['ch1'], messages: [], initialTimetokenOverride: '17525257097772389' }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['ch1'], messages: [], initialTimetokenOverride: '17525257097772389' },
        {
          channels: ['ch1', 'ch2'],
          messages: [{ channel: 'ch2', message: { ch2: 'My expected message!' } }],
          timetoken: '17525257156893384',
        },
        { channels: ['ch1', 'ch2'], messages: [], replyDelay: 500 },
      ],
    });

    const messages: Subscription.Message[] = [];
    const subscriptionCh1 = pubnub.channel('ch1').subscription();
    subscriptionCh1.onMessage = () => {};

    const connectionPromise = new Promise<void>((resolve) => {
      pubnub.onStatus = (status) => {
        if (status.category === PubNub.CATEGORIES.PNConnectedCategory) resolve();
      };
    });

    // Wait for connection.
    subscriptionCh1.subscribe();
    await connectionPromise;

    const disconnectionPromise = new Promise<void>((resolve) => {
      pubnub.onStatus = (status) => {
        // This is simulation which possible to reproduce only this way.
        if (status.category === PubNub.CATEGORIES.PNDisconnectedUnexpectedlyCategory) resolve();
      };
    });

    // Wait for disconnection.
    pubnub.disconnect(true);
    await disconnectionPromise;

    const reconnectionPromise = new Promise<void>((resolve) => {
      pubnub.onStatus = (status) => {
        if (status.category === PubNub.CATEGORIES.PNConnectedCategory) resolve();
      };
    });

    // Wait for reconnection.
    pubnub.reconnect({ timetoken: '17525257156893384' });
    await reconnectionPromise;

    const subscriptionCh2 = pubnub.channel('ch2').subscription();
    const messagePromise = new Promise<void>((resolveMessage) => {
      subscriptionCh2.onMessage = (message) => messages.push(message);
      setTimeout(() => resolveMessage(), 500);
    });

    // Wait for messages.
    subscriptionCh2.subscribe();
    await messagePromise;

    expect(messages.length).to.equal(1);
    expect(JSON.stringify(messages[0].message)).to.equal('{"ch2":"My expected message!"}');
  });

  it('subscribe and deliver notifications targeted by subscription object', async () => {
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [
        { channels: ['ch1', 'ch2'] },
        { channels: ['ch1', 'ch2', 'ch3'] },
        { channels: ['ch1', 'ch2', 'ch3', 'ch4'] },
        { channels: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'] },
      ],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['ch1', 'ch2'], messages: [{ channel: 'ch1', message: { message: 'My message!' } }] },
        { channels: ['ch1', 'ch2', 'ch3'], messages: [] },
        { channels: ['ch1', 'ch2', 'ch3', 'ch4'], messages: [] },
        {
          channels: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'],
          messages: [
            { channel: 'ch1', message: { message: 'My message!' } },
            { channel: 'ch3', message: { ch3: 'My message!' }, timetokenAdjust: '10000000' },
          ],
        },
        { channels: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'], messages: [], replyDelay: 500 },
      ],
    });

    const ch12Messages: Subscription.Message[] = [];
    const ch3Messages: Subscription.Message[] = [];
    const subscriptionCh12 = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });
    subscriptionCh12.onMessage = (message) => ch12Messages.push(message);

    const connectionPromise = new Promise<void>((resolve) => {
      pubnub.onStatus = (status) => {
        if (status.category === PubNub.CATEGORIES.PNConnectedCategory) resolve();
      };
    });

    // Wait for connection.
    subscriptionCh12.subscribe();
    await connectionPromise;

    const subscriptionCh3 = pubnub.channel('ch3').subscription();
    const messagePromise = new Promise<void>((resolveMessage) => {
      subscriptionCh3.onMessage = (message) => ch3Messages.push(message);
      setTimeout(() => resolveMessage(), 500);
    });

    // Wait for messages.
    subscriptionCh3.subscribe();

    const subscriptionCh4 = pubnub.channel('ch4').subscription();
    const subscriptionSet1Ch34 = subscriptionCh4.addSubscription(subscriptionCh3);
    const subscriptionCh5 = pubnub.channel('ch5').subscription();
    const subscriptionSet2Ch35 = subscriptionCh5.addSubscription(subscriptionCh3);
    expect(subscriptionCh4.state.isSubscribed).to.equal(true);
    expect(subscriptionSet1Ch34.state.isSubscribed).to.equal(true);
    expect(subscriptionCh5.state.isSubscribed).to.equal(true);
    expect(subscriptionSet2Ch35.state.isSubscribed).to.equal(true);

    await messagePromise;

    expect(ch12Messages.length).to.equal(1);
    expect(ch3Messages.length).to.equal(1);
    expect(JSON.stringify(ch12Messages[0].message)).to.equal('{"message":"My message!"}');
    expect(JSON.stringify(ch3Messages[0].message)).to.equal('{"ch3":"My message!"}');
  });

  it('should work with event type specific listener registration', async () => {
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch1'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        { channels: ['ch1'], messages: [{ channel: 'ch1', message: { message: 'My message!' } }] },
        { channels: ['ch1'], messages: [], replyDelay: 500 },
      ],
    });

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
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['ch1'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        {
          channels: ['ch1', 'ch1-pnpres'],
          messages: [{ channel: 'ch1-pnpres', presenceAction: 'join', presenceUserId: 'bob' }],
        },
        { channels: ['ch1', 'ch1-pnpres'], messages: [], replyDelay: 500 },
      ],
    });

    const channel = pubnub.channel('ch1');
    const subscription = channel.subscription({ receivePresenceEvents: true });
    const presencePromise = new Promise<Subscription.Presence>(
      (resolvePresenceEvent) => (subscription.onPresence = (p) => resolvePresenceEvent(p)),
    );
    subscription.subscribe();
    const actual = await presencePromise;
    expect(actual.channel).to.be.equal('ch1');
    expect(actual.subscription).to.be.equal('ch1-pnpres');
    expect(actual.action).to.be.equal('join');
    // @ts-expect-error: Don't check a type of presence event here.
    expect(actual.occupancy).to.be.equal(1);
    // @ts-expect-error: Don't check a type of presence event here.
    expect(actual.uuid).to.be.equal('bob');
    expect(actual.timetoken).to.not.be.equal(undefined);
  });
  it('should route messages correctly between subscription sets and individual subscriptions', (done) => {
    utils.createPresenceMockScopes({
      subKey: 'mySubKey',
      presenceType: 'heartbeat',
      requests: [{ channels: ['a', 'b', 'c', 'd'] }],
    });

    utils.createSubscribeMockScopes({
      subKey: 'mySubKey',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'myUUID',
      eventEngine: true,
      requests: [
        {
          channels: ['a', 'b', 'c', 'd'],
          messages: [
            { channel: 'a', message: { id: 'msg-channel-a', content: 'Message for channel A' } },
            { channel: 'b', message: { id: 'msg-channel-b', content: 'Message for channel B' } },
            { channel: 'c', message: { id: 'msg-channel-c', content: 'Message for channel C' } },
            // Intentionally NO message for channel 'd' - this tests message isolation
          ],
        },
        // Final empty response to end subscription loop
        { channels: ['a', 'b', 'c', 'd'], messages: [], replyDelay: 500 },
      ],
    });

    // Message tracking arrays for individual subscriptions (as requested)
    const channelASubscriptionMessagesReceived: Subscription.Message[] = [];
    const channelBSubscriptionMessagesReceived: Subscription.Message[] = [];
    const channelCSubscriptionMessagesReceived: Subscription.Message[] = [];
    const subDReceivedMessages: Subscription.Message[] = []; // Array for subD as requested
    const subscriptionSet1MessagesReceived: Subscription.Message[] = [];

    // Create individual subscriptions (subA, subB, subD)
    const subA = pubnub.channel('a').subscription();
    const subB = pubnub.channel('b').subscription();
    const subD = pubnub.channel('d').subscription(); // Added subD for channel 'd'
    const subscriptionC = pubnub.channel('c').subscription(); // Individual subscription for channel 'c'

    // Add message listeners to individual subscriptions to maintain received message arrays
    subA.onMessage = (message) => channelASubscriptionMessagesReceived.push(message);
    subB.onMessage = (message) => channelBSubscriptionMessagesReceived.push(message);
    subD.onMessage = (message) => subDReceivedMessages.push(message); // subD listener as requested
    subscriptionC.onMessage = (message) => channelCSubscriptionMessagesReceived.push(message);

    // Create subscriptionSet1 by adding individual subscriptions (subA + subB + subD + subscriptionC)
    // This creates a subscription set covering channels 'a', 'b', 'c', 'd'
    const subscriptionSet1 = subA.addSubscription(subB);
    subscriptionSet1.addSubscription(subD); // Add subD to subscriptionSet as requested
    subscriptionSet1.addSubscription(subscriptionC);
    subscriptionSet1.onMessage = (message) => subscriptionSet1MessagesReceived.push(message);

    // Track when we've received enough messages to verify the test
    let messageCount = 0;
    let testCompleted = false;

    const checkCompletion = () => {
      messageCount++;
      // We expect messages for channels a, b, c - both to individual subscriptions and subscription set
      // subD should receive NO messages since no message is sent to channel 'd'
      if (messageCount >= 6 && !testCompleted) {
        // 3 for set + 3 for individual subscriptions (a,b,c only)
        testCompleted = true;

        try {
          // Verify that each individual subscription receives messages for its respective channel
          expect(channelASubscriptionMessagesReceived.length).to.equal(1);
          expect((channelASubscriptionMessagesReceived[0].message as any).id).to.equal('msg-channel-a');
          expect(channelASubscriptionMessagesReceived[0].channel).to.equal('a');

          expect(channelBSubscriptionMessagesReceived.length).to.equal(1);
          expect((channelBSubscriptionMessagesReceived[0].message as any).id).to.equal('msg-channel-b');
          expect(channelBSubscriptionMessagesReceived[0].channel).to.equal('b');

          expect(channelCSubscriptionMessagesReceived.length).to.equal(1);
          expect((channelCSubscriptionMessagesReceived[0].message as any).id).to.equal('msg-channel-c');
          expect(channelCSubscriptionMessagesReceived[0].channel).to.equal('c');

          // subD should NOT receive any messages since no message was sent to channel 'd'
          // This confirms that messages are not routed to wrong subscription listeners
          expect(subDReceivedMessages.length).to.equal(0, 'subD should not receive messages for channels a,b,c');

          // Verify that subscriptionSet1 receives messages for channels a, b, c (but not d since no message sent)
          expect(subscriptionSet1MessagesReceived.length).to.equal(3);
          const set1MessageIds = subscriptionSet1MessagesReceived.map((m) => (m.message as any).id).sort();
          expect(set1MessageIds).to.deep.equal(['msg-channel-a', 'msg-channel-b', 'msg-channel-c']);

          // Verify correct channel routing for each message in the subscription set
          const channelAMsg = subscriptionSet1MessagesReceived.find((m) => (m.message as any).id === 'msg-channel-a');
          const channelBMsg = subscriptionSet1MessagesReceived.find((m) => (m.message as any).id === 'msg-channel-b');
          const channelCMsg = subscriptionSet1MessagesReceived.find((m) => (m.message as any).id === 'msg-channel-c');

          expect(channelAMsg?.channel).to.equal('a');
          expect(channelBMsg?.channel).to.equal('b');
          expect(channelCMsg?.channel).to.equal('c');

          // Verify that no message for channel 'd' exists in the subscription set
          const channelDMsg = subscriptionSet1MessagesReceived.find((m) => m.channel === 'd');
          expect(channelDMsg).to.be.undefined;

          done();
        } catch (error) {
          done(error);
        }
      }
    };

    // Add listeners to test completion check
    subscriptionSet1.addListener({ message: checkCompletion });
    subA.addListener({ message: checkCompletion });
    subB.addListener({ message: checkCompletion });
    subD.addListener({ message: checkCompletion });
    subscriptionC.addListener({ message: checkCompletion });

    // Subscribe the subscription set (which includes a, b, c, d through individual subscriptions)
    subscriptionSet1.subscribe();
  });
});
