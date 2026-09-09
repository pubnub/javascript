/**
 * DataSync real-time event tests — generic Relationship (`JSREQUESTED_BY`, Customer → LoanQuote).
 *
 * ROUTING RULE: relationship-type events are delivered on the TWO endpoint-entity id channels
 * (`entityAId` AND `entityBId`), NEVER on the relationship's own id. We therefore subscribe to both
 * endpoint ids and assert `channel ∈ {customerId, loanQuoteId}`; `data.id` still equals the rel id.
 *
 */

import assert from 'assert';
import nock from 'nock';

import type * as Subscription from '../../../../src/core/types/api/subscription';

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
  loanQuotePayload,
  safeRemove,
} from './helpers';

describe('DataSync events Relationship REQUESTED_BY', function () {
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

  /** Seed the two endpoint entities a REQUESTED_BY relationship links. */
  async function seedEndpoints(): Promise<{ customerId: string; loanQuoteId: string }> {
    const customerId = freshId('customer');
    const loanQuoteId = freshId('loanquote');
    await pubnub.dataSync.createEntity({
      id: customerId,
      class: ENTITY_CLASS_CUSTOMER,
      data: {
        classVersion: CLASS_VERSION,
        status: 'active',
        payload: customerPayload(customerId),
      },
    });
    await pubnub.dataSync.createEntity({
      id: loanQuoteId,
      class: ENTITY_CLASS_LOAN_QUOTE,
      data: {
        classVersion: CLASS_VERSION,
        status: 'active',
        payload: loanQuotePayload(loanQuoteId),
      },
    });
    return { customerId, loanQuoteId };
  }

  const createRel = (relId: string, customerId: string, loanQuoteId: string, linkedAt = '2026-07-06T10:00:00.000Z') =>
    pubnub.dataSync
      .createRelationship({
        id: relId,
        class: RELATIONSHIP_CLASS_REQUESTED_BY,
        entityAId: customerId,
        entityBId: loanQuoteId,
        data: {
          classVersion: CLASS_VERSION,
          status: 'active',
          payload: { linkedAt },
        },
      })
      .then(() => undefined);

  it('relationship create create event delivered on endpoint channels', async () => {
    const { customerId, loanQuoteId } = await seedEndpoints();
    const relId = freshId('requested-by');
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
      assertEventRelationshipData(event.message.data as Subscription.DataSyncRelationshipData, {
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
    const relId = freshId('requested-by');
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
      assertEventRelationshipData(event.message.data as Subscription.DataSyncRelationshipData, {
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
    const relId = freshId('requested-by');
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
      assertEventRelationshipData(event.message.data as Subscription.DataSyncRelationshipData, {
        id: relId,
        entityAId: customerId,
        entityBId: loanQuoteId,
        payload: { linkedAt: '2026-09-01T00:00:00.000Z' },
      });
    } finally {
      await safeRemove(() => pubnub.dataSync.removeRelationship({ id: relId }));
    }
  });

  it('relationship delete  delete event with only {id, deletedAt}', async () => {
    const { customerId, loanQuoteId } = await seedEndpoints();
    const relId = freshId('requested-by');
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
    assertEventDeleteData(event.message.data as Subscription.DataSyncDeleteData, relId);
  });

  it('routing proof — a subscriber to the relationship id receives nothing', async () => {
    const { customerId, loanQuoteId } = await seedEndpoints();
    const relId = freshId('requested-by');
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
