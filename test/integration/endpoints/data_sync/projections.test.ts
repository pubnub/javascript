/**
 * DataSync projection tests — the `admin` projection vs the base (`__default__`) projection.
 *
 * Real-time coverage uses the entity API:
 *   pubnub.dataSyncEntity('customer.*').subscription()
 *   pubnub.dataSyncEntity('customer.*').subscription({ projection: 'admin' })
 * `{ projection: 'admin' }` observes `__admin__{id}` — the prefix is never part of the entity id.
 *
 * PROJECTION MODEL provisioned on this subkey (verified against the live backend):
 *
 *   | class          | `__default__` payload fields                             | `admin` payload fields |
 *   |----------------|----------------------------------------------------------|------------------------|
 *   | `JSCustomer`     | customerId, firstName, lastName, email, creditScore, city | same **minus** `email`, **plus** `private` |
 *   | `JSLoanQuote`    | quoteId, make, model, price                              | quoteId, `private`     |
 *   | `JSREQUESTED_BY` | linkedAt                                                 | linkedAt, `private`    |
 *
 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../../src/node/index';
import type * as PAM from '../../../../src/core/types/api/access-manager';
import type * as Subscription from '../../../../src/core/types/api/subscription';
import type { Status, StatusEvent } from '../../../../src/core/types/api';

import {
  CLASS_VERSION,
  DATA_SYNC_KEYSET,
  ENTITY_CLASS_CUSTOMER,
  ENTITY_CLASS_LOAN_QUOTE,
  RELATIONSHIP_CLASS_REQUESTED_BY,
  assertEventCommon,
  assertEventDeleteData,
  customerPayload,
  delay,
  freshPubNub,
  loanQuotePayload,
  safeRemove,
} from './helpers';

// --------------------------------------------------------
// ------------------- Projection facts -------------------
// --------------------------------------------------------

/** Projection names are bare (`admin`); the `__…__` form is reserved for `__default__`. */
const PROJECTION_ADMIN = 'admin';
const PROJECTION_DEFAULT = '__default__';

/** A projection name the subkey does not define — the service rejects the whole token on use. */
const PROJECTION_UNKNOWN = 'nosuchprojection';

/** Real-time mirror-channel prefix for the `admin` projection. */
const ADMIN_CHANNEL_PREFIX = '__admin__';

/** Projection mirror channel for a DataSync object id. */
const adminChannel = (id: string): string => `${ADMIN_CHANNEL_PREFIX}${id}`;

/** Exact payload key sets per class per projection (see the table in the file header). */
const CUSTOMER_DEFAULT_FIELDS = ['customerId', 'firstName', 'lastName', 'email', 'creditScore', 'city'] as const;
const CUSTOMER_ADMIN_FIELDS = ['customerId', 'firstName', 'lastName', 'creditScore', 'city', 'private'] as const;
const LOAN_QUOTE_DEFAULT_FIELDS = ['quoteId', 'make', 'model', 'price'] as const;
const LOAN_QUOTE_ADMIN_FIELDS = ['quoteId', 'private'] as const;
const REQUESTED_BY_DEFAULT_FIELDS = ['linkedAt'] as const;
const REQUESTED_BY_ADMIN_FIELDS = ['linkedAt', 'private'] as const;

/** Distinct per-class secrets so a leak is attributable to the object it leaked from. */
const CUSTOMER_SECRET = 'customer-private-value';
const LOAN_QUOTE_SECRET = 'loanquote-private-value';
const REQUESTED_BY_SECRET = 'requestedby-private-value';

const LINKED_AT = '2026-07-06T10:00:00.000Z';

/** Minutes. Comfortably longer than the slowest case here, short enough to age out fast. */
const TOKEN_TTL = 60;

/**
 * Real-time eventing was only observed for `JSCustomer` on this subkey — probed 2026-08-25: creating a
 * `JSLoanQuote` entity and a `JSREQUESTED_BY` relationship emitted nothing within 10s on either the id
 * channel or the `__admin__…` mirror, while an identical `JSCustomer` create emitted on both. The REST
 * projection coverage for those two classes unaffected and always runs. Flip this
 * to `true` once the backend confirms those classes emit, and the mirror-channel assertions for them
 * come along with it.
 */
const LOAN_QUOTE_AND_RELATIONSHIP_EVENTS_ENABLED = true;
const itWhenAllClassesEmit = LOAN_QUOTE_AND_RELATIONSHIP_EVENTS_ENABLED ? it : it.skip;

// --------------------------------------------------------
// ----------------------- Helpers ------------------------
// --------------------------------------------------------

/**
 * Dot-separated id, so `dataSyncEntity('<prefix>.*')` matches the object's own channel — and
 * `subscription({ projection: 'admin' })` matches `__admin__<prefix>.*`. (helpers' `freshId` uses
 * `-`, which no wildcard matches.)
 */
function projectionId(prefix: string): string {
  return `${prefix}.p${Date.now().toString(36)}${Math.floor(Math.random() * 90000) + 10000}`;
}

/** Token-only client: same keyset as `freshPubNub()` but deliberately **without** `secretKey`. */
function receiverClient(userId: string): PubNub {
  const { secretKey: _superUserKey, ...publicKeyset } = DATA_SYNC_KEYSET;
  return new PubNub({
    ...publicKeyset,
    userId,
    // @ts-expect-error Force override default value.
    useRequestId: false,
  });
}

