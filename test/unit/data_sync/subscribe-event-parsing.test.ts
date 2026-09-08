import assert from 'assert';

import { BaseSubscribeRequest, PubNubEventType } from '../../../src/core/endpoints/subscribe';
import type * as Subscription from '../../../src/core/types/api/subscription';
import type { TransportResponse } from '../../../src/core/types/transport-response';

// --------------------------------------------------------
// --------------------- Test harness ---------------------
// --------------------------------------------------------

/** Minimal wire envelope: only the fields the parser reads. */
type WireEnvelope = {
  a?: string;
  f?: number;
  e?: number;
  p: { t: string; r?: number };
  c: string;
  b?: string;
  d: unknown;
};

function transportResponse(body: unknown): TransportResponse {
  return {
    url: 'https://ps.pndsn.com/v2/subscribe/sub-key/channel/0',
    status: 200,
    headers: {},
    body: new TextEncoder().encode(JSON.stringify(body)).buffer as ArrayBuffer,
  };
}

/**
 * Feed `envelope` through the real subscribe response parser and return the single parsed event.
 *
 * The parser drops envelopes whose channel (or subscription pattern) isn't one the request asked
 * for, so the request is built to subscribe to exactly `envelope.b ?? envelope.c`.
 */
async function parseEnvelope(envelope: WireEnvelope) {
  const subscribable = envelope.b === undefined ? envelope.c : envelope.b;
  const request = new BaseSubscribeRequest({
    channels: [subscribable],
    keySet: { subscribeKey: 'sub-key' },
    getFileUrl: () => '',
  });

  const response = await request.parse(
    transportResponse({ t: { t: '17865925322526025', r: 21 }, m: [{ a: '5', f: 0, ...envelope }] }),
  );

  assert.strictEqual(response.messages.length, 1, 'exactly one parsed event');
  return response.messages[0];
}

/** Parse and assert the envelope came out as a DataSync event, returning its `message`. */
async function parseDataSyncMessage(envelope: WireEnvelope): Promise<Subscription.DataSyncData> {
  const event = await parseEnvelope(envelope);
  assert.strictEqual(event.type, PubNubEventType.DataSync, 'dispatched as a DataSync event');
  return (event.data as Subscription.DataSyncObject).message;
}

/** Class identity belongs on the event, never duplicated into `data`. */
function assertNoDuplicatedClassFields(data: Record<string, unknown>): void {
  assert.ok(!('entityClass' in data), 'no data.entityClass');
  assert.ok(!('entityClassVersion' in data), 'no data.entityClassVersion');
  assert.ok(!('relationshipClass' in data), 'no data.relationshipClass');
  assert.ok(!('relationshipClassVersion' in data), 'no data.relationshipClassVersion');
}

// --------------------------------------------------------
// ------------------ Captured envelopes ------------------
// --------------------------------------------------------
// The service reports the semantic kind in `metadata.type` for its built-in classes (`user` /
// `channel` / `membership`) and the generic storage kind for developer-defined ones (`entity` /
// `relationship`). A membership's endpoints are named `channelId` / `userId`, matching the REST
// `MembershipObject`; only a developer-defined relationship uses `entityAId` / `entityBId`. The
// retired generic-kind wire shape is still exercised under "service compatibility" below.

const TYPED_USER_CREATE: WireEnvelope = {
  e: 5,
  p: { t: '17865925262384341', r: 21 },
  c: 'u.cl522260',
  b: 'u.*',
  d: {
    version: '1.0',
    metadata: {
      event: 'create',
      source: 'data-sync',
      type: 'user',
      className: 'User',
      classLevel: 'Global',
      classVersion: 1,
    },
    data: {
      id: 'u.cl522260',
      updatedAt: '2026-08-13T03:42:05.796378Z',
      createdAt: '2026-08-13T03:42:05.796378Z',
      eTag: '3w5e11248zuj8',
      expiresAt: '2026-09-13T00:00:00Z',
      status: 'st',
      payload: { name: 'N' },
    },
  },
};

const TYPED_CHANNEL_UPDATE: WireEnvelope = {
  e: 5,
  p: { t: '17865927171226331', r: 21 },
  c: 'chan-829465908',
  d: {
    version: '1.0',
    metadata: {
      event: 'update',
      source: 'data-sync',
      type: 'channel',
      className: 'Channel',
      classLevel: 'Global',
      classVersion: 1,
    },
    data: {
      id: 'chan-829465908',
      updatedAt: '2026-08-13T03:45:06.930595Z',
      createdAt: '2026-08-13T03:45:02.278248Z',
      eTag: '3w5e112493qh2',
      expiresAt: '2026-09-13T00:00:00Z',
      status: 'updated',
      payload: { kind: 'public', name: 'engineering', description: 'engineering', memberCount: 5 },
    },
  },
};

