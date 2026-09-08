/* global describe, beforeEach, it, before, afterEach */

/**
 * DataSync generic Relationship REST endpoint tests.
 *
 * Every request is served by a `nock` interceptor built from a live capture of these same endpoints
 * (class `REQUESTED_BY`, Customer → LoanQuote), so each test pins both halves of the contract: the
 * exact method / path / query / body / Content-Type the SDK emits, and the way the recorded reply is
 * parsed back out. `scope.isDone()` is what proves the request matched.
 *
 * No entity seeding: the live version created a Customer and a LoanQuote before every `it`, which was
 * both slow and the sole source of failures — a transient Access Manager 403 on a seeding POST failed
 * a test that had not yet exercised anything. Under a mock the endpoint ids are just strings in a
 * recorded reply, so there is nothing to seed and nothing to clean up.
 *
 * On the generic relationship axis the two endpoints travel as `entityAId` / `entityBId` (memberships
 * use `channelId` / `userId` instead), and `classVersion` goes on the wire as
 * `relationshipClassVersion`.
 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../../src/node/index';
import utils from '../../../utils';
import {
  CLASS_VERSION,
  RELATIONSHIP_CLASS_REQUESTED_BY,
  RELATIONSHIP_CURSOR_PAGE_2,
  relationshipClassRows,
  relationshipLinkedRows,
  relationshipListPage1,
  relationshipListPage2,
  relationshipObject,
  relationshipPayload,
  relationshipSortedDescRows,
  relationshipsOfEntityA,
  relationshipsOfEntityB,
  relationshipNotFoundError,
} from './fixtures';

/** Content type the service uses for the relationship resource, on both requests and responses. */
const RELATIONSHIP_MEDIA_TYPE = 'application/vnd.pubnub.objects.relationship+json;version=1';
const JSON_PATCH_MEDIA_TYPE = 'application/json-patch+json';
const JSON_HEADERS = { 'content-type': RELATIONSHIP_MEDIA_TYPE };

