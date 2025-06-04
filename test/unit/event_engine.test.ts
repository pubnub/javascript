import nock from 'nock';

import StatusCategory from '../../src/core/constants/categories';
import { Status, StatusEvent } from '../../src/core/types/api';
import PubNub from '../../src/node/index';
import utils from '../utils';

describe('EventEngine', () => {
  // @ts-expect-error Access event engine core for test purpose.
  let engine: PubNub['eventEngine']['engine'];
  let pubnub: PubNub;
  let stateChanges: { type: string; toState: { label: string } }[] = [];
  let receivedStatuses: (Status | StatusEvent)[] = [];

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  let unsub: () => void;

  beforeEach(() => {
    nock.cleanAll();
    receivedStatuses = [];
    stateChanges = [];

    pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      uuid: 'test-js',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      enableEventEngine: true,
    });

    // @ts-expect-error Access event engine core for test purpose.
    engine = pubnub.eventEngine!._engine;

    unsub = engine.subscribe((_change: Record<string, unknown>) => {
      // FOR DEBUG
      // console.dir(_change);
    });
  });

  afterEach(() => {
    unsub();
    pubnub.destroy(true);
  });

  function forStatus(statusCategory: StatusCategory, timeout?: number) {
    return new Promise<void>((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout>;

      for (const status of receivedStatuses) {
        if (status.category === statusCategory) {
          resolve();
          return;
        }
      }

      pubnub.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === statusCategory) {
            pubnub.removeAllListeners();
            resolve();
          }
        },
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          pubnub.removeAllListeners();
          reject(new Error(`Timeout occurred while waiting for state ${statusCategory}`));
        }, timeout);
      }
    });
  }

  function forEvent(eventLabel: string, timeout?: number) {
    return new Promise<void>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null;

      const unsubscribe = engine.subscribe((change: { type: string; event: { type: string } }) => {
        if (change.type === 'eventReceived' && change.event.type === eventLabel) {
          if (timeoutId) clearTimeout(timeoutId);
          unsubscribe();
          resolve();
        }
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          unsubscribe();
          reject(new Error(`Timeout occurred while waiting for state ${eventLabel}`));
        }, timeout);
      }
    });
  }

  function forState(stateLabel: string, timeout?: number) {
    return new Promise<void>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null;

      for (const change of stateChanges) {
        if (change.type === 'transitionDone' && change.toState.label === stateLabel) {
          resolve();
          return;
        }
      }

      const unsubscribe = engine.subscribe((change: { type: string; toState: { label: string } }) => {
        if (change.type === 'transitionDone' && change.toState.label === stateLabel) {
          if (timeoutId) clearTimeout(timeoutId);
          unsubscribe();
          resolve();
        }
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          unsubscribe();
          reject(new Error(`Timeout occured while waiting for state ${stateLabel}`));
        }, timeout);
      }
    });
  }

  function forInvocation(invocationLabel: string, timeout?: number) {
    return new Promise<void>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null;

      const unsubscribe = engine.subscribe((change: { type: string; invocation: { type: string } }) => {
        if (change.type === 'invocationDispatched' && change.invocation.type === invocationLabel) {
          if (timeoutId) clearTimeout(timeoutId);
          unsubscribe();
          resolve();
        }
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          unsubscribe();
          reject(new Error(`Timeout occured while waiting for invocation ${invocationLabel}`));
        }, timeout);
      }
    });
  }

  it('should work correctly', async () => {
    utils.createPresenceMockScopes({ subKey: 'demo', presenceType: 'heartbeat', requests: [{ channels: ['test'] }] });
    utils.createPresenceMockScopes({ subKey: 'demo', presenceType: 'leave', requests: [{ channels: ['test'] }] });
    utils.createSubscribeMockScopes({
      subKey: 'demo',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'test-js',
      eventEngine: true,
      requests: [
        { channels: ['test'], messages: [] },
        { channels: ['test'], messages: [], replyDelay: 500 },
      ],
    });
    engine.subscribe((change: { type: string; toState: { label: string } }) => stateChanges.push(change));

    pubnub.subscribe({ channels: ['test'] });

    await forEvent('HANDSHAKE_SUCCESS', 1000);

    pubnub.unsubscribe({ channels: ['test'] });

    await forState('UNSUBSCRIBED', 1000);
  });

  it('should work correctly', async () => {
    utils.createPresenceMockScopes({
      subKey: 'demo',
      presenceType: 'heartbeat',
      requests: [{ channels: ['test'] }, { channels: ['test', 'test1'] }],
    });
    utils.createPresenceMockScopes({
      subKey: 'demo',
      presenceType: 'leave',
      requests: [{ channels: ['test', 'test1'] }],
    });
    utils.createSubscribeMockScopes({
      subKey: 'demo',
      pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
      userId: 'test-js',
      eventEngine: true,
      requests: [
        { channels: ['test'], messages: [] },
        { channels: ['test', 'test1'], messages: [] },
        { channels: ['test', 'test1'], messages: [], replyDelay: 500 },
      ],
    });
    engine.subscribe((change: { type: string; toState: { label: string } }) => stateChanges.push(change));
    pubnub.addListener({ status: (statusEvent) => receivedStatuses.push(statusEvent) });

    pubnub.subscribe({ channels: ['test'] });

    await forEvent('HANDSHAKE_SUCCESS', 1000);

    pubnub.subscribe({ channels: ['test1'] });

    await forStatus(StatusCategory.PNSubscriptionChangedCategory);

    pubnub.unsubscribe({ channels: ['test', 'test1'] });

    await forState('UNSUBSCRIBED', 1000);
  });

  // TODO: retry with configuration
  // it('should retry correctly', async () => {
  //   utils.createNock().get('/v2/subscribe/demo/test/0').query(true).reply(200, '{"t":{"t":"12345","r":1}, "m": []}');
  //   utils.createNock().get('/v2/subscribe/demo/test/0').query(true).reply(500, '{"error": true}');

  //   pubnub.subscribe({ channels: ['test'] });

  //   await forState('RECEIVE_RECONNECTING', 1000);
  // });
});
