/* global describe, beforeEach, it, before, afterEach */

/**
 * DataSync typed Membership REST endpoint tests.
 *
 * Every request is served by a `nock` interceptor built from a live capture of these same endpoints,
 * so each test pins both halves of the contract: the exact method / path / query / body / Content-Type
 * the SDK emits, and the way the recorded reply is parsed back out. `scope.isDone()` is what proves
 * the request matched.
 *
 * A membership is a relationship between a user and a channel, so `classVersion` travels as
 * `relationshipClassVersion` — not `entityClassVersion`. On the REST axis the object carries
 * `channelId` / `userId` directly; the real-time event payload instead uses entityAId=channelId,
 * entityBId=userId.
 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../../src/node/index';
import utils from '../../../utils';
import {
  CLASS_VERSION,
  MEMBERSHIP_CURSOR_PAGE_2,
  membershipAdminRows,
  membershipObject,
  membershipPayload,
  membershipSortedDescRows,
  membershipsOfChannel,
  membershipsOfUser,
  relationshipNotFoundError,
} from './fixtures';

/** Content type the service uses for the membership resource, on both requests and responses. */
const MEMBERSHIP_MEDIA_TYPE = 'application/vnd.pubnub.objects.membership+json;version=1';
const JSON_PATCH_MEDIA_TYPE = 'application/json-patch+json';
const JSON_HEADERS = { 'content-type': MEMBERSHIP_MEDIA_TYPE };