describe('DataSync Relationship Endpoints', () => {
  const SUBSCRIBE_KEY = 'mySubKey';
  const PUBLISH_KEY = 'myPublishKey';
  const AUTH_KEY = 'myAuthKey';
  const UUID = 'myUUID';
  const RELATIONSHIPS = `/v1/datasync/subkeys/${SUBSCRIBE_KEY}/relationships`;

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
  // ------------ Single-relationship CRUD ------------------
  // --------------------------------------------------------

  it('createRelationship — POST links two entities', async () => {
    const created = relationshipObject();
    const scope = utils
      .createNock()
      // `class` goes on the wire as `relationshipClass` and `classVersion` as
      // `relationshipClassVersion`; both endpoints travel in the body alongside `id`.
      .post(RELATIONSHIPS, {
        data: {
          id: created.id,
          entityAId: created.entityAId,
          entityBId: created.entityBId,
          relationshipClass: RELATIONSHIP_CLASS_REQUESTED_BY,
          relationshipClassVersion: CLASS_VERSION,
          status: 'active',
          payload: relationshipPayload(),
        },
      })
      .matchHeader('content-type', RELATIONSHIP_MEDIA_TYPE)
      .query(common)
      .reply(201, { data: created }, JSON_HEADERS);

    const res = await pubnub.dataSync.createRelationship({
      id: created.id,
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      entityAId: created.entityAId,
      entityBId: created.entityBId,
      data: { classVersion: CLASS_VERSION, status: 'active', payload: relationshipPayload() },
    });

    assert.strictEqual(res.status, 201, 'create replies 201');
    assert.strictEqual(res.data.id, created.id);
    assert.strictEqual(res.data.entityAId, created.entityAId, 'entity A end');
    assert.strictEqual(res.data.entityBId, created.entityBId, 'entity B end');
    assert.strictEqual(res.data.relationshipClass, RELATIONSHIP_CLASS_REQUESTED_BY);
    assert.strictEqual(res.data.relationshipClassVersion, CLASS_VERSION);
    assert.strictEqual(res.data.status, 'active');
    assert.strictEqual(res.data.eTag, created.eTag);
    assert.deepStrictEqual(res.data.payload, relationshipPayload());
    assert.strictEqual(scope.isDone(), true);
  });

  it('createRelationship — omits `id` from the body when the server should generate it', async () => {
    const created = relationshipObject({ id: 'requested-by-61099', eTag: 'y3r4gb' });
    const scope = utils
      .createNock()
      // No `id` key at all — nock deep-equals the body, so an accidentally-sent `id: undefined` or
      // empty string would fail to match.
      .post(RELATIONSHIPS, {
        data: {
          entityAId: created.entityAId,
          entityBId: created.entityBId,
          relationshipClass: RELATIONSHIP_CLASS_REQUESTED_BY,
          relationshipClassVersion: CLASS_VERSION,
          payload: relationshipPayload(),
        },
      })
      .query(common)
      .reply(201, { data: created }, JSON_HEADERS);

    const res = await pubnub.dataSync.createRelationship({
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      entityAId: created.entityAId,
      entityBId: created.entityBId,
      data: { classVersion: CLASS_VERSION, payload: relationshipPayload() },
    });

    assert.strictEqual(res.data.id, created.id, 'server-assigned id surfaced');
    assert.strictEqual(scope.isDone(), true);
  });

  it('getRelationship — GET reads back', async () => {
    const stored = relationshipObject({
      id: 'requested-by-45754',
      createdAt: '2026-09-07T08:09:11.607222Z',
      updatedAt: '2026-09-07T08:09:11.607222Z',
      eTag: 'y3r6cw',
      entityAId: 'customer-77839',
      entityBId: 'loanquote-99978',
    });
    const scope = utils
      .createNock()
      .get(`${RELATIONSHIPS}/${stored.id}`)
      .query(common)
      .reply(200, { data: stored }, JSON_HEADERS);

    const res = await pubnub.dataSync.getRelationship({ id: stored.id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.id, stored.id);
    assert.strictEqual(res.data.eTag, stored.eTag);
    assert.strictEqual(res.data.entityAId, stored.entityAId);
    assert.strictEqual(res.data.entityBId, stored.entityBId);
    assert.strictEqual(res.data.relationshipClass, RELATIONSHIP_CLASS_REQUESTED_BY);
    assert.deepStrictEqual(res.data.payload, relationshipPayload());
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateRelationship — add/replace/remove sends a JSON Patch document', async () => {
    const before = relationshipObject({
      id: 'requested-by-41980',
      createdAt: '2026-09-07T08:09:14.624007Z',
      updatedAt: '2026-09-07T08:09:14.624007Z',
      eTag: 'y3r8qh',
      payload: relationshipPayload({ label: 'primary' }),
    });
    const after = relationshipObject({
      id: before.id,
      createdAt: before.createdAt,
      updatedAt: '2026-09-07T08:09:15.392480Z',
      eTag: 'y3r8xl',
      payload: { linkedAt: '2026-08-01T00:00:00.000Z', note: 'renewal' },
    });
    const scope = utils
      .createNock()
      // Paths are JSON Pointers sent verbatim, including the `/payload` prefix.
      .patch(`${RELATIONSHIPS}/${before.id}`, [
        { op: 'add', path: '/payload/note', value: 'renewal' },
        { op: 'replace', path: '/payload/linkedAt', value: '2026-08-01T00:00:00.000Z' },
        { op: 'remove', path: '/payload/label' },
      ])
      .matchHeader('content-type', JSON_PATCH_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: after }, JSON_HEADERS);

    const res = await pubnub.dataSync.updateRelationship({
      id: before.id,
      add: { '/payload/note': 'renewal' },
      replace: { '/payload/linkedAt': '2026-08-01T00:00:00.000Z' },
      remove: ['/payload/label'],
    });

    const payload = res.data.payload as Record<string, unknown>;
    assert.strictEqual(payload.linkedAt, '2026-08-01T00:00:00.000Z', 'linkedAt replaced');
    assert.strictEqual(payload.note, 'renewal', 'note added');
    assert.ok(!('label' in payload), 'label removed');
    assert.strictEqual(res.data.entityAId, before.entityAId, 'entityAId is immutable');
    assert.strictEqual(res.data.entityBId, before.entityBId, 'entityBId is immutable');
    assert.notStrictEqual(res.data.eTag, before.eTag, 'eTag changed');
    assert.ok(Date.parse(res.data.updatedAt) > Date.parse(res.data.createdAt), 'updatedAt advanced');
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateRelationship — supports move / copy / test ops', async () => {
    const before = relationshipObject({
      id: 'requested-by-11649',
      createdAt: '2026-09-07T08:09:18.363179Z',
      updatedAt: '2026-09-07T08:09:18.363179Z',
      eTag: 'y3rbf8',
      payload: relationshipPayload({ label: 'primary' }),
    });
    const after = relationshipObject({
      id: before.id,
      createdAt: before.createdAt,
      updatedAt: '2026-09-07T08:09:18.782117Z',
      eTag: 'y3rbw7',
      payload: {
        linkedAt: '2026-07-06T10:00:00.000Z',
        labelMoved: 'primary',
        linkedAtCopy: '2026-07-06T10:00:00.000Z',
      },
    });
    const scope = utils
      .createNock()
      // `toJsonPatchOperations` emits a fixed op order — add, replace, remove, move, copy, test —
      // regardless of the order the caller passes them in below.
      .patch(`${RELATIONSHIPS}/${before.id}`, [
        { op: 'move', from: '/payload/label', path: '/payload/labelMoved' },
        { op: 'copy', from: '/payload/linkedAt', path: '/payload/linkedAtCopy' },
        { op: 'test', path: '/payload/linkedAt', value: '2026-07-06T10:00:00.000Z' },
      ])
      .matchHeader('content-type', JSON_PATCH_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: after }, JSON_HEADERS);

    const res = await pubnub.dataSync.updateRelationship({
      id: before.id,
      copy: [{ from: '/payload/linkedAt', path: '/payload/linkedAtCopy' }],
      move: [{ from: '/payload/label', path: '/payload/labelMoved' }],
      test: { '/payload/linkedAt': '2026-07-06T10:00:00.000Z' },
    });

    const payload = res.data.payload as Record<string, unknown>;
    assert.strictEqual(payload.linkedAtCopy, '2026-07-06T10:00:00.000Z', 'linkedAt copied to linkedAtCopy');
    assert.strictEqual(payload.linkedAt, '2026-07-06T10:00:00.000Z', 'source linkedAt retained after copy/test');
    assert.strictEqual(payload.labelMoved, 'primary', 'label moved to labelMoved');
    assert.ok(!('label' in payload), 'source label removed by move');
    assert.notStrictEqual(res.data.eTag, before.eTag, 'eTag changed');
    assert.strictEqual(scope.isDone(), true);
  });

  it('setRelationship — PUT full replace; body carries no `id` and no `relationshipClass`', async () => {
    const before = relationshipObject({
      id: 'requested-by-40771',
      createdAt: '2026-09-07T08:09:22.030338Z',
      updatedAt: '2026-09-07T08:09:22.030338Z',
      eTag: 'y3re7b',
      entityAId: 'customer-81534',
      entityBId: 'loanquote-96329',
    });
    const payload = { linkedAt: '2026-09-01T00:00:00.000Z' };
    const replaced = relationshipObject({
      id: before.id,
      createdAt: before.createdAt,
      updatedAt: '2026-09-07T08:09:22.328181Z',
      eTag: 'y3reoh',
      entityAId: before.entityAId,
      entityBId: before.entityBId,
      status: 'inactive',
      payload,
    });
    const scope = utils
      .createNock()
      // `id` lives in the path and the class is immutable, so neither appears in the body — but both
      // endpoints and `relationshipClassVersion` are still required on a full replace.
      .put(`${RELATIONSHIPS}/${before.id}`, {
        data: {
          entityAId: before.entityAId,
          entityBId: before.entityBId,
          relationshipClassVersion: CLASS_VERSION,
          status: 'inactive',
          payload,
        },
      })
      .matchHeader('content-type', RELATIONSHIP_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: replaced }, JSON_HEADERS);

    const res = await pubnub.dataSync.setRelationship({
      id: before.id,
      entityAId: before.entityAId,
      entityBId: before.entityBId,
      data: { classVersion: CLASS_VERSION, status: 'inactive', payload },
    });

    assert.strictEqual(res.data.id, before.id);
    assert.strictEqual(res.data.status, 'inactive');
    assert.strictEqual(res.data.relationshipClass, RELATIONSHIP_CLASS_REQUESTED_BY, 'class survives a full replace');
    assert.deepStrictEqual(res.data.payload, payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('removeRelationship — DELETE replies 200 with an empty body', async () => {
    const id = 'requested-by-68584';
    const scope = utils.createNock().delete(`${RELATIONSHIPS}/${id}`).query(common).reply(200, '');

    const res = await pubnub.dataSync.removeRelationship({ id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getRelationship — rejects with the service error on 404', async () => {
    const id = 'requested-by-68584';
    const scope = utils
      .createNock()
      .get(`${RELATIONSHIPS}/${id}`)
      .query(common)
      .reply(404, relationshipNotFoundError(id), { 'content-type': 'application/json' });

    await assert.rejects(
      () => pubnub.dataSync.getRelationship({ id }),
      (error: { message: string; status: { statusCode: number; errorData?: unknown } }) => {
        assert.strictEqual(error.status.statusCode, 404, 'status code surfaced');
        assert.strictEqual(error.message, 'REST API request processing error, check status for details');
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

  // --------------------------------------------------------
  // ------------- Optimistic concurrency -------------------
  // --------------------------------------------------------
  // All three mutating verbs accept `ifMatchesEtag`; each forwards it as a bare `If-Match` header.

  it('updateRelationship — forwards ifMatchesEtag as an If-Match header', async () => {
    const before = relationshipObject({ id: 'requested-by-41980', eTag: 'y3r8qh' });
    const scope = utils
      .createNock()
      .patch(`${RELATIONSHIPS}/${before.id}`, [
        { op: 'replace', path: '/payload/linkedAt', value: '2026-08-01T00:00:00.000Z' },
      ])
      .matchHeader('if-match', before.eTag)
      .query(common)
      .reply(200, { data: relationshipObject({ id: before.id, eTag: 'y3r8xl' }) }, JSON_HEADERS);

    await pubnub.dataSync.updateRelationship({
      id: before.id,
      ifMatchesEtag: before.eTag,
      replace: { '/payload/linkedAt': '2026-08-01T00:00:00.000Z' },
    });

    assert.strictEqual(scope.isDone(), true);
  });

  it('setRelationship — forwards ifMatchesEtag as an If-Match header', async () => {
    const before = relationshipObject({ id: 'requested-by-40771', eTag: 'y3re7b' });
    const scope = utils
      .createNock()
      .put(`${RELATIONSHIPS}/${before.id}`)
      .matchHeader('if-match', before.eTag)
      .query(common)
      .reply(200, { data: relationshipObject({ id: before.id, eTag: 'y3reoh' }) }, JSON_HEADERS);

    await pubnub.dataSync.setRelationship({
      id: before.id,
      ifMatchesEtag: before.eTag,
      entityAId: before.entityAId,
      entityBId: before.entityBId,
      data: { classVersion: CLASS_VERSION, payload: relationshipPayload() },
    });

    assert.strictEqual(scope.isDone(), true);
  });

  it('removeRelationship — forwards ifMatchesEtag as an If-Match header', async () => {
    const before = relationshipObject({ id: 'requested-by-68584', eTag: 'y3rgxi' });
    const scope = utils
      .createNock()
      .delete(`${RELATIONSHIPS}/${before.id}`)
      .matchHeader('if-match', before.eTag)
      .query(common)
      .reply(200, '');

    await pubnub.dataSync.removeRelationship({ id: before.id, ifMatchesEtag: before.eTag });

    assert.strictEqual(scope.isDone(), true);
  });

  // --------------------------------------------------------
  // ------------------ List / page / query -----------------
  // --------------------------------------------------------

  it('getRelationships — sends the class as `relationship_class`', async () => {
    const scope = utils
      .createNock()
      .get(RELATIONSHIPS)
      .query({ ...common, relationship_class: RELATIONSHIP_CLASS_REQUESTED_BY, limit: '50' })
      .reply(200, { data: relationshipClassRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getRelationships({
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      limit: 50,
    });

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(
      res.data.map((r) => r.id),
      relationshipClassRows.map((r) => r.id),
    );
    for (const row of res.data)
      assert.strictEqual(row.relationshipClass, RELATIONSHIP_CLASS_REQUESTED_BY, `row ${row.id} is REQUESTED_BY`);
    assert.strictEqual(res.meta?.has_next, false);
    assert.strictEqual(res.meta?.limit, 50);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getRelationships — defaults limit to 20 when the caller omits it', async () => {
    const scope = utils
      .createNock()
      // `GetRelationshipsRequest` applies `limit ??= 20` in its constructor, so an omitted limit still
      // reaches the wire.
      .get(RELATIONSHIPS)
      .query({ ...common, relationship_class: RELATIONSHIP_CLASS_REQUESTED_BY, limit: '20' })
      .reply(200, { data: relationshipClassRows, meta: { has_next: false, limit: 20 } }, JSON_HEADERS);

    await pubnub.dataSync.getRelationships({ class: RELATIONSHIP_CLASS_REQUESTED_BY });

    assert.strictEqual(scope.isDone(), true);
  });

  it('getRelationships — threads next_cursor into the following request', async () => {
    const page1Scope = utils
      .createNock()
      .get(RELATIONSHIPS)
      .query({ ...common, relationship_class: RELATIONSHIP_CLASS_REQUESTED_BY, limit: '2' })
      .reply(
        200,
        {
          data: relationshipListPage1,
          meta: { has_next: true, next_cursor: RELATIONSHIP_CURSOR_PAGE_2, limit: 2 },
        },
        JSON_HEADERS,
      );
    const page2Scope = utils
      .createNock()
      .get(RELATIONSHIPS)
      .query({
        ...common,
        relationship_class: RELATIONSHIP_CLASS_REQUESTED_BY,
        limit: '2',
        cursor: RELATIONSHIP_CURSOR_PAGE_2,
      })
      .reply(200, { data: relationshipListPage2, meta: { has_next: false, limit: 2 } }, JSON_HEADERS);

    const page1 = await pubnub.dataSync.getRelationships({
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      limit: 2,
    });
    assert.strictEqual(page1.data.length, 2, 'page 1 respects limit');
    assert.strictEqual(page1.meta?.next_cursor, RELATIONSHIP_CURSOR_PAGE_2, 'cursor surfaced on page 1');

    const page2 = await pubnub.dataSync.getRelationships({
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      limit: 2,
      cursor: page1.meta!.next_cursor!,
    });
    const seen = new Set(page1.data.map((r) => r.id));
    for (const row of page2.data) assert.ok(!seen.has(row.id), `relationship ${row.id} not on both pages`);
    assert.strictEqual(page2.meta?.has_next, false, 'last page reports no successor');

    assert.strictEqual(page1Scope.isDone(), true);
    assert.strictEqual(page2Scope.isDone(), true);
  });

  it('getRelationships — sends entityAId as `entity_a_id`', async () => {
    const entityAId = 'customer-13775';
    const scope = utils
      .createNock()
      .get(RELATIONSHIPS)
      .query({ ...common, relationship_class: RELATIONSHIP_CLASS_REQUESTED_BY, entity_a_id: entityAId, limit: '50' })
      .reply(200, { data: relationshipsOfEntityA(entityAId), meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getRelationships({
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      entityAId,
      limit: 50,
    });

    for (const row of res.data) assert.strictEqual(row.entityAId, entityAId, `row ${row.id} is anchored on entity A`);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getRelationships — sends entityBId as `entity_b_id`', async () => {
    const entityBId = 'loanquote-35280';
    const scope = utils
      .createNock()
      .get(RELATIONSHIPS)
      .query({ ...common, relationship_class: RELATIONSHIP_CLASS_REQUESTED_BY, entity_b_id: entityBId, limit: '50' })
      .reply(200, { data: relationshipsOfEntityB(entityBId), meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getRelationships({
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      entityBId,
      limit: 50,
    });

    for (const row of res.data) assert.strictEqual(row.entityBId, entityBId, `row ${row.id} is anchored on entity B`);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getRelationships — sends both endpoints plus relationship_class_version to pin one edge', async () => {
    const entityAId = 'customer-13775';
    const entityBId = 'loanquote-35280';
    const scope = utils
      .createNock()
      .get(RELATIONSHIPS)
      .query({
        ...common,
        relationship_class: RELATIONSHIP_CLASS_REQUESTED_BY,
        relationship_class_version: `${CLASS_VERSION}`,
        entity_a_id: entityAId,
        entity_b_id: entityBId,
        limit: '20',
      })
      .reply(
        200,
        { data: [relationshipObject({ entityAId, entityBId })], meta: { has_next: false, limit: 20 } },
        JSON_HEADERS,
      );

    const res = await pubnub.dataSync.getRelationships({
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      classVersion: CLASS_VERSION,
      entityAId,
      entityBId,
    });

    assert.strictEqual(res.data.length, 1);
    assert.strictEqual(res.data[0].entityAId, entityAId);
    assert.strictEqual(res.data[0].entityBId, entityBId);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getRelationships — sends filterFast as `filter_fast`', async () => {
    const filterFast = `linkedAt == '2026-07-06T10:00:00.000Z'`;
    const scope = utils
      .createNock()
      .get(RELATIONSHIPS)
      .query({ ...common, relationship_class: RELATIONSHIP_CLASS_REQUESTED_BY, limit: '50', filter_fast: filterFast })
      .reply(200, { data: relationshipLinkedRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getRelationships({
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      filterFast,
      limit: 50,
    });

    for (const row of res.data)
      assert.strictEqual(
        (row.payload as Record<string, unknown>).linkedAt,
        '2026-07-06T10:00:00.000Z',
        'only matching rows returned',
      );
    assert.strictEqual(scope.isDone(), true);
  });

  it('getRelationships — passes a compound filter expression through verbatim', async () => {
    const filter = `(linkedAt >= '2026-07-01T00:00:00.000Z') AND (label == 'primary')`;
    const scope = utils
      .createNock()
      .get(RELATIONSHIPS)
      .query({ ...common, relationship_class: RELATIONSHIP_CLASS_REQUESTED_BY, limit: '50', filter })
      .reply(200, { data: relationshipLinkedRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    await pubnub.dataSync.getRelationships({
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      filter,
      limit: 50,
    });

    assert.strictEqual(scope.isDone(), true);
  });

  it('getRelationships — serializes an object sort as `field:direction`', async () => {
    const scope = utils
      .createNock()
      .get(RELATIONSHIPS)
      .query({ ...common, relationship_class: RELATIONSHIP_CLASS_REQUESTED_BY, limit: '50', sort: 'createdAt:desc' })
      .reply(200, { data: relationshipSortedDescRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getRelationships({
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      sort: { createdAt: 'desc' },
      limit: 50,
    });

    for (let i = 1; i < res.data.length; i++)
      assert.ok(
        Date.parse(res.data[i - 1].createdAt) >= Date.parse(res.data[i].createdAt),
        'createdAt is non-increasing',
      );
    assert.strictEqual(scope.isDone(), true);
  });

  it('getRelationships — passes a raw string sort through unchanged', async () => {
    const scope = utils
      .createNock()
      // A string `sort` is forwarded verbatim, so a `-field` shorthand reaches the service as typed.
      .get(RELATIONSHIPS)
      .query({ ...common, relationship_class: RELATIONSHIP_CLASS_REQUESTED_BY, limit: '50', sort: '-createdAt' })
      .reply(200, { data: relationshipSortedDescRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    await pubnub.dataSync.getRelationships({
      class: RELATIONSHIP_CLASS_REQUESTED_BY,
      sort: '-createdAt',
      limit: 50,
    });

    assert.strictEqual(scope.isDone(), true);
  });

  // --------------------------------------------------------
  // ------------- Validation (no request sent) -------------
  // --------------------------------------------------------

  it('createRelationship — rejects missing entityAId', async () => {
    const scope = utils.createNock().post(RELATIONSHIPS).reply(201, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        // @ts-expect-error — intentional omission of entityAId to exercise validation.
        pubnub.dataSync.createRelationship({
          class: RELATIONSHIP_CLASS_REQUESTED_BY,
          entityBId: 'loanquote-23500',
          data: { classVersion: CLASS_VERSION, payload: {} },
        }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Entity A id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('createRelationship — rejects missing entityBId', async () => {
    const scope = utils.createNock().post(RELATIONSHIPS).reply(201, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        // @ts-expect-error — intentional omission of entityBId to exercise validation.
        pubnub.dataSync.createRelationship({
          class: RELATIONSHIP_CLASS_REQUESTED_BY,
          entityAId: 'customer-20648',
          data: { classVersion: CLASS_VERSION, payload: {} },
        }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Entity B id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('createRelationship — rejects missing class', async () => {
    const scope = utils.createNock().post(RELATIONSHIPS).reply(201, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        // @ts-expect-error — intentional omission of class to exercise validation.
        pubnub.dataSync.createRelationship({
          entityAId: 'customer-20648',
          entityBId: 'loanquote-23500',
          data: { classVersion: CLASS_VERSION, payload: {} },
        }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Relationship class cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('createRelationship — rejects missing classVersion', async () => {
    const scope = utils.createNock().post(RELATIONSHIPS).reply(201, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        pubnub.dataSync.createRelationship({
          class: RELATIONSHIP_CLASS_REQUESTED_BY,
          entityAId: 'customer-20648',
          entityBId: 'loanquote-23500',
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

  it('setRelationship — rejects empty id', async () => {
    const scope = utils
      .createNock()
      .put(new RegExp(`^${RELATIONSHIPS}`))
      .reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        pubnub.dataSync.setRelationship({
          id: '',
          entityAId: 'customer-20648',
          entityBId: 'loanquote-23500',
          data: { classVersion: CLASS_VERSION, payload: {} },
        }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Relationship id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('updateRelationship — rejects empty add/replace/remove', async () => {
    const scope = utils.createNock().patch(`${RELATIONSHIPS}/placeholder`).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () => pubnub.dataSync.updateRelationship({ id: 'placeholder' }),
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

  it('getRelationship — rejects empty id', async () => {
    const scope = utils.createNock().get(RELATIONSHIPS).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () => pubnub.dataSync.getRelationship({ id: '' }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Relationship id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('getRelationships — rejects a missing class', async () => {
    const scope = utils.createNock().get(RELATIONSHIPS).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      // @ts-expect-error — intentional omission of `class` to exercise validation.
      () => pubnub.dataSync.getRelationships({ limit: 50 }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Relationship class cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });
});
