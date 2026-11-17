/**
 * Helpers of the live DataSync event and projection tests (endpoints/data_sync/*.test.ts). Moved here from the mocked
 * test folder: the nock-mocked DataSync tests never used them. Keys come from the tier's env loading (the `datasync` role).
 */
import assert from 'node:assert';
import PubNub from 'pubnub';
import { createClient } from './clients';
import { keysOf } from './env';
import { cleanupAfterTest } from './cleanup';
import { createWithRunUniqueId } from './retry';
import { uniqueSuffix } from './util';
import { connected } from './wait';

// --------------------------------------------------------
// ------------------- Config & basics --------------------
// --------------------------------------------------------

/** Keys of the `datasync` role (DS_* variables or the tier's env file). Read on use, so a missing keyset fails the test that needs it. */
export const dataSyncKeyset = (): { subscribeKey: string; publishKey: string; secretKey: string } => keysOf('datasync');

/** User id of every DataSync test client. */
export const DATA_SYNC_USER_ID = 'dsjs';

/** Entity/relationship class schema version provisioned on this subkey. */
export const CLASS_VERSION = 1;

/** Provisioned class names on this subkey — `JS`-prefixed, so this SDK's classes stay its own. */
export const ENTITY_CLASS_CUSTOMER = 'JSCustomer';
export const ENTITY_CLASS_LOAN_QUOTE = 'JSLoanQuote';
export const RELATIONSHIP_CLASS_REQUESTED_BY = 'JSREQUESTED_BY';

/** Class the service pins for the typed `/memberships` endpoints (never sent by the client). */
export const RELATIONSHIP_CLASS_MEMBERSHIP = 'Membership';

/**
 * Fresh client per call on the datasync keyset, with the secret key. The root hook destroys it after the test.
 * Pass `secretKey: undefined` for a token-only client.
 */
export function freshPubNub(overrides: Record<string, unknown> = {}): PubNub {
  // `useRequestId: false` is an internal switch the public type does not declare.
  return createClient('datasync', DATA_SYNC_USER_ID, {
    secretKey: dataSyncKeyset().secretKey,
    useRequestId: false,
    ...overrides,
  } as Partial<PubNub.PubNubConfiguration>);
}

/**
 * Like `freshPubNub`, but NOT tracked: for a client built in a `before` hook, which must outlive the first test. The caller
 * destroys it in `after`.
 */
export function untrackedPubNub(overrides: Record<string, unknown> = {}): PubNub {
  return new PubNub({
    ...dataSyncKeyset(),
    userId: DATA_SYNC_USER_ID,
    useRequestId: false,
    ...overrides,
  } as PubNub.PubNubConfiguration);
}

/**
 * Client-supplied id for an object this run creates: `<prefix>-<uniqueSuffix()>`, for example `customer-mh3k9x2a4f7q1z`. The
 * suffix (support/util.ts) is the time in base 36 plus 6 random base-36 characters, so it cannot meet an object that earlier
 * runs left on the keyset. Underscore-free (the service rejects `_` with SYN-0004), lower-case apart from the caller's prefix, and
 * at most 28 characters with the prefixes used here (the longest id known to be accepted is 28 characters).
 * `createWithRunUniqueId` (retry.ts) relies on this: a 409 on a retry may only mean that our own first attempt was stored.
 * Register the id with `removeAfterTest` before creating the object, so a red test does not leave it behind.
 */
export function freshId(prefix: string): string {
  return `${prefix}-${uniqueSuffix()}`;
}

/** Per-run marker used to isolate list/filter assertions against a shared live subkey. */
export function runMarker(): string {
  return String(PubNub.generateUUID())
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 12);
}

/** What `removeAfterTest` knows how to remove. */
export type DataSyncKind = 'entity' | 'user' | 'channel' | 'relationship' | 'membership';

/**
 * Registers the removal of an object THIS test creates and returns its id, so it reads `const id = removeAfterTest(pubnub, 'entity', freshId('customer'))`.
 * Call it before the create: the root `afterEach` (hooks.ts, `support/cleanup.ts`) then removes the object whether the test passed,
 * failed on an assertion, or failed in the create itself (a create whose answer was lost can still have stored the object). The
 * removals run newest first, so a relationship or membership goes before the entities it links, and a 404 (the test removed it itself,
 * or it was never stored) is expected. It only ever removes the ids registered here, which this run generated.
 */
