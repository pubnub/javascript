import assert from '../harness/assert.js';
import { page, step } from '../harness/step.js';
import { eventually } from '../harness/wait.js';

/**
 * Channel group examples.
 */
export default page('api-reference/channel-groups', 'P3', (world) => {
  // Channel order in a group is not guaranteed, so compare sorted copies.
  const sorted = (values: string[]): string[] => [...values].sort();

  step('addChannelsToGroupBasicUsage', { proves: 'addChannels adds two channels to a group, and a second client reads them back from the group.' }, async () => {
    const pubnub = world.shopper;
    // snippet.addChannelsToGroupBasicUsage
    const response = await pubnub.channelGroups.addChannels({
      channels: ['ch1', 'ch2'],
      channelGroup: 'myChannelGroup',
    });
    console.log('addChannels to Group response:', response);
    // snippet.end
    // Another client confirms the effect.
    await eventually(async () => {
      const listed = await world.observer.channelGroups.listChannels({ channelGroup: world.n('myChannelGroup') });
      assert.deepEqual(sorted(listed.channels), sorted([world.n('ch1'), world.n('ch2')]));
    }, { label: 'group lists ch1 and ch2' });
  });

  step('listChannelsInGroupBasicUsage', { needs: ['addChannelsToGroupBasicUsage'], proves: 'listChannels returns the channels the previous step added to the group.' }, async () => {
    const pubnub = world.shopper;
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
    assert.deepEqual(sorted(response.channels), sorted([world.n('ch1'), world.n('ch2')]));
  });

  step('removeChannelsFromGroupBasicUsage', { proves: 'removeChannels removes one channel from a group and leaves only the other one.' }, async () => {
    const pubnub = world.shopper;
    // The docs say the channel must already be in the group to observe the removal.
    await world.observer.channelGroups.addChannels({
      channelGroup: world.n('family'),
      channels: [world.n('son'), world.n('daughter')],
    });
    await eventually(async () => {
      const listed = await world.observer.channelGroups.listChannels({ channelGroup: world.n('family') });
      assert.deepEqual(sorted(listed.channels), sorted([world.n('son'), world.n('daughter')]));
    }, { label: 'family group seeded' });

    // snippet.removeChannelsFromGroupBasicUsage
    // assuming an initialized PubNub instance already exists
    // and channel which is going to be removed from the group is aredaly added to the group to observe the removal
    const response = await pubnub.channelGroups.removeChannels({
      channels: ['son'],
      channelGroup: 'family',
    });
    console.log('removeChannels from group response:', response);
    // snippet.end
    await eventually(async () => {
      const listed = await world.observer.channelGroups.listChannels({ channelGroup: world.n('family') });
      assert.deepEqual(listed.channels, [world.n('daughter')]);
    }, { label: 'son removed, daughter stays' });
    await world.observer.channelGroups.deleteGroup({ channelGroup: world.n('family') });
    await eventually(async () => {
      const listed = await world.observer.channelGroups.listChannels({ channelGroup: world.n('family') });
      assert.deepEqual(listed.channels, []);
    }, { label: 'family group cleaned up after the removal sample' });
  });

  step('deleteChannelGroupBasicUsage', { phase: 'P9', needs: ['removeChannelsFromGroupBasicUsage'], proves: 'deleteChannelGroup removes the group, and a deleted group lists no channels.' }, async () => {
    const pubnub = world.shopper;
    await world.observer.channelGroups.addChannels({ channelGroup: world.n('family'), channels: [world.n('son')] });
    await eventually(async () => {
      const listed = await world.observer.channelGroups.listChannels({ channelGroup: world.n('family') });
      assert.ok(listed.channels.includes(world.n('son')), `family lists son, got ${listed.channels.join(', ')}`);
    }, { label: 'family group seeded for deletion' });
    // snippet.deleteChannelGroupBasicUsage
    // assuming an initialized PubNub instance already exists
    // and channel group which is getting deleted already exist to see the deletion effect.
    const response = await pubnub.channelGroups.deleteGroup({
      channelGroup: 'family',
    });
    console.log('deleteChannelGroup response:', response);
    // snippet.end
    await eventually(async () => {
      const listed = await world.observer.channelGroups.listChannels({ channelGroup: world.n('family') });
      assert.deepEqual(listed.channels, []);
    }, { label: 'family group is empty after deletion' });
  });
});
