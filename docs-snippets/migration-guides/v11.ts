import assert from '../harness/assert.js';
import PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';
import { connected, eventually } from '../harness/wait.js';

/**
 * Examples for the version 11 migration guide.
 */
export default page('migration-guides/v11', 'P0', (world) => {
  step('migrationV11LegacySubscriptionManager', { proves: 'The legacy manager fires PNConnectedCategory again on a second subscribe and never PNSubscriptionChangedCategory.' }, async () => {
    // snippet.migrationV11LegacySubscriptionManager
    const pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      userId: 'myUserId',
      enableEventEngine: false, // set explicitly to keep legacy behavior
      // snippet.hide
      ...world.live.open,
      // snippet.show
    });
    // snippet.end
    world.track(pubnub);
    // Legacy behavior: PNConnectedCategory fires again when the channel mix changes, and there is no PNSubscriptionChangedCategory.
    const categories: string[] = [];
    pubnub.addListener({ status: (s) => categories.push(String(s.category)) });
    const first = connected(pubnub, { channels: [world.n('ch1')] });
    pubnub.subscribe({ channels: [world.n('ch1')] });
    await first;
    pubnub.subscribe({ channels: [world.n('ch2')] });
    await eventually(() => assert.equal(categories.filter((c) => c === 'PNConnectedCategory').length, 2), { label: 'second PNConnectedCategory' });
    assert.ok(!categories.includes('PNSubscriptionChangedCategory'));
    pubnub.unsubscribeAll();
  });

  step('migrationV11RestoreFalse', { proves: 'A client built with restore false is valid and works.' }, async () => {
    // snippet.migrationV11RestoreFalse
    const pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      userId: 'myUserId',
      restore: false, // set explicitly to keep legacy behavior
      // snippet.hide
      ...world.live.open,
      // snippet.show
    });
    // snippet.end
    world.track(pubnub);
    // The option is accepted and the client works. The network-loss behavior itself needs a browser.
    world.check.serverTime((await pubnub.time()).timetoken);
  });

  // Offline: only the constructor is exercised. Version 11 lifted the upper bounds, so values the old SDK rejected must be accepted.
  check('migrationV11RetryPolicyBounds', { proves: 'Retry policy values the old SDK rejected are accepted since version 11.' }, () => {
    const open = world.live.open;
    const config = (retryConfiguration: PubNub.RequestRetryPolicy): PubNub.PubNubConfiguration => ({
      subscribeKey: open.subscribeKey!,
      userId: world.n('v11-bounds'),
      retryConfiguration,
    });
    // "Version 11.0.0 accepts" maximumRetry above 10 (linear), above 6 and maximumDelay above 150 (exponential).
    world.track(new PubNub(config(PubNub.LinearRetryPolicy({ delay: 2, maximumRetry: 50 }))));
    world.track(new PubNub(config(PubNub.ExponentialRetryPolicy({ minimumDelay: 2, maximumDelay: 600, maximumRetry: 20 }))));
    // The minimum delay of the exponential policy is still checked.
    assert.throws(() => new PubNub(config(PubNub.ExponentialRetryPolicy({ minimumDelay: 1, maximumDelay: 10, maximumRetry: 2 }))), /minimum|delay/i);
  });

  check('migrationV11MaintainPresenceState', { needs: ['preflightPresence'], timeout: 90_000, proves: 'With maintainPresenceState true the client re-sends its state after leaving and rejoining, and with false the state is gone.' }, async () => {
    const channel = world.n('ch1');
    const kept = world.fresh('v11-state-kept', { ...world.presenceOptions });
    const dropped = world.fresh('v11-state-dropped', { ...world.presenceOptions, maintainPresenceState: false });
    const stateOn = async (client: PubNub): Promise<unknown> => (await world.observer.getState({ uuid: client.getUserId(), channels: [channel] })).channels[channel];
    for (const client of [kept, dropped]) {
      const first = connected(client, { channels: [channel] });
      client.subscribe({ channels: [channel], withPresence: true });
      await first;
      await client.setState({ state: { mood: 'happy' }, channels: [channel] });
      await eventually(async () => assert.deepEqual(await stateOn(client), { mood: 'happy' }), { timeout: 30_000, label: 'state set' });
      client.disconnect();
      await eventually(async () => assert.deepEqual(await stateOn(client), {}), { timeout: 30_000, label: 'state cleared by the leave' });
      client.reconnect();
    }
    await eventually(async () => assert.deepEqual(await stateOn(kept), { mood: 'happy' }), { timeout: 30_000, label: 'state re-sent when the client joins again' });
    // The other client joined at the same time, so its state would be back by now if it were sent.
    assert.notDeepEqual(await stateOn(dropped), { mood: 'happy' }, 'with maintainPresenceState: false the state is gone after leaving');
    kept.unsubscribeAll();
    dropped.unsubscribeAll();
  });
});