export function removeAfterTest(pn: PubNub, kind: DataSyncKind, id: string): string {
  const remove: Record<DataSyncKind, () => Promise<unknown>> = {
    entity: () => pn.dataSync.removeEntity({ id }),
    user: () => pn.dataSync.removeUser({ id }),
    channel: () => pn.dataSync.removeChannel({ id }),
    relationship: () => pn.dataSync.removeRelationship({ id }),
    membership: () => pn.dataSync.removeMembership({ id }),
  };
  cleanupAfterTest(`remove ${kind} ${id}`, remove[kind]);
  return id;
}

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
  obj: PubNub.DataSync.EntityObject,
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
  obj: PubNub.DataSync.RelationshipObject,
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
  obj: PubNub.DataSync.UserObject | PubNub.DataSync.ChannelObject,
  expected: { id: string; entityClassVersion: number; status?: string; payload?: Record<string, unknown> },
): void {
  assert.strictEqual(obj.id, expected.id, 'id');
  assert.strictEqual(obj.entityClassVersion, expected.entityClassVersion, 'entityClassVersion');
  if (expected.status !== undefined) assert.strictEqual(obj.status, expected.status, 'status');
  assertServerTimestamps(obj);
  if (expected.payload) assertPayloadContains(obj.payload, expected.payload);
}

export function assertMembershipObject(
  obj: PubNub.DataSync.MembershipObject,
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
// swallows errors (already-removed objects 404, which is fine for cleanup). The id is also registered with `removeAfterTest`, so a
// test that forgets `dispose()` does not leave the object behind.

export type Fixture<T> = { obj: T; dispose: () => Promise<void> };

export async function createCustomerEntity(
  pn: PubNub,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<PubNub.DataSync.EntityObject>> {
  const id = removeAfterTest(pn, 'entity', freshId('customer'));
  const res = await createWithRunUniqueId(
    () =>
      pn.dataSync.createEntity({
        id,
        class: ENTITY_CLASS_CUSTOMER,
        data: {
          classVersion: CLASS_VERSION,
          status: 'active',
          payload: customerPayload(id, overrides),
        },
      }),
    () => pn.dataSync.getEntity({ id }),
    { label: 'createEntity' },
  );
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeEntity({ id: res.data.id })) };
}

export async function createLoanQuoteEntity(
  pn: PubNub,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<PubNub.DataSync.EntityObject>> {
  const id = removeAfterTest(pn, 'entity', freshId('loanquote'));
  const res = await createWithRunUniqueId(
    () =>
      pn.dataSync.createEntity({
        id,
        class: ENTITY_CLASS_LOAN_QUOTE,
        data: {
          classVersion: CLASS_VERSION,
          status: 'active',
          payload: loanQuotePayload(id, overrides),
        },
      }),
    () => pn.dataSync.getEntity({ id }),
    { label: 'createEntity' },
  );
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeEntity({ id: res.data.id })) };
}

export async function createRequestedByRelationship(
  pn: PubNub,
  customerId: string,
  loanQuoteId: string,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<PubNub.DataSync.RelationshipObject>> {
  const id = removeAfterTest(pn, 'relationship', freshId('requested-by'));
  const res = await createWithRunUniqueId(
    () =>
      pn.dataSync.createRelationship({
        id,
        class: RELATIONSHIP_CLASS_REQUESTED_BY,
        entityAId: customerId,
        entityBId: loanQuoteId,
        data: {
          classVersion: CLASS_VERSION,
          status: 'active',
          payload: { linkedAt: '2026-07-06T10:00:00.000Z', ...overrides },
        },
      }),
    () => pn.dataSync.getRelationship({ id }),
    { label: 'createRelationship' },
  );
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeRelationship({ id: res.data.id })) };
}

export async function createUserObj(
  pn: PubNub,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<PubNub.DataSync.UserObject>> {
  const id = removeAfterTest(pn, 'user', freshId('user'));
  const res = await createWithRunUniqueId(
    () =>
      pn.dataSync.createUser({
        id,
        data: { classVersion: CLASS_VERSION, status: 'active', payload: userPayload(overrides) },
      }),
    () => pn.dataSync.getUser({ id }),
    { label: 'createUser' },
  );
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeUser({ id: res.data.id })) };
}

export async function createChannelObj(
  pn: PubNub,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<PubNub.DataSync.ChannelObject>> {
  const id = removeAfterTest(pn, 'channel', freshId('JSchannel'));
  const res = await createWithRunUniqueId(
    () =>
      pn.dataSync.createChannel({
        id,
        data: { classVersion: CLASS_VERSION, status: 'active', payload: channelPayload(overrides) },
      }),
    () => pn.dataSync.getChannel({ id }),
    { label: 'createChannel' },
  );
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeChannel({ id: res.data.id })) };
}

