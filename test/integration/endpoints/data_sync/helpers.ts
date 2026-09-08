import assert from 'assert';

import PubNub from '../../../../src/node/index';
import type * as DataSync from '../../../../src/core/types/api/data-sync';
import type * as Subscription from '../../../../src/core/types/api/subscription';
import type { Status, StatusEvent } from '../../../../src/core/types/api';

// --------------------------------------------------------
// ------------------- Config & basics --------------------
// --------------------------------------------------------

export const DATA_SYNC_KEYSET = {
  subscribeKey: process.env.DS_SUBSCRIBE_KEY ?? '',
  publishKey: process.env.DS_PUBLISH_KEY ?? '',
  secretKey: process.env.DS_SECRET_KEY ?? '',
  userId: 'dsjs',
} as const;

/** Entity/relationship class schema version provisioned on this subkey. */
export const CLASS_VERSION = 1;

/** Provisioned class names on this subkey — `JS`-prefixed, so this SDK's classes stay its own. */
export const ENTITY_CLASS_CUSTOMER = 'JSCustomer';
export const ENTITY_CLASS_LOAN_QUOTE = 'JSLoanQuote';
export const RELATIONSHIP_CLASS_REQUESTED_BY = 'JSREQUESTED_BY';

/** Class the service pins for the typed `/memberships` endpoints (never sent by the client). */
export const RELATIONSHIP_CLASS_MEMBERSHIP = 'Membership';

/** Fresh client per test — no shared mutable state, no cross-test bleed. */
export function freshPubNub(overrides: Record<string, unknown> = {}): PubNub {
  return new PubNub({
    ...DATA_SYNC_KEYSET,
    // @ts-expect-error Force override default value.
    useRequestId: false,
    ...overrides,
  });
}

