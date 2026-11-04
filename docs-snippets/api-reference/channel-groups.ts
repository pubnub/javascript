import assert from '../harness/assert.js';
import { page, step } from '../harness/step.js';
import { eventually } from '../harness/wait.js';

/**
 * docs/sdks/javascript/api-reference/channel-groups.md
 *
 * Keyset: open. Phases: add and list run in P3 (the shop's rooms get wired together), deletion runs in P9 with the
 * other teardown snippets. In the Sneaker Drop story a shopper groups a family's chat rooms under one name.
 *
 * What it proves: each snippet changes the group and a second client (`observer`) sees the change. Channel group
 * reads are eventually consistent, so every effect check polls with `eventually` instead of reading once.
 * What it does not prove: subscribing to a group (that is `subscribe.ts` and `subscribe-legacy.ts`, which also use
 * the `family` group and rely on the cleanups below) and Access Manager rules for group calls.
 */
export default page('api-reference/channel-groups', 'P3', (world) => {
  // Channel order in a group is not guaranteed, so compare sorted copies.
  const sorted = (values: string[]): string[] => [...values].sort();

  // Proves addChannels works: the shopper adds ch1 and ch2, then the observer reads the group back.
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

  // Proves listChannels returns what the previous step added. Needs that step so the group is not empty.
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

  // Seeds `family` with son and daughter, runs the removal and checks only daughter is left.
  // The group is deleted at the end on purpose: subscribe-legacy.ts also uses the name `family` (the stage rewrite maps
  // both pages to one live group), so leaving daughter behind would leak into that page.
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
    // The docs use the group name 'family' on the legacy subscribe page too, and the stage rewrite maps both pages to one
    // live group. Leave nothing behind, so the legacy fixture starts from a clean group instead of inheriting 'daughter'.
    await world.observer.channelGroups.deleteGroup({ channelGroup: world.n('family') });
    await eventually(async () => {
      const listed = await world.observer.channelGroups.listChannels({ channelGroup: world.n('family') });
      assert.deepEqual(listed.channels, []);
    }, { label: 'family group cleaned up after the removal sample' });
  });

  // Teardown sample, hence P9. It seeds `family` itself so it does not depend on what other pages left in the group.
  // The assertion after the snippet checks the group is empty (a deleted group lists no channels).
  step('deleteChannelGroupBasicUsage', { phase: 'P9', needs: ['removeChannelsFromGroupBasicUsage'], proves: 'deleteChannelGroup removes the group, and a deleted group lists no channels.' }, async () => {
    const pubnub = world.shopper;
    // The group must exist to see the deletion effect. Seed it here, so this step does not depend on what other pages left in 'family'.
    await world.observer.channelGroups.addChannels({ channelGroup: world.n('family'), channels: [world.n('son')] });
    await eventually(async () => {
      const listed = await world.observer.channelGroups.listChannels({ channelGroup: world.n('family') });
      // The legacy subscribe page may have put its own member into 'family' earlier. The group only has to hold 'son'.
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