/** DataSync CRUD wide open — this suite isolates *projections*, never CRUD permission bits. */
const DATA_SYNC_FULL_ACCESS: PAM.DataSyncTokenScopes = {
  entities: { '.*': { get: true, create: true, update: true, delete: true } },
  relationships: { '.*': { get: true, create: true, update: true, delete: true } },
};

const channelReadMap = (names: readonly string[]): Record<string, PAM.ChannelTokenPermissions> =>
  Object.fromEntries(names.map((name) => [name, { read: true, join: true }]));

/**
 * Mint a reader token. `channelPatterns` are RegEx-matched, `channelResources` are exact ids — the
 * distinction is the whole point of this test.
 */
function grantReaderToken(
  pnPam: PubNub,
  opts: {
    channelPatterns?: readonly string[];
    channelResources?: readonly string[];
    projections?: PAM.DataSyncProjections;
  } = {},
): Promise<string> {
  return pnPam.grantToken({
    ttl: TOKEN_TTL,
    ...(opts.channelResources ? { resources: { channels: channelReadMap(opts.channelResources) } } : {}),
    patterns: {
      ...(opts.channelPatterns ? { channels: channelReadMap(opts.channelPatterns) } : {}),
      dataSync: DATA_SYNC_FULL_ACCESS,
    },
    ...(opts.projections ? { dataSyncProjections: opts.projections } : {}),
  });
}

/** A reader wired to a freshly minted token. Caller owns `destroy()`. */
async function readerWithToken(
  pnPam: PubNub,
  userId: string,
  opts: Parameters<typeof grantReaderToken>[1] = {},
): Promise<PubNub> {
  const token = await grantReaderToken(pnPam, opts);
  const reader = receiverClient(userId);
  reader.setToken(token);
  return reader;
}

/** Compare the exact projected key set — locks both leaks (extra keys) and losses (missing keys). */
function assertPayloadFields(
  payload: Record<string, unknown> | undefined,
  expectedFields: readonly string[],
  label: string,
): void {
  assert.ok(payload != null, `${label}: payload present`);
  assert.deepStrictEqual(
    Object.keys(payload!).sort(),
    [...expectedFields].sort(),
    `${label}: projected payload fields`,
  );
}

const payloadOf = (obj: { payload?: unknown }): Record<string, unknown> | undefined =>
  obj.payload as Record<string, unknown> | undefined;

/** Shape of a rejected DataSync REST call: generic message, service detail under `status`. */
type RestRejection = {
  message: string;
  status: { statusCode: number; category?: string; errorData?: { errors?: Array<{ errorCode?: string }> } };
};

/**
 * `assert.rejects` matcher for a service error code. The SDK's `PubNubError.message` is always the
 * generic `REST API request processing error, check status for details` — the DataSync `errors[]`
 * envelope (and therefore the `DS-xxxx` code) is only reachable through `status.errorData`, so a
 * regex against the error string can never see the code.
 */
function rejectsWithDataSyncError(expected: {
  statusCode: number;
  category?: string;
  errorCode: string;
}): (error: RestRejection) => true {
  return (error: RestRejection) => {
    assert.strictEqual(error.message, 'REST API request processing error, check status for details', 'error message');
    assert.strictEqual(error.status.statusCode, expected.statusCode, 'status code surfaced');
    if (expected.category !== undefined) assert.strictEqual(error.status.category, expected.category, 'category');
    assert.deepStrictEqual(
      error.status.errorData?.errors?.map((entry) => entry.errorCode),
      [expected.errorCode],
      'service error code surfaced through status.errorData.errors',
    );
    return true;
  };
}

/** Entity / set subscription — the surface `dataSyncEntity(id).subscription()` returns. */
type EntitySubscription = {
  addListener(listener: { dataSync?: (event: Subscription.DataSyncObject) => void }): void;
  removeListener(listener: object): void;
  subscribe(): void;
  unsubscribe(): void;
};

/**
 * Base (`__default__`) plus `admin` projection of the same DataSync object, as one subscription set.
 * `{ projection: 'admin' }` maps to the `__admin__{id}` channel — never put that prefix in `id`.
 */
function bothProjections(reader: PubNub, id: string): EntitySubscription {
  const entity = reader.dataSyncEntity(id);
  return entity.subscription().addSubscription(entity.subscription({ projection: PROJECTION_ADMIN }));
}

/** `admin` projection only — the `__admin__{id}` mirror channel. */
function adminProjection(reader: PubNub, id: string): EntitySubscription {
  return reader.dataSyncEntity(id).subscription({ projection: PROJECTION_ADMIN });
}

/**
 * Subscribe via the entity API, run `trigger` once the subscription is actually connected, and
 * resolve when `expectedCount` matching DataSync events have arrived. A single mutation fans out to
 * both the id channel and its `__admin__…` mirror, so tests here wait for 2.
 *
 * The trigger must not fire before the handshake completes: DataSync events are only delivered from
 * the handshake timetoken onward, so a mutation published while the subscribe is still in flight is
 * lost for good. A fixed settle delay is a race (handshake retries routinely exceed it) — so gate on
 * the connect status and keep the delay only as a small post-connect grace period.
 */
