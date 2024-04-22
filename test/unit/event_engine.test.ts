import nock from 'nock';

import { Payload } from '../../src/core/types/api';
import PubNub from '../../src/node/index';
import utils from '../utils';

describe('EventEngine', () => {
  // @ts-expect-error Access event engine core for test purpose.
  let engine: PubNub['eventEngine']['engine'];
  let pubnub: PubNub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  let unsub: () => void;

  beforeEach(() => {
    nock.cleanAll();

    pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      uuid: 'test-js',
      enableEventEngine: true,
    });

    // @ts-expect-error Access event engine core for test purpose.
    engine = pubnub.eventEngine!._engine;

    unsub = engine.subscribe((_change: Record<string, any>) => {
      // FOR DEBUG
      // console.dir(_change);
    });
  });

  afterEach(() => {
    unsub();
  });

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
          reject(new Error(`Timeout occured while waiting for state ${eventLabel}`));
        }, timeout);
      }
    });
  }

  function forState(stateLabel: string, timeout?: number) {
    return new Promise<void>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null;

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
    utils.createNock().get('/v2/subscribe/demo/test/0').query(true).reply(200, '{"t":{"t":"12345","r":1}, "m": []}');
    utils.createNock().get('/v2/subscribe/demo/test/0').query(true).reply(200, '{"t":{"t":"12345","r":1}, "m": []}');

    pubnub.subscribe({ channels: ['test'] });

    await forEvent('HANDSHAKE_SUCCESS', 1000);

    pubnub.unsubscribe({ channels: ['test'] });

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