const TYPED_MEMBERSHIP_CREATE: WireEnvelope = {
  e: 5,
  p: { t: '17865927498612345', r: 21 },
  c: 'c.mem914058452',
  b: 'c.*',
  d: {
    version: '1.0',
    metadata: {
      event: 'create',
      source: 'data-sync',
      type: 'membership',
      className: 'Membership',
      classLevel: 'Global',
      classVersion: 1,
    },
    data: {
      id: 'm.mem914058452',
      updatedAt: '2026-08-13T03:45:57.918497Z',
      createdAt: '2026-08-13T03:45:57.918497Z',
      eTag: '3w5e112494tzu',
      channelId: 'c.mem914058452',
      userId: 'u.mem914058452',
      expiresAt: '2026-09-13T00:00:00Z',
      status: 'active',
      payload: { role: 'member', joinedAt: '2026-07-06T10:00:00.000Z' },
    },
  },
};

const CUSTOM_ENTITY_CREATE: WireEnvelope = {
  e: 5,
  p: { t: '17865926660201074', r: 21 },
  c: 'animal.exp661967',
  b: 'animal.*',
  d: {
    version: '1.0',
    metadata: {
      event: 'create',
      source: 'data-sync',
      type: 'entity',
      className: 'Lion',
      classLevel: 'SubKey',
      classVersion: 1,
    },
    data: {
      id: 'animal.exp661967',
      updatedAt: '2026-08-13T03:44:25.402304Z',
      createdAt: '2026-08-13T03:44:25.402304Z',
      eTag: '3w5e112492uf2',
      expiresAt: '2027-08-14T00:00:00Z',
      status: 'some-default-status',
      payload: { galaxy: 'MilkyWay', planet: 'Earth', country: null },
    },
  },
};

const CUSTOM_RELATIONSHIP_CREATE: WireEnvelope = {
  e: 5,
  p: { t: '17865927885900138', r: 21 },
  c: 'cust-70b1d0f54f',
  b: 'cust-70b1d0f54f',
  d: {
    version: '1.0',
    metadata: {
      event: 'create',
      source: 'data-sync',
      type: 'relationship',
      className: 'REQUESTED_BY',
      classLevel: 'SubKey',
      classVersion: 1,
    },
    data: {
      id: 'rel-c129c5a237',
      updatedAt: '2026-08-13T03:46:14.806779Z',
      createdAt: '2026-08-13T03:46:14.806779Z',
      eTag: '3w5e11249571e',
      entityAId: 'cust-70b1d0f54f',
      entityBId: 'lq-871f0a90f3',
      expiresAt: '2026-08-15T00:00:00Z',
      status: 'active',
      payload: { linkedAt: '2026-07-06T10:00:00.000Z' },
    },
  },
};

const TYPED_MEMBERSHIP_DELETE: WireEnvelope = {
  e: 5,
  p: { t: '17865927752415830', r: 21 },
  c: 'c.mem914058452',
  b: 'c.*',
  d: {
    version: '1.0',
    metadata: {
      event: 'delete',
      source: 'data-sync',
      type: 'membership',
      className: 'Membership',
      classLevel: 'Global',
      classVersion: 1,
    },
    data: { id: 'm.mem914058452', deletedAt: '2026-08-13T03:46:14.418911Z' },
  },
};

// --------------------------------------------------------
// ------------------------ Tests -------------------------
// --------------------------------------------------------

