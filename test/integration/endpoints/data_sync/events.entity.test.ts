/**
 * DataSync real-time event tests — generic Entity (`JSCustomer`).
 *
 * Entity-type events are delivered on `channel === object.id`, so we subscribe to the (client-supplied)
 * id before creating the entity. `JSCustomer` is a developer-defined class, so the wire carries
 * `className: 'JSCustomer'` / `classLevel: 'SubKey'` and `objectType` stays the wire `'entity'`.
 *
 */

import nock from 'nock';

import type * as Subscription from '../../../../src/core/types/api/subscription';

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
} from './helpers';

describe('DataSync events — Entity Customer', function () {
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

  const createCustomer = (id: string) =>
    pubnub.dataSync
      .createEntity({
        id,
        class: ENTITY_CLASS_CUSTOMER,
        data: {
          classVersion: CLASS_VERSION,
          status: 'active',
          payload: customerPayload(id),
        },
      })
      .then(() => undefined);

  it('entity create - create event', async () => {
    const id = freshId('customer');
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
    assertEventEntityData(event.message.data as Subscription.DataSyncEntityData, {
      id,
      status: 'active',
      payload: { customerId: id, firstName: 'Alice', creditScore: 720, city: 'Pune' },
    });
  });

  it('entity update (PUT) - update event', async () => {
    const id = freshId('customer');
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
    assertEventEntityData(event.message.data as Subscription.DataSyncEntityData, {
      id,
      status: 'updated',
      payload: { creditScore: 780 },
    });
  });

  it('entity update  update event', async () => {
    const id = freshId('customer');
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
    assertEventEntityData(event.message.data as Subscription.DataSyncEntityData, {
      id,
      payload: { creditScore: 810 },
    });
  });

  it('entity delete - delete event with only id, deletedAt', async () => {
    const id = freshId('customer');
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
    assertEventDeleteData(event.message.data as Subscription.DataSyncDeleteData, id);
  });
});