function captureEvents(
  pn: PubNub,
  subscription: EntitySubscription,
  predicate: (event: Subscription.DataSyncObject) => boolean,
  expectedCount: number,
  trigger: () => Promise<void>,
  opts: {
    graceMs?: number;
    connectTimeoutMs?: number;
    timeoutMs?: number;
    /** When set, wins over `expectedCount` — used when fan-out order is not stable. */
    completeWhen?: (events: Subscription.DataSyncObject[]) => boolean;
  } = {},
): Promise<Subscription.DataSyncObject[]> {
  const graceMs = opts.graceMs ?? 1000;
  const connectTimeoutMs = opts.connectTimeoutMs ?? 20000;
  const timeoutMs = opts.timeoutMs ?? 45000;
  const isComplete = (events: Subscription.DataSyncObject[]): boolean =>
    opts.completeWhen ? opts.completeWhen(events) : events.length >= expectedCount;

  return new Promise<Subscription.DataSyncObject[]>((resolve, reject) => {
    const collected: Subscription.DataSyncObject[] = [];
    let settled = false;

    const listener = {
      dataSync: (event: Subscription.DataSyncObject) => {
        if (settled || !predicate(event)) return;
        collected.push(event);
        if (!isComplete(collected)) return;
        settled = true;
        cleanup();
        resolve(collected);
      },
    };

    /** Resolves on the first connect status; rejects if the subscribe never comes up. */
    const connected = new Promise<void>((onConnected, onConnectFailure) => {
      const statusListener = {
        status: (status: Status | StatusEvent) => {
          if (
            status.category !== PubNub.CATEGORIES.PNConnectedCategory &&
            status.category !== PubNub.CATEGORIES.PNSubscriptionChangedCategory
          )
            return;
          done();
          onConnected();
        },
      };
      const connectTimer = setTimeout(() => {
        done();
        onConnectFailure(new Error(`Subscription did not connect within ${connectTimeoutMs}ms.`));
      }, connectTimeoutMs);

      function done(): void {
        clearTimeout(connectTimer);
        pn.removeListener(statusListener);
      }

      pn.addListener(statusListener);
    });

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(
        new Error(
          `Timed out waiting for DataSync event(s)` +
            `${opts.completeWhen ? '' : ` (expected ${expectedCount})`}; ` +
            `got ${collected.length} on [${collected.map((e) => e.channel).join(', ')}].`,
        ),
      );
    }, timeoutMs);

    function cleanup(): void {
      clearTimeout(timer);
      subscription.removeListener(listener);
      subscription.unsubscribe();
    }

    subscription.addListener(listener);
    subscription.subscribe();

    connected
      .then(() => delay(graceMs))
      .then(trigger)
      .catch((error) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      });
  });
}

/**
 * Subscribe via the entity API and report *everything* surfaced within `windowMs` — DataSync events
 * on the subscription, statuses on the client (access-denied lives there). For negative cases.
 */
async function observeSubscribe(
  pn: PubNub,
  subscription: EntitySubscription,
  trigger: () => Promise<void>,
  opts: { settleMs?: number; windowMs?: number } = {},
): Promise<{ events: Subscription.DataSyncObject[]; statuses: Array<Status | StatusEvent> }> {
  const settleMs = opts.settleMs ?? 4000;
  const windowMs = opts.windowMs ?? 10000;

  const events: Subscription.DataSyncObject[] = [];
  const statuses: Array<Status | StatusEvent> = [];
  const dataSyncListener = { dataSync: (event: Subscription.DataSyncObject) => events.push(event) };
  const statusListener = { status: (status: Status | StatusEvent) => statuses.push(status) };

  pn.addListener(statusListener);
  subscription.addListener(dataSyncListener);
  subscription.subscribe();
  try {
    await delay(settleMs);
    await trigger();
    await delay(windowMs);
  } finally {
    subscription.removeListener(dataSyncListener);
    subscription.unsubscribe();
    pn.removeListener(statusListener);
  }
  return { events, statuses };
}

/** Pick the single event delivered on `channel` out of a fan-out batch. */
function eventOn(events: Subscription.DataSyncObject[], channel: string): Subscription.DataSyncObject {
  const matches = events.filter((e) => e.channel === channel);
  assert.strictEqual(matches.length, 1, `exactly one event on ${channel} (got ${matches.length})`);
  return matches[0];
}

// --------------------------------------------------------
// ------------------------ Seeding -----------------------
// --------------------------------------------------------

/** Every seeded object carries a `private` field, which only the `admin` projection exposes. */
async function seedCustomer(pnPam: PubNub, id: string, overrides: Record<string, unknown> = {}): Promise<void> {
  await pnPam.dataSync.createEntity({
    id,
    class: ENTITY_CLASS_CUSTOMER,
    data: {
      classVersion: CLASS_VERSION,
      status: 'active',
      payload: customerPayload(id, { private: CUSTOMER_SECRET, ...overrides }),
    },
  });
}

async function seedLoanQuote(pnPam: PubNub, id: string): Promise<void> {
  await pnPam.dataSync.createEntity({
    id,
    class: ENTITY_CLASS_LOAN_QUOTE,
    data: {
      classVersion: CLASS_VERSION,
      status: 'active',
      payload: loanQuotePayload(id, { private: LOAN_QUOTE_SECRET }),
    },
  });
}

async function seedRequestedBy(pnPam: PubNub, id: string, customerId: string, loanQuoteId: string): Promise<void> {
  await pnPam.dataSync.createRelationship({
    id,
    class: RELATIONSHIP_CLASS_REQUESTED_BY,
    entityAId: customerId,
    entityBId: loanQuoteId,
    data: {
      classVersion: CLASS_VERSION,
      status: 'active',
      payload: { linkedAt: LINKED_AT, private: REQUESTED_BY_SECRET },
    },
  });
}

// --------------------------------------------------------
// ------------------------- Tests ------------------------
// --------------------------------------------------------

