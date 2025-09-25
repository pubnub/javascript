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
    // Properly destroy PubNub instance to prevent open handles
    pubnub.destroy(true);
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

  it('should properly reset all channel tracking when calling leaveAll', async () => {
    // This test verifies that leaveAll properly resets internal channel and group tracking
    // Scenario: subscribe(a,b) -> subscribe(groups: [g1,g2]) -> leaveAll -> verify empty tracking
    
    // Mock heartbeat requests
    utils.createNock()
      .get('/v2/presence/sub-key/demo/channel/a,b/heartbeat')
      .query(true)
      .reply(200, '{"message":"OK", "service":"Presence"}', { 'content-type': 'text/javascript' })
      .persist();
    
    utils.createNock()
      .get('/v2/presence/sub-key/demo/channel/a,b/heartbeat')
      .query(query => query['channel-group'] === 'group1,group2')
      .reply(200, '{"message":"OK", "service":"Presence"}', { 'content-type': 'text/javascript' })
      .persist();

    // Mock leaveAll request
    utils.createPresenceMockScopes({
      subKey: 'demo',
      presenceType: 'leave',
      requests: [{ channels: [], groups: [] }], // leaveAll sends empty arrays
    });

    engine.subscribe(
      (change: { type: string; event: { type: string } } | { type: string; toState: { label: string } }) =>
        'toState' in change ? stateChanges.push(change) : receivedEvents.push(change),
    );

    // @ts-expect-error Access internal state for verification
    const presenceEngine = pubnub.presenceEventEngine;

    // Step 1: Subscribe to channels 'a' and 'b'
    // @ts-expect-error Intentional access to the private interface.
    pubnub.join({ channels: ['a', 'b'] });

    await forEvent('JOINED', 1000);

    // Verify presence engine has both channels
    expect(presenceEngine?.channels).to.deep.equal(['a', 'b']);

    // Step 2: Subscribe to channel groups 'group1' and 'group2'
    // @ts-expect-error Intentional access to the private interface.
    pubnub.join({ groups: ['group1', 'group2'] });

    await forEvent('JOINED', 1000);

    // Verify presence engine has both channels and groups
    expect(presenceEngine?.channels).to.deep.equal(['a', 'b']);
    expect(presenceEngine?.groups).to.deep.equal(['group1', 'group2']);

    // Step 3: Call leaveAll
    // @ts-expect-error Intentional access to the private interface.
    pubnub.leaveAll();

    await forEvent('LEFT_ALL', 1000);

    // CRITICAL VERIFICATION: After leaveAll, both channels and groups should be empty
    // This test verifies the leaveAll fix is working
    expect(presenceEngine?.channels).to.deep.equal([]);
    expect(presenceEngine?.groups).to.deep.equal([]);
    
    // Double-check that no channels or groups remain tracked
    expect(presenceEngine?.channels).to.have.lengthOf(0);
    expect(presenceEngine?.groups).to.have.lengthOf(0);
  });

  it('should properly clear presence state for all channels and groups when calling leaveAll', async () => {
    // This test verifies that leaveAll clears presence state for all tracked channels/groups
    // and that subsequent operations start with clean state
    
    // Mock heartbeat requests
    utils.createNock()
      .get('/v2/presence/sub-key/demo/channel/test1,test2/heartbeat')
      .query(true)
      .reply(200, '{"message":"OK", "service":"Presence"}', { 'content-type': 'text/javascript' })
      .persist();

    // Mock leaveAll request  
    utils.createPresenceMockScopes({
      subKey: 'demo',
      presenceType: 'leave',
      requests: [{ channels: [], groups: [] }],
    });

    engine.subscribe(
      (change: { type: string; event: { type: string } } | { type: string; toState: { label: string } }) =>
        'toState' in change ? stateChanges.push(change) : receivedEvents.push(change),
    );

    // @ts-expect-error Access internal state for verification
    const presenceEngine = pubnub.presenceEventEngine;

    // Step 1: Join channels with presence state
    // @ts-expect-error Intentional access to the private interface.  
    pubnub.join({ channels: ['test1', 'test2'] });

    await forEvent('JOINED', 1000);

    // Simulate presence state being set (this would normally happen through heartbeat responses)
    if (presenceEngine?.dependencies.presenceState) {
      presenceEngine.dependencies.presenceState['test1'] = { mood: 'happy' };
      presenceEngine.dependencies.presenceState['test2'] = { mood: 'excited' };
    }

    // Verify initial state
    expect(presenceEngine?.channels).to.deep.equal(['test1', 'test2']);
    expect(presenceEngine?.dependencies.presenceState?.['test1']).to.deep.equal({ mood: 'happy' });
    expect(presenceEngine?.dependencies.presenceState?.['test2']).to.deep.equal({ mood: 'excited' });

    // Step 2: Call leaveAll
    // @ts-expect-error Intentional access to the private interface.
    pubnub.leaveAll();

    await forEvent('LEFT_ALL', 1000);

    // CRITICAL VERIFICATION: After leaveAll, presence state should be cleared
    expect(presenceEngine?.channels).to.deep.equal([]);
    expect(presenceEngine?.dependencies?.presenceState?.['test1']).to.be.undefined;
    expect(presenceEngine?.dependencies.presenceState?.['test2']).to.be.undefined;
  });

  it('should handle leaveAll correctly when called with offline flag', async () => {
    // This test verifies that leaveAll(true) properly handles offline scenarios
    // and still resets internal tracking even when offline
    
    // Mock heartbeat requests
    utils.createNock()
      .get('/v2/presence/sub-key/demo/channel/offline-test/heartbeat')
      .query(true)
      .reply(200, '{"message":"OK", "service":"Presence"}', { 'content-type': 'text/javascript' })
      .persist();

    engine.subscribe(
      (change: { type: string; event: { type: string } } | { type: string; toState: { label: string } }) =>
        'toState' in change ? stateChanges.push(change) : receivedEvents.push(change),
    );

    // @ts-expect-error Access internal state for verification
    const presenceEngine = pubnub.presenceEventEngine;

    // Step 1: Join a channel
    // @ts-expect-error Intentional access to the private interface.
    pubnub.join({ channels: ['offline-test'] });

    await forEvent('JOINED', 1000);

    // Verify initial state
    expect(presenceEngine?.channels).to.deep.equal(['offline-test']);

    // Step 2: Call leaveAll with offline=true (simulating network disconnection)
    // @ts-expect-error Intentional access to the private interface.
    pubnub.leaveAll(true);

    await forEvent('LEFT_ALL', 1000);

    // CRITICAL VERIFICATION: Even when offline, leaveAll should reset tracking
    expect(presenceEngine?.channels).to.deep.equal([]);
    expect(presenceEngine?.groups).to.deep.equal([]);
  });

  it('should handle leaveAll when no channels or groups are tracked', async () => {
    // This test verifies that leaveAll behaves correctly when called with empty tracking
    // (edge case that should not cause errors)
    
    engine.subscribe(
      (change: { type: string; event: { type: string } } | { type: string; toState: { label: string } }) =>
        'toState' in change ? stateChanges.push(change) : receivedEvents.push(change),
    );

    // @ts-expect-error Access internal state for verification
    const presenceEngine = pubnub.presenceEventEngine;

    // Verify initial empty state
    expect(presenceEngine?.channels).to.deep.equal([]);
    expect(presenceEngine?.groups).to.deep.equal([]);

    // Call leaveAll on empty state (should not cause errors)
    // @ts-expect-error Intentional access to the private interface.
    pubnub.leaveAll();

    await forEvent('LEFT_ALL', 1000);

    // Verify state remains empty (no side effects)
    expect(presenceEngine?.channels).to.deep.equal([]);
    expect(presenceEngine?.groups).to.deep.equal([]);
  });
});
