/**
 * DataSync real-time event tests — generic Entity (`JSCustomer`).
 *
 * Entity-type events are delivered on `channel === object.id`, so we subscribe to the (client-supplied)
 * id before creating the entity. `JSCustomer` is a developer-defined class, so the wire carries
 * `className: 'JSCustomer'` / `classLevel: 'SubKey'` and `objectType` stays the wire `'entity'`.
 *
 */

import type PubNub from 'pubnub';

import {
  CLASS_VERSION,
  ENTITY_CLASS_CUSTOMER,
  assertEventCommon,
  assertEventDeleteData,
  assertEventEntityData,
  captureEvent,
  customerPayload,
  freshId,
  freshPubNub,
  removeAfterTest,
} from '../../support/datasync-live-helpers';
import { createWithRunUniqueId } from '../../support/retry';

describe('endpoints/data_sync/events.entity: DataSync events — Entity Customer', function () {
  this.timeout(60000);

  let pubnub: ReturnType<typeof freshPubNub>;

  beforeEach(() => {
    pubnub = freshPubNub();
  });

  // The id comes from `freshId` and is unique to this run, so a 409 on a retry means the first attempt was stored (see retry.ts).
  const createCustomer = (id: string) =>
    createWithRunUniqueId(
      () =>
        pubnub.dataSync.createEntity({
          id,
          class: ENTITY_CLASS_CUSTOMER,
          data: {
            classVersion: CLASS_VERSION,
            status: 'active',
            payload: customerPayload(id),
          },
        }),
      () => pubnub.dataSync.getEntity({ id }),
      { label: 'createEntity' },
    ).then(() => undefined);

  it('entity create - create event', async () => {
    const id = removeAfterTest(pubnub, 'entity', freshId('customer'));
    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'create' && (e.message.data as { id?: string }).id === id,
      () => createCustomer(id),
    );

    assertEventCommon(event, {
      event: 'create',
      type: 'entity',
      objectType: 'entity',
      id,
      channelOneOf: [id],
      className: ENTITY_CLASS_CUSTOMER,
      classLevel: 'SubKey',
    });
    assertEventEntityData(event.message.data as PubNub.DataSyncEntityData, {
      id,
      status: 'active',
      payload: { customerId: id, firstName: 'Alice', creditScore: 720, city: 'Pune' },
    });
  });

  it('entity update (PUT) - update event', async () => {
    const id = removeAfterTest(pubnub, 'entity', freshId('customer'));
    await createCustomer(id);

    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'update' && (e.message.data as { id?: string }).id === id,
      () =>
        pubnub.dataSync
          .setEntity({
            id,
            data: {
              classVersion: CLASS_VERSION,
              status: 'updated',
              payload: customerPayload(id, { creditScore: 780 }),
            },
          })
          .then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'update',
      type: 'entity',
      objectType: 'entity',
      id,
      channelOneOf: [id],
      className: ENTITY_CLASS_CUSTOMER,
      classLevel: 'SubKey',
    });
    assertEventEntityData(event.message.data as PubNub.DataSyncEntityData, {
      id,
      status: 'updated',
      payload: { creditScore: 780 },
    });
  });

  it('entity update  update event', async () => {
    const id = removeAfterTest(pubnub, 'entity', freshId('customer'));
    await createCustomer(id);

    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'update' && (e.message.data as { id?: string }).id === id,
      () => pubnub.dataSync.updateEntity({ id, replace: { '/payload/creditScore': 810 } }).then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'update',
      type: 'entity',
      objectType: 'entity',
      id,
      channelOneOf: [id],
      className: ENTITY_CLASS_CUSTOMER,
      classLevel: 'SubKey',
    });
    assertEventEntityData(event.message.data as PubNub.DataSyncEntityData, {
      id,
      payload: { creditScore: 810 },
    });
  });

  it('entity delete - delete event with only id, deletedAt', async () => {
    const id = removeAfterTest(pubnub, 'entity', freshId('customer'));
    await createCustomer(id);

    const event = await captureEvent(
      pubnub,
      [id],
      (e) => e.message.event === 'delete' && (e.message.data as { id?: string }).id === id,
      () => pubnub.dataSync.removeEntity({ id }).then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'delete',
      type: 'entity',
      objectType: 'entity',
      id,
      channelOneOf: [id],
      className: ENTITY_CLASS_CUSTOMER,
      classLevel: 'SubKey',
    });
    assertEventDeleteData(event.message.data as PubNub.DataSyncDeleteData, id);
  });
});
