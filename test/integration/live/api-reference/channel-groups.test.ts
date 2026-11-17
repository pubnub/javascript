import assert from 'node:assert/strict';
import type PubNub from 'pubnub';
import { observer, shopper } from '../support/clients';
import { retryTransient } from '../support/retry';
import { eventually, settled } from '../support/wait';
import { sorted } from '../support/util';

/**
 * Channel group examples.
 * The groups 'myChannelGroup' and 'family' are shared literal names, so every test deletes the group it works on first
 * (reset approach). After the reset the exact channel list assertions are legitimate.
 */
describe('api-reference/channel-groups', () => {
  // Channel order in a group is not guaranteed, so compare sorted copies.

  const listed = async (pubnub: PubNub, channelGroup: string): Promise<string[]> =>
    (await pubnub.channelGroups.listChannels({ channelGroup })).channels;

  /** Deletes the group and waits until another client sees it empty on consecutive reads. */
  async function resetGroup(channelGroup: string): Promise<void> {
    const reader = observer();
    await reader.channelGroups.deleteGroup({ channelGroup });
    await settled(async () => assert.deepEqual(await listed(reader, channelGroup), []), {
      label: `group ${channelGroup} reset`,
    });
  }

  /** Resets a group, fills it with `channels` and waits until another client lists exactly those on consecutive reads. */
  async function seedGroup(channelGroup: string, channels: string[]): Promise<void> {
    await resetGroup(channelGroup);
    const reader = observer();
    await retryTransient(() => reader.channelGroups.addChannels({ channelGroup, channels }), {
      label: 'seed channel group',
    });
    await settled(async () => assert.deepEqual(sorted(await listed(reader, channelGroup)), sorted(channels)), {
      label: `group ${channelGroup} seeded`,
    });
  }

  after(async () => {
    // The samples leave both groups behind.
    const reader = observer();
    await reader.channelGroups.deleteGroup({ channelGroup: 'myChannelGroup' });
    await reader.channelGroups.deleteGroup({ channelGroup: 'family' });
  });

  it('addChannelsToGroupBasicUsage: addChannels adds two channels to a group, and a second client reads them back from the group', async () => {
    const pubnub = shopper();
    // Reset approach: the group starts empty, so the list below is exactly this sample's two channels.
    await resetGroup('myChannelGroup');

    // snippet.addChannelsToGroupBasicUsage
    const response = await pubnub.channelGroups.addChannels({
      channels: ['ch1', 'ch2'],
      channelGroup: 'myChannelGroup',
    });
    console.log('addChannels to Group response:', response);
    // snippet.end

    // Another client confirms the effect.
    const reader = observer();
    await eventually(async () => assert.deepEqual(sorted(await listed(reader, 'myChannelGroup')), ['ch1', 'ch2']), {
      label: 'group lists ch1 and ch2',
    });
  });

  it('listChannelsInGroupBasicUsage: listChannels returns the channels that were added to the group', async () => {
    const pubnub = shopper();
    // Reset approach: the sample says to add channels first, so this test does that on a freshly reset group.
    await seedGroup('myChannelGroup', ['ch1', 'ch2']);

    // snippet.listChannelsInGroupBasicUsage
    // assuming an intialized PubNub instance already exists
    // to get some data in response, first add some channels to the group using addChannels() method.
    const response = await pubnub.channelGroups.listChannels({
      channelGroup: 'myChannelGroup',
    });
    console.log('Channels in the group:', response);
    response.channels.forEach((channel) => {
      console.log(channel);
    });
    // snippet.end

    assert.deepEqual(sorted(response.channels), ['ch1', 'ch2']);
  });

  it('removeChannelsFromGroupBasicUsage: removeChannels removes one channel from a group and leaves only the other one', async () => {
    const pubnub = shopper();
    // The docs say the channel must already be in the group to observe the removal. Reset approach on 'family'.
    await seedGroup('family', ['son', 'daughter']);

    // snippet.removeChannelsFromGroupBasicUsage
    // assuming an initialized PubNub instance already exists
    // and channel which is going to be removed from the group is aredaly added to the group to observe the removal
    const response = await pubnub.channelGroups.removeChannels({
      channels: ['son'],
      channelGroup: 'family',
    });
    console.log('removeChannels from group response:', response);
    // snippet.end

    const reader = observer();
    await eventually(async () => assert.deepEqual(await listed(reader, 'family'), ['daughter']), {
      label: 'son removed, daughter stays',
    });
  });

  it('deleteChannelGroupBasicUsage: deleteGroup removes the group, and a deleted group lists no channels', async () => {
    const pubnub = shopper();
    // The group must exist to see the deletion effect. Reset approach: fill 'family' with exactly one channel.
    await seedGroup('family', ['son']);

    // snippet.deleteChannelGroupBasicUsage
    // assuming an initialized PubNub instance already exists
    // and channel group which is getting deleted already exist to see the deletion effect.
    const response = await pubnub.channelGroups.deleteGroup({
      channelGroup: 'family',
    });
    console.log('deleteChannelGroup response:', response);
    // snippet.end

    const reader = observer();
    await eventually(async () => assert.deepEqual(await listed(reader, 'family'), []), {
      label: 'family group is empty after deletion',
    });
  });
});
