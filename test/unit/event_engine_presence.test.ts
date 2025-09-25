import nock from 'nock';
import { expect } from 'chai';

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

  it('should properly manage channel tracking during subscribe/unsubscribe sequence to prevent stale heartbeat requests', async () => {
    // This test verifies the fix for the issue where unsubscribing from channels
    // doesn't remove them from heartbeat requests when using Event Engine
    // Scenario: subscribe(a) -> subscribe(b) -> unsubscribe(b) -> subscribe(c)
    // Expected: presence engine should only track [a,c], not [a,b,c]

    // Mock heartbeat requests (we'll verify state, not HTTP requests)
    utils.createNock()
      .get('/v2/presence/sub-key/demo/channel/a/heartbeat')
      .query(true)
      .reply(200, '{"message":"OK", "service":"Presence"}', { 'content-type': 'text/javascript' })
      .persist();
    
    utils.createNock()
      .get('/v2/presence/sub-key/demo/channel/a,b/heartbeat')
      .query(true)
      .reply(200, '{"message":"OK", "service":"Presence"}', { 'content-type': 'text/javascript' })
      .persist();
    
    utils.createNock()
      .get('/v2/presence/sub-key/demo/channel/a,c/heartbeat')
      .query(true)
      .reply(200, '{"message":"OK", "service":"Presence"}', { 'content-type': 'text/javascript' })
      .persist();

    // Mock leave request for channel 'b'
    utils.createPresenceMockScopes({
      subKey: 'demo',
      presenceType: 'leave',
      requests: [{ channels: ['b'] }],
    });

    engine.subscribe(
      (change: { type: string; event: { type: string } } | { type: string; toState: { label: string } }) =>
        'toState' in change ? stateChanges.push(change) : receivedEvents.push(change),
    );

    // @ts-expect-error Access internal state for verification
    const presenceEngine = pubnub.presenceEventEngine;
    expect(presenceEngine).to.not.be.undefined;

    // Step 1: Subscribe to channel 'a'
    // @ts-expect-error Intentional access to the private interface.
    pubnub.join({ channels: ['a'] });

    await forEvent('JOINED', 1000);

    // Verify presence engine internal state after joining 'a'
    expect(presenceEngine!.channels).to.deep.equal(['a']);

    // Step 2: Subscribe to channel 'b' (now should have [a, b])
    // @ts-expect-error Intentional access to the private interface.
    pubnub.join({ channels: ['b'] });

    await forEvent('JOINED', 1000);

    // Verify presence engine internal state after joining 'b'
    expect(presenceEngine!.channels).to.deep.equal(['a', 'b']);

    // Step 3: Unsubscribe from channel 'b'
    // @ts-expect-error Intentional access to the private interface.
    pubnub.leave({ channels: ['b'] });

    await forEvent('LEFT', 1000);

    // CRITICAL VERIFICATION: After unsubscribing from 'b', 
    // the presence engine should only track channel 'a'
    // This test verifies the fix is working
    expect(presenceEngine?.channels).to.deep.equal(['a']);

    // Step 4: Subscribe to channel 'c'
    // @ts-expect-error Intentional access to the private interface.
    pubnub.join({ channels: ['c'] });

    await forEvent('JOINED', 1000);

    // FINAL VERIFICATION: Presence engine should only track channels [a, c]
    // This verifies the fix prevents stale channel 'b' from being tracked
    expect(presenceEngine?.channels).to.deep.equal(['a', 'c']);
    
    // Verify that channel 'b' is NOT in the tracked channels
    expect(presenceEngine?.channels).to.not.include('b');
  });

  it('should handle channel group unsubscribe correctly in presence engine', async () => {
    // Test the same fix but for channel groups
    // Scenario: subscribe(group1) -> subscribe(group2) -> unsubscribe(group2) -> subscribe(group3)
    // Expected: presence engine should only track [group1, group3], not [group1, group2, group3]
    
    // Mock heartbeat requests for channel groups (we'll verify state, not HTTP requests)
    utils.createNock()
      .get('/v2/presence/sub-key/demo/channel/,/heartbeat')
      .query(query => query['channel-group'] === 'group1')
      .reply(200, '{"message":"OK", "service":"Presence"}', { 'content-type': 'text/javascript' })
      .persist();
    
    utils.createNock()
      .get('/v2/presence/sub-key/demo/channel/,/heartbeat')
      .query(query => query['channel-group'] === 'group1,group2')
      .reply(200, '{"message":"OK", "service":"Presence"}', { 'content-type': 'text/javascript' })
      .persist();
    
    utils.createNock()
      .get('/v2/presence/sub-key/demo/channel/,/heartbeat')
      .query(query => query['channel-group'] === 'group1,group3')
      .reply(200, '{"message":"OK", "service":"Presence"}', { 'content-type': 'text/javascript' })
      .persist();

    // Mock leave request for group2
    utils.createPresenceMockScopes({
      subKey: 'demo',
      presenceType: 'leave',
      requests: [{ groups: ['group2'] }],
    });

    engine.subscribe(
      (change: { type: string; event: { type: string } } | { type: string; toState: { label: string } }) =>
        'toState' in change ? stateChanges.push(change) : receivedEvents.push(change),
    );

    // @ts-expect-error Access internal state for verification
    const presenceEngine = pubnub.presenceEventEngine;

    // Step 1: Subscribe to group1
    // @ts-expect-error Intentional access to the private interface.
    pubnub.join({ groups: ['group1'] });

    await forEvent('JOINED', 1000);

    // Verify presence engine internal state after joining group1
    expect(presenceEngine?.groups).to.deep.equal(['group1']);

    // Step 2: Subscribe to group2
    // @ts-expect-error Intentional access to the private interface.
    pubnub.join({ groups: ['group2'] });

    await forEvent('JOINED', 1000);

    // Verify presence engine internal state after joining group2
    expect(presenceEngine?.groups).to.deep.equal(['group1', 'group2']);

    // Step 3: Unsubscribe from group2
    // @ts-expect-error Intentional access to the private interface.
    pubnub.leave({ groups: ['group2'] });

    await forEvent('LEFT', 1000);

    // CRITICAL VERIFICATION: After unsubscribing from group2,
    // the presence engine should only track group1
    // This test verifies the fix is working for channel groups
    expect(presenceEngine?.groups).to.deep.equal(['group1']);

    // Step 4: Subscribe to group3
    // @ts-expect-error Intentional access to the private interface.
    pubnub.join({ groups: ['group3'] });

    await forEvent('JOINED', 1000);

    // FINAL VERIFICATION: Presence engine should only track groups [group1, group3]
    // This verifies the fix prevents stale group 'group2' from being tracked
    expect(presenceEngine?.groups).to.deep.equal(['group1', 'group3']);
    
    // Verify that group2 is NOT in the tracked groups
    expect(presenceEngine?.groups).to.not.include('group2');
  });
});
