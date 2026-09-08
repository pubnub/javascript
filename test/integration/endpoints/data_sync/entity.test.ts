/* global describe, beforeEach, it, before, afterEach */

/**
 * DataSync generic Entity REST endpoint tests.
 *
 * Every request is served by a `nock` interceptor built from a live capture of these same endpoints,
 * so each test pins both halves of the contract: the exact method / path / query / body / Content-Type
 * the SDK emits, and the way the recorded reply is parsed back out. `scope.isDone()` is what proves
 * the request matched.
 *
 * Class under test: `Customer` — sub-key scoped, `entityClassVersion` 1.
 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../../src/node/index';
import utils from '../../../utils';
import {
  CLASS_VERSION,
  ENTITY_CLASS_CUSTOMER,
  ENTITY_CURSOR_PAGE_2,
  ENTITY_CURSOR_PAGE_3,
  customerPayload,
  entityListPage1,
  entityListPage2,
  entityObject,
  entityPuneRows,
  entitySortedDescRows,
  notFoundError,
} from './fixtures';

/** Content type the service uses for the entity resource, on both requests and responses. */
const ENTITY_MEDIA_TYPE = 'application/vnd.pubnub.objects.entity+json;version=1';
const JSON_PATCH_MEDIA_TYPE = 'application/json-patch+json';
const JSON_HEADERS = { 'content-type': ENTITY_MEDIA_TYPE };

