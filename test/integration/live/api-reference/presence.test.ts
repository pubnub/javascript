import assert from 'node:assert/strict';
import PubNub from 'pubnub';
import { friend, observer } from '../support/clients';
import { keysOf } from '../support/env';
import { connected, eventually, PRESENCE_TIMEOUT, settled } from '../support/wait';
import { sorted } from '../support/util';

/**
 * Presence examples.
 *
 * The samples run as the user id `uuid` on the channels `ch1`, `my_channel` and the channel group `cg1`. One occupant client
 * joins them once in `before` and leaves in `after`, because joining is the slow part of presence. It is built by hand
 * (not through `createClient`) so the per-test client cleanup does not destroy it between tests. Channels and groups are
 * shared and persistent, so the assertions look for the occupant `uuid` in a list, never for exact occupancy.
 * Residue: channel groups `cg1` and `my_channel_group` (both hold the channel `cg1_member`).
 */
describe('api-reference/presence', () => {
  let occupant: PubNub;
  const here = (query: Parameters<PubNub['hereNow']>[0]) => observer().hereNow(query);

  before(async function () {
    this.timeout(120_000);
    // Two groups share one member channel: `cg1` is subscribed by the occupant, `my_channel_group` is only read.
    for (const channelGroup of ['cg1', 'my_channel_group']) {
      await friend().channelGroups.addChannels({ channelGroup, channels: ['cg1_member'] });
    }
    const { publishKey, subscribeKey } = keysOf('open');
    // Short presence timeout, so a client that dies without leaving does not linger for the default 300 s.
    occupant = new PubNub({ publishKey, subscribeKey, userId: 'uuid', presenceTimeout: 20, heartbeatInterval: 8 });
    const set = occupant.subscriptionSet({ channels: ['ch1', 'my_channel'], channelGroups: ['cg1'] });
    const ready = connected(occupant, { channels: ['ch1', 'my_channel'], channelGroups: ['cg1'] });
    set.subscribe();
    await ready;
    await occupant.setState({ state: { status: 'online' }, channels: ['my_channel', 'ch1'] });
  });

  after(() => {
    occupant?.unsubscribeAll();
    occupant?.destroy();
  });

  it('fixture: the occupant is visible on all its channels, through both channel groups, with its state', async function () {
    this.timeout(120_000);
    const channels = ['ch1', 'my_channel', 'cg1_member'];
    // The samples below read each of these views once and assert the occupant exactly, so one pass over all of them is not
    // enough: every view must hold on consecutive passes (`settled`), because presence reads come from replicas that catch up
    // independently.
    const groupReads: Array<[string, { channels?: string[]; channelGroups: string[] }]> = [
      ['cg1', { channelGroups: ['cg1'] }],
      ['my_channel_group', { channelGroups: ['my_channel_group'] }],
      ['ch1 and cg1', { channels: ['ch1'], channelGroups: ['cg1'] }],
    ];
    await settled(
      async () => {
        const result = await here({ channels });
        for (const channel of channels) {
          assert.ok(
            result.channels[channel]?.occupants.some((o) => o.uuid === 'uuid'),
            `${channel} lists the occupant`,
          );
        }
        for (const [label, query] of groupReads) {
          const viaGroup = await here(query);
          assert.ok(
            viaGroup.channels['cg1_member']?.occupants.some((o) => o.uuid === 'uuid'),
            `${label} lists the occupant on cg1_member`,
          );
        }
        const withState = await here({ channels: ['my_channel'], includeState: true });
        assert.deepEqual(
          withState.channels['my_channel']?.occupants.find((o) => o.uuid === 'uuid')?.state,
          { status: 'online' },
          'hereNow lists the state on the channel',
        );
        const counted = await here({ channels: ['my_channel'], includeUUIDs: false });
        assert.ok((counted.channels['my_channel']?.occupancy ?? 0) >= 1, 'occupancy counts the occupant');
        const where = await observer().whereNow({ uuid: 'uuid' });
        assert.ok(
          ['ch1', 'my_channel'].every((c) => where.channels.includes(c)),
          'whereNow lists both channels',
        );
      },
      { timeout: PRESENCE_TIMEOUT, label: 'occupant visible through every read the samples use' },
    );
  });

  it('setStateBasicUsage: setState stores state that another client can read back', async () => {
    const pubnub = occupant;
    // Start from a different state, so the read-back below proves the sample changed it.
    await pubnub.setState({ state: { status: 'offline' }, channels: ['ch1'] });
    await eventually(
      async () => {
        const stored = await observer().getState({ uuid: 'uuid', channels: ['ch1'] });
        assert.deepEqual(stored.channels['ch1'], { status: 'offline' });
      },
      { label: 'initial state visible' },
    );

    // snippet.setStateBasicUsage
    const response = await pubnub.setState({
      state: { status: 'online' },
      channels: ['ch1'],
      channelGroups: ['cg1'],
    });
    console.log('State set successfully:', response);
    // snippet.end
    assert.deepEqual(response.state, { status: 'online' });
    await eventually(
      async () => {
        const stored = await observer().getState({ uuid: 'uuid', channels: ['ch1'] });
        assert.deepEqual(stored.channels['ch1'], { status: 'online' });
      },
      { label: 'state visible to another client' },
    );
    // hereNowBasicUsage reads the same state through hereNow in one shot, so wait for that read path too.
    await eventually(
      async () => {
        const result = await here({ channels: ['ch1'], includeState: true });
        assert.deepEqual(
          result.channels['ch1']?.occupants.find((o) => o.uuid === 'uuid')?.state,
          { status: 'online' },
          'hereNow lists the state on ch1',
        );
      },
      { label: 'state visible through hereNow' },
    );
  });

  it('getStateBasicUsage: getState returns the state set for the channel and the group', async function () {
    this.timeout(60_000);
    const pubnub = occupant;
    await pubnub.setState({ state: { status: 'online' }, channels: ['ch1'], channelGroups: ['cg1'] });
    // The sample reads the state once. Wait until consecutive reads from another client return it (the previous test left the
    // same value, so this matters mostly when this test runs alone).
    await settled(
      async () => {
        const stored = await observer().getState({ uuid: 'uuid', channels: ['ch1'] });
        assert.deepEqual(stored.channels['ch1'], { status: 'online' });
      },
      { label: 'state visible before the sample reads it' },
    );

    // snippet.getStateBasicUsage
    const response = await pubnub.getState({
      uuid: 'uuid',
      channels: ['ch1'],
      channelGroups: ['cg1'],
    });
    console.log('State retrieved successfully:', response);
    // snippet.end
    const nested = (response.channels as unknown as { channels?: Record<string, unknown> }).channels;
    assert.deepEqual(nested?.['ch1'], { status: 'online' });
  });

  it('hereNowBasicUsage: hereNow lists the occupant with its state and the group member channel appears through the group', async function () {
    this.timeout(60_000);
    const pubnub = occupant;
    await pubnub.setState({ state: { status: 'online' }, channels: ['ch1'] });
    await settled(
      async () => {
        const result = await here({ channels: ['ch1'], includeState: true });
        assert.deepEqual(result.channels['ch1']?.occupants.find((o) => o.uuid === 'uuid')?.state, { status: 'online' });
      },
      { timeout: 30_000, label: 'state visible before the sample reads it' },
    );

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
    const entry = result.channels['ch1']?.occupants.find((o) => o.uuid === 'uuid');
    assert.ok(entry, 'ch1 lists the occupant');
    assert.deepEqual(entry.state, { status: 'online' });
    // The group member shows up a moment after the occupant joins it, so re-read until it does.
    await eventually(
      async () => {
        const again = await pubnub.hereNow({
          channels: ['ch1'],
          channelGroups: ['cg1'],
          includeUUIDs: true,
          includeState: true,
        });
        assert.ok(
          again.channels['cg1_member']?.occupants.some((o) => o.uuid === 'uuid'),
          'the channel group member is part of the result',
        );
      },
      { timeout: 30_000, label: 'hereNow lists the channel group member' },
    );
  });

  it('hereNowWithState: hereNow with includeState returns the state set in the fixture', async () => {
    const pubnub = occupant;

    // snippet.hereNowWithState
    const response = await pubnub.hereNow({
      channels: ['my_channel'],
      includeState: true,
    });
    console.log('hereNow response:', response);
    // snippet.end
    const entry = response.channels['my_channel']?.occupants.find((o) => o.uuid === 'uuid');
    assert.deepEqual(entry?.state, { status: 'online' });
  });

  it('hereNowFetchOccupancyOnly: hereNow with includeUUIDs false gives a count and no user list', async () => {
    const pubnub = occupant;

    // snippet.hereNowFetchOccupancyOnly
    const response = await pubnub.hereNow({
      channels: ['my_channel'],
      includeUUIDs: false,
    });
    console.log('hereNow response:', response);
    // snippet.end
    const entry = response.channels['my_channel'];
    assert.ok(entry.occupancy >= 1, 'occupancy counts the occupant');
    assert.equal(entry.occupants?.length ?? 0, 0, 'no user ids when includeUUIDs is false');
  });

  it('hereNowChannelGroup: hereNow on a channel group reports presence for each member channel', async () => {
    const pubnub = occupant;

    // snippet.hereNowChannelGroup
    const response = await pubnub.hereNow({
      channelGroups: ['my_channel_group'],
    });
    console.log('hereNow response:', response);
    // snippet.end
    const entry = response.channels['cg1_member'];
    assert.ok(entry, 'the group member channel is in the result');
    assert.ok(entry.occupants.some((o) => o.uuid === 'uuid'));
  });

  it('basicUsageWithPromises: the promise form of hereNow resolves with the occupants, seen through a spy', async () => {
    const pubnub = occupant;
    await pubnub.setState({ state: { status: 'online' }, channels: ['ch1'] });
    // Spy: keep the promise the sample does not return.
    const results: Array<Promise<PubNub.Presence.HereNowResponse>> = [];
    const original = pubnub.hereNow.bind(pubnub);
    pubnub.hereNow = ((...args: Parameters<PubNub['hereNow']>) => {
      const result = original(...args);
      results.push(result);
      return result;
    }) as PubNub['hereNow'];

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
    assert.equal(results.length, 1, 'the snippet called hereNow once');
    const response = await results[0];
    assert.ok(response.channels['ch1']?.occupants.some((o) => o.uuid === 'uuid'));
  });

  it('whereNowBasicUsage: whereNow lists the channels the occupant is in', async () => {
    const pubnub = observer();

    // snippet.whereNowBasicUsage
    const response = await pubnub.whereNow({
      uuid: 'uuid',
    });
    console.log('whereNow response:', response);
    // snippet.end
    assert.deepEqual(
      sorted(response.channels).filter((c) => ['ch1', 'my_channel'].includes(c)),
      ['ch1', 'my_channel'],
    );
  });

  it('after the occupant unsubscribes the channel empties of it in hereNow', async function () {
    this.timeout(90_000);
    // Own user and a channel unique to this test, so it does not disturb the shared occupant of the other tests.
    const channel = `presence-leave-${Date.now().toString(36)}`;
    const { publishKey, subscribeKey } = keysOf('open');
    const leaver = new PubNub({
      publishKey,
      subscribeKey,
      userId: `leaver-${channel}`,
      presenceTimeout: 20,
      heartbeatInterval: 8,
    });
    try {
      const ready = connected(leaver, { channels: [channel] });
      leaver.subscribe({ channels: [channel] });
      await ready;
      await eventually(
        async () => {
          const result = await here({ channels: [channel] });
          assert.ok(
            result.channels[channel]?.occupants.some((o) => o.uuid === leaver.getUserId()),
            'occupant is listed',
          );
        },
        { timeout: PRESENCE_TIMEOUT, label: 'occupant joined' },
      );
      leaver.unsubscribeAll();
      await eventually(
        async () => {
          const result = await here({ channels: [channel] });
          assert.ok(
            !result.channels[channel]?.occupants.some((o) => o.uuid === leaver.getUserId()),
            'occupant is still listed',
          );
        },
        { timeout: PRESENCE_TIMEOUT, label: 'occupant left' },
      );
    } finally {
      leaver.destroy();
    }
  });
});
