import assert from '../harness/assert.js';
import type PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';
import { connected, eventually, PRESENCE_TIMEOUT } from '../harness/wait.js';

/**
 * Presence examples.
 */
export default page('api-reference/presence', 'P4', (world) => {
  let occupant: PubNub | undefined;
  const user = (): PubNub => {
    assert.ok(occupant, 'presenceFixture has not run');
    return occupant;
  };
  const sorted = (values: string[]): string[] => [...values].sort();

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
    const reads: Array<[string, { channels?: string[]; channelGroups: string[] }]> = [
      [cg1, { channelGroups: [cg1] }],
      [otherGroup, { channelGroups: [otherGroup] }],
      [`${ch1} and ${cg1}`, { channels: [ch1], channelGroups: [cg1] }],
    ];
    for (const [label, query] of reads) {
      await eventually(async () => {
        const here = await world.observer.hereNow(query);
        assert.ok(here.channels[member]?.occupants.some((o) => o.uuid === occupant!.getUserId()), `${label} lists the occupant on ${member}`);
      }, { timeout: PRESENCE_TIMEOUT, label: `occupant visible through ${label}` });
    }
    await eventually(async () => {
      const here = await world.observer.hereNow({ channels: [myChannel], includeState: true });
      assert.deepEqual(here.channels[myChannel]?.occupants.find((o) => o.uuid === occupant!.getUserId())?.state, { status: 'online' }, 'hereNow lists the state on the channel');
      const where = await world.observer.whereNow({ uuid: occupant!.getUserId() });
      assert.ok([ch1, myChannel].every((c) => where.channels.includes(c)), `whereNow lists both channels (got ${where.channels.length})`);
    }, { timeout: PRESENCE_TIMEOUT, label: 'state and channel list visible' });
  });

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
    const nested = (response.channels as unknown as { channels?: Record<string, unknown> }).channels;
    assert.deepEqual(nested?.[world.n('ch1')], { status: 'online' });
  });

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
    // The group member shows up a moment after the fixture joins it, so re-read until it does.
    await eventually(
      async () => {
        const again = await pubnub.hereNow({
          channels: [world.n('ch1')],
          channelGroups: [world.n('cg1')],
          includeUUIDs: true,
          includeState: true,
        });
        assert.ok(again.channels[world.n('cg1_member')], 'the channel group member is part of the result');
      },
      { timeout: 30_000, label: 'hereNow lists the channel group member' },
    );
  });

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

  step('basicUsageWithPromises', { needs: ['setStateBasicUsage'], proves: 'The promise form of hereNow resolves with the occupants, seen through a spy.' }, async () => {
    const pubnub = user();
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
    await eventually(async () => {
      const here = await world.observer.hereNow({ channels: [ch1] });
      assert.ok(!here.channels[ch1]?.occupants.some((o) => o.uuid === pubnub.getUserId()), 'occupant is still listed');
    }, { timeout: PRESENCE_TIMEOUT, label: 'occupant left ch1' });
  });
});
