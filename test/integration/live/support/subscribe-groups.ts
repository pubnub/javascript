/**
 * Channel group fixtures for the subscribe pages. A group without a channel carries no messages, so the samples that subscribe to
 * a group need one member channel. The member name is derived from the group, so it never collides with another page's channels.
 */
import assert from 'node:assert/strict';
import { createClient, friend, observer } from './clients';
import { settled } from './wait';

export const memberOf = (group: string): string => `${group}_member`;

/**
 * Gives every group its member channel and waits until the service lists it. A sample subscribes to the group right after and the
 * test expects a message on the member channel to arrive, so one listing that shows the member is not enough: the listing must hold
 * on consecutive polls (`settled`), because the subscribe request is served by whichever node answers it.
 */
export async function ensureGroups(groups: string[]): Promise<void> {
  const writer = friend();
  for (const group of groups) {
    await writer.channelGroups.addChannels({ channelGroup: group, channels: [memberOf(group)] });
  }
  const reader = observer();
  await settled(
    async () => {
      for (const group of groups) {
        const listed = await reader.channelGroups.listChannels({ channelGroup: group });
        assert.ok(listed.channels.includes(memberOf(group)), `${group} lists ${memberOf(group)}`);
      }
    },
    { label: 'channel groups have their member channel' },
  );
}

/** Removes only the member channels that `ensureGroups` added, so the groups do not keep them between runs. */
export async function removeGroupMembers(groups: string[]): Promise<void> {
  const writer = createClient('open', 'friend');
  for (const group of groups) {
    await writer.channelGroups
      .removeChannels({ channelGroup: group, channels: [memberOf(group)] })
      .catch(() => undefined);
  }
  writer.destroy();
}
