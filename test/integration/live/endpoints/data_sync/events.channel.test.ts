/**
 * DataSync real-time event tests — typed Channel.
 *
 * Channels ride the wire as `type: 'channel'` with `className: 'Channel'` / `classLevel: 'Global'`,
 * so `objectType` matches the wire type. Delivered on `channel === id`.
 */

import type PubNub from 'pubnub';

import {
  CLASS_VERSION,
  assertEventCommon,
  assertEventDeleteData,
  assertEventEntityData,
  captureEvent,
  channelPayload,
  freshId,
  freshPubNub,
  removeAfterTest,
} from '../../support/datasync-live-helpers';
import { createWithRunUniqueId } from '../../support/retry';

describe('endpoints/data_sync/events.channel: DataSync events — Channel', function () {
  this.timeout(60000);

  let pubnub: ReturnType<typeof freshPubNub>;

  beforeEach(() => {
    pubnub = freshPubNub();
  });

  // The id comes from `freshId` and is unique to this run, so a 409 on a retry means the first attempt was stored (see retry.ts).
  const createChannel = (id: string, payload = channelPayload()) =>
    createWithRunUniqueId(
      () => pubnub.dataSync.createChannel({ id, data: { classVersion: CLASS_VERSION, status: 'active', payload } }),
      () => pubnub.dataSync.getChannel({ id }),
      { label: 'createChannel' },
    ).then(() => undefined);

  it('channel create → "create" event (objectType "channel")', async () => {
    const id = removeAfterTest(pubnub, 'channel', freshId('channel'));
    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'create' && (e.message.data as { id?: string }).id === id,
      () => createChannel(id),
    );

    assertEventCommon(event, {
      event: 'create',
      type: 'channel',
      objectType: 'channel',
      id,
      channelOneOf: [id],
      className: 'Channel',
      classLevel: 'Global',
    });
    assertEventEntityData(event.message.data as PubNub.DataSyncEntityData, {
      id,
      status: 'active',
      payload: { name: 'engineering', kind: 'public' },
    });
  });

  it('channel update (PUT) → "update" event', async () => {
    const id = removeAfterTest(pubnub, 'channel', freshId('channel'));
    await createChannel(id);

    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'update' && (e.message.data as { id?: string }).id === id,
      () =>
        pubnub.dataSync
          .setChannel({
            id,
            data: {
              classVersion: CLASS_VERSION,
              status: 'updated',
              payload: channelPayload({ memberCount: 5 }),
            },
          })
          .then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'update',
      type: 'channel',
      objectType: 'channel',
      id,
      channelOneOf: [id],
      className: 'Channel',
      classLevel: 'Global',
    });
    assertEventEntityData(event.message.data as PubNub.DataSyncEntityData, {
      id,
      status: 'updated',
      payload: { memberCount: 5 },
    });
  });

  it('channel update → "update" event', async () => {
    const id = removeAfterTest(pubnub, 'channel', freshId('channel'));
    // Seed `memberCount` first — the service rejects update-replace of a property that does not already
    // exist (`SYN-0006: Property does not exist`).
    await createChannel(id, channelPayload({ memberCount: 1 }));

    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'update' && (e.message.data as { id?: string }).id === id,
      () => pubnub.dataSync.updateChannel({ id, replace: { '/payload/memberCount': 9 } }).then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'update',
      type: 'channel',
      objectType: 'channel',
      id,
      channelOneOf: [id],
      className: 'Channel',
      classLevel: 'Global',
    });
    assertEventEntityData(event.message.data as PubNub.DataSyncEntityData, {
      id,
      payload: { memberCount: 9 },
    });
  });

  it('channel delete → "delete" event with only {id, deletedAt}', async () => {
    const id = removeAfterTest(pubnub, 'channel', freshId('channel'));
    await createChannel(id);

    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'delete' && (e.message.data as { id?: string }).id === id,
      () => pubnub.dataSync.removeChannel({ id }).then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'delete',
      type: 'channel',
      objectType: 'channel',
      id,
      channelOneOf: [id],
      className: 'Channel',
      classLevel: 'Global',
    });
    assertEventDeleteData(event.message.data as PubNub.DataSyncDeleteData, id);
  });
});
