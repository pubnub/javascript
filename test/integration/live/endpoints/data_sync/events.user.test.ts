/**
 * DataSync real-time event tests — typed User.
 *
 * Users ride the wire as `type: 'user'` with `className: 'User'` / `classLevel: 'Global'`, so
 * `objectType` matches the wire type. Delivered on `channel === id`.
 */

import type PubNub from 'pubnub';

import {
  CLASS_VERSION,
  assertEventCommon,
  assertEventDeleteData,
  assertEventEntityData,
  captureEvent,
  freshId,
  freshPubNub,
  userPayload,
} from '../../support/datasync-live-helpers';

describe('endpoints/data_sync/events.user: DataSync events — User', function () {
  this.timeout(60000);

  let pubnub: ReturnType<typeof freshPubNub>;

  beforeEach(() => {
    pubnub = freshPubNub();
  });

  const createUser = (id: string, payload = userPayload()) =>
    pubnub.dataSync
      .createUser({ id, data: { classVersion: CLASS_VERSION, status: 'active', payload } })
      .then(() => undefined);

  it('user create → "create" event (objectType "user")', async () => {
    const id = freshId('user');
    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'create' && (e.message.data as { id?: string }).id === id,
      () => createUser(id),
    );

    assertEventCommon(event, {
      event: 'create',
      type: 'user',
      objectType: 'user',
      id,
      channelOneOf: [id],
      className: 'User',
      classLevel: 'Global',
    });
    assertEventEntityData(event.message.data as PubNub.DataSyncEntityData, {
      id,
      status: 'active',
      payload: { firstName: 'Alice', lastName: 'Verma' },
    });
  });

  it('user update (PUT) → "update" event', async () => {
    const id = freshId('user');
    await createUser(id);

    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'update' && (e.message.data as { id?: string }).id === id,
      () =>
        pubnub.dataSync
          .setUser({
            id,
            data: { classVersion: CLASS_VERSION, status: 'updated', payload: userPayload({ level: 'L4' }) },
          })
          .then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'update',
      type: 'user',
      objectType: 'user',
      id,
      channelOneOf: [id],
      className: 'User',
      classLevel: 'Global',
    });
    assertEventEntityData(event.message.data as PubNub.DataSyncEntityData, {
      id,
      status: 'updated',
      payload: { level: 'L4' },
    });
  });

  it('user update → "update" event', async () => {
    const id = freshId('user');
    // Seed `level` first — the service rejects update-replace of a property that does not already
    // exist (`SYN-0006: Property does not exist`).
    await createUser(id, userPayload({ level: 'L3' }));

    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'update' && (e.message.data as { id?: string }).id === id,
      () => pubnub.dataSync.updateUser({ id, replace: { '/payload/level': 'L5' } }).then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'update',
      type: 'user',
      objectType: 'user',
      id,
      channelOneOf: [id],
      className: 'User',
      classLevel: 'Global',
    });
    assertEventEntityData(event.message.data as PubNub.DataSyncEntityData, {
      id,
      payload: { level: 'L5' },
    });
  });

  it('user delete → "delete" event with only {id, deletedAt}', async () => {
    const id = freshId('user');
    await createUser(id);

    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'delete' && (e.message.data as { id?: string }).id === id,
      () => pubnub.dataSync.removeUser({ id }).then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'delete',
      type: 'user',
      objectType: 'user',
      id,
      channelOneOf: [id],
      className: 'User',
      classLevel: 'Global',
    });
    assertEventDeleteData(event.message.data as PubNub.DataSyncDeleteData, id);
  });
});
