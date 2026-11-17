/**
 * DataSync real-time event tests — generic Relationship (`JSREQUESTED_BY`, Customer → LoanQuote).
 *
 * ROUTING RULE: relationship-type events are delivered on the TWO endpoint-entity id channels
 * (`entityAId` AND `entityBId`), NEVER on the relationship's own id. We therefore subscribe to both
 * endpoint ids and assert `channel ∈ {customerId, loanQuoteId}`; `data.id` still equals the rel id.
 * A delete keeps those endpoint ids on the body along with `id` and `deletedAt`.
 *
 */

import assert from 'node:assert';

import type PubNub from 'pubnub';

import {
  CLASS_VERSION,
  ENTITY_CLASS_CUSTOMER,
  ENTITY_CLASS_LOAN_QUOTE,
  RELATIONSHIP_CLASS_REQUESTED_BY,
  assertEventCommon,
  assertEventDeleteData,
  assertEventRelationshipData,
  captureEvent,
  customerPayload,
  freshId,
  freshPubNub,
  removeAfterTest,
  loanQuotePayload,
  safeRemove,
} from '../../support/datasync-live-helpers';
import { createWithRunUniqueId } from '../../support/retry';

describe('endpoints/data_sync/events.relationship: DataSync events Relationship REQUESTED_BY', function () {
  this.timeout(60000);

  let pubnub: ReturnType<typeof freshPubNub>;

  beforeEach(() => {
    pubnub = freshPubNub();
  });

  /** Seed the two endpoint entities a REQUESTED_BY relationship links. */
  async function seedEndpoints(): Promise<{ customerId: string; loanQuoteId: string }> {
    const customerId = removeAfterTest(pubnub, 'entity', freshId('customer'));
    const loanQuoteId = removeAfterTest(pubnub, 'entity', freshId('loanquote'));
    // Both ids come from `freshId`, unique to this run: a 409 on a retry means the first attempt was stored (see retry.ts).
    await createWithRunUniqueId(
      () =>
        pubnub.dataSync.createEntity({
          id: customerId,
          class: ENTITY_CLASS_CUSTOMER,
          data: {
            classVersion: CLASS_VERSION,
            status: 'active',
            payload: customerPayload(customerId),
          },
        }),
      () => pubnub.dataSync.getEntity({ id: customerId }),
      { label: 'createEntity customer' },
    );
    await createWithRunUniqueId(
      () =>
        pubnub.dataSync.createEntity({
          id: loanQuoteId,
          class: ENTITY_CLASS_LOAN_QUOTE,
          data: {
            classVersion: CLASS_VERSION,
            status: 'active',
            payload: loanQuotePayload(loanQuoteId),
          },
        }),
      () => pubnub.dataSync.getEntity({ id: loanQuoteId }),
      { label: 'createEntity loanQuote' },
    );
    return { customerId, loanQuoteId };
  }

  // The id comes from `freshId` and is unique to this run, so a 409 on a retry means the first attempt was stored (see retry.ts).
  const createRel = (relId: string, customerId: string, loanQuoteId: string, linkedAt = '2026-07-06T10:00:00.000Z') =>
    createWithRunUniqueId(
      () =>
        pubnub.dataSync.createRelationship({
          id: relId,
          class: RELATIONSHIP_CLASS_REQUESTED_BY,
          entityAId: customerId,
          entityBId: loanQuoteId,
          data: {
            classVersion: CLASS_VERSION,
            status: 'active',
            payload: { linkedAt },
          },
        }),
      () => pubnub.dataSync.getRelationship({ id: relId }),
      { label: 'createRelationship' },
    ).then(() => undefined);

  it('relationship create create event delivered on endpoint channels', async () => {
    const { customerId, loanQuoteId } = await seedEndpoints();
    const relId = removeAfterTest(pubnub, 'relationship', freshId('requested-by'));
    try {
      const event = await captureEvent(
        pubnub,
        [customerId, loanQuoteId],
        (e) => e.message.event === 'create' && (e.message.data as { id?: string }).id === relId,
        () => createRel(relId, customerId, loanQuoteId),
      );

      assertEventCommon(event, {
        event: 'create',
        type: 'relationship',
        objectType: 'relationship',
        id: relId,
        channelOneOf: [customerId, loanQuoteId],
        className: RELATIONSHIP_CLASS_REQUESTED_BY,
        classLevel: 'SubKey',
      });
      assertEventRelationshipData(event.message.data as PubNub.DataSyncRelationshipData, {
        id: relId,
        entityAId: customerId,
        entityBId: loanQuoteId,
        status: 'active',
        payload: { linkedAt: '2026-07-06T10:00:00.000Z' },
      });
    } finally {
      await safeRemove(() => pubnub.dataSync.removeRelationship({ id: relId }));
    }
  });

  it('relationship set (PUT)  "update" event', async () => {
    const { customerId, loanQuoteId } = await seedEndpoints();
    const relId = removeAfterTest(pubnub, 'relationship', freshId('requested-by'));
    await createRel(relId, customerId, loanQuoteId);
    try {
      const event = await captureEvent(
        pubnub,
        [customerId, loanQuoteId],
        (e) => e.message.event === 'update' && (e.message.data as { id?: string }).id === relId,
        () =>
          pubnub.dataSync
            .setRelationship({
              id: relId,
              entityAId: customerId,
              entityBId: loanQuoteId,
              data: {
                classVersion: CLASS_VERSION,
                status: 'active',
                payload: { linkedAt: '2026-08-01T00:00:00.000Z' },
              },
            })
            .then(() => undefined),
      );

      assertEventCommon(event, {
        event: 'update',
        type: 'relationship',
        objectType: 'relationship',
        id: relId,
        channelOneOf: [customerId, loanQuoteId],
        className: RELATIONSHIP_CLASS_REQUESTED_BY,
        classLevel: 'SubKey',
      });
      assertEventRelationshipData(event.message.data as PubNub.DataSyncRelationshipData, {
        id: relId,
        entityAId: customerId,
        entityBId: loanQuoteId,
        payload: { linkedAt: '2026-08-01T00:00:00.000Z' },
      });
    } finally {
      await safeRemove(() => pubnub.dataSync.removeRelationship({ id: relId }));
    }
  });

  it('relationship update (PATCH) event', async () => {
    const { customerId, loanQuoteId } = await seedEndpoints();
    const relId = removeAfterTest(pubnub, 'relationship', freshId('requested-by'));
    await createRel(relId, customerId, loanQuoteId);
    try {
      const event = await captureEvent(
        pubnub,
        [customerId, loanQuoteId],
        (e) => e.message.event === 'update' && (e.message.data as { id?: string }).id === relId,
        () =>
          pubnub.dataSync
            .updateRelationship({ id: relId, replace: { '/payload/linkedAt': '2026-09-01T00:00:00.000Z' } })
            .then(() => undefined),
      );

      assertEventCommon(event, {
        event: 'update',
        type: 'relationship',
        objectType: 'relationship',
        id: relId,
        channelOneOf: [customerId, loanQuoteId],
        className: RELATIONSHIP_CLASS_REQUESTED_BY,
        classLevel: 'SubKey',
      });
      assertEventRelationshipData(event.message.data as PubNub.DataSyncRelationshipData, {
        id: relId,
        entityAId: customerId,
        entityBId: loanQuoteId,
        payload: { linkedAt: '2026-09-01T00:00:00.000Z' },
      });
    } finally {
      await safeRemove(() => pubnub.dataSync.removeRelationship({ id: relId }));
    }
  });

  it('relationship delete event with {id, deletedAt, entityAId, entityBId}', async () => {
    const { customerId, loanQuoteId } = await seedEndpoints();
    const relId = removeAfterTest(pubnub, 'relationship', freshId('requested-by'));
    await createRel(relId, customerId, loanQuoteId);

    const event = await captureEvent(
      pubnub,
      [customerId, loanQuoteId],
      (e) => e.message.event === 'delete' && (e.message.data as { id?: string }).id === relId,
      () => pubnub.dataSync.removeRelationship({ id: relId }).then(() => undefined),
    );

    assertEventCommon(event, {
      event: 'delete',
      type: 'relationship',
      objectType: 'relationship',
      id: relId,
      channelOneOf: [customerId, loanQuoteId],
      className: RELATIONSHIP_CLASS_REQUESTED_BY,
      classLevel: 'SubKey',
    });
    assertEventDeleteData(event.message.data as PubNub.DataSyncDeleteData, relId, {
      entityAId: customerId,
      entityBId: loanQuoteId,
    });
  });

  it('routing proof — a subscriber to the relationship id receives nothing', async () => {
    const { customerId, loanQuoteId } = await seedEndpoints();
    const relId = removeAfterTest(pubnub, 'relationship', freshId('requested-by'));
    try {
      // Subscribing ONLY to the relationship's own id must time out — the event routes to the
      // endpoint channels, never the relationship id.
      await assert.rejects(
        () =>
          captureEvent(
            pubnub,
            [relId],
            (e) => (e.message.data as { id?: string }).id === relId,
            () => createRel(relId, customerId, loanQuoteId),
            { timeoutMs: 8000 },
          ),
        /Timed out/,
        'relationship event must not arrive on the relationship id channel',
      );
    } finally {
      await safeRemove(() => pubnub.dataSync.removeRelationship({ id: relId }));
    }
  });
});
