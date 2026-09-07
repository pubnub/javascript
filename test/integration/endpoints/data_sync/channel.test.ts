/* global describe, beforeEach, it, before, afterEach */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../../src/node/index';
import utils from '../../../utils';
import {
  CLASS_VERSION,
  NEXT_CURSOR,
  channelObject,
  filteredGroupRows,
  listPage1,
  listPage2,
  notFoundError,
  sortedDescRows,
} from './fixtures';

/** Content type the service uses for the channel resource, on both requests and responses. */
const CHANNEL_MEDIA_TYPE = 'application/vnd.pubnub.objects.channel+json;version=1';
const JSON_PATCH_MEDIA_TYPE = 'application/json-patch+json';
const JSON_HEADERS = { 'content-type': CHANNEL_MEDIA_TYPE };

describe('DataSync Channel Endpoints', () => {
  const SUBSCRIBE_KEY = 'mySubKey';
  const PUBLISH_KEY = 'myPublishKey';
  const AUTH_KEY = 'myAuthKey';
  const UUID = 'myUUID';
  const CHANNELS = `/v1/datasync/subkeys/${SUBSCRIBE_KEY}/channels`;

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

  it('createChannel — POST returns fully-formed channel', async () => {
    const id = 'JSchannel-56738';
    const created = channelObject({
      id,
      payload: {
        kind: 'public',
        name: 'engineering',
        description: 'engineering',
        category: 'general',
        memberCount: 3,
        archived: false,
      },
    });
    const scope = utils
      .createNock()
      // `classVersion` goes on the wire as `entityClassVersion`; `id` travels in the body on create.
      .post(CHANNELS, {
        data: {
          id,
          entityClassVersion: CLASS_VERSION,
          status: 'active',
          payload: {
            name: 'engineering',
            description: 'engineering',
            kind: 'public',
            category: 'general',
            memberCount: 3,
            archived: false,
          },
        },
      })
      .matchHeader('content-type', CHANNEL_MEDIA_TYPE)
      .query(common)
      .reply(201, { data: created }, JSON_HEADERS);

    const res = await pubnub.dataSync.createChannel({
      id,
      data: {
        classVersion: CLASS_VERSION,
        status: 'active',
        payload: {
          name: 'engineering',
          description: 'engineering',
          kind: 'public',
          category: 'general',
          memberCount: 3,
          archived: false,
        },
      },
    });

    assert.strictEqual(res.status, 201, 'create replies 201');
    assert.strictEqual(res.data.id, id);
    assert.strictEqual(res.data.entityClassVersion, CLASS_VERSION);
    assert.strictEqual(res.data.status, 'active');
    assert.strictEqual(res.data.eTag, created.eTag);
    assert.strictEqual(res.data.createdAt, created.createdAt);
    assert.strictEqual(res.data.updatedAt, created.updatedAt);
    assert.deepStrictEqual(res.data.payload, created.payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getChannel — GET reads back', async () => {
    const stored = channelObject({ id: 'JSchannel-90550', eTag: 'y16lds' });
    const scope = utils
      .createNock()
      .get(`${CHANNELS}/${stored.id}`)
      .query(common)
      .reply(200, { data: stored }, JSON_HEADERS);

    const res = await pubnub.dataSync.getChannel({ id: stored.id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.id, stored.id);
    assert.strictEqual(res.data.eTag, stored.eTag);
    assert.strictEqual(res.data.entityClassVersion, CLASS_VERSION);
    assert.deepStrictEqual(res.data.payload, stored.payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateChannel — add/replace/remove sends a JSON Patch document', async () => {
    const before = channelObject({ id: 'JSchannel-10268', eTag: 'y16m11' });
    const after = channelObject({
      id: before.id,
      eTag: 'y16n76',
      updatedAt: '2026-09-07T06:57:14.425997Z',
      payload: {
        kind: 'public',
        name: 'engineering',
        description: 'engineering',
        category: 'general',
        memberCount: 42,
      },
    });
    const scope = utils
      .createNock()
      .patch(`${CHANNELS}/${before.id}`, [
        { op: 'add', path: '/payload/category', value: 'general' },
        { op: 'replace', path: '/payload/memberCount', value: 42 },
        { op: 'remove', path: '/payload/archived' },
      ])
      .matchHeader('content-type', JSON_PATCH_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: after }, JSON_HEADERS);

    const res = await pubnub.dataSync.updateChannel({
      id: before.id,
      add: { '/payload/category': 'general' },
      replace: { '/payload/memberCount': 42 },
      remove: ['/payload/archived'],
    });

    const payload = res.data.payload as Record<string, unknown>;
    assert.strictEqual(payload.category, 'general', 'category added');
    assert.strictEqual(payload.memberCount, 42, 'memberCount replaced');
    assert.ok(!('archived' in payload), 'archived removed');
    assert.notStrictEqual(res.data.eTag, before.eTag, 'eTag changed');
    assert.ok(Date.parse(res.data.updatedAt) > Date.parse(res.data.createdAt), 'updatedAt advanced');
    assert.strictEqual(scope.isDone(), true);
  });

  it('updateChannel — supports move / copy / test ops', async () => {
    const before = channelObject({ id: 'JSchannel-83057', eTag: 'y16o11' });
    const after = channelObject({
      id: before.id,
      eTag: 'y16ova',
      updatedAt: '2026-09-07T06:57:16.333298Z',
      payload: { kind: 'public', name: 'engineering', summary: 'engineering', displayName: 'engineering' },
    });
    const scope = utils
      .createNock()
      // `toJsonPatchOperations` emits a fixed op order — add, replace, remove, move, copy, test —
      // regardless of the order the caller passes them in below.
      .patch(`${CHANNELS}/${before.id}`, [
        { op: 'move', from: '/payload/description', path: '/payload/summary' },
        { op: 'copy', from: '/payload/name', path: '/payload/displayName' },
        { op: 'test', path: '/payload/kind', value: 'public' },
      ])
      .matchHeader('content-type', JSON_PATCH_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: after }, JSON_HEADERS);

    const res = await pubnub.dataSync.updateChannel({
      id: before.id,
      copy: [{ from: '/payload/name', path: '/payload/displayName' }],
      move: [{ from: '/payload/description', path: '/payload/summary' }],
      test: { '/payload/kind': 'public' },
    });

    const payload = res.data.payload as Record<string, unknown>;
    assert.strictEqual(payload.displayName, 'engineering', 'name copied to displayName');
    assert.strictEqual(payload.name, 'engineering', 'name still present after copy');
    assert.strictEqual(payload.summary, 'engineering', 'description moved to summary');
    assert.ok(!('description' in payload), 'description removed after move');
    assert.notStrictEqual(res.data.eTag, before.eTag, 'eTag changed');
    assert.strictEqual(scope.isDone(), true);
  });

  it('setChannel — PUT full replace, id travels in the path only', async () => {
    const id = 'JSchannel-73825';
    const replaced = channelObject({
      id,
      eTag: 'y16qi3',
      updatedAt: '2026-09-07T06:57:18.450121Z',
      status: 'inactive',
      payload: { kind: 'private', name: 'design', description: 'design', memberCount: 7, archived: true },
    });
    const scope = utils
      .createNock()
      .put(`${CHANNELS}/${id}`, {
        data: {
          entityClassVersion: CLASS_VERSION,
          status: 'inactive',
          payload: { name: 'design', description: 'design', kind: 'private', memberCount: 7, archived: true },
        },
      })
      .matchHeader('content-type', CHANNEL_MEDIA_TYPE)
      .query(common)
      .reply(200, { data: replaced }, JSON_HEADERS);

    const res = await pubnub.dataSync.setChannel({
      id,
      data: {
        classVersion: CLASS_VERSION,
        status: 'inactive',
        payload: { name: 'design', description: 'design', kind: 'private', memberCount: 7, archived: true },
      },
    });

    assert.strictEqual(res.data.id, id);
    assert.strictEqual(res.data.status, 'inactive');
    assert.deepStrictEqual(res.data.payload, replaced.payload);
    assert.strictEqual(scope.isDone(), true);
  });

  it('removeChannel — DELETE replies 200 with an empty body', async () => {
    const id = 'JSchannel-41089';
    const scope = utils.createNock().delete(`${CHANNELS}/${id}`).query(common).reply(200, '');

    const res = await pubnub.dataSync.removeChannel({ id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getChannel — rejects with the service error on 404', async () => {
    const id = 'JSchannel-41089';
    const scope = utils
      .createNock()
      .get(`${CHANNELS}/${id}`)
      .query(common)
      .reply(404, notFoundError(id), { 'content-type': 'application/json' });

    await assert.rejects(
      () => pubnub.dataSync.getChannel({ id }),
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

  it('getChannels — sends limit and returns the list envelope', async () => {
    const scope = utils
      .createNock()
      .get(CHANNELS)
      .query({ ...common, limit: '10' })
      .reply(200, { data: listPage1, meta: { has_next: false, limit: 10 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getChannels({ limit: 10 });

    assert.ok(Array.isArray(res.data), 'data is an array');
    assert.deepStrictEqual(
      res.data.map((c) => c.id),
      listPage1.map((c) => c.id),
    );
    assert.strictEqual(res.meta?.limit, 10);
    assert.strictEqual(res.meta?.has_next, false);
    assert.strictEqual(scope.isDone(), true);
  });

  it('getChannels — threads next_cursor into the following request', async () => {
    const page1Scope = utils
      .createNock()
      .get(CHANNELS)
      .query({ ...common, limit: '2' })
      .reply(200, { data: listPage1, meta: { has_next: true, next_cursor: NEXT_CURSOR, limit: 2 } }, JSON_HEADERS);
    const page2Scope = utils
      .createNock()
      .get(CHANNELS)
      .query({ ...common, limit: '2', cursor: NEXT_CURSOR })
      .reply(
        200,
        { data: listPage2, meta: { has_next: true, next_cursor: 'eyJpIjoiMTQ3MDkzIn0', limit: 2 } },
        JSON_HEADERS,
      );

    const page1 = await pubnub.dataSync.getChannels({ limit: 2 });
    assert.strictEqual(page1.meta?.next_cursor, NEXT_CURSOR, 'cursor surfaced on page 1');

    const page2 = await pubnub.dataSync.getChannels({ limit: 2, cursor: page1.meta!.next_cursor });
    const seen = new Set(page1.data.map((c) => c.id));
    for (const c of page2.data) assert.ok(!seen.has(c.id), `id ${c.id} not on both pages`);

    assert.strictEqual(page1Scope.isDone(), true);
    assert.strictEqual(page2Scope.isDone(), true);
  });

  it('getChannels — passes the filter expression through verbatim', async () => {
    const scope = utils
      .createNock()
      .get(CHANNELS)
      .query({ ...common, limit: '50', filter: `name == 'group'` })
      .reply(200, { data: filteredGroupRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getChannels({ filter: `name == 'group'`, limit: 50 });

    for (const channel of res.data)
      assert.strictEqual((channel.payload as Record<string, unknown>).name, 'group', 'only "group" rows returned');
    assert.strictEqual(scope.isDone(), true);
  });

  it('getChannels — serializes sort as `field:direction`', async () => {
    const scope = utils
      .createNock()
      .get(CHANNELS)
      .query({ ...common, limit: '50', sort: 'createdAt:desc' })
      .reply(200, { data: sortedDescRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getChannels({ sort: { createdAt: 'desc' }, limit: 50 });

    for (let i = 1; i < res.data.length; i++)
      assert.ok(
        Date.parse(res.data[i - 1].createdAt) >= Date.parse(res.data[i].createdAt),
        'createdAt is non-increasing',
      );
    assert.strictEqual(scope.isDone(), true);
  });

  it('getChannels — sends entityClassVersion as `entity_class_version` and defaults limit to 20', async () => {
    const scope = utils
      .createNock()
      // `GetChannelsRequest` applies `limit ??= 20` in its constructor, so an omitted limit still
      // reaches the wire.
      .get(CHANNELS)
      .query({ ...common, entity_class_version: `${CLASS_VERSION}`, limit: '20' })
      .reply(200, { data: listPage1, meta: { has_next: false } }, JSON_HEADERS);

    await pubnub.dataSync.getChannels({ entityClassVersion: CLASS_VERSION });

    assert.strictEqual(scope.isDone(), true);
  });

  it('getChannels — sends entityClass/entityClassLevel as `entity_class`/`entity_class_level`', async () => {
    const scope = utils
      .createNock()
      .get(CHANNELS)
      .query({
        ...common,
        entity_class: 'Channel',
        entity_class_version: `${CLASS_VERSION}`,
        entity_class_level: 'Global',
        limit: '50',
        filter_fast: `status == 'active'`,
        sort: 'createdAt:desc',
      })
      .reply(200, { data: sortedDescRows, meta: { has_next: false, limit: 50 } }, JSON_HEADERS);

    const res = await pubnub.dataSync.getChannels({
      entityClass: 'Channel',
      entityClassVersion: CLASS_VERSION,
      entityClassLevel: 'Global',
      limit: 50,
      filterFast: `status == 'active'`,
      sort: { createdAt: 'desc' },
    });

    for (const channel of res.data) {
      assert.strictEqual((channel as unknown as { entityClass: string }).entityClass, 'Channel');
      assert.strictEqual((channel as unknown as { entityClassLevel: string }).entityClassLevel, 'Global');
    }
    assert.strictEqual(scope.isDone(), true);
  });

  // --------------------------------------------------------
  // ------------- Validation (no request sent) -------------
  // --------------------------------------------------------

  it('updateChannel — rejects empty add/replace/remove', async () => {
    const scope = utils.createNock().patch(`${CHANNELS}/placeholder`).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () => pubnub.dataSync.updateChannel({ id: 'placeholder' }),
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

  it('getChannel — rejects empty id', async () => {
    const scope = utils.createNock().get(CHANNELS).reply(200, {}, JSON_HEADERS);

    await assert.rejects(
      () => pubnub.dataSync.getChannel({ id: '' }),
      (error: { status: { message: string } }) => {
        assert.strictEqual(error.status.message, 'Channel id cannot be empty');
        return true;
      },
    );
    assert.strictEqual(scope.isDone(), false, 'no request was sent');
  });

  it('createChannel — rejects missing classVersion', async () => {
    const scope = utils.createNock().post(CHANNELS).reply(201, {}, JSON_HEADERS);

    await assert.rejects(
      () =>
        pubnub.dataSync.createChannel({
          id: 'JSchannel-00001',
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
});
