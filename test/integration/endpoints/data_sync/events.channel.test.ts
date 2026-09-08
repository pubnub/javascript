/**
 * DataSync real-time event tests — typed Channel.
 *
 * Channels ride the wire as `type: 'channel'` with `className: 'Channel'` / `classLevel: 'Global'`,
 * so `objectType` matches the wire type. Delivered on `channel === id`.
 *
 */

import nock from 'nock';

import type * as Subscription from '../../../../src/core/types/api/subscription';

import {
  CLASS_VERSION,
  assertEventCommon,
  assertEventDeleteData,
  assertEventEntityData,
  captureEvent,
  channelPayload,
  freshId,
  freshPubNub,
} from './helpers';

describe('DataSync events — Channel', function () {
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

  const createChannel = (id: string, payload = channelPayload()) =>
    pubnub.dataSync
      .createChannel({ id, data: { classVersion: CLASS_VERSION, status: 'active', payload } })
      .then(() => undefined);

  it('channel create → "create" event (objectType "channel")', async () => {
    const id = freshId('channel');
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
    assertEventEntityData(event.message.data as Subscription.DataSyncEntityData, {
      id,
      status: 'active',
      payload: { name: 'engineering', kind: 'public' },
    });
  });

  it('channel update (PUT) → "update" event', async () => {
    const id = freshId('channel');
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
    assertEventEntityData(event.message.data as Subscription.DataSyncEntityData, {
      id,
      status: 'updated',
      payload: { memberCount: 5 },
    });
  });

  it('channel update → "update" event', async () => {
    const id = freshId('channel');
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
    assertEventEntityData(event.message.data as Subscription.DataSyncEntityData, {
      id,
      payload: { memberCount: 9 },
    });
  });

  it('channel delete → "delete" event with only {id, deletedAt}', async () => {
    const id = freshId('channel');
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
    assertEventDeleteData(event.message.data as Subscription.DataSyncDeleteData, id);
  });
});
