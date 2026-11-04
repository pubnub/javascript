import assert from '../harness/assert.js';
import type PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';
import { connected, eventually, PRESENCE_TIMEOUT } from '../harness/wait.js';

/**
 * docs/sdks/javascript/api-reference/presence.md
 *
 * Keyset: open (needs Presence on, hence `preflightPresence`). Phase: P4, with teardown in P9. In the Sneaker Drop story
 * this is the live "who is browsing the drop" counter.
 *
 * The docs samples ask about a user called `uuid` on channels `ch1`, `my_channel` and groups `cg1`,
 * `my_channel_group`. The `presenceFixture` check makes that user real: one client with the user id `uuid` subscribes to
 * those channels and the group, so every sample has someone to find. Presence is eventually consistent, so the
 * fixture polls `hereNow` for up to 45 seconds, and the clients use a short presence timeout (`world.presenceOptions`).
 *
 * What it proves: setState, getState, hereNow (state, occupancy only, channel group), whereNow and leave. Event samples
 * (`eventListenerBasicUsage`) live in the subscribe module, which the presence page embeds too. It does not prove
 * timeout and interval events.
 */
export default page('api-reference/presence', 'P4', (world) => {
  // The one client that plays user `uuid`. Set by presenceFixture, used by every step below.
  let occupant: PubNub | undefined;
  const user = (): PubNub => {
    assert.ok(occupant, 'presenceFixture has not run');
    return occupant;
  };
  const sorted = (values: string[]): string[] => [...values].sort();

  // Builds the world the samples describe: two groups share one member channel, `cg1` is subscribed by the occupant and
  // `my_channel_group` is only read. The final `eventually` waits until presence has registered the occupant on all
  // three channels, because every later step reads presence and would otherwise race the join.
  check('presenceFixture', { needs: ['preflightPresence'], timeout: 120_000, proves: 'Fixture: an occupant is visible on all three channels, two channels sharing one group member.' }, async () => {
    const [ch1, myChannel, member] = [world.n('ch1'), world.n('my_channel'), world.n('cg1_member')];
    const [cg1, otherGroup] = [world.n('cg1'), world.n('my_channel_group')];
    // Two groups share one member channel: `cg1` is subscribed by the occupant, `my_channel_group` is only read.
    for (const channelGroup of [cg1, otherGroup]) {
      await world.friend.channelGroups.addChannels({ channelGroup, channels: [member] });
    }
    occupant = world.client('open', 'uuid', world.presenceOptions);
    const set = occupant.subscriptionSet({ channels: [ch1, myChannel], channelGroups: [cg1] });
    const ready = connected(occupant, { channels: [ch1, myChannel], channelGroups: [cg1] });
    set.subscribe();
    await ready;
    await occupant.setState({ state: { status: 'online' }, channels: [myChannel] });
    await eventually(async () => {
      const here = await world.observer.hereNow({ channels: [ch1, myChannel, member] });
      for (const channel of [ch1, myChannel, member]) {
        assert.ok(here.channels[channel]?.occupants.some((o) => o.uuid === occupant!.getUserId()), `${channel} lists the occupant`);
      }
    }, { timeout: PRESENCE_TIMEOUT, label: 'occupant visible in hereNow' });
    // `hereNowChannelGroup` reads presence through `my_channel_group`, which was created a moment ago. A group read resolves the
    // group's member channels first, and that can lag the channel reads above (seen in CI, where the steps run seconds apart).
    await eventually(async () => {
      const here = await world.observer.hereNow({ channelGroups: [otherGroup] });
      assert.ok(here.channels[member]?.occupants.some((o) => o.uuid === occupant!.getUserId()), `${otherGroup} lists the occupant on ${member}`);
    }, { timeout: PRESENCE_TIMEOUT, label: 'occupant visible through the channel group' });
    // The steps below read state through hereNow and the channel list through whereNow right after the snippet, in one shot.
    // Both are separate reads that can lag the occupant listing above, so wait for them here, once.
    await eventually(async () => {
      const here = await world.observer.hereNow({ channels: [myChannel], includeState: true });
      assert.deepEqual(here.channels[myChannel]?.occupants.find((o) => o.uuid === occupant!.getUserId())?.state, { status: 'online' }, 'hereNow lists the state on the channel');
      const where = await world.observer.whereNow({ uuid: occupant!.getUserId() });
      assert.ok([ch1, myChannel].every((c) => where.channels.includes(c)), `whereNow lists both channels (got ${where.channels.length})`);
    }, { timeout: PRESENCE_TIMEOUT, label: 'state and channel list visible' });
  });

  // Proves setState stores state that a different client can read. The poll covers the delay between write and read.
  step('setStateBasicUsage', { needs: ['presenceFixture'], proves: 'setState stores state that another client can read back.' }, async () => {
    const pubnub = user();
    // snippet.setStateBasicUsage
    const response = await pubnub.setState({
      state: { status: 'online' },
      channels: ['ch1'],
      channelGroups: ['cg1'],
    });
    console.log('State set successfully:', response);
    // snippet.end
    assert.deepEqual(response.state, { status: 'online' });
    await eventually(async () => {
      const stored = await world.observer.getState({ uuid: pubnub.getUserId(), channels: [world.n('ch1')] });
      assert.deepEqual(stored.channels[world.n('ch1')], { status: 'online' });
    }, { label: 'state visible to another client' });
    // hereNowBasicUsage reads the same state through hereNow in one shot, so wait for that read path too.
    await eventually(async () => {
      const here = await world.observer.hereNow({ channels: [world.n('ch1')], includeState: true });
      assert.deepEqual(here.channels[world.n('ch1')]?.occupants.find((o) => o.uuid === pubnub.getUserId())?.state, { status: 'online' }, 'hereNow lists the state on ch1');
    }, { label: 'state visible through hereNow' });
  });

  // Proves getState returns the state set above, hence the `needs`.
  step('getStateBasicUsage', { needs: ['setStateBasicUsage'], proves: 'getState returns the state set earlier.' }, async () => {
    const pubnub = user();
    // snippet.getStateBasicUsage
    const response = await pubnub.getState({
      uuid: 'uuid',
      channels: ['ch1'],
      channelGroups: ['cg1'],
    });
    console.log('State retrieved successfully:', response);
    // snippet.end
    // With channelGroups in the request the SDK returns the state one level deeper, as response.channels.channels
    // (live finding). Without groups it is response.channels[channel].
    // Docs finding: with channelGroups in the request the result is nested one level deeper.
    const nested = (response.channels as unknown as { channels?: Record<string, unknown> }).channels;
    assert.deepEqual(nested?.[world.n('ch1')], { status: 'online' });
  });

  // Proves hereNow lists the occupant with its state on a channel and the group member channel appears via the group.
  step('hereNowBasicUsage', { needs: ['setStateBasicUsage'], timeout: 60_000, proves: 'hereNow lists the occupant with its state and the group member channel appears through the group.' }, async () => {
    const pubnub = user();
    // snippet.hereNowBasicUsage
    // Function to get presence information for a channel
    const result = await pubnub.hereNow({
      channels: ['ch1'],
      channelGroups: ['cg1'],
      includeUUIDs: true,
      includeState: true,
    });
    console.log('Here Now Result:', result);
    // snippet.end
    const entry = result.channels[world.n('ch1')]?.occupants.find((o) => o.uuid === pubnub.getUserId());
    assert.ok(entry, 'ch1 lists the occupant');
    assert.deepEqual(entry.state, { status: 'online' });
    assert.ok(result.channels[world.n('cg1_member')], 'the channel group member is part of the result');
  });

  // Proves includeState returns the state set in presenceFixture.
  step('hereNowWithState', { needs: ['presenceFixture'], proves: 'hereNow with includeState returns the state set in the fixture.' }, async () => {
    const pubnub = user();
    // snippet.hereNowWithState
    const response = await pubnub.hereNow({
      channels: ['my_channel'],
      includeState: true,
    });
    console.log('hereNow response:', response);
    // snippet.end
    const entry = response.channels[world.n('my_channel')]?.occupants.find((o) => o.uuid === pubnub.getUserId());
    assert.deepEqual(entry?.state, { status: 'online' });
  });

  // Proves includeUUIDs: false gives a count and no user list. `>= 1` because other steps may also have clients on the channel.
  step('hereNowFetchOccupancyOnly', { needs: ['presenceFixture'], proves: 'hereNow with includeUUIDs false gives a count and no user list.' }, async () => {
    const pubnub = user();
    // snippet.hereNowFetchOccupancyOnly
    const response = await pubnub.hereNow({
      channels: ['my_channel'],
      includeUUIDs: false,
    });
    console.log('hereNow response:', response);
    // snippet.end
    const entry = response.channels[world.n('my_channel')];
    assert.ok(entry.occupancy >= 1, 'occupancy counts the occupant');
    assert.equal(entry.occupants?.length ?? 0, 0, 'no user ids when includeUUIDs is false');
  });

  // Proves a group query reports presence per member channel of the group.
  step('hereNowChannelGroup', { needs: ['presenceFixture'], proves: 'hereNow on a channel group reports presence for each member channel.' }, async () => {
    const pubnub = user();
    // snippet.hereNowChannelGroup
    const response = await pubnub.hereNow({
      channelGroups: ['my_channel_group'],
    });
    console.log('hereNow response:', response);
    // snippet.end
    const entry = response.channels[world.n('cg1_member')];
    assert.ok(entry, 'the group member channel is in the result');
    assert.ok(entry.occupants.some((o) => o.uuid === pubnub.getUserId()));
  });

  // The snippet returns nothing, so a spy on hereNow gives the harness the promise to await and inspect.
  step('basicUsageWithPromises', { needs: ['setStateBasicUsage'], proves: 'The promise form of hereNow resolves with the occupants, seen through a spy.' }, async () => {
    const pubnub = user();
    // The snippet chains .then and .catch and returns nothing. The spy hands the harness the promise.
    const spy = world.spy(pubnub, 'hereNow');
    // snippet.basicUsageWithPromises
    pubnub
      .hereNow({
        channels: ['ch1'],
        channelGroups: ['cg1'],
        includeUUIDs: true,
        includeState: true,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
    // snippet.end
    assert.equal(spy.results.length, 1, 'the snippet called hereNow once');
    const response = (await spy.results[0]) as PubNub.Presence.HereNowResponse;
    assert.ok(response.channels[world.n('ch1')]?.occupants.some((o) => o.uuid === pubnub.getUserId()));
  });

  // Proves whereNow lists the channels the occupant is in. Filtered to the two channels this fixture owns because other fixtures may add more.
  step('whereNowBasicUsage', { needs: ['presenceFixture'], proves: 'whereNow lists the channels the occupant is in.' }, async () => {
    const pubnub = world.observer;
    // snippet.whereNowBasicUsage
    const response = await pubnub.whereNow({
      uuid: 'uuid',
    });
    console.log('whereNow response:', response);
    // snippet.end
    assert.deepEqual(
      sorted(response.channels).filter((c) => [world.n('ch1'), world.n('my_channel')].includes(c)),
      sorted([world.n('ch1'), world.n('my_channel')]),
    );
  });

  // Leaving is part of presence too: the occupant unsubscribes and the channels empty out.
  check('presenceTeardown', { phase: 'P9', needs: ['presenceFixture'], timeout: 90_000, proves: 'After the occupant unsubscribes the channels empty out of hereNow.' }, async () => {
    const pubnub = user();
    const ch1 = world.n('ch1');
    pubnub.unsubscribeAll();
    // Other steps leave clients subscribed to ch1, so check this occupant only, not the occupancy.
    await eventually(async () => {
      const here = await world.observer.hereNow({ channels: [ch1] });
      assert.ok(!here.channels[ch1]?.occupants.some((o) => o.uuid === pubnub.getUserId()), 'occupant is still listed');
    }, { timeout: PRESENCE_TIMEOUT, label: 'occupant left ch1' });
  });
});