describe('DataSync Membership Endpoints', () => {
  const SUBSCRIBE_KEY = 'mySubKey';
  const PUBLISH_KEY = 'myPublishKey';
  const AUTH_KEY = 'myAuthKey';
  const UUID = 'myUUID';
  const MEMBERSHIPS = `/v1/datasync/subkeys/${SUBSCRIBE_KEY}/memberships`;

  let pubnub: PubNub;
  /** Query parameters the middleware appends to every request. */
  let common: Record<string, string>;

  before(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: SUBSCRIBE_KEY,
      publishKey: PUBLISH_KEY,
      uuid: UUID,
      authKey: AUTH_KEY,
      // @ts-expect-error Force override default value.
      useRequestId: false,
    });
    // No `secretKey` is configured, so the middleware signs nothing: the only common parameters are
    // `uuid`, `pnsdk` and `auth` (the configured `authKey`).
    common = { uuid: UUID, auth: AUTH_KEY, pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}` };
  });

  afterEach(() => {
    pubnub.destroy(true);
  });

  // --------------------------------------------------------
  // ------------- Single-membership CRUD -------------------
  // --------------------------------------------------------

  it('createMembership — POST associates one user with one channel', async () => {
    const id = 'membership-18116';
    const userId = 'user-97219';
    const channelId = 'JSchannel-46429';
    const payload = membershipPayload({ notificationsEnabled: true });
    const created = membershipObject({ id, userId, channelId, payload });
    const scope = utils
      .createNock()
      // `classVersion` goes on the wire as `relationshipClassVersion`; both endpoints of the
      // relationship travel in the body, alongside `id`.
      .post(MEMBERSHIPS, {
        data: { id, userId, channelId, relationshipClassVersion: CLASS_VERSION, status: 'active', payload },
      })
      .matchHeader('content-type', MEMBERSHIP_MEDIA_TYPE)
      .query(common)
      .reply(201, { data: created }, JSON_HEADERS);

    const res = await pubnub.dataSync.createMembership({
      id,
      userId,
      channelId,
      data: { classVersion: CLASS_VERSION, status: 'active', payload },
    });

    assert.strictEqual(res.status, 201, 'create replies 201');
    assert.strictEqual(res.data.id, id);
    assert.strictEqual(res.data.userId, userId, 'membership references the user');
    assert.strictEqual(res.data.channelId, channelId, 'membership references the channel');
    assert.strictEqual(res.data.relationshipClass, 'Membership', 'class is server-assigned');
    assert.strictEqual(res.data.relationshipClassVersion, CLASS_VERSION);
    assert.strictEqual(res.data.status, 'active');
    assert.strictEqual(res.data.eTag, created.eTag);
    assert.deepStrictEqual(res.data.payload, payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getMembership — GET reads back', async () => {
    const stored = membershipObject({
      id: 'membership-16198',
      eTag: 'y2svzc',
      userId: 'user-40866',
      channelId: 'JSchannel-40406',
      payload: membershipPayload({ role: 'admin' }),
    });
    const scope = utils
      .createNock()
      .get(`${MEMBERSHIPS}/${stored.id}`)
      .query(common)
      .reply(200, { data: stored }, JSON_HEADERS);

    const res = await pubnub.dataSync.getMembership({ id: stored.id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.id, stored.id);
    assert.strictEqual(res.data.eTag, stored.eTag);
    assert.strictEqual(res.data.userId, stored.userId);
    assert.strictEqual(res.data.channelId, stored.channelId);
    assert.strictEqual(res.data.relationshipClassVersion, CLASS_VERSION);
    assert.deepStrictEqual(res.data.payload, stored.payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateMembership — add/replace/remove sends a JSON Patch document', async () => {
    const before = membershipObject({
      id: 'membership-86369',
      eTag: 'y2sy0r',
      payload: membershipPayload({ notificationsEnabled: true }),
    });
    const after = membershipObject({
      id: before.id,
      eTag: 'y2sz1s',
      updatedAt: '2026-09-07T07:42:35.575671Z',
      payload: membershipPayload({ role: 'moderator', lastReadAt: '2026-07-06T10:00:00.000Z' }),
    });
    const scope = utils
      .createNock()
      // Paths are JSON Pointers sent verbatim, including the `/payload` prefix.
      .patch(`${MEMBERSHIPS}/${before.id}`, [
        { op: 'add', path: '/payload/lastReadAt', value: '2026-07-06T10:00:00.000Z' },
        { op: 'replace', path: '/payload/role', value: 'moderator' },
        { op: 'remove', path: '/payload/notificationsEnabled' },
      ])
      .matchHeader('content-type', JSON_PATCH_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: after }, JSON_HEADERS);

    const res = await pubnub.dataSync.updateMembership({
      id: before.id,
      add: { '/payload/lastReadAt': '2026-07-06T10:00:00.000Z' },
      replace: { '/payload/role': 'moderator' },
      remove: ['/payload/notificationsEnabled'],
    });

    const payload = res.data.payload as Record<string, unknown>;
    assert.strictEqual(payload.role, 'moderator', 'role replaced');
    assert.strictEqual(payload.lastReadAt, '2026-07-06T10:00:00.000Z', 'lastReadAt added');
    assert.ok(!('notificationsEnabled' in payload), 'notificationsEnabled removed');
    assert.notStrictEqual(res.data.eTag, before.eTag, 'eTag changed');
    assert.ok(Date.parse(res.data.updatedAt) > Date.parse(res.data.createdAt), 'updatedAt advanced');
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateMembership — supports move / copy / test ops', async () => {
    const before = membershipObject({ id: 'membership-25517', eTag: 'y2t011' });
    const patched = membershipPayload({ roleCopy: 'member', joinedAtMoved: '2026-07-06T10:00:00.000Z' });
    delete (patched as Record<string, unknown>).joinedAt;
    const after = membershipObject({
      id: before.id,
      eTag: 'y2t122',
      updatedAt: '2026-09-07T07:42:38.111222Z',
      payload: patched,
    });
    const scope = utils
      .createNock()
      // `toJsonPatchOperations` emits a fixed op order — add, replace, remove, move, copy, test —
      // regardless of the order the caller passes them in below.
      .patch(`${MEMBERSHIPS}/${before.id}`, [
        { op: 'move', from: '/payload/joinedAt', path: '/payload/joinedAtMoved' },
        { op: 'copy', from: '/payload/role', path: '/payload/roleCopy' },
        { op: 'test', path: '/payload/role', value: 'member' },
      ])
      .matchHeader('content-type', JSON_PATCH_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: after }, JSON_HEADERS);

    const res = await pubnub.dataSync.updateMembership({
      id: before.id,
      copy: [{ from: '/payload/role', path: '/payload/roleCopy' }],
      move: [{ from: '/payload/joinedAt', path: '/payload/joinedAtMoved' }],
      test: { '/payload/role': 'member' },
    });

    const payload = res.data.payload as Record<string, unknown>;
    assert.strictEqual(payload.roleCopy, 'member', 'role copied to roleCopy');
    assert.strictEqual(payload.role, 'member', 'original role retained after copy/test');
    assert.strictEqual(payload.joinedAtMoved, '2026-07-06T10:00:00.000Z', 'joinedAt moved to joinedAtMoved');
    assert.ok(!('joinedAt' in payload), 'original joinedAt removed by move');
    assert.notStrictEqual(res.data.eTag, before.eTag, 'eTag changed');
    assert.strictEqual(scope.isDone(), true);
  });

  it('setMembership — PUT full replace; id in the path, both endpoints still in the body', async () => {
    const id = 'membership-97095';
    const userId = 'user-20356';
    const channelId = 'JSchannel-66763';
    const payload = membershipPayload({ role: 'owner', notificationsEnabled: false });
    const replaced = membershipObject({
      id,
      userId,
      channelId,
      eTag: 'y2t4jj',
      updatedAt: '2026-09-07T07:42:42.886193Z',
      status: 'inactive',
      payload,
    });
    const scope = utils
      .createNock()
      // Unlike entity/user, `setMembership` repeats `userId`/`channelId` in the body: the server
      // requires `relationshipClassVersion` on a full replace too.
      .put(`${MEMBERSHIPS}/${id}`, {
        data: { userId, channelId, relationshipClassVersion: CLASS_VERSION, status: 'inactive', payload },
      })
      .matchHeader('content-type', MEMBERSHIP_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: replaced }, JSON_HEADERS);

    const res = await pubnub.dataSync.setMembership({
      id,
      userId,
      channelId,
      data: { classVersion: CLASS_VERSION, status: 'inactive', payload },
    });

    assert.strictEqual(res.data.id, id);
    assert.strictEqual(res.data.status, 'inactive');
    assert.strictEqual(res.data.userId, userId);
    assert.strictEqual(res.data.channelId, channelId);
    assert.deepStrictEqual(res.data.payload, payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('removeMembership — DELETE replies 200 with an empty body', async () => {
    const id = 'membership-18116';
    const scope = utils.createNock().delete(`${MEMBERSHIPS}/${id}`).query(common).reply(200, '');

    const res = await pubnub.dataSync.removeMembership({ id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getMembership — rejects with the service error on 404', async () => {
    const id = 'membership-57036';
    const scope = utils
      .createNock()
      .get(`${MEMBERSHIPS}/${id}`)
      .query(common)
      .reply(404, relationshipNotFoundError(id), { 'content-type': 'application/json' });

    await assert.rejects(
      () => pubnub.dataSync.getMembership({ id }),
      (error: { message: string; status: { statusCode: number; errorData?: unknown } }) => {
        assert.strictEqual(error.status.statusCode, 404, 'status code surfaced');
        assert.strictEqual(error.message, 'REST API request processing error, check status for details');
        // Memberships report `Relationship '<id>' not found`, not the `Entity not found: <id>` the
        // entity / channel / user endpoints use.
        assert.deepStrictEqual(
          error.status.errorData,
          relationshipNotFoundError(id),
          'DataSync `errors[]` envelope reachable through `status.errorData`',
        );
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateMembership — forwards ifMatchesEtag as an If-Match header', async () => {
    const before = membershipObject({ id: 'membership-86369', eTag: 'y2sy0r' });
    const scope = utils
      .createNock()
      .patch(`${MEMBERSHIPS}/${before.id}`, [{ op: 'replace', path: '/payload/role', value: 'moderator' }])
      .matchHeader('if-match', before.eTag)
      .query(common)
      .reply(200, { data: membershipObject({ id: before.id, eTag: 'y2sz1s' }) }, JSON_HEADERS);

    await pubnub.dataSync.updateMembership({
      id: before.id,
      ifMatchesEtag: before.eTag,
      replace: { '/payload/role': 'moderator' },
    });

    assert.strictEqual(scope.isDone(), true);
  });

  // --------------------------------------------------------
  // ------------------ List / page / query -----------------
  // --------------------------------------------------------

  it('getMemberships — sends userId as `user_id` to list one user across channels', async () => {
    const userId = 'user-99640';
    const rows = membershipsOfUser(userId);
    const scope = utils
      .createNock()
      .get(MEMBERSHIPS)
      .query({ ...common, user_id: userId, limit: '50' })
      .reply(200, { data: rows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getMemberships({ userId, limit: 50 });

    assert.deepStrictEqual(
      res.data.map((m) => m.id),
      rows.map((m) => m.id),
    );
    for (const m of res.data) assert.strictEqual(m.userId, userId, `row ${m.id} references the user`);
    const channelIds = new Set(res.data.map((m) => m.channelId));
    assert.strictEqual(channelIds.size, rows.length, 'one membership per distinct channel');
    assert.strictEqual(res.meta?.has_next, false);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getMemberships — sends channelId as `channel_id` to list one channel across users', async () => {
    const channelId = 'JSchannel-30001';
    const rows = membershipsOfChannel(channelId);
    const scope = utils
      .createNock()
      .get(MEMBERSHIPS)
      .query({ ...common, channel_id: channelId, limit: '50' })
      .reply(200, { data: rows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getMemberships({ channelId, limit: 50 });

    for (const m of res.data) assert.strictEqual(m.channelId, channelId, `row ${m.id} references the channel`);
    const userIds = new Set(res.data.map((m) => m.userId));
    assert.strictEqual(userIds.size, rows.length, 'one membership per distinct user');
    assert.strictEqual(scope.isDone(), true);
  });

  it('getMemberships — sends both endpoints plus relationship_class_version to pin one edge', async () => {
    const userId = 'user-99640';
    const channelId = 'JSchannel-77932';
    const scope = utils
      .createNock()
      .get(MEMBERSHIPS)
      .query({
        ...common,
        user_id: userId,
        channel_id: channelId,
        relationship_class_version: `${CLASS_VERSION}`,
        limit: '20',
      })
      .reply(
        200,
        { data: [membershipObject({ userId, channelId })], meta: { has_next: false, limit: 20 } },
        JSON_HEADERS,
      );

    const res = await pubnub.dataSync.getMemberships({
      userId,
      channelId,
      relationshipClassVersion: CLASS_VERSION,
    });

    assert.strictEqual(res.data.length, 1, 'a user/channel pair identifies at most one membership');
    assert.strictEqual(scope.isDone(), true);
  });

  it('getMemberships — defaults limit to 20 when the caller omits it', async () => {
    const userId = 'user-99640';
    const scope = utils
      .createNock()
      // `GetMembershipsRequest` applies `limit ??= 20` in its constructor, so an omitted limit still
      // reaches the wire.
      .get(MEMBERSHIPS)
      .query({ ...common, user_id: userId, limit: '20' })
      .reply(200, { data: membershipsOfUser(userId), meta: { has_next: false } }, JSON_HEADERS);

    await pubnub.dataSync.getMemberships({ userId });

    assert.strictEqual(scope.isDone(), true);
  });

  it('getMemberships — threads next_cursor into the following request', async () => {
    const userId = 'user-44679';
    const rows = membershipsOfUser(userId);
    const page1Scope = utils
      .createNock()
      .get(MEMBERSHIPS)
      .query({ ...common, user_id: userId, limit: '2' })
      .reply(
        200,
        { data: rows.slice(0, 2), meta: { has_next: true, next_cursor: MEMBERSHIP_CURSOR_PAGE_2, limit: 2 } },
        JSON_HEADERS,
      );
    const page2Scope = utils
      .createNock()
      .get(MEMBERSHIPS)
      .query({ ...common, user_id: userId, limit: '2', cursor: MEMBERSHIP_CURSOR_PAGE_2 })
      .reply(200, { data: rows.slice(2), meta: { has_next: false, limit: 2 } }, JSON_HEADERS);

    const page1 = await pubnub.dataSync.getMemberships({ userId, limit: 2 });
    assert.strictEqual(page1.data.length, 2, 'page 1 respects limit');
    assert.strictEqual(page1.meta?.next_cursor, MEMBERSHIP_CURSOR_PAGE_2, 'cursor surfaced on page 1');

    const page2 = await pubnub.dataSync.getMemberships({ userId, limit: 2, cursor: page1.meta!.next_cursor! });
    const seen = new Set(page1.data.map((m) => m.id));
    for (const m of page2.data) assert.ok(!seen.has(m.id), `membership ${m.id} not on both pages`);
    assert.strictEqual(page2.meta?.has_next, false, 'last page reports no successor');

    assert.strictEqual(page1Scope.isDone(), true);
    assert.strictEqual(page2Scope.isDone(), true);
  });

  it('getMemberships — sends filterFast as `filter_fast`', async () => {
    const userId = 'user-99640';
    const scope = utils
      .createNock()
      .get(MEMBERSHIPS)
      .query({ ...common, user_id: userId, limit: '50', filter_fast: `role == 'admin'` })
      .reply(200, { data: membershipAdminRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getMemberships({ userId, filterFast: `role == 'admin'`, limit: 50 });

    for (const m of res.data)
      assert.strictEqual((m.payload as Record<string, unknown>).role, 'admin', 'only admin rows returned');
    assert.strictEqual(scope.isDone(), true);
  });

  it('getMemberships — passes a compound filter expression through verbatim', async () => {
    const userId = 'user-99640';
    const filter = `(role == 'admin') AND (notificationsEnabled == true)`;
    const scope = utils
      .createNock()
      .get(MEMBERSHIPS)
      .query({ ...common, user_id: userId, limit: '50', filter })
      .reply(200, { data: membershipAdminRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    await pubnub.dataSync.getMemberships({ userId, filter, limit: 50 });

    assert.strictEqual(scope.isDone(), true);
  });

  it('getMemberships — serializes an object sort as `field:direction`', async () => {
    const userId = 'user-99640';
    const scope = utils
      .createNock()
      .get(MEMBERSHIPS)
      .query({ ...common, user_id: userId, limit: '50', sort: 'createdAt:desc' })
      .reply(200, { data: membershipSortedDescRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getMemberships({ userId, sort: { createdAt: 'desc' }, limit: 50 });

    for (let i = 1; i < res.data.length; i++)
      assert.ok(
        Date.parse(res.data[i - 1].createdAt) >= Date.parse(res.data[i].createdAt),
        'createdAt is non-increasing',
      );
    assert.strictEqual(scope.isDone(), true);
  });

  it('getMemberships — passes a raw string sort through unchanged', async () => {
    const userId = 'user-99640';
    const scope = utils
      .createNock()
      // A string `sort` is forwarded verbatim, so a `-field` shorthand reaches the service as typed.
      .get(MEMBERSHIPS)
      .query({ ...common, user_id: userId, limit: '50', sort: '-createdAt' })
      .reply(200, { data: membershipSortedDescRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    await pubnub.dataSync.getMemberships({ userId, sort: '-createdAt', limit: 50 });

    assert.strictEqual(scope.isDone(), true);
  });

  // --------------------------------------------------------
  // ------------- Validation (no request sent) -------------
  // --------------------------------------------------------

  it('createMembership — rejects missing userId', async () => {
    const scope = utils.createNock().post(MEMBERSHIPS).reply(201, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        // @ts-expect-error — intentional omission of userId to exercise validation.
        pubnub.dataSync.createMembership({
          channelId: 'JSchannel-46429',
          data: { classVersion: CLASS_VERSION, payload: {} },
        }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'User id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('createMembership — rejects missing channelId', async () => {
    const scope = utils.createNock().post(MEMBERSHIPS).reply(201, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        // @ts-expect-error — intentional omission of channelId to exercise validation.
        pubnub.dataSync.createMembership({
          userId: 'user-97219',
          data: { classVersion: CLASS_VERSION, payload: {} },
        }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Channel id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('createMembership — rejects missing classVersion', async () => {
    const scope = utils.createNock().post(MEMBERSHIPS).reply(201, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        pubnub.dataSync.createMembership({
          userId: 'user-97219',
          channelId: 'JSchannel-46429',
          // @ts-expect-error — intentional omission of classVersion to exercise validation.
          data: { payload: {} },
        }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Relationship class version cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('setMembership — rejects missing channelId', async () => {
    const scope = utils.createNock().put(`${MEMBERSHIPS}/membership-18116`).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        // @ts-expect-error — intentional omission of channelId to exercise validation.
        pubnub.dataSync.setMembership({
          id: 'membership-18116',
          userId: 'user-97219',
          data: { classVersion: CLASS_VERSION, payload: {} },
        }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Channel id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('updateMembership — rejects empty add/replace/remove', async () => {
    const scope = utils.createNock().patch(`${MEMBERSHIPS}/placeholder`).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () => pubnub.dataSync.updateMembership({ id: 'placeholder' }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(
          error.status.message,
          'At least one of add, replace, remove, move, copy, or test must be provided',
        );
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('getMembership — rejects empty id', async () => {
    const scope = utils.createNock().get(MEMBERSHIPS).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () => pubnub.dataSync.getMembership({ id: '' }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Membership id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });
});