describe('DataSync subscribe event parsing', () => {
  describe('built-in (Global) classes', () => {
    it('parses a typed User create into objectType "user" with classLevel "Global"', async () => {
      const message = await parseDataSyncMessage(TYPED_USER_CREATE);

      assert.strictEqual(message.version, '1.0', 'version');
      assert.strictEqual(message.source, 'data-sync', 'source');
      assert.strictEqual(message.event, 'create', 'event');
      assert.strictEqual(message.type, 'user', 'wire type');
      assert.strictEqual(message.objectType, 'user', 'objectType');
      assert.strictEqual(message.className, 'User', 'className');
      assert.strictEqual(message.classLevel, 'Global', 'classLevel');
      assert.strictEqual(message.classVersion, 1, 'classVersion');
    });

    it('passes the User body through verbatim, without duplicating class identity', async () => {
      const message = await parseDataSyncMessage(TYPED_USER_CREATE);

      assert.deepStrictEqual(message.data, {
        id: 'u.cl522260',
        updatedAt: '2026-08-13T03:42:05.796378Z',
        createdAt: '2026-08-13T03:42:05.796378Z',
        eTag: '3w5e11248zuj8',
        expiresAt: '2026-09-13T00:00:00Z',
        status: 'st',
        payload: { name: 'N' },
      });
      assertNoDuplicatedClassFields(message.data as Record<string, unknown>);
    });

    it('parses a typed Channel update into objectType "channel"', async () => {
      const message = await parseDataSyncMessage(TYPED_CHANNEL_UPDATE);

      assert.strictEqual(message.event, 'update', 'event');
      assert.strictEqual(message.type, 'channel', 'wire type');
      assert.strictEqual(message.objectType, 'channel', 'objectType');
      assert.strictEqual(message.className, 'Channel', 'className');
      assert.strictEqual(message.classLevel, 'Global', 'classLevel');
      assertNoDuplicatedClassFields(message.data as Record<string, unknown>);
    });

    it('parses a typed Membership create into objectType "membership", keeping channelId/userId', async () => {
      const message = await parseDataSyncMessage(TYPED_MEMBERSHIP_CREATE);
      const data = message.data as Subscription.DataSyncMembershipData;

      assert.strictEqual(message.type, 'membership', 'wire type');
      assert.strictEqual(message.objectType, 'membership', 'objectType');
      assert.strictEqual(message.className, 'Membership', 'className');
      assert.strictEqual(message.classLevel, 'Global', 'classLevel');
      // A membership names its endpoints semantically, on the same axis as the REST MembershipObject.
      assert.strictEqual(data.channelId, 'c.mem914058452', 'channelId');
      assert.strictEqual(data.userId, 'u.mem914058452', 'userId');
      assert.ok(!('entityAId' in data), 'no entityAId');
      assert.ok(!('entityBId' in data), 'no entityBId');
      assertNoDuplicatedClassFields(data as unknown as Record<string, unknown>);
    });
  });

  describe('developer-defined (SubKey) classes', () => {
    it('parses a custom entity class into objectType "entity" with classLevel "SubKey"', async () => {
      const message = await parseDataSyncMessage(CUSTOM_ENTITY_CREATE);

      assert.strictEqual(message.objectType, 'entity', 'objectType falls back to the wire type');
      assert.strictEqual(message.className, 'Lion', 'className');
      assert.strictEqual(message.classLevel, 'SubKey', 'classLevel');
      assertNoDuplicatedClassFields(message.data as Record<string, unknown>);
    });

    it('parses a custom relationship class into objectType "relationship"', async () => {
      const message = await parseDataSyncMessage(CUSTOM_RELATIONSHIP_CREATE);
      const data = message.data as Subscription.DataSyncRelationshipData;

      assert.strictEqual(message.objectType, 'relationship', 'objectType falls back to the wire type');
      assert.strictEqual(message.className, 'REQUESTED_BY', 'className');
      assert.strictEqual(message.classLevel, 'SubKey', 'classLevel');
      assert.strictEqual(data.entityAId, 'cust-70b1d0f54f', 'entityAId');
      assert.strictEqual(data.entityBId, 'lq-871f0a90f3', 'entityBId');
      assertNoDuplicatedClassFields(data as unknown as Record<string, unknown>);
    });

    it('does not mistake a developer class named "User" for the built-in User class', async () => {
      const message = await parseDataSyncMessage({
        ...CUSTOM_ENTITY_CREATE,
        d: {
          version: '1.0',
          metadata: {
            event: 'create',
            source: 'data-sync',
            type: 'entity',
            className: 'User',
            classLevel: 'SubKey',
            classVersion: 2,
          },
          data: { id: 'animal.exp661967' },
        },
      });

      assert.strictEqual(message.objectType, 'entity', 'a SubKey `User` class is not a typed resource');
      assert.strictEqual(message.className, 'User', 'className');
      assert.strictEqual(message.classLevel, 'SubKey', 'classLevel');
      assert.strictEqual(message.classVersion, 2, 'classVersion');
    });
  });

  describe('delete events', () => {
    it('trims the delete body to { id, deletedAt }', async () => {
      const message = await parseDataSyncMessage(TYPED_MEMBERSHIP_DELETE);

      assert.strictEqual(message.event, 'delete', 'event');
      assert.strictEqual(message.objectType, 'membership', 'objectType');
      assert.strictEqual(message.classLevel, 'Global', 'classLevel is sent on delete too');
      assert.deepStrictEqual(message.data, {
        id: 'm.mem914058452',
        deletedAt: '2026-08-13T03:46:14.418911Z',
      });
    });
  });

  describe('service compatibility', () => {
    it('still derives objectType from the class identity when the wire type is the generic kind', async () => {
      const user = await parseDataSyncMessage({
        ...TYPED_USER_CREATE,
        d: {
          version: '1.0',
          metadata: {
            event: 'create',
            source: 'data-sync',
            type: 'entity',
            className: 'User',
            classLevel: 'Global',
            classVersion: 1,
          },
          data: { id: 'u.cl522260' },
        },
      });
      assert.strictEqual(user.type, 'entity', 'generic wire type passed through');
      assert.strictEqual(user.objectType, 'user', 'objectType derived from the Global class name');

      const membership = await parseDataSyncMessage({
        ...TYPED_MEMBERSHIP_CREATE,
        d: {
          version: '1.0',
          metadata: {
            event: 'create',
            source: 'data-sync',
            type: 'relationship',
            className: 'Membership',
            classLevel: 'Global',
            classVersion: 1,
          },
          data: { id: 'm.mem914058452', entityAId: 'c.mem914058452', entityBId: 'u.mem914058452' },
        },
      });
      const data = membership.data as Subscription.DataSyncRelationshipData;
      assert.strictEqual(membership.type, 'relationship', 'generic wire type passed through');
      assert.strictEqual(membership.objectType, 'membership', 'objectType derived from the Global class name');
      // `data` is a verbatim pass-through, so the retired endpoint axis survives as sent.
      assert.strictEqual(data.entityAId, 'c.mem914058452', 'entityAId (channel id)');
      assert.strictEqual(data.entityBId, 'u.mem914058452', 'entityBId (user id)');
    });

    it('derives objectType from the bare className when classLevel is absent', async () => {
      const message = await parseDataSyncMessage({
        ...TYPED_USER_CREATE,
        d: {
          version: '1.0',
          metadata: { event: 'create', source: 'data-sync', type: 'entity', className: 'User', classVersion: 1 },
          data: { id: 'u.cl522260' },
        },
      });

      assert.strictEqual(message.objectType, 'user', 'objectType');
      assert.strictEqual(message.className, 'User', 'className');
      assert.strictEqual(message.classLevel, undefined, 'classLevel absent');
    });

    it('still tolerates the retired positional composite className', async () => {
      const typed = await parseDataSyncMessage({
        ...TYPED_USER_CREATE,
        d: {
          version: '1.0',
          metadata: { event: 'create', source: 'data-sync', type: 'entity', className: 'User::', classVersion: 1 },
          data: { id: 'u.cl522260' },
        },
      });
      assert.strictEqual(typed.objectType, 'user', 'leading system segment → typed resource');
      assert.strictEqual(typed.className, 'User', 'composite collapses to the bare class name');

      const custom = await parseDataSyncMessage({
        ...CUSTOM_ENTITY_CREATE,
        d: {
          version: '1.0',
          metadata: { event: 'create', source: 'data-sync', type: 'entity', className: '::Lion', classVersion: 1 },
          data: { id: 'animal.exp661967' },
        },
      });
      assert.strictEqual(custom.objectType, 'entity', 'developer segment → wire type');
      assert.strictEqual(custom.className, 'Lion', 'composite collapses to the bare class name');
    });

    it('omits classVersion when the service sends a non-numeric value', async () => {
      const message = await parseDataSyncMessage({
        ...TYPED_USER_CREATE,
        d: {
          version: '1.0',
          metadata: {
            event: 'create',
            source: 'data-sync',
            type: 'entity',
            className: 'User',
            classLevel: 'Global',
            classVersion: 'not-a-number',
          },
          data: { id: 'u.cl522260' },
        },
      });

      assert.strictEqual(message.classVersion, undefined, 'classVersion');
    });

    it('falls back to a message event when the payload is not marked as DataSync', async () => {
      const event = await parseEnvelope({
        ...TYPED_USER_CREATE,
        d: { version: '1.0', metadata: { event: 'create', source: 'objects', type: 'entity' }, data: { id: 'x' } },
      });

      assert.strictEqual(event.type, PubNubEventType.Message, 'not dispatched as DataSync');
    });
  });
});
