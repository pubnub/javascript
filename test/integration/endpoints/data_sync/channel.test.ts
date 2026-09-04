import assert from 'assert';

import {
  CLASS_VERSION,
  assertUserOrChannelObject,
  createChannelObj,
  freshId,
  freshPubNub,
  runMarker,
  safeRemove,
} from './helpers';

describe('DataSync Channel Endpoints', function () {
  this.timeout(30000);
  it('createChannel — POST returns fully-formed channel', async () => {
    const pubnub = freshPubNub();
    const id = freshId('JSchannel');
    try {
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

      assert.ok(res.status >= 200 && res.status < 300, `create status ${res.status}`);
      assertUserOrChannelObject(res.data, {
        id,
        entityClassVersion: CLASS_VERSION,
        status: 'active',
        payload: { name: 'engineering', kind: 'public', memberCount: 3, archived: false },
      });
    } finally {
      await safeRemove(() => pubnub.dataSync.removeChannel({ id }));
    }
  });

  it('getChannel — GET reads back', async () => {
    const pubnub = freshPubNub();
    const created = await createChannelObj(pubnub, { category: 'general' });
    try {
      const res = await pubnub.dataSync.getChannel({ id: created.obj.id });
      assertUserOrChannelObject(res.data, {
        id: created.obj.id,
        entityClassVersion: CLASS_VERSION,
        status: 'active',
        payload: { name: 'engineering', kind: 'public', category: 'general' },
      });
      assert.strictEqual(res.data.eTag, created.obj.eTag, 'eTag matches create');
    } finally {
      await created.dispose();
    }
  });

  it('updateChannel — add/replace/remove', async () => {
    const pubnub = freshPubNub();
    const created = await createChannelObj(pubnub, { memberCount: 1, archived: false });
    try {
      await pubnub.dataSync.updateChannel({
        id: created.obj.id,
        add: { '/payload/category': 'general' },
        replace: { '/payload/memberCount': 42 },
        remove: ['/payload/archived'],
      });

      const after = await pubnub.dataSync.getChannel({ id: created.obj.id });
      const payload = after.data.payload as Record<string, unknown>;
      assert.strictEqual(payload.category, 'general', 'category added');
      assert.strictEqual(payload.memberCount, 42, 'memberCount replaced');
      assert.ok(!('archived' in payload), 'archived removed');
      assert.notStrictEqual(after.data.eTag, created.obj.eTag, 'eTag changed');
      assert.ok(Date.parse(after.data.updatedAt) >= Date.parse(created.obj.updatedAt), 'updatedAt advanced');
    } finally {
      await created.dispose();
    }
  });

  it('updateChannel — supports move / copy / test ops', async () => {
    const pubnub = freshPubNub();
    // Default channelPayload: { name: 'engineering', description: 'engineering', kind: 'public' }.
    const created = await createChannelObj(pubnub);
    try {
      await pubnub.dataSync.updateChannel({
        id: created.obj.id,
        // copy an existing field to a new key, move an existing field to a new key,
        // and assert an existing field equals its known value.
        copy: [{ from: '/payload/name', path: '/payload/displayName' }],
        move: [{ from: '/payload/description', path: '/payload/summary' }],
        test: { '/payload/kind': 'public' },
      });

      const after = await pubnub.dataSync.getChannel({ id: created.obj.id });
      const payload = after.data.payload as Record<string, unknown>;
      assert.strictEqual(payload.displayName, 'engineering', 'name copied to displayName');
      assert.strictEqual(payload.name, 'engineering', 'name still present after copy');
      assert.strictEqual(payload.summary, 'engineering', 'description moved to summary');
      assert.ok(!('description' in payload), 'description removed after move');
      assert.notStrictEqual(after.data.eTag, created.obj.eTag, 'eTag changed');
    } finally {
      await created.dispose();
    }
  });

  it('setChannel — PUT full replace', async () => {
    const pubnub = freshPubNub();
    const created = await createChannelObj(pubnub);
    try {
      await pubnub.dataSync.setChannel({
        id: created.obj.id,
        data: {
          classVersion: CLASS_VERSION,
          status: 'inactive',
          payload: { name: 'design', description: 'design', kind: 'private', memberCount: 7, archived: true },
        },
      });

      const after = await pubnub.dataSync.getChannel({ id: created.obj.id });
      assertUserOrChannelObject(after.data, {
        id: created.obj.id,
        entityClassVersion: CLASS_VERSION,
        status: 'inactive',
        payload: { name: 'design', kind: 'private', memberCount: 7, archived: true },
      });
    } finally {
      await created.dispose();
    }
  });

  it('removeChannel — DELETE then GET 404s', async () => {
    const pubnub = freshPubNub();
    const created = await createChannelObj(pubnub);
    let removed = false;
    try {
      const res = await pubnub.dataSync.removeChannel({ id: created.obj.id });
      removed = true;
      assert.ok(res.status >= 200 && res.status < 300, `remove status ${res.status}`);
      await assert.rejects(
        () => pubnub.dataSync.getChannel({ id: created.obj.id }),
        'getChannel after remove must reject',
      );
    } finally {
      if (!removed) await created.dispose();
    }
  });

  // --------------------------------------------------------
  // List / filter / sort — per-run marker isolation.
  // --------------------------------------------------------

  it('getChannels — default list returns an array', async () => {
    const pubnub = freshPubNub();
    const created = await createChannelObj(pubnub);
    try {
      const res = await pubnub.dataSync.getChannels({ limit: 10 });
      assert.ok(Array.isArray(res.data), 'data is an array');
    } finally {
      await created.dispose();
    }
  });

  it('getChannels — limit respected', async () => {
    const pubnub = freshPubNub();
    const disposers: Array<() => Promise<void>> = [];
    try {
      for (let i = 0; i < 3; i++) disposers.push((await createChannelObj(pubnub)).dispose);
      const res = await pubnub.dataSync.getChannels({ limit: 3 });
      assert.ok(res.data.length <= 3, 'limit respected');
    } finally {
      for (const dispose of disposers) await dispose();
    }
  });

  it('getChannels — cursor pagination, no overlap', async () => {
    const pubnub = freshPubNub();
    const disposers: Array<() => Promise<void>> = [];
    try {
      for (let i = 0; i < 4; i++) disposers.push((await createChannelObj(pubnub)).dispose);

      const page1 = await pubnub.dataSync.getChannels({ limit: 2 });
      assert.ok(page1.data.length <= 2, 'page 1 respects limit');
      if (page1.meta?.next_cursor) {
        const page2 = await pubnub.dataSync.getChannels({ limit: 2, cursor: page1.meta.next_cursor });
        const seen = new Set(page1.data.map((c) => c.id));
        for (const c of page2.data) assert.ok(!seen.has(c.id), `id ${c.id} not on both pages`);
      }
    } finally {
      for (const dispose of disposers) await dispose();
    }
  });

  it('getChannels — filter by name', async () => {
    const pubnub = freshPubNub();
    const marker = runMarker();
    const publicIds: string[] = [];
    const privateIds: string[] = [];
    const disposers: Array<() => Promise<void>> = [];
    try {
      for (let i = 0; i < 3; i++) {
        const f = await createChannelObj(pubnub, {name:'group', status: 'public', cohort: marker });
        publicIds.push(f.obj.id);
        disposers.push(f.dispose);
      }
      for (let i = 0; i < 2; i++) {
        const f = await createChannelObj(pubnub, {name: 'individual', status: 'private', cohort: marker });
        privateIds.push(f.obj.id);
        disposers.push(f.dispose);
      }
  
      const res = await pubnub.dataSync.getChannels({
        filter: `name == 'group'`,
        limit: 50,
      });
      const returnedIds = new Set(res.data.map((c) => c.id));
      for (const id of publicIds) assert.ok(returnedIds.has(id), `group id ${id} present`);
      for (const id of privateIds) assert.ok(!returnedIds.has(id), `individual id ${id} excluded`);
    } finally {
      for (const dispose of disposers) await dispose();
    }
  });

  it('getChannels — sort by createdAt desc', async () => {
    const pubnub = freshPubNub();
    const marker = runMarker();
    const seededIds: string[] = [];
    const disposers: Array<() => Promise<void>> = [];
    try {
      for (let i = 0; i < 3; i++) {
        const f = await createChannelObj(pubnub, { cohort: marker });
        seededIds.push(f.obj.id);
        disposers.push(f.dispose);
      }
  
      const res = await pubnub.dataSync.getChannels({
        sort: {createdAt: 'desc'},
        limit: 50,
      });
      const seededRows = res.data.filter((c) => seededIds.includes(c.id));
      for (let i = 1; i < seededRows.length; i++) {
        assert.ok(
          Date.parse(seededRows[i - 1].createdAt) >= Date.parse(seededRows[i].createdAt),
          'createdAt is non-increasing',
        );
      }
    } finally {
      for (const dispose of disposers) await dispose();
    }
  });

  // --------------------------------------------------------
  // Validation / negative cases.
  // --------------------------------------------------------

  it('updateChannel — rejects empty add/replace/remove', async () => {
    const pubnub = freshPubNub();
    await assert.rejects(
      () => pubnub.dataSync.updateChannel({ id: 'placeholder' }),
      'updateChannel empty body must throw',
    );
  });

  it('getChannel — rejects empty id', async () => {
    const pubnub = freshPubNub();
    await assert.rejects(() => pubnub.dataSync.getChannel({ id: '' }), 'getChannel("") must throw');
  });

  it('createChannel — rejects missing classVersion', async () => {
    const pubnub = freshPubNub();
    await assert.rejects(
      () =>
        pubnub.dataSync.createChannel({
          id: freshId('channel'),
          // @ts-expect-error — intentional omission of classVersion to exercise validation.
          data: { status: 'active', payload: {} },
        }),
      'createChannel without classVersion must throw',
    );
  });
});
