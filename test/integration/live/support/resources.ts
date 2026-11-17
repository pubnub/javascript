/**
 * The literal resources the live tier uses, per keyset role. DATA ONLY.
 *
 * The tests use the names the docs show, so these names are fixed, shared and persistent. The janitor (janitor.ts) cleans exactly
 * what is listed here before and after every run, and nothing else. It never lists a keyset and deletes what it finds.
 *
 * To add a name: put it in the right list of the right role below (one string, no logic). A name that a test creates but that is
 * not listed here is never cleaned and leaks from run to run. Seeded from docs-snippets/fixtures/names.ts and from the
 * literals of the old page modules (snippet regions and `world.n(...)`).
 *
 * Which list does a name belong to?
 *   channels       every channel a test publishes to or reads history from (history is deleted on these, and on `fileChannels`)
 *   fileChannels   channels a test uploads files to (all files are deleted, then history)
 *   channelGroups  channel groups (deleted as a whole; the member channels are NOT touched, list them under `channels`)
 *   appContext     users and channels stored as App Context metadata, and their memberships (removed when both sides are listed)
 *   pushDevices    device tokens registered for push (fcm, apns, apns2 production and development are all cleared)
 *   dataSync       DataSync object ids by kind (the datasync keyset only; classes are never touched)
 */
import type { Role } from './env';

export interface DataSyncResources {
  users: readonly string[];
  channels: readonly string[];
  /** Entities of the `product` class. Ids may contain dots. */
  entities: readonly string[];
  /** Membership ids. A membership between a listed user and a listed channel is removed even when its id is not listed. */
  memberships: readonly string[];
  /** `ProductOwner` relationship ids. Relationships between a listed user and a listed entity are removed even when not listed. */
  relationships: readonly string[];
}

export interface RoleResources {
  channels?: readonly string[];
  fileChannels?: readonly string[];
  channelGroups?: readonly string[];
  appContext?: { users?: readonly string[]; channels?: readonly string[] };
  pushDevices?: readonly string[];
  dataSync?: Partial<DataSyncResources>;
}

/** A realistic 64-character hex device token (the shape of an APNs token), the one the push samples show. */
export const DEVICE_TOKEN_EXAMPLE = '740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad';

/** Groups the legacy subscribe page fills with one `<group>_member` channel each. */
const MEMBER_GROUPS = [
  'my_channelGroup',
  'family',
  'my_channelGroup1',
  'my_channelGroup2',
  'my_channelGroup3',
  'demo_group1',
  'demo_group2',
  'cg1',
  'channelGroup_1',
];

/**
 * The literal DataSync ids the page api-reference/datasync.test.ts creates, by kind. The page's own hooks
 * (support/datasync-state.ts) reset exactly these, and the janitor cleans them too, so both read this one list.
 */
export const DATASYNC_PAGE_OBJECTS = {
  relationships: ['rel-bob-owns-sneaker-42'],
  memberships: ['membership-alice-summer-sale', 'membership-alice-winter-sale'],
  entities: ['product-sneaker-42', 'product.676', 'product.677', 'product.678', 'product.679'],
  users: ['user-alice', 'seller-bob'],
  channels: ['channel-summer-sale', 'channel-winter-sale'],
} as const;

export const RESOURCES: Readonly<Record<Role, RoleResources>> = {
  open: {
    // Deliberately NOT listed: `history_documented_behavior` (api-reference/message-persistence-legacy). Its test needs more than
    // 100 stored messages, writes about 105 once (5 batches of 21 publishes, then waits for the service to show them) and
    // reuses them. Listing it would make the janitor wipe it before every run and the test refill it every run. It cannot
    // grow: the test publishes only while the channel holds fewer than 100 messages. The assertions look at the cap, the order
    // and the field types of whatever is stored, not at the content. Names that tests generate per run (a suffix from
    // randomUUID or Date.now, such as `misc_disconnect_<uuid>`) cannot be listed either; their messages expire with the
    // retention of the keyset.
    channels: [
      'my_channel',
      'my-channel',
      'my_channel_1',
      'my_channel_2',
      'my_channel_3',
      'ch1',
      'ch2',
      'ch3',
      'ch4',
      'ch-1',
      'ch-2',
      'channel_1',
      'channel_3',
      'channel_name',
      'chan1',
      'chan2',
      'chan3',
      'chats.room1',
      'chats.room2',
      'team.blue',
      'team.red',
      'channel-with-status-type',
      'foo',
      'son',
      'daughter',
      'a',
      'b',
      'myChannel',
      'awesomeChannel',
      'history_channel',
      'history_test',
      'hello_world',
      'chat-bot',
      'ab.news',
      'outage_channel',
      'fire_replacement',
      'legacy_ivs',
      'legacy_cipher',
      'legacy_listeners_channel',
      'persist_channel',
      'filter_channel',
      'preflight_channel',
      'push_marker',
      // Use cases (use-cases/*.test.ts), literal channel names of the sports example.
      'game.chat',
      'game.chat.shard-0',
      'game.chat.shard-1',
      'game.chat.shard-2',
      'game.match-stats.score',
      'game.match-stats.possession',
      'game.match-stats.shots',
      'game.match-stats.cards',
      'game.new-poll',
      'game.poll-votes',
      'game.poll-results',
      'game.poll-triggers',
      'game.score-alerts',
      'game.commentary',
      'game.stream',
      'game.stream-reactions',
      'game.ad-decisions',
      'game.reaction-upgrades',
      'game.moment-alerts.fan-a',
      'game.moment-alerts.fan-b',
      // Members of the channel groups above (`<group>_member`).
      ...MEMBER_GROUPS.map((group) => `${group}_member`),
    ],
    fileChannels: ['my_channel', 'awesomeChannel', 'preflight_channel'],
    channelGroups: [
      'myChannelGroup',
      'family',
      'cg1',
      'my_channel_group',
      'channelGroup_1',
      'my_channelGroup',
      'my_channelGroup1',
      'my_channelGroup2',
      'my_channelGroup3',
      'demo_group1',
      'demo_group2',
    ],
    appContext: {
      // Users are metadata of an App Context user id: the ids the objects samples set, and the clients' own user ids.
      users: [
        'myUuid',
        'my-uuid',
        'uuid',
        'uuid-1',
        'uuid-2',
        'uuid-3',
        'user_meta1',
        'shopper',
        'friend',
        'observer',
        'fan-42',
      ],
      channels: [
        'team.blue',
        'team.red',
        'my-channel',
        'my_channel',
        'channel-with-status-type',
        'myChannel',
        'ch-1',
        'ch-2',
        'push_marker',
        'legacy_listeners_channel',
        'game.chat',
      ],
    },
    pushDevices: [DEVICE_TOKEN_EXAMPLE, 'niceDevice'],
  },

  // Access Manager keyset: the application-level grant is revoked by the janitor (not a list entry). Channels the grant and
  // token samples publish to.
  pam: {
    channels: [
      'am_room',
      'am_other',
      'my_channel',
      'my-channel',
      'channel-a',
      'channel-b',
      'channel-c',
      'channel-d',
      'game.chat',
      'game.chat.moderation',
    ],
  },

  datasync: {
    dataSync: {
      users: DATASYNC_PAGE_OBJECTS.users,
      channels: DATASYNC_PAGE_OBJECTS.channels,
      entities: DATASYNC_PAGE_OBJECTS.entities,
      memberships: DATASYNC_PAGE_OBJECTS.memberships,
      relationships: DATASYNC_PAGE_OBJECTS.relationships,
    },
  },
};
