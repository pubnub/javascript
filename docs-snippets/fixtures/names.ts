/**
 * Resource-name registry.
 *
 * Docs snippets show plain literals such as `my_channel`. Every literal listed here names a live resource,
 * so `harness/stage.ts` rewrites it inside snippet regions of a staged copy to carry the per-run suffix.
 * Source files stay untouched, which is what the docs fetch.
 *
 * Three kinds of entries:
 * - `names`: live resource names. Rewritten to `<name>-r<6 base36>`. A name with dots gets the suffix on its
 *   first dot segment so wildcard roots stay intact (`chats.room1` becomes `chats-rk3x9q.room1`).
 * - `placeholders`: literals such as `replace_with_message_timetoken`. Rewritten to `world.ph('<key>')`, so the
 *   step that produced the real value can supply it at run time.
 * - `harnessOnly`: names the harness itself creates (outside snippet markers). They are never rewritten, the
 *   harness calls `world.n(name)` for them. Listed so the janitor knows what to clean.
 */

import { createHash } from 'node:crypto';
import { runIdAgeMs } from '../harness/env.js';

/** A realistic 64-character hex device token, the shape of an APNs token. Shown in the push snippets. */
export const DEVICE_TOKEN_EXAMPLE = '740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad';

/** Groups the registry by what the name identifies. Only used to organize `names`. Rewriting treats all kinds alike. */
export type NameKind = 'channel' | 'channelGroup' | 'userId' | 'metadata' | 'device' | 'dataSync';

/** The literals the stage rewrite suffixes. Add a literal here when a snippet names a new live resource. */
export const names: Readonly<Record<NameKind, readonly string[]>> = {
  channel: [
    'my_channel',
    'my-channel',
    'ch1',
    'ch2',
    'ch3',
    'ch4',
    'channel_1',
    'channel_3',
    'channel_name',
    'chats.room1',
    'chats.room2',
    'foo',
    'son',
    'team.blue',
    'team.red',
    'channel-with-status-type',
    'ch-1',
    'ch-2',
    // Channels of the legacy subscribe, history and quickstart pages.
    'my_channel_1',
    'my_channel_2',
    'my_channel_3',
    'ab.*',
    'chan1',
    'chan2',
    'chan3',
    'history_channel',
    'history_test',
    'hello_world',
    'myChannel',
    'awesomeChannel',
    'chat-bot',
    'a',
    'b',
  ],
  channelGroup: ['myChannelGroup', 'family', 'cg1', 'my_channel_group', 'channelGroup_1', 'my_channelGroup', 'my_channelGroup1', 'my_channelGroup2', 'my_channelGroup3', 'demo_group1', 'demo_group2'],
  userId: ['YOUR_USER_ID', 'myUniqueUserId', 'uuid', 'myUuid', 'my-uuid', 'uuid-1', 'uuid-2', 'uuid-3', 'my-authorized-uuid', 'my-authorized-userId', 'my_authkey', 'key1', 'my-auth-key', 'uuid1', 'user-alice', 'your-user-id', 'unique-user-id', 'myUserId'],
  metadata: ['user_meta1'],
  /**
   * Push device tokens. The janitor removes their registrations.
   *
   * The literal must be a realistic token that the real service accepts on EVERY gateway. The docs sample uses
   * `niceDevice`, which the service rejects for apns and apns2 (400 "Invalid device token", verified live 2026-11-02),
   * because it checks the token FORMAT for those gateways: a hex string of 64 characters (40 also passes) is accepted,
   * and FCM accepts any string. So the app's snippet bodies show a 64-character hex token. The staging rewrite
   * replaces it with another 64-character hex token derived from the run id (see `deviceToken`), so the rewritten
   * value stays valid for apns and apns2. Tokens are not checked against Apple or Google until a push is sent.
   */
  device: [DEVICE_TOKEN_EXAMPLE],
  /** DataSync object ids on the secured keyset. Ids allow hyphens and dots but no underscores, so the run suffix fits. `user-alice` is a userId above. */
  dataSync: [
    'channel-summer-sale',
    'membership-alice-summer-sale',
    'product-sneaker-42',
    'seller-bob',
    'rel-bob-owns-sneaker-42',
    'product.*',
  ],
};

