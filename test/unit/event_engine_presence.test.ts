import nock from 'nock';

import PubNub from '../../src/node/index';
import utils from '../utils';

describe('EventEngine', () => {
  // @ts-expect-error Access event engine core for test purpose.
  let engine: PubNub['presenceEventEngine']['engine'];
  let pubnub: PubNub;
  let receivedEvents: { type: string; event: { type: string } }[] = [];
  let stateChanges: { type: string; toState: { label: string } }[] = [];

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  let unsub: () => void;

  beforeEach(() => {
    nock.cleanAll();
    receivedEvents = [];
    stateChanges = [];

    pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      uuid: 'test-js',
      enableEventEngine: true,
      heartbeatInterval: 1,
      // logVerbosity: true,
    });

    // @ts-expect-error Access event engine core for test purpose.
    engine = pubnub.presenceEventEngine._engine;

    unsub = engine.subscribe((_change: Record<string, unknown>) => {
      // FOR DEBUG
      // console.dir(change);
    });
  });

  afterEach(() => {
    unsub();
  });

  function forEvent(eventLabel: string, timeout?: number) {
    return new Promise<void>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null;

      for (const change of receivedEvents) {
        if (change.type === 'eventReceived' && change.event.type === eventLabel) {
          resolve();
          return;
        }
      }

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
          reject(new Error(`Timeout occured while waiting for event ${eventLabel}`));
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

  it('presence event_engine should work correctly', async () => {
    utils.createPresenceMockScopes({
      subKey: 'demo',
      presenceType: 'leave',
      requests: [{ channels: ['test'] }],
    });
    utils
      .createNock()
      .get('/v2/presence/sub-key/demo/channel/test/heartbeat')
      .query(true)
      .reply(200, '{"message":"OK", "service":"Presence"}', { 'content-type': 'text/javascript' });

    engine.subscribe(
      (change: { type: string; event: { type: string } } | { type: string; toState: { label: string } }) =>
        'toState' in change ? stateChanges.push(change) : receivedEvents.push(change),
    );

    // @ts-expect-error Intentional access to the private interface.
    pubnub.join({ channels: ['test'] });

    await forEvent('JOINED', 1000);

    await forState('HEARTBEATING', 1000);

    await forEvent('HEARTBEAT_SUCCESS', 1000);

    await forState('HEARTBEAT_COOLDOWN', 1000);

    // @ts-expect-error Intentional access to the private interface.
    pubnub.leaveAll();

    await forEvent('LEFT_ALL', 2000);
  });
});