export async function createMembershipObj(
  pn: PubNub,
  userId: string,
  channelId: string,
  overrides: Record<string, unknown> = {},
): Promise<Fixture<PubNub.DataSync.MembershipObject>> {
  const id = removeAfterTest(pn, 'membership', freshId('membership'));
  const res = await createWithRunUniqueId(
    () =>
      pn.dataSync.createMembership({
        id,
        userId,
        channelId,
        data: {
          classVersion: CLASS_VERSION,
          status: 'active',
          payload: { role: 'member', joinedAt: '2026-07-06T10:00:00.000Z', ...overrides },
        },
      }),
    () => pn.dataSync.getMembership({ id }),
    { label: 'createMembership' },
  );
  return { obj: res.data, dispose: () => safeRemove(() => pn.dataSync.removeMembership({ id: res.data.id })) };
}

// --------------------------------------------------------
// ------------------- Event capture ----------------------
// --------------------------------------------------------

/**
 * Subscribe to `channels`, wait until the subscription is connected (the tier's `connected` helper; it replaced a fixed
 * 3 s settle delay), run `trigger`, and resolve with the
 * first DataSync event matching `predicate`. Rejects on timeout or if `trigger` throws. Always cleans
 * up (removes listener + unsubscribes), even on the happy path.
 *
 * Relationship/membership events are delivered on BOTH endpoint-entity id channels, never on the
 * object's own id — so `channels` is an array and the caller subscribes to every relevant channel.
 */
export function captureEvent(
  pn: PubNub,
  channels: string[],
  predicate: (event: PubNub.Subscription.DataSyncObject) => boolean,
  trigger: () => Promise<void>,
  opts: { timeoutMs?: number } = {},
): Promise<PubNub.Subscription.DataSyncObject> {
  const timeoutMs = opts.timeoutMs ?? 20000;

  return new Promise<PubNub.Subscription.DataSyncObject>((resolve, reject) => {
    let settled = false;

    const listener = {
      dataSync: (event: PubNub.Subscription.DataSyncObject) => {
        if (settled || !predicate(event)) return;
        settled = true;
        cleanup();
        resolve(event);
      },
      status: (_status: PubNub.Status | PubNub.StatusEvent) => {
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

    // Register for the connected status BEFORE subscribing: statuses are not replayed.
    const ready = connected(pn, { channels }, { timeout: timeoutMs });
    pn.addListener(listener);
    pn.subscribe({ channels });

    ready.then(trigger).catch((error) => {
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
  event: PubNub.Subscription.DataSyncObject,
  expected: {
    event: 'create' | 'update' | 'delete';
    type: PubNub.DataSyncObjectType;
    objectType: PubNub.DataSyncObjectType;
    id: string;
    channelOneOf: string[];
    className?: string;
    classLevel?: PubNub.DataSyncClassLevel;
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
  data: PubNub.DataSyncEntityData,
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
  data: PubNub.DataSyncRelationshipData,
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
  data: PubNub.DataSyncMembershipData,
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

/**
 * Delete body is trimmed to `{ id, deletedAt? }`, plus the linked ids for a membership
 * (`channelId` / `userId`) or a relationship (`entityAId` / `entityBId`). Pass `links` to require
 * those ids; otherwise every link key must be absent.
 */
export function assertEventDeleteData(
  data: PubNub.DataSyncDeleteData & {
    channelId?: string;
    userId?: string;
    entityAId?: string;
    entityBId?: string;
  },
  id: string,
  links?: { channelId: string; userId: string } | { entityAId: string; entityBId: string },
): void {
  assert.strictEqual(data.id, id, 'delete data.id');
  assert.ok(!('payload' in data), 'no payload on delete');
  assert.ok(!('status' in data), 'no status on delete');
  assert.ok(!('eTag' in data), 'no eTag on delete');
  if (links && 'channelId' in links) {
    assert.strictEqual(data.channelId, links.channelId, 'channelId');
    assert.strictEqual(data.userId, links.userId, 'userId');
    assert.ok(!('entityAId' in data), 'no entityAId on membership delete');
    assert.ok(!('entityBId' in data), 'no entityBId on membership delete');
  } else if (links && 'entityAId' in links) {
    assert.strictEqual(data.entityAId, links.entityAId, 'entityAId');
    assert.strictEqual(data.entityBId, links.entityBId, 'entityBId');
    assert.ok(!('channelId' in data), 'no channelId on relationship delete');
    assert.ok(!('userId' in data), 'no userId on relationship delete');
  } else {
    assert.ok(!('channelId' in data), 'no channelId on delete');
    assert.ok(!('userId' in data), 'no userId on delete');
    assert.ok(!('entityAId' in data), 'no entityAId on delete');
    assert.ok(!('entityBId' in data), 'no entityBId on delete');
  }
  if (data.deletedAt !== undefined) {
    assert.strictEqual(typeof data.deletedAt, 'string', 'deletedAt is ISO string');
    assert.ok(!Number.isNaN(Date.parse(data.deletedAt)), 'deletedAt parses');
  }
}