/** Client-supplied id, underscore-free (service rejects `_` with SYN-0004). */
export function freshId(prefix: string): string {
  return `${prefix}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
}

/** Per-run marker used to isolate list/filter assertions against a shared live subkey. */
export function runMarker(): string {
  return String(PubNub.generateUUID())
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 12);
}

export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Await `fn`, swallowing any error. Use only for cleanup — never in the assertion path. */
export async function safeRemove(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch {
    /* cleanup failures never fail the test */
  }
}

// --------------------------------------------------------
// -------------- Payload templates -----------------------
// --------------------------------------------------------
// Schema-valid, event-safe (single-token strings — see the `+`-encoding caveat in the plan §0.3).

export function customerPayload(id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    customerId: id,
    firstName: 'Alice',
    lastName: 'Verma',
    email: 'alice.verma@acme.test',
    creditScore: 720,
    city: 'Pune',
    ...overrides,
  };
}

export function loanQuotePayload(id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { quoteId: id, make: 'Toyota', model: 'Corolla', price: 25000, ...overrides };
}

export function userPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { firstName: 'Alice', lastName: 'Verma', email: 'alice.verma@acme.test', ...overrides };
}

export function channelPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { name: 'engineering', description: 'engineering', kind: 'public', ...overrides };
}

// --------------------------------------------------------
// ------------- REST common-property asserts -------------
// --------------------------------------------------------

/** Fields present on EVERY persisted DataSync object (entity/user/channel/relationship/membership). */
function assertServerTimestamps(obj: { createdAt?: string; updatedAt?: string; eTag?: string }): void {
  assert.strictEqual(typeof obj.createdAt, 'string', 'createdAt is an ISO string');
  assert.strictEqual(typeof obj.updatedAt, 'string', 'updatedAt is an ISO string');
  assert.ok(!Number.isNaN(Date.parse(obj.createdAt!)), 'createdAt parses as a date');
  assert.ok(!Number.isNaN(Date.parse(obj.updatedAt!)), 'updatedAt parses as a date');
  assert.strictEqual(typeof obj.eTag, 'string', 'eTag is a string');
  assert.ok(obj.eTag!.length > 0, 'eTag non-empty');
}

/** Assert each expected key/value appears in the actual payload (allows extra server fields). */
export function assertPayloadContains(
  actual: Record<string, unknown> | undefined,
  expected: Record<string, unknown>,
): void {
  assert.ok(actual != null, 'payload present');
  for (const [k, v] of Object.entries(expected)) {
    assert.deepStrictEqual(actual![k], v, `payload.${k}`);
  }
}

export function assertEntityObject(
  obj: DataSync.EntityObject,
  expected: {
    id: string;
    entityClass: string;
    entityClassVersion: number;
    status?: string;
    payload?: Record<string, unknown>;
  },
): void {
  assert.strictEqual(obj.id, expected.id, 'entity id');
  assert.strictEqual(obj.entityClass, expected.entityClass, 'entityClass');
  assert.strictEqual(obj.entityClassVersion, expected.entityClassVersion, 'entityClassVersion');
  if (expected.status !== undefined) assert.strictEqual(obj.status, expected.status, 'status');
  assertServerTimestamps(obj);
  if (expected.payload) assertPayloadContains(obj.payload, expected.payload);
}

export function assertRelationshipObject(
  obj: DataSync.RelationshipObject,
  expected: {
    id: string;
    entityAId: string;
    entityBId: string;
    relationshipClass: string;
    relationshipClassVersion: number;
    status?: string;
    payload?: Record<string, unknown>;
  },
): void {
  assert.strictEqual(obj.id, expected.id, 'relationship id');
  assert.strictEqual(obj.entityAId, expected.entityAId, 'entityAId');
  assert.strictEqual(obj.entityBId, expected.entityBId, 'entityBId');
  assert.strictEqual(obj.relationshipClass, expected.relationshipClass, 'relationshipClass');
  assert.strictEqual(obj.relationshipClassVersion, expected.relationshipClassVersion, 'relationshipClassVersion');
  if (expected.status !== undefined) assert.strictEqual(obj.status, expected.status, 'status');
  assertServerTimestamps(obj);
  if (expected.payload) assertPayloadContains(obj.payload, expected.payload);
}

/** UserObject/ChannelObject share the shape: id + entityClassVersion + status? + payload + timestamps. */
export function assertUserOrChannelObject(
  obj: DataSync.UserObject | DataSync.ChannelObject,
  expected: { id: string; entityClassVersion: number; status?: string; payload?: Record<string, unknown> },
): void {
  assert.strictEqual(obj.id, expected.id, 'id');
  assert.strictEqual(obj.entityClassVersion, expected.entityClassVersion, 'entityClassVersion');
  if (expected.status !== undefined) assert.strictEqual(obj.status, expected.status, 'status');
  assertServerTimestamps(obj);
  if (expected.payload) assertPayloadContains(obj.payload, expected.payload);
}

export function assertMembershipObject(
  obj: DataSync.MembershipObject,
  expected: {
    id: string;
    channelId: string;
    userId: string;
    /** Defaults to `Membership` — the class the service pins for `/memberships`. */
    relationshipClass?: string;
    /** Defaults to the provisioned {@link CLASS_VERSION}. */
    relationshipClassVersion?: number;
    status?: string;
    payload?: Record<string, unknown>;
  },
): void {
  assert.strictEqual(obj.id, expected.id, 'membership id');
  // REST response axis: the server returns `channelId` / `userId` (not entityAId/entityBId).
  assert.strictEqual(obj.channelId, expected.channelId, 'channelId');
  assert.strictEqual(obj.userId, expected.userId, 'userId');
  // `MembershipResource` requires the class identity on every response (openapi/v4-data.yaml).
  assert.strictEqual(
    obj.relationshipClass,
    expected.relationshipClass ?? RELATIONSHIP_CLASS_MEMBERSHIP,
    'relationshipClass',
  );
  assert.strictEqual(
    obj.relationshipClassVersion,
    expected.relationshipClassVersion ?? CLASS_VERSION,
    'relationshipClassVersion',
  );
  if (expected.status !== undefined) assert.strictEqual(obj.status, expected.status, 'status');
  assertServerTimestamps(obj);
  if (expected.payload) assertPayloadContains(obj.payload, expected.payload);
}

// --------------------------------------------------------
// -------------- REST fixture factories ------------------
// --------------------------------------------------------
// Each factory creates a valid object and returns `{ obj, dispose }`. `dispose()` is idempotent and
// swallows errors (already-removed objects 404, which is fine for cleanup).

export type Fixture<T> = { obj: T; dispose: () => Promise<void> };

export async function createCustomerEntity(
  pn: PubNub,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<DataSync.EntityObject>> {
  const id = freshId('customer');
  const res = await pn.dataSync.createEntity({
    id,
    class: ENTITY_CLASS_CUSTOMER,
    data: {
      classVersion: CLASS_VERSION,
      status: 'active',
      payload: customerPayload(id, overrides),
    },
  });
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeEntity({ id: res.data.id })) };
}

export async function createLoanQuoteEntity(
  pn: PubNub,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<DataSync.EntityObject>> {
  const id = freshId('loanquote');
  const res = await pn.dataSync.createEntity({
    id,
    class: ENTITY_CLASS_LOAN_QUOTE,
    data: {
      classVersion: CLASS_VERSION,
      status: 'active',
      payload: loanQuotePayload(id, overrides),
    },
  });
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeEntity({ id: res.data.id })) };
}

export async function createRequestedByRelationship(
  pn: PubNub,
  customerId: string,
  loanQuoteId: string,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<DataSync.RelationshipObject>> {
  const id = freshId('requested-by');
  const res = await pn.dataSync.createRelationship({
    id,
    class: RELATIONSHIP_CLASS_REQUESTED_BY,
    entityAId: customerId,
    entityBId: loanQuoteId,
    data: {
      classVersion: CLASS_VERSION,
      status: 'active',
      payload: { linkedAt: '2026-07-06T10:00:00.000Z', ...overrides },
    },
  });
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeRelationship({ id: res.data.id })) };
}

export async function createUserObj(
  pn: PubNub,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<DataSync.UserObject>> {
  const id = freshId('user');
  const res = await pn.dataSync.createUser({
    id,
    data: { classVersion: CLASS_VERSION, status: 'active', payload: userPayload(overrides) },
  });
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeUser({ id: res.data.id })) };
}

export async function createChannelObj(
  pn: PubNub,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<DataSync.ChannelObject>> {
  const id = freshId('JSchannel');
  const res = await pn.dataSync.createChannel({
    id,
    data: { classVersion: CLASS_VERSION, status: 'active', payload: channelPayload(overrides) },
  });
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeChannel({ id: res.data.id })) };
}

export async function createMembershipObj(
  pn: PubNub,
  userId: string,
  channelId: string,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<DataSync.MembershipObject>> {
  const id = freshId('membership');
  const res = await pn.dataSync.createMembership({
    id,
    userId,
    channelId,
    data: {
      classVersion: CLASS_VERSION,
      status: 'active',
      payload: { role: 'member', joinedAt: '2026-07-06T10:00:00.000Z', ...overrides },
    },
  });
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeMembership({ id: res.data.id })) };
}

// --------------------------------------------------------
// ------------------- Event capture ----------------------
// --------------------------------------------------------

/**
 * Subscribe to `channels`, wait for the connection to settle, run `trigger`, and resolve with the
 * first DataSync event matching `predicate`. Rejects on timeout or if `trigger` throws. Always cleans
 * up (removes listener + unsubscribes), even on the happy path.
 *
 * Relationship/membership events are delivered on BOTH endpoint-entity id channels, never on the
 * object's own id — so `channels` is an array and the caller subscribes to every relevant channel.
 */
export function captureEvent(
  pn: PubNub,
  channels: string[],
  predicate: (event: Subscription.DataSyncObject) => boolean,
  trigger: () => Promise<void>,
  opts: { settleMs?: number; timeoutMs?: number } = {},
): Promise<Subscription.DataSyncObject> {
  const settleMs = opts.settleMs ?? 3000;
  const timeoutMs = opts.timeoutMs ?? 20000;

  return new Promise<Subscription.DataSyncObject>((resolve, reject) => {
    let settled = false;

    const listener = {
      dataSync: (event: Subscription.DataSyncObject) => {
        if (settled || !predicate(event)) return;
        settled = true;
        cleanup();
        resolve(event);
      },
      status: (_status: Status | StatusEvent) => {
        /* connection lifecycle — not asserted here */
      },
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`Timed out waiting for DataSync event on channels [${channels.join(', ')}].`));
    }, timeoutMs);

    function cleanup(): void {
      clearTimeout(timer);
      pn.removeListener(listener);
      pn.unsubscribe({ channels });
    }

    pn.addListener(listener);
    pn.subscribe({ channels });

    delay(settleMs)
      .then(trigger)
      .catch((error) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      });
  });
}

// --------------------------------------------------------
// -------------- Event-shape assertions ------------------
// --------------------------------------------------------

/**
 * Class identity is reported once, on the event (`message.className` / `classLevel` /
 * `classVersion`) — never duplicated into `message.data`. Guards against the duplication regressing.
 */
function assertNoDuplicatedClassFields(data: object): void {
  assert.ok(!('entityClass' in data), 'no data.entityClass');
  assert.ok(!('entityClassVersion' in data), 'no data.entityClassVersion');
  assert.ok(!('relationshipClass' in data), 'no data.relationshipClass');
  assert.ok(!('relationshipClassVersion' in data), 'no data.relationshipClassVersion');
}

/** Assert the fields common to every parsed DataSync event. */
export function assertEventCommon(
  event: Subscription.DataSyncObject,
  expected: {
    event: 'create' | 'update' | 'delete';
    type: Subscription.DataSyncObjectType;
    objectType: Subscription.DataSyncNormalizedType;
    id: string;
    channelOneOf: string[];
    className?: string;
    classLevel?: Subscription.DataSyncClassLevel;
  },
): void {
  assert.strictEqual(event.message.source, 'data-sync', 'source');
  assert.strictEqual(event.message.event, expected.event, 'event');
  assert.strictEqual(event.message.type, expected.type, 'wire type');
  assert.strictEqual(event.message.objectType, expected.objectType, 'objectType');
  assert.strictEqual(event.message.version, '1.0', 'payload version');
  assert.ok(expected.channelOneOf.includes(event.channel), `channel ∈ [${expected.channelOneOf.join(', ')}]`);
  assert.strictEqual((event.message.data as { id?: string }).id, expected.id, 'data.id');
  assert.ok(event.timetoken, 'timetoken present');
  assert.strictEqual(typeof event.timetoken, 'string', 'timetoken is string');
  if (expected.className !== undefined) assert.strictEqual(event.message.className, expected.className, 'className');
  if (expected.classLevel !== undefined)
    assert.strictEqual(event.message.classLevel, expected.classLevel, 'classLevel');
  // classVersion is a parsed int, never NaN, when present.
  if (event.message.classVersion !== undefined)
    assert.strictEqual(event.message.classVersion, CLASS_VERSION, 'classVersion');
  assertNoDuplicatedClassFields(event.message.data);
}

/** For create/update: assert the full non-delete entity data body. */
export function assertEventEntityData(
  data: Subscription.DataSyncEntityData,
  exp: { id: string; status?: string; payload?: Record<string, unknown> },
): void {
  assert.strictEqual(data.id, exp.id, 'data.id');
  assert.strictEqual(typeof data.createdAt, 'string', 'data.createdAt');
  assert.strictEqual(typeof data.updatedAt, 'string', 'data.updatedAt');
  assert.strictEqual(typeof data.eTag, 'string', 'data.eTag');
  assert.strictEqual(typeof data.expiresAt, 'string', 'data.expiresAt');
  if (exp.status !== undefined) assert.strictEqual(data.status, exp.status, 'data.status');
  assertNoDuplicatedClassFields(data);
  if (exp.payload) assertPayloadContains(data.payload as Record<string, unknown>, exp.payload);
}

/** For create/update: assert the full non-delete relationship data body. */
export function assertEventRelationshipData(
  data: Subscription.DataSyncRelationshipData,
  exp: {
    id: string;
    entityAId: string;
    entityBId: string;
    status?: string;
    payload?: Record<string, unknown>;
  },
): void {
  assert.strictEqual(data.id, exp.id, 'data.id');
  assert.strictEqual(data.entityAId, exp.entityAId, 'entityAId');
  assert.strictEqual(data.entityBId, exp.entityBId, 'entityBId');
  assert.strictEqual(typeof data.createdAt, 'string', 'createdAt');
  assert.strictEqual(typeof data.updatedAt, 'string', 'updatedAt');
  assert.strictEqual(typeof data.eTag, 'string', 'eTag');
  if (exp.status !== undefined) assert.strictEqual(data.status, exp.status, 'status');
  assertNoDuplicatedClassFields(data);
  if (exp.payload) assertPayloadContains(data.payload as Record<string, unknown>, exp.payload);
}

/**
 * For create/update: assert the full non-delete membership data body.
 *
 * A membership is stored as a relationship, but its event body names the endpoints semantically
 * (`channelId` / `userId`) — the same axis the REST `MembershipObject` uses.
 */
export function assertEventMembershipData(
  data: Subscription.DataSyncMembershipData,
  exp: {
    id: string;
    channelId: string;
    userId: string;
    status?: string;
    payload?: Record<string, unknown>;
  },
): void {
  assert.strictEqual(data.id, exp.id, 'data.id');
  assert.strictEqual(data.channelId, exp.channelId, 'channelId');
  assert.strictEqual(data.userId, exp.userId, 'userId');
  // The retired relationship axis must not come back alongside the semantic one.
  assert.ok(!('entityAId' in data), 'no entityAId on a membership event');
  assert.ok(!('entityBId' in data), 'no entityBId on a membership event');
  assert.strictEqual(typeof data.createdAt, 'string', 'createdAt');
  assert.strictEqual(typeof data.updatedAt, 'string', 'updatedAt');
  assert.strictEqual(typeof data.eTag, 'string', 'eTag');
  if (exp.status !== undefined) assert.strictEqual(data.status, exp.status, 'status');
  assertNoDuplicatedClassFields(data);
  if (exp.payload) assertPayloadContains(data.payload as Record<string, unknown>, exp.payload);
}

/** Delete body is trimmed to `{ id, deletedAt? }` only. */
export function assertEventDeleteData(data: Subscription.DataSyncDeleteData, id: string): void {
  assert.strictEqual(data.id, id, 'delete data.id');
  assert.ok(!('payload' in data), 'no payload on delete');
  assert.ok(!('status' in data), 'no status on delete');
  assert.ok(!('entityAId' in data), 'no entityAId on delete');
  assert.ok(!('entityBId' in data), 'no entityBId on delete');
  assert.ok(!('channelId' in data), 'no channelId on delete');
  assert.ok(!('userId' in data), 'no userId on delete');
  assert.ok(!('eTag' in data), 'no eTag on delete');
  if (data.deletedAt !== undefined) {
    assert.strictEqual(typeof data.deletedAt, 'string', 'deletedAt is ISO string');
    assert.ok(!Number.isNaN(Date.parse(data.deletedAt)), 'deletedAt parses');
  }
}
