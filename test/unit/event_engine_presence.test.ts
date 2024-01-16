import nock from 'nock';
import utils from '../utils';
import PubNub from '../../src/node/index';

describe('EventEngine', () => {
  let pubnub: PubNub;
  let engine: PubNub['presenceEventEngine']['engine'];

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  let unsub;
  beforeEach(() => {
    nock.cleanAll();

    pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      uuid: 'test-js',
      enableEventEngine: true,
      heartbeatInterval: 1,
      logVerbosity: true,
    });

    engine = pubnub.presenceEventEngine._engine;

    unsub = engine.subscribe((change) => {
      console.log(change);
    });
  });

  afterEach(() => {
    unsub();
  });

  function forEvent(eventLabel: string, timeout?: number) {
    return new Promise<void>((resolve, reject) => {
      let timeoutId = null;

      const unsubscribe = engine.subscribe((change) => {
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
      let timeoutId = null;

      const unsubscribe = engine.subscribe((change) => {
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
      let timeoutId = null;

      const unsubscribe = engine.subscribe((change) => {
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

  it(' presence event_engine should work correctly', async () => {
    utils
      .createNock()
      .get('/v2/presence/sub-key/demo/channel/test/heartbeat')
      .query(true)
      .reply(200, '{"message":"OK", "service":"Presence"}');

    pubnub.join({ channels: ['test'] });

    await forEvent('JOINED', 1000);

    await forState('HEARTBEATING', 1000);

    await forEvent('HEARTBEAT_SUCCESS', 1000);

    await forState('HEARTBEAT_COOLDOWN', 1000);

    pubnub.leaveAll();

    await forEvent('LEFT_ALL', 2000);

  });

});
