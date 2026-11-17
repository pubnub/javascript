import assert from 'node:assert/strict';
import PubNub from 'pubnub';
import { assertServerTime } from '../support/assertions';
import { createClient, observer, track } from '../support/clients';
import { unique } from '../support/util';
import { keysOf, openKeys } from '../support/env';

import { connected, eventually } from '../support/wait';

/**
 * Examples for the version 11 migration guide. Port of docs-snippets/migration-guides/v11.ts.
 * The presence test needs Presence on for the open keyset.
 */

describe('migration-guides/v11', () => {
  it('migrationV11LegacySubscriptionManager: the legacy manager fires PNConnectedCategory again on a second subscribe and never PNSubscriptionChangedCategory', async () => {
    // snippet.migrationV11LegacySubscriptionManager
    const pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      userId: 'myUserId',
      enableEventEngine: false, // set explicitly to keep legacy behavior
      // snippet.hide
      ...openKeys(),
      // snippet.show
    });
    // snippet.end
    track(pubnub);
    // Legacy behavior: PNConnectedCategory fires again when the channel mix changes, and there is no PNSubscriptionChangedCategory.
    const categories: string[] = [];
    pubnub.addListener({ status: (s) => categories.push(String(s.category)) });
    const first = connected(pubnub, { channels: ['ch1'] });
    pubnub.subscribe({ channels: ['ch1'] });
    await first;
    pubnub.subscribe({ channels: ['ch2'] });
    await eventually(() => assert.equal(categories.filter((c) => c === 'PNConnectedCategory').length, 2), {
      label: 'second PNConnectedCategory',
    });
    assert.ok(!categories.includes('PNSubscriptionChangedCategory'));
    pubnub.unsubscribeAll();
  });

  it('migrationV11RestoreFalse: a client built with restore false is valid and works', async () => {
    // snippet.migrationV11RestoreFalse
    const pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      userId: 'myUserId',
      restore: false, // set explicitly to keep legacy behavior
      // snippet.hide
      ...openKeys(),
      // snippet.show
    });
    // snippet.end
    track(pubnub);
    // The option is accepted and the client works. The network-loss behavior itself needs a browser.
    assertServerTime((await pubnub.time()).timetoken);
  });

  // Offline: only the constructor is exercised. Version 11 lifted the upper bounds, so values the old SDK rejected must be accepted.
  it('migrationV11RetryPolicyBounds: retry policy values the old SDK rejected are accepted since version 11', () => {
    const config = (retryConfiguration: PubNub.RequestRetryPolicy): PubNub.PubNubConfiguration => ({
      subscribeKey: keysOf('open').subscribeKey,
      userId: 'v11-bounds',
      retryConfiguration,
    });
    // "Version 11.0.0 accepts" maximumRetry above 10 (linear), above 6 and maximumDelay above 150 (exponential).
    track(new PubNub(config(PubNub.LinearRetryPolicy({ delay: 2, maximumRetry: 50 }))));
    track(new PubNub(config(PubNub.ExponentialRetryPolicy({ minimumDelay: 2, maximumDelay: 600, maximumRetry: 20 }))));
    // The minimum delay of the exponential policy is still checked.
    assert.throws(
      () => new PubNub(config(PubNub.ExponentialRetryPolicy({ minimumDelay: 1, maximumDelay: 10, maximumRetry: 2 }))),
      /minimum|delay/i,
    );
  });

  it('migrationV11MaintainPresenceState: with maintainPresenceState true the client re-sends its state after leaving and rejoining, and with false the state is gone', async function () {
    this.timeout(90_000);
    // Own channel and user ids of this run: the test asserts on exact presence state.
    const channel = unique('v11_state');
    // A short presence timeout keeps a client that leaves without unsubscribing out of hereNow quickly.
    const presenceOptions = { presenceTimeout: 20, heartbeatInterval: 8 };
    const kept = createClient('open', unique('v11-state-kept'), presenceOptions);
    const dropped = createClient('open', unique('v11-state-dropped'), {
      ...presenceOptions,
      maintainPresenceState: false,
    });
    const reader = observer();
    const stateOn = async (client: PubNub): Promise<unknown> =>
      (await reader.getState({ uuid: client.getUserId(), channels: [channel] })).channels[channel];
    for (const client of [kept, dropped]) {
      const first = connected(client, { channels: [channel] });
      client.subscribe({ channels: [channel], withPresence: true });
      await first;
      await client.setState({ state: { mood: 'happy' }, channels: [channel] });
      await eventually(async () => assert.deepEqual(await stateOn(client), { mood: 'happy' }), {
        timeout: 30_000,
        label: 'state set',
      });
      client.disconnect();
      await eventually(async () => assert.deepEqual(await stateOn(client), {}), {
        timeout: 30_000,
        label: 'state cleared by the leave',
      });
      client.reconnect();
    }
    await eventually(async () => assert.deepEqual(await stateOn(kept), { mood: 'happy' }), {
      timeout: 30_000,
      label: 'state re-sent when the client joins again',
    });
    // The other client joined at the same time, so its state would be back by now if it were sent.
    assert.notDeepEqual(
      await stateOn(dropped),
      { mood: 'happy' },
      'with maintainPresenceState: false the state is gone after leaving',
    );
    kept.unsubscribeAll();
    dropped.unsubscribeAll();
  });
});