describe('DataSync Entity Endpoints', () => {
  const SUBSCRIBE_KEY = 'mySubKey';
  const PUBLISH_KEY = 'myPublishKey';
  const AUTH_KEY = 'myAuthKey';
  const UUID = 'myUUID';
  const ENTITIES = `/v1/datasync/subkeys/${SUBSCRIBE_KEY}/entities`;

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

  it('createEntity — POST returns a fully formed entity', async () => {
    const id = 'customer-43508';
    const created = entityObject({ id });
    const scope = utils
      .createNock()
      // `class` goes on the wire as `entityClass` and `data.classVersion` as `entityClassVersion`;
      // `id` travels in the body on create.
      .post(ENTITIES, {
        data: {
          id,
          entityClass: ENTITY_CLASS_CUSTOMER,
          entityClassVersion: CLASS_VERSION,
          status: 'active',
          payload: customerPayload(id),
        },
      })
      .matchHeader('content-type', ENTITY_MEDIA_TYPE)
      .query(common)
      .reply(201, { data: created }, JSON_HEADERS);

    const res = await pubnub.dataSync.createEntity({
      id,
      class: ENTITY_CLASS_CUSTOMER,
      data: { classVersion: CLASS_VERSION, status: 'active', payload: customerPayload(id) },
    });

    assert.strictEqual(res.status, 201, 'create replies 201');
    assert.strictEqual(res.data.id, id);
    assert.strictEqual(res.data.entityClass, ENTITY_CLASS_CUSTOMER);
    assert.strictEqual(res.data.entityClassVersion, CLASS_VERSION);
    assert.strictEqual(res.data.status, 'active');
    assert.strictEqual(res.data.eTag, created.eTag);
    assert.strictEqual(res.data.createdAt, created.createdAt);
    assert.strictEqual(res.data.updatedAt, created.updatedAt);
    assert.deepStrictEqual(res.data.payload, created.payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('createEntity — sends classLevel as `entityClassLevel`, and omits id when absent', async () => {
    const serverGenerated = entityObject({ id: 'e3d1f0c2-8b64-4a1e-9f2c-5d7a6b9c0e11' });
    const scope = utils
      .createNock()
      // No `id` key at all: the service auto-generates a UUID when the caller omits it.
      .post(ENTITIES, {
        data: {
          entityClass: ENTITY_CLASS_CUSTOMER,
          entityClassVersion: CLASS_VERSION,
          entityClassLevel: 'SubKey',
          payload: { customerId: 'anonymous' },
        },
      })
      .matchHeader('content-type', ENTITY_MEDIA_TYPE)
      .query(common)
      .reply(201, { data: serverGenerated }, JSON_HEADERS);

    const res = await pubnub.dataSync.createEntity({
      class: ENTITY_CLASS_CUSTOMER,
      classLevel: 'SubKey',
      data: { classVersion: CLASS_VERSION, payload: { customerId: 'anonymous' } },
    });

    assert.strictEqual(res.data.id, serverGenerated.id, 'server-assigned id surfaced');
    assert.strictEqual(scope.isDone(), true);
  });

  it('getEntity — GET reads back', async () => {
    const stored = entityObject({ id: 'customer-16321', eTag: 'y26ue7' });
    const scope = utils
      .createNock()
      .get(`${ENTITIES}/${stored.id}`)
      .query(common)
      .reply(200, { data: stored }, JSON_HEADERS);

    const res = await pubnub.dataSync.getEntity({ id: stored.id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.id, stored.id);
    assert.strictEqual(res.data.eTag, stored.eTag);
    assert.strictEqual(res.data.entityClass, ENTITY_CLASS_CUSTOMER);
    assert.strictEqual(res.data.entityClassVersion, CLASS_VERSION);
    assert.deepStrictEqual(res.data.payload, stored.payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateEntity — add/replace/remove sends a JSON Patch document', async () => {
    const before = entityObject({ id: 'customer-16321', eTag: 'y26tel' });
    const patched = customerPayload(before.id, { creditScore: 810, phone: '+15550100' });
    delete (patched as Record<string, unknown>).city;
    const after = entityObject({
      id: before.id,
      eTag: 'y26ue7',
      updatedAt: '2026-09-07T07:25:23.622306Z',
      payload: patched,
    });

    const scope = utils
      .createNock()
      // Paths are JSON Pointers sent verbatim, including the `/payload` prefix.
      .patch(`${ENTITIES}/${before.id}`, [
        { op: 'add', path: '/payload/phone', value: '+15550100' },
        { op: 'replace', path: '/payload/creditScore', value: 810 },
        { op: 'remove', path: '/payload/city' },
      ])
      .matchHeader('content-type', JSON_PATCH_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: after }, JSON_HEADERS);

    const res = await pubnub.dataSync.updateEntity({
      id: before.id,
      replace: { '/payload/creditScore': 810 },
      add: { '/payload/phone': '+15550100' },
      remove: ['/payload/city'],
    });

    const payload = res.data.payload as Record<string, unknown>;
    assert.strictEqual(payload.creditScore, 810, 'creditScore replaced');
    assert.strictEqual(payload.phone, '+15550100', 'phone added');
    assert.ok(!('city' in payload), 'city removed');
    assert.notStrictEqual(res.data.eTag, before.eTag, 'eTag changed');
    assert.ok(Date.parse(res.data.updatedAt) > Date.parse(res.data.createdAt), 'updatedAt advanced');
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateEntity — supports move / copy / test ops', async () => {
    const before = entityObject({ id: 'customer-77047', eTag: 'y26w0a' });
    const patched = customerPayload(before.id, { score: 720, firstNameCopy: 'Alice' });
    delete (patched as Record<string, unknown>).creditScore;
    const after = entityObject({
      id: before.id,
      eTag: 'y26w8f',
      updatedAt: '2026-09-07T07:25:25.494894Z',
      payload: patched,
    });

    const scope = utils
      .createNock()
      // `toJsonPatchOperations` emits a fixed op order — add, replace, remove, move, copy, test —
      // regardless of the order the caller passes them in below.
      .patch(`${ENTITIES}/${before.id}`, [
        { op: 'move', from: '/payload/creditScore', path: '/payload/score' },
        { op: 'copy', from: '/payload/firstName', path: '/payload/firstNameCopy' },
        { op: 'test', path: '/payload/firstName', value: 'Alice' },
      ])
      .matchHeader('content-type', JSON_PATCH_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: after }, JSON_HEADERS);

    const res = await pubnub.dataSync.updateEntity({
      id: before.id,
      copy: [{ from: '/payload/firstName', path: '/payload/firstNameCopy' }],
      move: [{ from: '/payload/creditScore', path: '/payload/score' }],
      test: { '/payload/firstName': 'Alice' },
    });

    const payload = res.data.payload as Record<string, unknown>;
    assert.strictEqual(payload.firstNameCopy, 'Alice', 'firstName copied to firstNameCopy');
    assert.strictEqual(payload.firstName, 'Alice', 'firstName still present (copy leaves source)');
    assert.strictEqual(payload.score, 720, 'creditScore moved to score');
    assert.ok(!('creditScore' in payload), 'creditScore removed after move');
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateEntity — forwards ifMatchesEtag as an If-Match header', async () => {
    const before = entityObject({ id: 'customer-16321', eTag: 'y26tel' });
    const scope = utils
      .createNock()
      .patch(`${ENTITIES}/${before.id}`, [{ op: 'replace', path: '/payload/creditScore', value: 700 }])
      .matchHeader('if-match', before.eTag)
      .query(common)
      .reply(200, { data: entityObject({ id: before.id, eTag: 'y26v11' }) }, JSON_HEADERS);

    await pubnub.dataSync.updateEntity({
      id: before.id,
      ifMatchesEtag: before.eTag,
      replace: { '/payload/creditScore': 700 },
    });

    assert.strictEqual(scope.isDone(), true);
  });

  it('setEntity — PUT full replace; id in the path, entityClass never in the body', async () => {
    const id = 'customer-70652';
    const payload = customerPayload(id, { creditScore: 600, city: 'Mumbai' });
    const replaced = entityObject({
      id,
      eTag: 'y26x59',
      updatedAt: '2026-09-07T07:25:27.380429Z',
      status: 'inactive',
      payload,
    });
    const scope = utils
      .createNock()
      // `entityClass` is immutable, so a full replace carries only classVersion / status / payload.
      .put(`${ENTITIES}/${id}`, { data: { entityClassVersion: CLASS_VERSION, status: 'inactive', payload } })
      .matchHeader('content-type', ENTITY_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: replaced }, JSON_HEADERS);

    const res = await pubnub.dataSync.setEntity({
      id,
      data: { classVersion: CLASS_VERSION, status: 'inactive', payload },
    });

    assert.strictEqual(res.data.id, id);
    assert.strictEqual(res.data.status, 'inactive');
    assert.strictEqual(res.data.entityClass, ENTITY_CLASS_CUSTOMER, 'class unchanged by a full replace');
    assert.deepStrictEqual(res.data.payload, payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('removeEntity — DELETE replies 200 with an empty body', async () => {
    const id = 'customer-60695';
    const scope = utils.createNock().delete(`${ENTITIES}/${id}`).query(common).reply(200, '');

    const res = await pubnub.dataSync.removeEntity({ id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getEntity — rejects with the service error on 404', async () => {
    const id = 'customer-33238';
    const scope = utils
      .createNock()
      .get(`${ENTITIES}/${id}`)
      .query(common)
      .reply(404, notFoundError(id), { 'content-type': 'application/json' });

    await assert.rejects(
      () => pubnub.dataSync.getEntity({ id }),
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

  // --------------------------------------------------------
  // ------------------ List / page / query -----------------
  // --------------------------------------------------------

  it('getEntities — sends entity_class plus limit and returns the list envelope', async () => {
    const scope = utils
      .createNock()
      .get(ENTITIES)
      .query({ ...common, entity_class: ENTITY_CLASS_CUSTOMER, limit: '50' })
      .reply(200, { data: entityListPage1, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getEntities({ class: ENTITY_CLASS_CUSTOMER, limit: 50 });

    assert.ok(Array.isArray(res.data), 'data is an array');
    assert.deepStrictEqual(
      res.data.map((row) => row.id),
      entityListPage1.map((row) => row.id),
    );
    for (const row of res.data) assert.strictEqual(row.entityClass, ENTITY_CLASS_CUSTOMER, 'every row is a Customer');
    assert.strictEqual(res.meta?.limit, 50);
    assert.strictEqual(res.meta?.has_next, false);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getEntities — threads next_cursor into the following request', async () => {
    const page1Scope = utils
      .createNock()
      .get(ENTITIES)
      .query({ ...common, entity_class: ENTITY_CLASS_CUSTOMER, limit: '2' })
      .reply(
        200,
        { data: entityListPage1, meta: { has_next: true, next_cursor: ENTITY_CURSOR_PAGE_2, limit: 2 } },
        JSON_HEADERS,
      );
    const page2Scope = utils
      .createNock()
      .get(ENTITIES)
      .query({ ...common, entity_class: ENTITY_CLASS_CUSTOMER, limit: '2', cursor: ENTITY_CURSOR_PAGE_2 })
      .reply(
        200,
        { data: entityListPage2, meta: { has_next: true, next_cursor: ENTITY_CURSOR_PAGE_3, limit: 2 } },
        JSON_HEADERS,
      );

    const page1 = await pubnub.dataSync.getEntities({ class: ENTITY_CLASS_CUSTOMER, limit: 2 });
    assert.strictEqual(page1.data.length, 2, 'page 1 respects limit');
    assert.strictEqual(page1.meta?.next_cursor, ENTITY_CURSOR_PAGE_2, 'cursor surfaced on page 1');

    const page2 = await pubnub.dataSync.getEntities({
      class: ENTITY_CLASS_CUSTOMER,
      limit: 2,
      cursor: page1.meta!.next_cursor!,
    });
    const seen = new Set(page1.data.map((row) => row.id));
    for (const row of page2.data) assert.ok(!seen.has(row.id), `id ${row.id} not on both pages`);

    assert.strictEqual(page1Scope.isDone(), true);
    assert.strictEqual(page2Scope.isDone(), true);
  });

  it('getEntities — sends filterFast as `filter_fast` and classVersion as `entity_class_version`', async () => {
    const scope = utils
      .createNock()
      .get(ENTITIES)
      .query({
        ...common,
        entity_class: ENTITY_CLASS_CUSTOMER,
        entity_class_version: `${CLASS_VERSION}`,
        limit: '50',
        filter_fast: `city == 'Pune'`,
      })
      .reply(200, { data: entityPuneRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getEntities({
      class: ENTITY_CLASS_CUSTOMER,
      classVersion: CLASS_VERSION,
      filterFast: `city == 'Pune'`,
      limit: 50,
    });

    for (const row of res.data)
      assert.strictEqual((row.payload as Record<string, unknown>).city, 'Pune', 'only Pune rows returned');
    assert.strictEqual(scope.isDone(), true);
  });

  it('getEntities — sends classLevel as `entity_class_level`', async () => {
    const scope = utils
      .createNock()
      // The provisioned `Customer` class is sub-key scoped, so `SubKey` is what disambiguates it from
      // a same-named global class.
      .get(ENTITIES)
      .query({
        ...common,
        entity_class: ENTITY_CLASS_CUSTOMER,
        entity_class_version: `${CLASS_VERSION}`,
        entity_class_level: 'SubKey',
        limit: '50',
      })
      .reply(200, { data: entityListPage1, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getEntities({
      class: ENTITY_CLASS_CUSTOMER,
      classVersion: CLASS_VERSION,
      classLevel: 'SubKey',
      limit: 50,
    });

    for (const row of res.data)
      assert.strictEqual((row as unknown as { entityClassLevel: string }).entityClassLevel, 'SubKey');
    assert.strictEqual(scope.isDone(), true);
  });

  it('getEntities — passes the `filter` expression through verbatim, alongside filterFast', async () => {
    const scope = utils
      .createNock()
      .get(ENTITIES)
      .query({
        ...common,
        entity_class: ENTITY_CLASS_CUSTOMER,
        limit: '50',
        filter: `creditScore >= 700 && city == 'Pune'`,
        filter_fast: `city == 'Pune'`,
      })
      .reply(200, { data: entityPuneRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    await pubnub.dataSync.getEntities({
      class: ENTITY_CLASS_CUSTOMER,
      filter: `creditScore >= 700 && city == 'Pune'`,
      filterFast: `city == 'Pune'`,
      limit: 50,
    });

    assert.strictEqual(scope.isDone(), true);
  });

  it('getEntities — serializes an object sort as `field:direction`', async () => {
    const scope = utils
      .createNock()
      .get(ENTITIES)
      .query({ ...common, entity_class: ENTITY_CLASS_CUSTOMER, limit: '100', sort: 'firstName:desc' })
      .reply(200, { data: entitySortedDescRows, meta: { has_next: false, limit: 100 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getEntities({
      class: ENTITY_CLASS_CUSTOMER,
      sort: { firstName: 'desc' },
      limit: 100,
    });

    const firstNames = res.data.map((row) => (row.payload as Record<string, unknown>).firstName as string);
    assert.deepStrictEqual(firstNames, ['Zoe', 'Dan', 'Cara', 'Bella', 'Aaron'], 'rows are firstName-descending');
    assert.strictEqual(scope.isDone(), true);
  });

  it('getEntities — passes a raw string sort through unchanged', async () => {
    const scope = utils
      .createNock()
      // A string `sort` is forwarded verbatim, letting the service apply its default direction.
      .get(ENTITIES)
      .query({ ...common, entity_class: ENTITY_CLASS_CUSTOMER, limit: '100', sort: 'firstName' })
      .reply(200, { data: entitySortedDescRows, meta: { has_next: false, limit: 100 } }, JSON_HEADERS);

    await pubnub.dataSync.getEntities({ class: ENTITY_CLASS_CUSTOMER, sort: 'firstName', limit: 100 });

    assert.strictEqual(scope.isDone(), true);
  });

  it('getEntities — defaults limit to 20 when the caller omits it', async () => {
    const scope = utils
      .createNock()
      // `GetEntitiesRequest` applies `limit ??= 20` in its constructor, so an omitted limit still
      // reaches the wire.
      .get(ENTITIES)
      .query({ ...common, entity_class: ENTITY_CLASS_CUSTOMER, limit: '20' })
      .reply(200, { data: entityListPage1, meta: { has_next: false } }, JSON_HEADERS);

    await pubnub.dataSync.getEntities({ class: ENTITY_CLASS_CUSTOMER });

    assert.strictEqual(scope.isDone(), true);
  });

  it('getEntities — surfaces `meta` and `links` unchanged', async () => {
    const links = {
      self: `${ENTITIES}?entity_class=${ENTITY_CLASS_CUSTOMER}&limit=2`,
      next: `${ENTITIES}?entity_class=${ENTITY_CLASS_CUSTOMER}&limit=2&cursor=${ENTITY_CURSOR_PAGE_2}`,
    };
    const scope = utils
      .createNock()
      .get(ENTITIES)
      .query({ ...common, entity_class: ENTITY_CLASS_CUSTOMER, limit: '2' })
      .reply(
        200,
        { data: entityListPage1, meta: { has_next: true, next_cursor: ENTITY_CURSOR_PAGE_2, limit: 2 }, links },
        JSON_HEADERS,
      );

    const res = await pubnub.dataSync.getEntities({ class: ENTITY_CLASS_CUSTOMER, limit: 2 });

    assert.strictEqual(res.meta?.has_next, true);
    assert.strictEqual(res.meta?.limit, 2);
    assert.strictEqual(res.meta?.next_cursor, ENTITY_CURSOR_PAGE_2);
    assert.deepStrictEqual(res.links, links, '`links` passed through verbatim');
    assert.ok(res.links!.next!.includes('cursor='), '`links.next` carries the next cursor');
    assert.strictEqual(scope.isDone(), true);
  });

  // --------------------------------------------------------
  // ------------- Validation (no request sent) -------------
  // --------------------------------------------------------

  it('createEntity — rejects missing class', async () => {
    const scope = utils.createNock().post(ENTITIES).reply(201, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        // @ts-expect-error — intentional omission of `class` to exercise validation.
        pubnub.dataSync.createEntity({ data: { classVersion: CLASS_VERSION, payload: {} } }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Entity class cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('setEntity — rejects missing classVersion', async () => {
    const scope = utils.createNock().put(`${ENTITIES}/customer-00001`).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        pubnub.dataSync.setEntity({
          id: 'customer-00001',
          // @ts-expect-error — intentional omission of classVersion to exercise validation.
          data: { status: 'active', payload: {} },
        }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Entity class version cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('getEntity — rejects empty id', async () => {
    const scope = utils.createNock().get(ENTITIES).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () => pubnub.dataSync.getEntity({ id: '' }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Entity id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('getEntities — rejects missing class', async () => {
    const scope = utils.createNock().get(ENTITIES).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      // @ts-expect-error — intentional omission of `class` to exercise validation.
      () => pubnub.dataSync.getEntities({ limit: 10 }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Entity class cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('updateEntity — rejects empty add/replace/remove', async () => {
    const scope = utils.createNock().patch(`${ENTITIES}/placeholder`).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () => pubnub.dataSync.updateEntity({ id: 'placeholder' }),
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
});
