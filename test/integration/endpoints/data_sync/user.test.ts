/* global describe, beforeEach, it, before, afterEach */

/**
 * DataSync typed User REST endpoint tests.
 *
 * Every request is served by a `nock` interceptor built from a live capture of these same endpoints,
 * so each test pins both halves of the contract: the exact method / path / query / body / Content-Type
 * the SDK emits, and the way the recorded reply is parsed back out. `scope.isDone()` is what proves
 * the request matched.
 *
 * `User` is a globally scoped class at `entityClassVersion` 1.
 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../../src/node/index';
import utils from '../../../utils';
import {
  CLASS_VERSION,
  USER_CURSOR_PAGE_2,
  USER_CURSOR_PAGE_3,
  accessDeniedError,
  notFoundError,
  userEngineeringRows,
  userListPage1,
  userListPage2,
  userObject,
  userPayload,
  userSortedDescRows,
} from './fixtures';

/** Content type the service uses for the user resource, on both requests and responses. */
const USER_MEDIA_TYPE = 'application/vnd.pubnub.objects.user+json;version=1';
const JSON_PATCH_MEDIA_TYPE = 'application/json-patch+json';
const JSON_HEADERS = { 'content-type': USER_MEDIA_TYPE };

describe('DataSync User Endpoints', () => {
  const SUBSCRIBE_KEY = 'mySubKey';
  const PUBLISH_KEY = 'myPublishKey';
  const AUTH_KEY = 'myAuthKey';
  const UUID = 'myUUID';
  const USERS = `/v1/datasync/subkeys/${SUBSCRIBE_KEY}/users`;

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
  // ------------------------- CRUD -------------------------
  // --------------------------------------------------------

  it('createUser — POST returns fully-formed user', async () => {
    const id = 'user-90786';
    const payload = {
      firstName: 'Amelia',
      lastName: 'Acharya',
      email: 'amelia.acharya@acme.test',
      department: 'Engineering',
      level: 'L3',
      location: 'Pune',
      isActive: true,
    };
    const created = userObject({ id, eTag: 'y2j19m', payload });
    const scope = utils
      .createNock()
      // `classVersion` goes on the wire as `entityClassVersion`; `id` travels in the body on create.
      // `entityClass` is absent because the caller let the service apply its default (`User`).
      .post(USERS, { data: { id, entityClassVersion: CLASS_VERSION, status: 'active', payload } })
      .matchHeader('content-type', USER_MEDIA_TYPE)
      .query(common)
      .reply(201, { data: created }, JSON_HEADERS);

    const res = await pubnub.dataSync.createUser({
      id,
      data: { classVersion: CLASS_VERSION, status: 'active', payload },
    });

    assert.strictEqual(res.status, 201, 'create replies 201');
    assert.strictEqual(res.data.id, id);
    assert.strictEqual(res.data.entityClassVersion, CLASS_VERSION);
    assert.strictEqual(res.data.status, 'active');
    assert.strictEqual(res.data.eTag, created.eTag);
    assert.strictEqual(res.data.createdAt, created.createdAt);
    assert.strictEqual(res.data.updatedAt, created.updatedAt);
    assert.deepStrictEqual(res.data.payload, payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('createUser — sends an explicit subclass as `entityClass` and classLevel as `entityClassLevel`', async () => {
    const id = 'user-40021';
    const created = userObject({ id, entityClass: 'Employee', entityClassLevel: 'SubKey', eTag: 'y2j2aa' });
    const scope = utils
      .createNock()
      // `class` is optional for users — when given it must be `User` or a subclass of it.
      .post(USERS, {
        data: {
          id,
          entityClass: 'Employee',
          entityClassVersion: CLASS_VERSION,
          entityClassLevel: 'SubKey',
          payload: userPayload(),
        },
      })
      .matchHeader('content-type', USER_MEDIA_TYPE)
      .query(common)
      .reply(201, { data: created }, JSON_HEADERS);

    await pubnub.dataSync.createUser({
      id,
      class: 'Employee',
      classLevel: 'SubKey',
      data: { classVersion: CLASS_VERSION, payload: userPayload() },
    });

    assert.strictEqual(scope.isDone(), true);
  });

  it('getUser — GET reads back', async () => {
    const stored = userObject({ id: 'user-99961', payload: userPayload({ department: 'Engineering' }) });
    const scope = utils
      .createNock()
      .get(`${USERS}/${stored.id}`)
      .query(common)
      .reply(200, { data: stored }, JSON_HEADERS);

    const res = await pubnub.dataSync.getUser({ id: stored.id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.id, stored.id);
    assert.strictEqual(res.data.eTag, stored.eTag);
    assert.strictEqual(res.data.entityClassVersion, CLASS_VERSION);
    assert.strictEqual(res.data.status, 'active');
    assert.deepStrictEqual(res.data.payload, stored.payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateUser — add/replace/remove sends a JSON Patch document', async () => {
    const before = userObject({ id: 'user-51687', eTag: 'y2j5ab', payload: userPayload({ isActive: true }) });
    const after = userObject({
      id: before.id,
      eTag: 'y2j6cd',
      updatedAt: '2026-09-07T07:34:59.111222Z',
      payload: userPayload({ email: 'updated@acme.test', phone: '+15550100' }),
    });
    const scope = utils
      .createNock()
      // Paths are JSON Pointers sent verbatim, including the `/payload` prefix.
      .patch(`${USERS}/${before.id}`, [
        { op: 'add', path: '/payload/phone', value: '+15550100' },
        { op: 'replace', path: '/payload/email', value: 'updated@acme.test' },
        { op: 'remove', path: '/payload/isActive' },
      ])
      .matchHeader('content-type', JSON_PATCH_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: after }, JSON_HEADERS);

    const res = await pubnub.dataSync.updateUser({
      id: before.id,
      add: { '/payload/phone': '+15550100' },
      replace: { '/payload/email': 'updated@acme.test' },
      remove: ['/payload/isActive'],
    });

    const payload = res.data.payload as Record<string, unknown>;
    assert.strictEqual(payload.phone, '+15550100', 'phone added');
    assert.strictEqual(payload.email, 'updated@acme.test', 'email replaced');
    assert.ok(!('isActive' in payload), 'isActive removed');
    assert.notStrictEqual(res.data.eTag, before.eTag, 'eTag changed');
    assert.ok(Date.parse(res.data.updatedAt) > Date.parse(res.data.createdAt), 'updatedAt advanced');
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateUser — supports move / copy / test ops', async () => {
    const before = userObject({ id: 'user-81905', eTag: 'y2j77p' });
    const patched = userPayload({ surname: 'Verma', nickname: 'Alice' });
    delete (patched as Record<string, unknown>).lastName;
    const after = userObject({
      id: before.id,
      eTag: 'y2j88q',
      updatedAt: '2026-09-07T07:35:00.865828Z',
      payload: patched,
    });
    const scope = utils
      .createNock()
      // `toJsonPatchOperations` emits a fixed op order — add, replace, remove, move, copy, test —
      // regardless of the order the caller passes them in below.
      .patch(`${USERS}/${before.id}`, [
        { op: 'move', from: '/payload/lastName', path: '/payload/surname' },
        { op: 'copy', from: '/payload/firstName', path: '/payload/nickname' },
        { op: 'test', path: '/payload/email', value: 'alice.verma@acme.test' },
      ])
      .matchHeader('content-type', JSON_PATCH_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: after }, JSON_HEADERS);

    const res = await pubnub.dataSync.updateUser({
      id: before.id,
      copy: [{ from: '/payload/firstName', path: '/payload/nickname' }],
      move: [{ from: '/payload/lastName', path: '/payload/surname' }],
      test: { '/payload/email': 'alice.verma@acme.test' },
    });

    const payload = res.data.payload as Record<string, unknown>;
    assert.strictEqual(payload.nickname, 'Alice', 'firstName copied to nickname');
    assert.strictEqual(payload.firstName, 'Alice', 'firstName still present after copy');
    assert.strictEqual(payload.surname, 'Verma', 'lastName moved to surname');
    assert.ok(!('lastName' in payload), 'lastName removed by move');
    assert.strictEqual(payload.email, 'alice.verma@acme.test', 'email unchanged (test op)');
    assert.notStrictEqual(res.data.eTag, before.eTag, 'eTag changed');
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateUser — forwards ifMatchesEtag as an If-Match header', async () => {
    const before = userObject({ id: 'user-81905', eTag: 'y2j77p' });
    const scope = utils
      .createNock()
      .patch(`${USERS}/${before.id}`, [{ op: 'replace', path: '/payload/firstName', value: 'Amelia' }])
      .matchHeader('if-match', before.eTag)
      .query(common)
      .reply(200, { data: userObject({ id: before.id, eTag: 'y2j99r' }) }, JSON_HEADERS);

    await pubnub.dataSync.updateUser({
      id: before.id,
      ifMatchesEtag: before.eTag,
      replace: { '/payload/firstName': 'Amelia' },
    });

    assert.strictEqual(scope.isDone(), true);
  });

  it('setUser — PUT full replace; id in the path, entityClass never in the body', async () => {
    const id = 'user-79435';
    const payload = { firstName: 'Bianca', lastName: 'Rao', email: 'bianca.rao@acme.test', department: 'Sales' };
    const replaced = userObject({
      id,
      eTag: 'y2j9i1',
      updatedAt: '2026-09-07T07:35:03.328618Z',
      status: 'inactive',
      payload,
    });
    const scope = utils
      .createNock()
      // `entityClass` is immutable, so a full replace carries only classVersion / status / payload.
      .put(`${USERS}/${id}`, { data: { entityClassVersion: CLASS_VERSION, status: 'inactive', payload } })
      .matchHeader('content-type', USER_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: replaced }, JSON_HEADERS);

    const res = await pubnub.dataSync.setUser({
      id,
      data: { classVersion: CLASS_VERSION, status: 'inactive', payload },
    });

    assert.strictEqual(res.data.id, id);
    assert.strictEqual(res.data.status, 'inactive');
    assert.deepStrictEqual(res.data.payload, payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('removeUser — DELETE replies 200 with an empty body', async () => {
    const id = 'user-90051';
    const scope = utils.createNock().delete(`${USERS}/${id}`).query(common).reply(200, '');

    const res = await pubnub.dataSync.removeUser({ id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getUser — rejects with the service error on 404', async () => {
    const id = 'user-90051';
    const scope = utils
      .createNock()
      .get(`${USERS}/${id}`)
      .query(common)
      .reply(404, notFoundError(id), { 'content-type': 'application/json' });

    await assert.rejects(
      () => pubnub.dataSync.getUser({ id }),
      (error: { message: string; status: { statusCode: number; errorData?: unknown } }) => {
        assert.strictEqual(error.status.statusCode, 404, 'status code surfaced');
        assert.strictEqual(error.message, 'REST API request processing error, check status for details');
        assert.deepStrictEqual(
          error.status.errorData,
          notFoundError(id),
          'DataSync `errors[]` envelope reachable through `status.errorData`',
        );
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), true);
  });

  it('createUser — surfaces an Access Manager 403 as PNAccessDeniedCategory', async () => {
    const id = 'user-51687';
    const scope = utils
      .createNock()
      .post(USERS)
      .query(common)
      // Access Manager replies with its own `{ error, status, service, message }` envelope under a
      // `text/javascript` content type — not the DataSync `{ errors: [...] }` one.
      .reply(403, accessDeniedError, { 'content-type': 'text/javascript; charset=UTF-8' });

    await assert.rejects(
      () =>
        pubnub.dataSync.createUser({
          id,
          data: { classVersion: CLASS_VERSION, status: 'active', payload: userPayload() },
        }),
      (error: { message: string; status: { statusCode: number; category: string; errorData?: unknown } }) => {
        assert.strictEqual(error.status.statusCode, 403);
        assert.strictEqual(error.status.category, 'PNAccessDeniedCategory');
        // Both envelope shapes land in `status.errorData` verbatim and share the generic message.
        assert.strictEqual(error.message, 'REST API request processing error, check status for details');
        assert.deepStrictEqual(error.status.errorData, accessDeniedError);
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), true);
  });

  // --------------------------------------------------------
  // ------------------ List / page / query -----------------
  // --------------------------------------------------------
  // `/users` takes no `entity_class` parameter — the class is implied by the endpoint.

  it('getUsers — sends limit and returns the list envelope', async () => {
    const scope = utils
      .createNock()
      .get(USERS)
      .query({ ...common, limit: '10' })
      .reply(
        200,
        { data: userListPage1, meta: { has_next: true, next_cursor: USER_CURSOR_PAGE_2, limit: 10 } },
        JSON_HEADERS,
      );

    const res = await pubnub.dataSync.getUsers({ limit: 10 });

    assert.ok(Array.isArray(res.data), 'data is an array');
    assert.deepStrictEqual(
      res.data.map((user) => user.id),
      userListPage1.map((user) => user.id),
    );
    assert.strictEqual(res.meta?.limit, 10);
    assert.strictEqual(res.meta?.has_next, true);
    assert.strictEqual(res.meta?.next_cursor, USER_CURSOR_PAGE_2);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getUsers — defaults limit to 20 when the caller omits it', async () => {
    const scope = utils
      .createNock()
      // `GetUsersRequest` applies `limit ??= 20` in its constructor, so an omitted limit still
      // reaches the wire.
      .get(USERS)
      .query({ ...common, limit: '20' })
      .reply(200, { data: userListPage1, meta: { has_next: false } }, JSON_HEADERS);

    await pubnub.dataSync.getUsers({});

    assert.strictEqual(scope.isDone(), true);
  });

  it('getUsers — threads next_cursor into the following request', async () => {
    const page1Scope = utils
      .createNock()
      .get(USERS)
      .query({ ...common, limit: '2' })
      .reply(
        200,
        { data: userListPage1, meta: { has_next: true, next_cursor: USER_CURSOR_PAGE_2, limit: 2 } },
        JSON_HEADERS,
      );
    const page2Scope = utils
      .createNock()
      .get(USERS)
      .query({ ...common, limit: '2', cursor: USER_CURSOR_PAGE_2 })
      .reply(
        200,
        { data: userListPage2, meta: { has_next: true, next_cursor: USER_CURSOR_PAGE_3, limit: 2 } },
        JSON_HEADERS,
      );

    const page1 = await pubnub.dataSync.getUsers({ limit: 2 });
    assert.strictEqual(page1.data.length, 2, 'page 1 respects limit');
    assert.strictEqual(page1.meta?.next_cursor, USER_CURSOR_PAGE_2, 'cursor surfaced on page 1');

    const page2 = await pubnub.dataSync.getUsers({ limit: 2, cursor: page1.meta!.next_cursor! });
    const seen = new Set(page1.data.map((user) => user.id));
    for (const user of page2.data) assert.ok(!seen.has(user.id), `id ${user.id} not on both pages`);

    assert.strictEqual(page1Scope.isDone(), true);
    assert.strictEqual(page2Scope.isDone(), true);
  });

  it('getUsers — passes the filter expression through verbatim', async () => {
    const filter = `department == 'Engineering'`;
    const scope = utils
      .createNock()
      .get(USERS)
      .query({ ...common, limit: '50', filter })
      .reply(200, { data: userEngineeringRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getUsers({ filter, limit: 50 });

    for (const user of res.data)
      assert.strictEqual(
        (user.payload as Record<string, unknown>).department,
        'Engineering',
        'only Engineering rows returned',
      );
    assert.strictEqual(scope.isDone(), true);
  });

  it('getUsers — sends a compound filter unescaped, and filterFast as `filter_fast`', async () => {
    const filter = `(department == 'Engineering') AND (location == 'Pune')`;
    const scope = utils
      .createNock()
      .get(USERS)
      .query({ ...common, limit: '50', filter, filter_fast: 'isActive == true' })
      .reply(200, { data: userEngineeringRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    await pubnub.dataSync.getUsers({ filter, filterFast: 'isActive == true', limit: 50 });

    assert.strictEqual(scope.isDone(), true);
  });

  it('getUsers — serializes an object sort as `field:direction`', async () => {
    const scope = utils
      .createNock()
      .get(USERS)
      .query({ ...common, limit: '50', sort: 'createdAt:desc' })
      .reply(200, { data: userSortedDescRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getUsers({ sort: { createdAt: 'desc' }, limit: 50 });

    for (let i = 1; i < res.data.length; i++)
      assert.ok(
        Date.parse(res.data[i - 1].createdAt) >= Date.parse(res.data[i].createdAt),
        'createdAt is non-increasing',
      );
    assert.strictEqual(scope.isDone(), true);
  });

  it('getUsers — passes a raw string sort through unchanged', async () => {
    const scope = utils
      .createNock()
      // A string `sort` is forwarded verbatim, so a `-field` shorthand reaches the service as typed.
      .get(USERS)
      .query({ ...common, limit: '50', sort: '-createdAt', entity_class_version: `${CLASS_VERSION}` })
      .reply(200, { data: userSortedDescRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    await pubnub.dataSync.getUsers({ sort: '-createdAt', entityClassVersion: CLASS_VERSION, limit: 50 });

    assert.strictEqual(scope.isDone(), true);
  });

  it('getUsers — sends entityClass/entityClassLevel as `entity_class`/`entity_class_level`', async () => {
    const scope = utils
      .createNock()
      .get(USERS)
      .query({
        ...common,
        entity_class: 'User',
        entity_class_version: `${CLASS_VERSION}`,
        entity_class_level: 'Global',
        limit: '50',
      })
      .reply(200, { data: userListPage1, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getUsers({
      entityClass: 'User',
      entityClassVersion: CLASS_VERSION,
      entityClassLevel: 'Global',
      limit: 50,
    });

    for (const user of res.data) {
      assert.strictEqual((user as unknown as { entityClass: string }).entityClass, 'User');
      assert.strictEqual((user as unknown as { entityClassLevel: string }).entityClassLevel, 'Global');
    }
    assert.strictEqual(scope.isDone(), true);
  });

  // --------------------------------------------------------
  // ------------- Validation (no request sent) -------------
  // --------------------------------------------------------

  it('updateUser — rejects empty add/replace/remove', async () => {
    const scope = utils.createNock().patch(`${USERS}/placeholder`).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () => pubnub.dataSync.updateUser({ id: 'placeholder' }),
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

  it('getUser — rejects empty id', async () => {
    const scope = utils.createNock().get(USERS).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () => pubnub.dataSync.getUser({ id: '' }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'User id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('createUser — rejects missing classVersion', async () => {
    const scope = utils.createNock().post(USERS).reply(201, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        // @ts-expect-error — intentional omission of classVersion to exercise validation.
        pubnub.dataSync.createUser({ data: { status: 'active', payload: {} } }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Entity class version cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('setUser — rejects empty id', async () => {
    const scope = utils.createNock().put(USERS).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () => pubnub.dataSync.setUser({ id: '', data: { classVersion: CLASS_VERSION, payload: {} } }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'User id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });
});
