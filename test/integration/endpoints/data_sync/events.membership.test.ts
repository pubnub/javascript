/**
 * DataSync real-time event tests — typed Membership.
 *
 * ROUTING RULE: memberships ride the wire as `type: 'membership'` and are delivered on BOTH the
 * channel-id channel AND the user-id channel, NEVER on the membership's own id. We subscribe to
 * `[channelId, userId]` and assert `channel ∈` that set. Wire `className: 'Membership'` /
 * `classLevel: 'Global'`, and the event body names the endpoints semantically — `channelId` /
 * `userId`, not the relationship's `entityAId` / `entityBId`.
 */

import assert from 'assert';
import nock from 'nock';

import type * as Subscription from '../../../../src/core/types/api/subscription';

import {
  CLASS_VERSION,
  assertEventCommon,
  assertEventDeleteData,
  assertEventMembershipData,
  captureEvent,
  channelPayload,
  freshId,
  freshPubNub,
  safeRemove,
  userPayload,
} from './helpers';

describe('DataSync events — Membership', function () {
  this.timeout(60000);

  // Earlier nocked Data Sync files call `disableNetConnect()` and never re-enable it. This suite
  // talks to the live service, so lift that block before any REST / subscribe call.
  before(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  let pubnub: ReturnType<typeof freshPubNub>;

  beforeEach(() => {
    pubnub = freshPubNub();
  });

  afterEach(() => {
    pubnub.destroy();
  });

  /** Seed the User + Channel a Membership joins. */
  async function seedEndpoints(): Promise<{ userId: string; channelId: string }> {
    const userId = freshId('user');
    const channelId = freshId('channel');
    await pubnub.dataSync.createUser({
      id: userId,
      data: { classVersion: CLASS_VERSION, status: 'active', payload: userPayload() },
    });
    await pubnub.dataSync.createChannel({
      id: channelId,
      data: { classVersion: CLASS_VERSION, status: 'active', payload: channelPayload() },
    });
    return { userId, channelId };
  }

  const createMembership = (id: string, userId: string, channelId: string, role = 'member') =>
    pubnub.dataSync
      .createMembership({
        id,
        userId,
        channelId,
        data: {
          classVersion: CLASS_VERSION,
          status: 'active',
          payload: { role, joinedAt: '2026-07-06T10:00:00.000Z' },
        },
      })
      .then(() => undefined);

  it('membership create → "create" event (delivered on channel + user)', async () => {
    const { userId, channelId } = await seedEndpoints();
    const id = freshId('membership');

    const event = await captureEvent(
      pubnub,
      [channelId, userId],
      (e) => e.message.event === 'create' && (e.message.data as { id?: string }).id === id,
      () => createMembership(id, userId, channelId),
    );

    assertEventCommon(event, {
      event: 'create',
      type: 'membership',
      objectType: 'membership',
      id,
      channelOneOf: [channelId, userId],
      className: 'Membership',
      classLevel: 'Global',
    });
    assertEventMembershipData(event.message.data as Subscription.DataSyncMembershipData, {
      id,
      channelId,
      userId,
      status: 'active',
      payload: { role: 'member' },
    });
  });

  it('membership update (PUT) → "update" event', async () => {
    const { userId, channelId } = await seedEndpoints();
    const id = freshId('membership');
    await createMembership(id, userId, channelId);

    const event = await captureEvent(
      pubnub,
      [channelId, userId],
      (e) => e.message.event === 'update' && (e.message.data as { id?: string }).id === id,
      () =>
        pubnub.dataSync
          .setMembership({
            id,
            userId,
            channelId,
            data: {
              classVersion: CLASS_VERSION,
              status: 'updated',
              payload: { role: 'moderator' },
            },
          })
          .then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'update',
      type: 'membership',
      objectType: 'membership',
      id,
      channelOneOf: [channelId, userId],
      className: 'Membership',
      classLevel: 'Global',
    });
    assertEventMembershipData(event.message.data as Subscription.DataSyncMembershipData, {
      id,
      channelId,
      userId,
      payload: { role: 'moderator' },
    });
  });

  it('membership update → "update" event', async () => {
    const { userId, channelId } = await seedEndpoints();
    const id = freshId('membership');
    await createMembership(id, userId, channelId);

    const event = await captureEvent(
      pubnub,
      [channelId, userId],
      (e) => e.message.event === 'update' && (e.message.data as { id?: string }).id === id,
      () => pubnub.dataSync.updateMembership({ id, replace: { '/payload/role': 'admin' } }).then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'update',
      type: 'membership',
      objectType: 'membership',
      id,
      channelOneOf: [channelId, userId],
      className: 'Membership',
      classLevel: 'Global',
    });
    assertEventMembershipData(event.message.data as Subscription.DataSyncMembershipData, {
      id,
      channelId,
      userId,
      payload: { role: 'admin' },
    });
  });

  it('membership delete → "delete" event with only {id, deletedAt}', async () => {
    const { userId, channelId } = await seedEndpoints();
    const id = freshId('membership');
    await createMembership(id, userId, channelId);

    const event = await captureEvent(
      pubnub,
      [channelId, userId],
      (e) => e.message.event === 'delete' && (e.message.data as { id?: string }).id === id,
      () => pubnub.dataSync.removeMembership({ id }).then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'delete',
      type: 'membership',
      objectType: 'membership',
      id,
      channelOneOf: [channelId, userId],
      className: 'Membership',
      classLevel: 'Global',
    });
    assertEventDeleteData(event.message.data as Subscription.DataSyncDeleteData, id);
  });

  it('routing proof — a subscriber to the membership id receives nothing', async () => {
    const { userId, channelId } = await seedEndpoints();
    const id = freshId('membership');
    try {
      await assert.rejects(
        () =>
          captureEvent(
            pubnub,
            [id],
            (e) => (e.message.data as { id?: string }).id === id,
            () => createMembership(id, userId, channelId),
            { timeoutMs: 8000 },
          ),
        /Timed out/,
        'membership event must not arrive on the membership id channel',
      );
    } finally {
      await safeRemove(() => pubnub.dataSync.removeMembership({ id }));
    }
  });
});