describe('DataSync projections admin vs __default__', function () {
  this.timeout(120000);

  // Earlier nocked Data Sync files call `disableNetConnect()` and never re-enable it. This suite
  // talks to the live service, so lift that block before any REST / subscribe call.
  before(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  // ======================================================
  // grantToken / parseToken encoding
  // ======================================================
  describe('grantToken encodes projections into meta[pn-projections]', function () {
    let pnPam: PubNub;

    beforeEach(() => {
      pnPam = freshPubNub();
    });

    afterEach(() => {
      pnPam.destroy();
    });

    const projectionsMeta = (token: string): Record<string, Record<string, string>> | undefined => {
      const meta = pnPam.parseToken(token)?.meta as Record<string, unknown> | undefined;
      return meta?.['pn-projections'] as Record<string, Record<string, string>> | undefined;
    };

    it('pattern assignments round-trip through `pat` as datasync:<type>:<id> keys', async () => {
      const token = await grantReaderToken(pnPam, {
        channelPatterns: ['customer.*'],
        projections: {
          patterns: {
            entities: { 'customer.*': PROJECTION_ADMIN, 'loanquote.*': PROJECTION_ADMIN },
            relationships: { 'requestedby.*': PROJECTION_ADMIN },
          },
        },
      });

      assert.deepStrictEqual(projectionsMeta(token), {
        pat: {
          'datasync:entities:customer.*': PROJECTION_ADMIN,
          'datasync:entities:loanquote.*': PROJECTION_ADMIN,
          'datasync:relationships:requestedby.*': PROJECTION_ADMIN,
        },
      });
    });

    it('resource assignments round-trip through `res`', async () => {
      const token = await grantReaderToken(pnPam, {
        channelPatterns: ['customer.*'],
        projections: { resources: { entities: { 'customer.001': PROJECTION_ADMIN } } },
      });

      assert.deepStrictEqual(projectionsMeta(token), {
        res: { 'datasync:entities:customer.001': PROJECTION_ADMIN },
      });
    });

    it('a token without projections carries no pn-projections key at all', async () => {
      const token = await grantReaderToken(pnPam, { channelPatterns: ['customer.*'] });
      assert.strictEqual(projectionsMeta(token), undefined, 'pn-projections omitted entirely');
    });

    /**
     * `users` / `channels` / `memberships` projections use the same `datasync:<type>:<id>` key shape
     * as entities and relationships — even though User / Channel *permissions* ride the un-prefixed
     * `users` / `channels` grant scopes. `__default__` is used deliberately: it is the base
     * projection and is defined for every class, so this stays an encoding assertion rather than a
     * bet on which named projections this subkey provisions for Users and Channels.
     */
    it('users / channels / memberships assignments round-trip as datasync:<type>:<id>', async () => {
      const token = await grantReaderToken(pnPam, {
        projections: {
          resources: {
            users: { 'user.001': PROJECTION_DEFAULT },
            channels: { 'channel.001': PROJECTION_DEFAULT },
            memberships: { 'user.001:channel.001': PROJECTION_DEFAULT },
          },
          patterns: {
            users: { 'user.*': PROJECTION_DEFAULT },
            channels: { 'channel.*': PROJECTION_DEFAULT },
            memberships: { 'user.*:channel.*': PROJECTION_DEFAULT },
          },
        },
      });

      assert.deepStrictEqual(projectionsMeta(token), {
        res: {
          'datasync:users:user.001': PROJECTION_DEFAULT,
          'datasync:channels:channel.001': PROJECTION_DEFAULT,
          'datasync:memberships:user.001:channel.001': PROJECTION_DEFAULT,
        },
        pat: {
          'datasync:users:user.*': PROJECTION_DEFAULT,
          'datasync:channels:channel.*': PROJECTION_DEFAULT,
          'datasync:memberships:user.*:channel.*': PROJECTION_DEFAULT,
        },
      });
    });
  });

  // ======================================================
  // REST reads are projected by the token
  // ======================================================
  describe('REST reads are projected by the token', function () {
    let pnPam: PubNub;
    let customerId: string;
    let loanQuoteId: string;
    let relationshipId: string;
    const readers: PubNub[] = [];

    /** Seeded once — there is nothing to isolate per test. */
    before(async () => {
      pnPam = freshPubNub();
      customerId = projectionId('customer');
      loanQuoteId = projectionId('loanquote');
      relationshipId = projectionId('requestedby');
      await seedCustomer(pnPam, customerId);
      await seedLoanQuote(pnPam, loanQuoteId);
      await seedRequestedBy(pnPam, relationshipId, customerId, loanQuoteId);
    });

    after(async () => {
      await safeRemove(() => pnPam.dataSync.removeRelationship({ id: relationshipId }));
      await safeRemove(() => pnPam.dataSync.removeEntity({ id: customerId }));
      await safeRemove(() => pnPam.dataSync.removeEntity({ id: loanQuoteId }));
      pnPam.destroy();
    });

    afterEach(() => {
      while (readers.length) readers.pop()!.destroy();
    });

    /** Track for teardown. */
    const track = (reader: PubNub): PubNub => {
      readers.push(reader);
      return reader;
    };

    /** Projection assignments covering every object this section seeded. */
    const allAdmin = (): PAM.DataSyncProjections => ({
      patterns: {
        entities: { 'customer.*': PROJECTION_ADMIN, 'loanquote.*': PROJECTION_ADMIN },
        relationships: { 'requestedby.*': PROJECTION_ADMIN },
      },
    });

    it('no projection assignment → __default__ view, `private` withheld', async () => {
      const reader = track(await readerWithToken(pnPam, 'proj-reader-default'));

      const res = await reader.dataSync.getEntity({ id: customerId });

      assertPayloadFields(payloadOf(res.data), CUSTOMER_DEFAULT_FIELDS, 'Customer default');
      assert.ok(!('private' in payloadOf(res.data)!), '`private` never reaches a default reader');
      // The super-user does hold the field — the reader's view is projected, not the stored object.
      const asSuperUser = await pnPam.dataSync.getEntity({ id: customerId });
      assert.strictEqual(payloadOf(asSuperUser.data)!.private, CUSTOMER_SECRET, 'stored `private` intact');
    });

    it('pattern-assigned `admin` → `private` exposed and `email` dropped', async () => {
      const reader = track(await readerWithToken(pnPam, 'proj-reader-admin-pat', { projections: allAdmin() }));

      const res = await reader.dataSync.getEntity({ id: customerId });

      assertPayloadFields(payloadOf(res.data), CUSTOMER_ADMIN_FIELDS, 'Customer admin');
      assert.strictEqual(payloadOf(res.data)!.private, CUSTOMER_SECRET, '`private` value');
      assert.ok(!('email' in payloadOf(res.data)!), 'admin projection omits `email` (not a superset)');
    });

    it('exact `resources` assignment by object id also selects `admin`', async () => {
      const reader = track(
        await readerWithToken(pnPam, 'proj-reader-admin-res', {
          projections: { resources: { entities: { [customerId]: PROJECTION_ADMIN } } },
        }),
      );

      const customer = await reader.dataSync.getEntity({ id: customerId });
      assertPayloadFields(payloadOf(customer.data), CUSTOMER_ADMIN_FIELDS, 'Customer admin (exact id)');

      // Scoped to that one id — the un-assigned LoanQuote stays on __default__.
      const loanQuote = await reader.dataSync.getEntity({ id: loanQuoteId });
      assertPayloadFields(payloadOf(loanQuote.data), LOAN_QUOTE_DEFAULT_FIELDS, 'LoanQuote default');
    });

    it('explicit `__default__` behaves exactly like no assignment', async () => {
      const reader = track(
        await readerWithToken(pnPam, 'proj-reader-explicit-default', {
          projections: { patterns: { entities: { '.*': PROJECTION_DEFAULT } } },
        }),
      );

      const res = await reader.dataSync.getEntity({ id: customerId });
      assertPayloadFields(payloadOf(res.data), CUSTOMER_DEFAULT_FIELDS, 'Customer explicit __default__');
    });

    it('an unknown projection name rejects the read (DS-0202, invalid auth)', async () => {
      const reader = track(
        await readerWithToken(pnPam, 'proj-reader-bogus', {
          projections: { patterns: { entities: { '.*': PROJECTION_UNKNOWN } } },
        }),
      );

      // The token itself mints fine — it is only rejected when a read tries to resolve the name.
      // An unknown projection name must fail the read, not silently fall back to `__default__`.
      await assert.rejects(
        () => reader.dataSync.getEntity({ id: customerId }),
        rejectsWithDataSyncError({
          statusCode: 403,
          category: PubNub.CATEGORIES.PNAccessDeniedCategory,
          errorCode: 'DS-0202',
        }),
      );
    });

    it('`__admin__` is not a valid projection name — the name is bare `admin`', async () => {
      const reader = track(
        await readerWithToken(pnPam, 'proj-reader-wrapped-name', {
          projections: { patterns: { entities: { '.*': `__${PROJECTION_ADMIN}__` } } },
        }),
      );

      // `__admin__` is the channel prefix, never the projection name — so it resolves to nothing.
      await assert.rejects(
        () => reader.dataSync.getEntity({ id: customerId }),
        rejectsWithDataSyncError({
          statusCode: 403,
          category: PubNub.CATEGORIES.PNAccessDeniedCategory,
          errorCode: 'DS-0202',
        }),
      );
    });

    it('list reads are projected too', async () => {
      const defaultReader = track(await readerWithToken(pnPam, 'proj-list-default'));
      const adminReader = track(await readerWithToken(pnPam, 'proj-list-admin', { projections: allAdmin() }));

      // `customerId` is echoed into the payload by `customerPayload`, so it filters deterministically
      // on a shared subkey.
      const query = {
        class: ENTITY_CLASS_CUSTOMER,
        classVersion: CLASS_VERSION,
        filterFast: `customerId == '${customerId}'`,
        limit: 100,
      };

      const asDefault = await defaultReader.dataSync.getEntities(query);
      const defaultRow = asDefault.data.find((row) => row.id === customerId);
      assert.ok(defaultRow, 'seeded customer present in the default-reader page');
      assertPayloadFields(payloadOf(defaultRow!), CUSTOMER_DEFAULT_FIELDS, 'getEntities default');

      const asAdmin = await adminReader.dataSync.getEntities(query);
      const adminRow = asAdmin.data.find((row) => row.id === customerId);
      assert.ok(adminRow, 'seeded customer present in the admin-reader page');
      assertPayloadFields(payloadOf(adminRow!), CUSTOMER_ADMIN_FIELDS, 'getEntities admin');
    });

    it('LoanQuote — `admin` narrows to {quoteId, private}', async () => {
      const defaultReader = track(await readerWithToken(pnPam, 'proj-loan-default'));
      const adminReader = track(await readerWithToken(pnPam, 'proj-loan-admin', { projections: allAdmin() }));

      const asDefault = await defaultReader.dataSync.getEntity({ id: loanQuoteId });
      assertPayloadFields(payloadOf(asDefault.data), LOAN_QUOTE_DEFAULT_FIELDS, 'LoanQuote default');
      assert.ok(!('private' in payloadOf(asDefault.data)!), 'LoanQuote `private` withheld by default');

      const asAdmin = await adminReader.dataSync.getEntity({ id: loanQuoteId });
      assertPayloadFields(payloadOf(asAdmin.data), LOAN_QUOTE_ADMIN_FIELDS, 'LoanQuote admin');
      assert.strictEqual(payloadOf(asAdmin.data)!.private, LOAN_QUOTE_SECRET, 'LoanQuote `private` value');
    });

    it('REQUESTED_BY relationship — `admin` adds `private`', async () => {
      const defaultReader = track(await readerWithToken(pnPam, 'proj-rel-default'));
      const adminReader = track(await readerWithToken(pnPam, 'proj-rel-admin', { projections: allAdmin() }));

      const asDefault = await defaultReader.dataSync.getRelationship({ id: relationshipId });
      assertPayloadFields(payloadOf(asDefault.data), REQUESTED_BY_DEFAULT_FIELDS, 'REQUESTED_BY default');

      const asAdmin = await adminReader.dataSync.getRelationship({ id: relationshipId });
      assertPayloadFields(payloadOf(asAdmin.data), REQUESTED_BY_ADMIN_FIELDS, 'REQUESTED_BY admin');
      assert.strictEqual(payloadOf(asAdmin.data)!.private, REQUESTED_BY_SECRET, 'relationship `private` value');
    });

    it('relationship assignments key off the relationship id, not `entityAId:entityBId`', async () => {
      const byOwnId = track(
        await readerWithToken(pnPam, 'proj-rel-by-id', {
          projections: { resources: { relationships: { [relationshipId]: PROJECTION_ADMIN } } },
        }),
      );
      const byEndpointPair = track(
        await readerWithToken(pnPam, 'proj-rel-by-pair', {
          projections: {
            resources: { relationships: { [`${customerId}:${loanQuoteId}`]: PROJECTION_ADMIN } },
          },
        }),
      );

      const resolved = await byOwnId.dataSync.getRelationship({ id: relationshipId });
      assertPayloadFields(payloadOf(resolved.data), REQUESTED_BY_ADMIN_FIELDS, 'keyed by relationship id');

      // The composite endpoint-pair key matches nothing, so the reader silently stays on __default__.
      const unresolved = await byEndpointPair.dataSync.getRelationship({ id: relationshipId });
      assertPayloadFields(payloadOf(unresolved.data), REQUESTED_BY_DEFAULT_FIELDS, 'keyed by entityAId:entityBId');
    });
  });

  // ======================================================
  // real-time events are projected by the channel
  // ======================================================
  describe('real-time events are projected by the channel', function () {
    let pnPam: PubNub;
    let customerId: string;
    let plainChannel: string;
    let mirrorChannel: string;
    let reader: PubNub;

    beforeEach(() => {
      pnPam = freshPubNub();
      customerId = projectionId('customer');
      plainChannel = customerId;
      mirrorChannel = adminChannel(customerId);
    });

    afterEach(async () => {
      await safeRemove(() => pnPam.dataSync.removeEntity({ id: customerId }));
      reader?.destroy();
      pnPam.destroy();
    });

    /** Wildcard grant covering both the id channel and its mirror, spelled out explicitly. */
    const bothChannelPatterns = ['customer.*', `${ADMIN_CHANNEL_PREFIX}customer.*`] as const;

    it('one create fans out twice — id channel __default__, mirror channel `admin`', async () => {
      reader = await readerWithToken(pnPam, 'proj-rt-both', { channelPatterns: bothChannelPatterns });

      const events = await captureEvents(
        reader,
        bothProjections(reader, 'customer.*'),
        (e) => e.message.event === 'create' && (e.message.data as { id?: string }).id === customerId,
        2,
        () => seedCustomer(pnPam, customerId),
      );

      const onPlain = eventOn(events, plainChannel);
      const onMirror = eventOn(events, mirrorChannel);

      for (const event of [onPlain, onMirror]) {
        assertEventCommon(event, {
          event: 'create',
          type: 'entity',
          objectType: 'entity',
          id: customerId,
          channelOneOf: [plainChannel, mirrorChannel],
          className: ENTITY_CLASS_CUSTOMER,
          classLevel: 'SubKey',
        });
      }

      // Same object, same revision — only the payload projection differs.
      const plainData = onPlain.message.data as Subscription.DataSyncEntityData;
      const mirrorData = onMirror.message.data as Subscription.DataSyncEntityData;
      assert.strictEqual(mirrorData.eTag, plainData.eTag, 'both events describe the same revision');
      assert.strictEqual(mirrorData.updatedAt, plainData.updatedAt, 'same updatedAt');

      assertPayloadFields(payloadOf(plainData), CUSTOMER_DEFAULT_FIELDS, 'id-channel event');
      assert.ok(!('private' in payloadOf(plainData)!), 'id channel never carries `private`');

      assertPayloadFields(payloadOf(mirrorData), CUSTOMER_ADMIN_FIELDS, 'mirror-channel event');
      assert.strictEqual(payloadOf(mirrorData)!.private, CUSTOMER_SECRET, 'mirror channel carries `private`');
    });

    it('the token`s dataSyncProjections do not affect real-time payloads — the channel does', async () => {
      // A reader with NO projection assignment (so its REST reads are __default__) subscribed to the
      // mirror channel still receives the `admin` payload. Channel read permission is the only gate.
      reader = await readerWithToken(pnPam, 'proj-rt-no-projection', { channelPatterns: bothChannelPatterns });

      const events = await captureEvents(
        reader,
        bothProjections(reader, 'customer.*'),
        (e) => e.message.event === 'create' && (e.message.data as { id?: string }).id === customerId,
        2,
        () => seedCustomer(pnPam, customerId),
      );

      const mirrorData = eventOn(events, mirrorChannel).message.data as Subscription.DataSyncEntityData;
      assertPayloadFields(payloadOf(mirrorData), CUSTOMER_ADMIN_FIELDS, 'mirror event, projection-less token');
      assert.strictEqual(payloadOf(mirrorData)!.private, CUSTOMER_SECRET, '`private` delivered regardless');

      // Same token, same object, REST read → still __default__. The two axes are independent.
      const restRead = await reader.dataSync.getEntity({ id: customerId });
      assertPayloadFields(payloadOf(restRead.data), CUSTOMER_DEFAULT_FIELDS, 'REST read stays __default__');
    });

    it('an unanchored `customer.*` pattern grant also authorizes `__admin__customer.…`', async () => {
      // PAM patterns are unanchored regexes, so `customer.*` matches inside `__admin__customer.123`.
      // A grant meant for the id channel silently opens the projection mirror — the footgun.
      reader = await readerWithToken(pnPam, 'proj-rt-unanchored', { channelPatterns: ['customer.*'] });

      const events = await captureEvents(
        reader,
        adminProjection(reader, customerId),
        (e) => e.message.event === 'create' && (e.message.data as { id?: string }).id === customerId,
        1,
        () => seedCustomer(pnPam, customerId),
      );

      const mirrorData = events[0].message.data as Subscription.DataSyncEntityData;
      assert.strictEqual(events[0].channel, mirrorChannel, 'delivered on the mirror channel');
      assert.strictEqual(payloadOf(mirrorData)!.private, CUSTOMER_SECRET, '`private` leaked via the pattern grant');
    });

    it('an exact `resources` grant on the id channel withholds the mirror channel', async () => {
      // The correct way to keep `private` out of a subscriber's reach: grant the id channel exactly,
      // never the mirror.
      reader = await readerWithToken(pnPam, 'proj-rt-exact-grant', { channelResources: [plainChannel] });

      const { events, statuses } = await observeSubscribe(reader, adminProjection(reader, customerId), () =>
        seedCustomer(pnPam, customerId),
      );

      assert.deepStrictEqual(
        events.map((e) => e.channel),
        [],
        'no event may reach an unauthorized mirror channel',
      );
      // The service refuses the subscribe; the SDK surfaces it as access-denied (or, when the retry
      // policy gives up first, a connection error) — never as a successful, silent subscription.
      const refused = statuses.some(
        (status) =>
          status.category === PubNub.CATEGORIES.PNAccessDeniedCategory ||
          status.category === PubNub.CATEGORIES.PNConnectionErrorCategory ||
          (status as Status).statusCode === 403,
      );
      assert.ok(refused, `subscribe must be refused; saw [${statuses.map((s) => s.category).join(', ')}]`);
    });

    it('update events are projected per channel', async () => {
      reader = await readerWithToken(pnPam, 'proj-rt-update', { channelPatterns: bothChannelPatterns });
      await seedCustomer(pnPam, customerId);

      const events = await captureEvents(
        reader,
        bothProjections(reader, 'customer.*'),
        (e) => e.message.event === 'update' && (e.message.data as { id?: string }).id === customerId,
        2,
        () =>
          pnPam.dataSync
            // Touch one field from each projection so both channels are guaranteed to emit.
            .updateEntity({ id: customerId, replace: { '/payload/city': 'Mumbai', '/payload/private': 'rotated' } })
            .then(() => undefined),
      );

      const plainData = eventOn(events, plainChannel).message.data as Subscription.DataSyncEntityData;
      assertPayloadFields(payloadOf(plainData), CUSTOMER_DEFAULT_FIELDS, 'id-channel update');
      assert.strictEqual(payloadOf(plainData)!.city, 'Mumbai', 'default field updated');
      assert.ok(!('private' in payloadOf(plainData)!), 'id channel still withholds `private`');

      const mirrorData = eventOn(events, mirrorChannel).message.data as Subscription.DataSyncEntityData;
      assertPayloadFields(payloadOf(mirrorData), CUSTOMER_ADMIN_FIELDS, 'mirror-channel update');
      assert.strictEqual(payloadOf(mirrorData)!.private, 'rotated', 'rotated `private` visible on the mirror');
      assert.strictEqual(payloadOf(mirrorData)!.city, 'Mumbai', 'shared field updated on the mirror too');
    });

    it('delete events are trimmed to {id, deletedAt} on both channels', async () => {
      reader = await readerWithToken(pnPam, 'proj-rt-delete', { channelPatterns: bothChannelPatterns });
      await seedCustomer(pnPam, customerId);

      const events = await captureEvents(
        reader,
        bothProjections(reader, 'customer.*'),
        (e) => e.message.event === 'delete' && (e.message.data as { id?: string }).id === customerId,
        2,
        () => pnPam.dataSync.removeEntity({ id: customerId }).then(() => undefined),
      );

      // A delete carries no payload, so there is nothing for a projection to widen or narrow.
      for (const channel of [plainChannel, mirrorChannel]) {
        const event = eventOn(events, channel);
        assertEventCommon(event, {
          event: 'delete',
          type: 'entity',
          objectType: 'entity',
          id: customerId,
          channelOneOf: [plainChannel, mirrorChannel],
          className: ENTITY_CLASS_CUSTOMER,
          classLevel: 'SubKey',
        });
        assertEventDeleteData(event.message.data as Subscription.DataSyncDeleteData, customerId);
      }
    });
  });

  // ======================================================
  // mirror channels for LoanQuote / REQUESTED_BY
  //     (gated: see LOAN_QUOTE_AND_RELATIONSHIP_EVENTS_ENABLED)
  // ======================================================
  describe('mirror channels for LoanQuote and REQUESTED_BY', function () {
    let pnPam: PubNub;
    let customerId: string;
    let loanQuoteId: string;
    let relationshipId: string;
    let reader: PubNub;

    beforeEach(() => {
      pnPam = freshPubNub();
      customerId = projectionId('customer');
      loanQuoteId = projectionId('loanquote');
      relationshipId = projectionId('requestedby');
    });

    afterEach(async () => {
      await safeRemove(() => pnPam.dataSync.removeRelationship({ id: relationshipId }));
      await safeRemove(() => pnPam.dataSync.removeEntity({ id: customerId }));
      await safeRemove(() => pnPam.dataSync.removeEntity({ id: loanQuoteId }));
      reader?.destroy();
      pnPam.destroy();
    });

    itWhenAllClassesEmit('LoanQuote create — mirror narrows to {quoteId, private}', async () => {
      reader = await readerWithToken(pnPam, 'proj-rt-loan', {
        channelPatterns: ['loanquote.*', `${ADMIN_CHANNEL_PREFIX}loanquote.*`],
      });

      const events = await captureEvents(
        reader,
        bothProjections(reader, 'loanquote.*'),
        (e) => e.message.event === 'create' && (e.message.data as { id?: string }).id === loanQuoteId,
        2,
        () => seedLoanQuote(pnPam, loanQuoteId),
      );

      const plainData = eventOn(events, loanQuoteId).message.data as Subscription.DataSyncEntityData;
      assertPayloadFields(payloadOf(plainData), LOAN_QUOTE_DEFAULT_FIELDS, 'LoanQuote id-channel event');

      const mirrorData = eventOn(events, adminChannel(loanQuoteId)).message.data as Subscription.DataSyncEntityData;
      assertPayloadFields(payloadOf(mirrorData), LOAN_QUOTE_ADMIN_FIELDS, 'LoanQuote mirror event');
      assert.strictEqual(payloadOf(mirrorData)!.private, LOAN_QUOTE_SECRET, 'LoanQuote `private` on the mirror');
    });

    itWhenAllClassesEmit('REQUESTED_BY create — mirrors of the two endpoint channels', async () => {
      // Relationship events route to the endpoint-entity channels (see events.relationship.test.ts),
      // so observe `dataSyncEntity` for each endpoint — not `dataSyncRelationship`.
      await seedCustomer(pnPam, customerId);
      await seedLoanQuote(pnPam, loanQuoteId);
      // Confirm both endpoints are readable before linking them — a missing entity fails the
      // relationship create and looks like a projection/event timeout.
      await pnPam.dataSync.getEntity({ id: customerId });
      await pnPam.dataSync.getEntity({ id: loanQuoteId });

      const plainChannels = [customerId, loanQuoteId];
      const mirrorChannels = [adminChannel(customerId), adminChannel(loanQuoteId)];

      reader = await readerWithToken(pnPam, projectionId('proj-rt-rel'), {
        channelPatterns: [
          'customer.*',
          'loanquote.*',
          `${ADMIN_CHANNEL_PREFIX}customer.*`,
          `${ADMIN_CHANNEL_PREFIX}loanquote.*`,
        ],
      });

      const customer = reader.dataSyncEntity(customerId);
      const quote = reader.dataSyncEntity(loanQuoteId);
      const subscription = customer
        .subscription()
        .addSubscription(customer.subscription({ projection: PROJECTION_ADMIN }));
      subscription.addSubscription(quote.subscription());
      subscription.addSubscription(quote.subscription({ projection: PROJECTION_ADMIN }));

      // One create fans out onto 4 channels (2 endpoints × default/admin). Arrival order is not
      // stable — resolving after any 2 events flakes when both land on the same projection.
      const events = await captureEvents(
        reader,
        subscription,
        (e) => e.message.event === 'create' && (e.message.data as { id?: string }).id === relationshipId,
        4,
        () => seedRequestedBy(pnPam, relationshipId, customerId, loanQuoteId),
        {
          completeWhen: (received) => {
            const hasPlain = received.some((e) => plainChannels.includes(e.channel));
            const hasMirror = received.some((e) => mirrorChannels.includes(e.channel));
            return hasPlain && hasMirror;
          },
        },
      );

      const plainEvents = events.filter((e) => plainChannels.includes(e.channel));
      const mirrorEvents = events.filter((e) => mirrorChannels.includes(e.channel));
      assert.ok(plainEvents.length >= 1, 'relationship event on at least one endpoint id channel');
      assert.ok(mirrorEvents.length >= 1, 'relationship event on at least one endpoint mirror channel');

      for (const event of plainEvents) {
        const data = event.message.data as Subscription.DataSyncRelationshipData;
        assertPayloadFields(payloadOf(data), REQUESTED_BY_DEFAULT_FIELDS, `${event.channel} (default)`);
      }
      for (const event of mirrorEvents) {
        const data = event.message.data as Subscription.DataSyncRelationshipData;
        assertPayloadFields(payloadOf(data), REQUESTED_BY_ADMIN_FIELDS, `${event.channel} (admin)`);
        assert.strictEqual(payloadOf(data)!.private, REQUESTED_BY_SECRET, 'relationship `private` on the mirror');
      }
    });
  });
});