/** Literal found in a snippet, mapped to the `world.ph()` key that supplies the live value. */
export const placeholders: Readonly<Record<string, string>> = {
  replace_with_message_timetoken: 'messageTimetoken',
  replace_with_action_timetoken: 'actionTimetoken',
  replace_with_start_timetoken: 'actionsStart',
  replace_with_end_timetoken: 'actionsEnd',
  'replace-with-start-timetoken': 'historyStart',
  'replace-with-end-timetoken': 'historyEnd',
  'replace-with-timetoken': 'countFrom',
  // history (legacy): the docs use these literals as start and end anchors.
  '13406746780720711': 'historyAnchor',
  '123123123133': 'historyPromiseStart',
  '123123123123': 'historyPromiseEnd',
  'replace-with-channel-timetoken-ch1': 'countFromCh1',
  'replace-with-channel-timetoken-ch2': 'countFromCh2',
  'replace-with-channel-timetoken-ch3': 'countFromCh3',
  // File id and the image id of the React Native sample, both supplied by the step that sends the file.
  '...': 'fileId',
  imageId: 'imageId',
  // Access Manager: a token the step granted, a token to revoke, the presence channel of my_channel.
  'use-token-string-generated-by-grantToken()': 'grantedToken',
  p0AkFl043rhDdHRsple3KgQ3NwY6BDcENnctokenVzcqBDczaWdYIGOAeTyWGJI: 'tokenToRevoke',
  'my_channel-pnpres': 'myChannelPnpres',
  // DataSync: eTags the docs show as examples. A step reads the real eTag first and sets these.
  AbQdEfGhIjKlMn: 'userEtag',
  StUvWxYzAbCdEf: 'entityEtag',
};

/** Names the harness creates itself. Used through `world.n()`, cleaned by the janitor. */
export const harnessOnly: Readonly<Record<'channel' | 'channelGroup' | 'userId', readonly string[]>> = {
  channel: ['cg1_member', 'channelGroup_1_member', 'daughter', 'filter_channel', 'persist_channel', 'preflight_channel', 'legacy_listeners_channel', 'am_room', 'am_other', 'push_marker'],
  channelGroup: [],
  userId: ['shopper', 'friend', 'observer', 'user-alice', 'user-bob', 'staff-server', 'am-revokee', 'am-v2-user', 'am-v2-reader', 'am-denied'],
};

/** `RUN_ID_PATTERN` validates a bare run id. `SUFFIX_PATTERN` finds the `-r<id>` suffix inside a resource name (at the end or before a dot). */
export const RUN_ID_PATTERN = /^[0-9a-z]{6}$/;
export const SUFFIX_PATTERN = /-r[0-9a-z]{6}(?=\.|$)/;

/**
 * True only when a name carries a run suffix that decodes to a run of the last year. The pattern alone also matches ordinary
 * words (`test-results`, `app-reviews`), so the janitors use this before they delete anything on a shared keyset.
 */
export function hasRunSuffix(name: string): boolean {
  const match = SUFFIX_PATTERN.exec(name);
  return Boolean(match && runIdAgeMs(match[0].slice(2)) !== undefined);
}

/**
 * Per-run device token of the same length as `literal` and still valid hex (lowercase 0-9a-f). Derived from
 * SHA-256 of the literal and the run id, so it is deterministic for one run (the janitor recomputes it for a crashed
 * run from the run id alone) and different between runs. Plain "-r<runId>" suffixes would not be hex, and the
 * service rejects non-hex tokens on apns and apns2.
 */
export function deviceToken(literal: string, runId: string): string {
  let hex = '';
  for (let round = 0; hex.length < literal.length; round += 1) {
    hex += createHash('sha256').update(`${literal}:${runId}:${round}`).digest('hex');
  }
  return hex.slice(0, literal.length);
}

/**
 * Applies the run suffix: on the first dot segment when the name has dots, at the end otherwise.
 * Device tokens are the exception: they get a derived hex token instead (see `deviceToken`).
 */
export function suffixName(name: string, runId: string): string {
  if (names.device.includes(name)) return deviceToken(name, runId);
  const suffix = `-r${runId}`;
  const dot = name.indexOf('.');
  return dot === -1 ? `${name}${suffix}` : `${name.slice(0, dot)}${suffix}${name.slice(dot)}`;
}

/** Every rewritable live-resource literal. */
/** Used by the stage report (unused names) and by `isRegisteredName`. */
export function allRewritableNames(): string[] {
  return Object.values(names).flat();
}

/** Channel group names the janitor deletes per run id. */
export function allGroupNames(): string[] {
  return [...names.channelGroup, ...harnessOnly.channelGroup];
}

export function isRegisteredName(literal: string): boolean {
  return allRewritableNames().includes(literal);
}

export function isPlaceholder(literal: string): boolean {
  return Object.prototype.hasOwnProperty.call(placeholders, literal);
}

/** Literal that looks like a placeholder (so a missing registry entry is caught by the marker lint). */
export const PLACEHOLDER_LOOKALIKE = /replace[-_]with/i;
