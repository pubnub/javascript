import assert from 'node:assert/strict';
import type PubNub from 'pubnub';
import { server } from '../support/clients';
import { captureConsole } from '../support/console';
import { filterFragments, patchFragments, sortFragments } from '../support/datasync-fragments';
import { errorText, removePageObjects, untilPageObjectsGone } from '../support/datasync-state';
import { connected, eventually, settled } from '../support/wait';

/**
 * DataSync examples, including the DataSync listener and subscription examples. Port of docs-snippets/api-reference/datasync.ts.
 *
 * Runs on the `datasync` keyset. The samples create DataSync objects with fixed literal ids, and the service answers a create of
 * an existing id with 409 (DS-0301), it does not overwrite. So a before hook removes every literal object the page creates
 * (support/datasync-state.ts), and an after hook does the same, best effort. The classes `product` (v1) and `ProductOwner`
 * (v1) are provisioned separately and must exist on the keyset. The Admin Portal event rules for User, Channel and product
 * must be on for the event tests.
 */
const ALICE = 'user-alice';
const BOB = 'seller-bob';
const SUMMER = 'channel-summer-sale';
const WINTER = 'channel-winter-sale';
const MEMBERSHIP = 'membership-alice-summer-sale';
const WINTER_MEMBERSHIP = 'membership-alice-winter-sale';
const PRODUCT = 'product-sneaker-42';
const REL = 'rel-bob-owns-sneaker-42';

const ids = (response: { data: Array<{ id: string }> }): string[] => response.data.map((o) => o.id);

/** Runs `run` with console.log captured, and hands it the captured lines. */
async function withLogs(run: (lines: string[]) => Promise<void>): Promise<void> {
  const logs = captureConsole('log');
  try {
    await run(logs.lines);
  } finally {
    logs.restore();
  }
}

/**
 * The samples show an example eTag in `ifMatchesEtag`. Left as it is, the guard (correctly) rejects the write, so the request
 * carries the real eTag instead and the sample text stays exactly what readers see.
 */
function useRealEtag(api: PubNub['dataSync'], method: 'setUser' | 'updateEntity', example: string, real: string): void {
  const target = api as unknown as Record<string, (parameters: { ifMatchesEtag?: string }) => Promise<unknown>>;
  const original = target[method].bind(api);
  target[method] = (parameters) =>
    original(parameters.ifMatchesEtag === example ? { ...parameters, ifMatchesEtag: real } : parameters);
}

/** Creates the channel `channel-winter-sale` and Alice's membership on it with `status: 'archived'`. Removing the channel removes the membership. */
async function seedArchivedMembership(pubnub: PubNub): Promise<void> {
  await pubnub.dataSync.createChannel({ id: WINTER, data: { classVersion: 1, payload: { name: 'Winter Sale 2026' } } });
  await pubnub.dataSync.createMembership({
    id: WINTER_MEMBERSHIP,
    userId: ALICE,
    channelId: WINTER,
    data: { classVersion: 1, status: 'archived' },
  });
}

describe('api-reference/datasync', () => {
  // Reset before and best effort after: the literal objects persist on the keyset across runs.
  const reset = async (): Promise<void> => {
    const pubnub = server('datasync');
    try {
      await removePageObjects(pubnub);
    } finally {
      pubnub.destroy();
    }
  };
  before(async function () {
    this.timeout(90_000);
    await reset();
    // The exact-list samples below assume nothing of an earlier run is left. Removing a user, channel or entity cascades to its
    // memberships and links, so wait until consecutive reads from the service show them gone.
    await untilPageObjectsGone(server('datasync'));
  });
  after(async function () {
    this.timeout(60_000);
    await reset().catch(() => undefined);
  });

  describe('preconditions', () => {
    // The classes are provisioned separately (docs-snippets/provision/). This only reports a missing one.
    it('the product entity class exists on the keyset', async () => {
      const klass = await server('datasync').dataSync.getEntities({ class: 'product', classVersion: 1, limit: 1 });
      assert.equal(klass.status, 200);
    });

    it('the ProductOwner relationship class exists on the keyset', async () => {
      const links = await server('datasync').dataSync.getRelationships({ class: 'ProductOwner', limit: 1 });
      assert.equal(links.status, 200);
    });
  });

  // The describe blocks below run in order and build on each other (create, read, update, patch of the same objects, then the
  // removal block at the end). The before hook above resets every literal object, so the sequence starts from a known state.

  describe('users', () => {
    it('createUserBasicUsage: createUser creates Alice, echoes the payload and returns an eTag', async () => {
      const pubnub = server('datasync');
      // snippet.createUserBasicUsage
      const response = await pubnub.dataSync.createUser({
        id: 'user-alice',
        data: {
          classVersion: 1,
          payload: { name: 'Alice', type: 'shopper' },
        },
      });
      console.log('createUser response:', response.data);
      // snippet.end
      assert.ok(response.status >= 200 && response.status < 300, `status ${response.status}`);
      assert.equal(response.data.id, ALICE);
      assert.equal(response.data.entityClassVersion, 1);
      assert.deepEqual(response.data.payload, { name: 'Alice', type: 'shopper' });
      assert.ok(response.data.eTag, 'response carries an eTag');
    });

    it('getUserBasicUsage: getUser reads Alice back by id', async () => {
      const pubnub = server('datasync');
      // snippet.getUserBasicUsage
      const response = await pubnub.dataSync.getUser({ id: 'user-alice' });
      console.log('getUser response:', response.data);
      // snippet.end
      assert.equal(response.data.id, ALICE);
      assert.equal(response.data.payload?.name, 'Alice');
    });

    it('getUsersBasicUsage: getUsers lists users sorted by createdAt, verified on the returned timestamps', async () => {
      const pubnub = server('datasync');
      // snippet.getUsersBasicUsage
      const response = await pubnub.dataSync.getUsers({
        limit: 20,
        sort: { createdAt: 'asc' },
      });
      console.log('getUsers response:', response.data);
      console.log('getUsers meta:', response.meta);
      // snippet.end
      assert.ok(Array.isArray(response.data));
      assert.ok(response.data.length <= 20);
      assert.equal(typeof response.meta?.has_next, 'boolean');
      const created = response.data.map((u) => Date.parse(u.createdAt));
      assert.deepEqual(
        created,
        [...created].sort((a, b) => a - b),
        'sorted by createdAt ascending',
      );
    });

    it('getUsersFilterExample: getUsers with filter finds Alice once the eventually consistent index has caught up', async () => {
      const pubnub = server('datasync');
      // `filter` is eventually consistent, so wait until the service indexed the object before running the sample. One read that
      // sees it does not prove the next one will (replicas lag independently), so the read must hold several times in a row.
      await settled(
        async () => {
          assert.ok(ids(await pubnub.dataSync.getUsers({ filter: 'name LIKE "*Alice*"' })).includes(ALICE));
        },
        { timeout: 45_000, label: 'filter index caught up with the new user' },
      );
      // snippet.getUsersFilterExample
      // `filter` runs over properties declared with filtering mode `full` and is evaluated against
      // eventually consistent storage.
      const response = await pubnub.dataSync.getUsers({
        filter: 'name LIKE "*Alice*"',
      });
      console.log('getUsers (filter) response:', response.data);
      // snippet.end
      assert.ok(ids(response).includes(ALICE), 'the filter finds Alice');
    }).timeout(60000);

    it('getUsersFilterFastExample: getUsers with filterFast finds Alice at once (strongly consistent)', async () => {
      const pubnub = server('datasync');
      // snippet.getUsersFilterFastExample
      // `filterFast` is evaluated against strongly consistent storage, so it matches an object you just
      // wrote.
      const response = await pubnub.dataSync.getUsers({
        filterFast: 'type == "shopper"',
      });
      console.log('getUsers (filterFast) response:', response.data);
      // snippet.end
      assert.ok(ids(response).includes(ALICE), 'filterFast sees the user right after the write');
    });

    it('getUsersCursorPagingExample: the cursor paging loop for users runs and lists Alice', async () => {
      const pubnub = server('datasync');
      await withLogs(async (lines) => {
        // snippet.getUsersCursorPagingExample
        // Pass no `cursor` on the first call. Take `meta.next_cursor` from the response and pass it back
        // as `cursor` on the next call. Stop when `meta.has_next` is `false`.
        let cursor: string | undefined;
        let hasNext = true;
        let page = 0;

        while (hasNext) {
          const response = await pubnub.dataSync.getUsers({
            filterFast: 'type == "shopper"',
            limit: 20,
            cursor,
          });
          console.log(`Page ${++page}:`, response.data);
          cursor = response.meta?.next_cursor ?? undefined;
          hasNext = response.meta?.has_next ?? false;
        }
        // snippet.end
        assert.ok(
          lines.some((line) => line.startsWith('Page 1:')),
          'the loop ran at least once',
        );
        assert.ok(
          lines.some((line) => line.includes(ALICE)),
          'a page lists Alice',
        );
      });
    });

    it('updateUserBasicUsage: setUser with ifMatchesEtag replaces Alice, and the eTag it was guarded by is stale afterwards', async () => {
      const pubnub = server('datasync');
      const before = (await pubnub.dataSync.getUser({ id: ALICE })).data.eTag;
      // The sample shows an example eTag. The example itself is refused by the guard.
      await assert.rejects(
        () =>
          pubnub.dataSync.setUser({
            id: ALICE,
            data: { classVersion: 1, payload: { name: 'x' } },
            ifMatchesEtag: 'AbQdEfGhIjKlMn',
          }),
        (error: unknown) => /\b(412|403)\b/.test(errorText(error)),
        'the example eTag is rejected',
      );
      // The sample text keeps the example eTag. The request carries the real one, so the guarded write can succeed.
      useRealEtag(pubnub.dataSync, 'setUser', 'AbQdEfGhIjKlMn', before);
      // snippet.updateUserBasicUsage
      const response = await pubnub.dataSync.setUser({
        id: 'user-alice',
        data: {
          classVersion: 1,
          payload: { name: 'Alice B.', type: 'shopper' },
        },
        ifMatchesEtag: 'AbQdEfGhIjKlMn',
      });
      console.log('setUser response:', response.data);
      // snippet.end
      assert.equal(response.data.payload?.name, 'Alice B.');
      assert.notEqual(response.data.eTag, before, 'the write produced a new eTag');
      await assert.rejects(
        () =>
          pubnub.dataSync.setUser({
            id: ALICE,
            data: { classVersion: 1, payload: { name: 'stale' } },
            ifMatchesEtag: before,
          }),
        (error: unknown) => /\b(412|403)\b/.test(errorText(error)),
        'the old eTag is now stale',
      );
    });

    it('patchUserBasicUsage: updateUser applies a patch to the user name and status', async () => {
      const pubnub = server('datasync');
      // snippet.patchUserBasicUsage
      const response = await pubnub.dataSync.updateUser({
        id: 'user-alice',
        replace: { '/payload/name': 'Alice B.', '/status': 'active' },
      });
      console.log('updateUser response:', response.data);
      // snippet.end
      assert.equal(response.data.payload?.name, 'Alice B.');
      assert.equal(response.data.status, 'active');
    });
  });

  describe('channels', () => {
    it('createDataSyncChannelBasicUsage: createChannel creates the drop channel and echoes the payload', async () => {
      const pubnub = server('datasync');
      // snippet.createDataSyncChannelBasicUsage
      const response = await pubnub.dataSync.createChannel({
        id: 'channel-summer-sale',
        data: {
          classVersion: 1,
          payload: { name: 'Summer Sale', type: 'promotion' },
        },
      });
      console.log('createChannel response:', response.data);
      // snippet.end
      assert.equal(response.data.id, SUMMER);
      assert.deepEqual(response.data.payload, { name: 'Summer Sale', type: 'promotion' });
    });

    it('getChannelBasicUsage: getChannel reads the DataSync channel back by id', async () => {
      const pubnub = server('datasync');
      // snippet.getChannelBasicUsage
      const response = await pubnub.dataSync.getChannel({ id: 'channel-summer-sale' });
      console.log('getChannel response:', response.data);
      // snippet.end
      assert.equal(response.data.id, SUMMER);
      assert.equal(response.data.payload?.name, 'Summer Sale');
    });

    it('getChannelsBasicUsage: getChannels lists channels with the data array and meta.has_next envelope', async () => {
      const pubnub = server('datasync');
      // snippet.getChannelsBasicUsage
      const response = await pubnub.dataSync.getChannels({ limit: 20 });
      console.log('getChannels response:', response.data);
      console.log('getChannels meta:', response.meta);
      // snippet.end
      assert.ok(Array.isArray(response.data));
      assert.equal(typeof response.meta?.has_next, 'boolean');
    });

    it('getChannelsFilterExample: getChannels with filter finds the new channel once the index has caught up', async () => {
      const pubnub = server('datasync');
      // `filter` is eventually consistent: wait until it holds on consecutive reads before running the sample (see `settled`).
      await settled(
        async () => {
          assert.ok(ids(await pubnub.dataSync.getChannels({ filter: 'name LIKE "*Sale*"' })).includes(SUMMER));
        },
        { timeout: 45_000, label: 'filter index caught up with the new channel' },
      );
      // snippet.getChannelsFilterExample
      const response = await pubnub.dataSync.getChannels({
        filter: 'name LIKE "*Sale*"',
      });
      console.log('getChannels (filter) response:', response.data);
      // snippet.end
      assert.ok(ids(response).includes(SUMMER));
    }).timeout(60000);

    it('getChannelsFilterFastExample: getChannels with filterFast finds the channel at once', async () => {
      const pubnub = server('datasync');
      // snippet.getChannelsFilterFastExample
      const response = await pubnub.dataSync.getChannels({
        filterFast: 'type == "promotion"',
      });
      console.log('getChannels (filterFast) response:', response.data);
      // snippet.end
      assert.ok(ids(response).includes(SUMMER));
    });

    it('getChannelsCursorPagingExample: the cursor paging loop for channels runs and lists the channel', async () => {
      const pubnub = server('datasync');
      await withLogs(async (lines) => {
        // snippet.getChannelsCursorPagingExample
        let cursor: string | undefined;
        let hasNext = true;
        let page = 0;

        while (hasNext) {
          const response = await pubnub.dataSync.getChannels({
            filterFast: 'type == "promotion"',
            limit: 20,
            cursor,
          });
          console.log(`Page ${++page}:`, response.data);
          cursor = response.meta?.next_cursor ?? undefined;
          hasNext = response.meta?.has_next ?? false;
        }
        // snippet.end
        assert.ok(
          lines.some((line) => line.includes(SUMMER)),
          'a page lists the channel',
        );
      });
    });

    it('updateChannelBasicUsage: setChannel replaces the channel payload', async () => {
      const pubnub = server('datasync');
      // snippet.updateChannelBasicUsage
      const response = await pubnub.dataSync.setChannel({
        id: 'channel-summer-sale',
        data: {
          classVersion: 1,
          payload: { name: 'Summer Sale 2026', type: 'promotion' },
        },
      });
      console.log('setChannel response:', response.data);
      // snippet.end
      assert.equal(response.data.payload?.name, 'Summer Sale 2026');
    });

    it('patchChannelBasicUsage: updateChannel patches one field and the other payload fields survive', async () => {
      const pubnub = server('datasync');
      // snippet.patchChannelBasicUsage
      const response = await pubnub.dataSync.updateChannel({
        id: 'channel-summer-sale',
        replace: { '/payload/name': 'Summer Sale 2026' },
      });
      console.log('updateChannel response:', response.data);
      // snippet.end
      assert.equal(response.data.payload?.name, 'Summer Sale 2026');
      assert.equal(response.data.payload?.type, 'promotion', 'the patch leaves other fields alone');
    });

    // Not a sample: paging one item at a time returns next_cursor and has_next correctly and never repeats an item.
    it('cursor paging by one item returns next_cursor and has_next correctly and never repeats an item', async () => {
      const api = server('datasync').dataSync;
      const seen: string[] = [];
      let cursor: string | undefined;
      let pages = 0;
      for (;;) {
        const response = await api.getChannels({ filterFast: 'type == "promotion"', limit: 1, cursor });
        pages += 1;
        seen.push(...ids(response));
        cursor = response.meta?.next_cursor ?? undefined;
        if (!response.meta?.has_next) break;
        assert.ok(cursor, 'has_next true comes with a next_cursor');
        assert.ok(pages < 50, 'paging terminates');
      }
      assert.ok(seen.includes(SUMMER), 'paging by one still reaches the channel');
      assert.equal(new Set(seen).size, seen.length, 'no object appears twice');
    });
  });

  describe('memberships', () => {
    it('createMembershipBasicUsage: createMembership links Alice to the channel with the fixed id that later tests use', async () => {
      const pubnub = server('datasync');
      // snippet.createMembershipBasicUsage
      const response = await pubnub.dataSync.createMembership({
        id: 'membership-alice-summer-sale',
        userId: 'user-alice',
        channelId: 'channel-summer-sale',
        data: {
          classVersion: 1,
          payload: { role: 'viewer' },
        },
      });
      console.log('createMembership response:', response.data);
      // snippet.end
      assert.equal(response.data.id, MEMBERSHIP);
      assert.equal(response.data.userId, ALICE);
      assert.equal(response.data.channelId, SUMMER);
      assert.equal(response.data.relationshipClass, 'Membership');
      assert.deepEqual(response.data.payload, { role: 'viewer' });
    });

    it('getDataSyncMembershipBasicUsage: getMembership reads the membership by its fixed id', async () => {
      const pubnub = server('datasync');
      // snippet.getDataSyncMembershipBasicUsage
      const response = await pubnub.dataSync.getMembership({
        id: 'membership-alice-summer-sale',
      });
      console.log('getMembership response:', response.data);
      // snippet.end
      assert.equal(response.data.id, MEMBERSHIP);
      assert.equal(response.data.payload?.role, 'viewer');
    });

    it('getMembershipsBasicUsage: getMemberships lists exactly the membership of Alice', async () => {
      const pubnub = server('datasync');
      // The sample reads the list once and the assertion is exact. Nothing documents a plain list as strongly consistent, so
      // wait until consecutive reads show the membership created a moment ago.
      await settled(
        async () => {
          const listed = await pubnub.dataSync.getMemberships({ userId: ALICE, limit: 20 });
          assert.deepEqual(ids(listed), [MEMBERSHIP]);
        },
        { timeout: 45_000, label: 'Alice lists exactly her membership' },
      );
      // snippet.getMembershipsBasicUsage
      const response = await pubnub.dataSync.getMemberships({
        userId: 'user-alice',
        limit: 20,
      });
      console.log('getMemberships response:', response.data);
      console.log('getMemberships meta:', response.meta);
      // snippet.end
      // Exact list: legitimate because the before hook removed Alice (and with her every membership) before this run created her.
      assert.deepEqual(ids(response), [MEMBERSHIP]);
      assert.equal(response.data[0].channelId, SUMMER);
    });

    it('getMembershipsByChannelIdExample: getMemberships by channel id lists Alice as the only member', async () => {
      const pubnub = server('datasync');
      // Exact list again: wait until consecutive reads show the one member (see getMembershipsBasicUsage).
      await settled(
        async () => {
          const listed = await pubnub.dataSync.getMemberships({ channelId: SUMMER, limit: 20 });
          assert.deepEqual(
            listed.data.map((m) => m.userId),
            [ALICE],
          );
        },
        { timeout: 45_000, label: 'the channel lists exactly Alice' },
      );
      // snippet.getMembershipsByChannelIdExample
      // Pass `channelId` instead of `userId` to list the members of a channel rather than a user's
      // memberships.
      const response = await pubnub.dataSync.getMemberships({
        channelId: 'channel-summer-sale',
        limit: 20,
      });
      console.log('getMemberships (channelId) response:', response.data);
      // snippet.end
      // Exact list: the before hook removed the channel (and its memberships) before this run created it.
      assert.deepEqual(
        response.data.map((m) => m.userId),
        [ALICE],
      );
    });

    // Filters on membership fields. The Global Membership class declares no payload properties and cannot be extended, so a
    // membership payload is never indexed and filters cannot reach it. The built-in fields (id, createdAt, updatedAt, status,
    // createdBy, modifiedBy) are filterable. Both samples need a second membership of Alice that matches (status "archived"),
    // so the helper adds one on a second channel and removes the channel (and with it the membership) afterwards.

    it('getMembershipsFilterExample: getMemberships with filter excludes a seeded archived membership once the index has caught up', async () => {
      const pubnub = server('datasync');
      await seedArchivedMembership(pubnub);
      try {
        // `filter` is eventually consistent: wait until it holds on consecutive reads before running the sample. One read that saw the
        // membership was not enough in CI: the sample's own read, milliseconds later, returned [] from a replica that lagged.
        await settled(
          async () => {
            const found = await pubnub.dataSync.getMemberships({ userId: ALICE, filter: 'status LIKE "arch*"' });
            assert.ok(ids(found).includes(WINTER_MEMBERSHIP));
          },
          { timeout: 45_000, label: 'filter index caught up with the new membership' },
        );
        // snippet.getMembershipsFilterExample
        // `status` is a built-in field, so it is filterable without any declaration. The Membership class
        // declares no `payload` properties, which means a filter cannot reference anything inside `payload`.
        // `LIKE` takes `*` as a wildcard. This call returns Alice's memberships whose status starts with `arch`.
        const response = await pubnub.dataSync.getMemberships({
          userId: 'user-alice',
          filter: 'status LIKE "arch*"',
        });
        console.log('getMemberships (filter) response:', response.data);
        // snippet.end
        // Exact list: legitimate because the before hook reset Alice's memberships and this test seeded the only archived one.
        assert.deepEqual(ids(response), [WINTER_MEMBERSHIP], 'only the archived membership matches');
        assert.ok(!ids(response).includes(MEMBERSHIP), 'the membership without a status is filtered out');
        const unfiltered = await pubnub.dataSync.getMemberships({ userId: ALICE });
        assert.ok(
          ids(unfiltered).includes(WINTER_MEMBERSHIP) && ids(unfiltered).includes(MEMBERSHIP),
          'without the filter both memberships are listed',
        );
      } finally {
        await pubnub.dataSync.removeChannel({ id: WINTER }).catch(() => undefined);
      }
    }).timeout(60000);

    it('getMembershipsFilterFastExample: getMemberships with filterFast excludes the seeded archived membership at once', async () => {
      const pubnub = server('datasync');
      await seedArchivedMembership(pubnub);
      try {
        // snippet.getMembershipsFilterFastExample
        // `filterFast` is evaluated against strongly consistent storage, so it matches a membership you just
        // wrote. It accepts the same built-in fields. This call returns Alice's archived memberships.
        const response = await pubnub.dataSync.getMemberships({
          userId: 'user-alice',
          filterFast: 'status == "archived"',
        });
        console.log('getMemberships (filterFast) response:', response.data);
        // snippet.end
        assert.deepEqual(
          ids(response),
          [WINTER_MEMBERSHIP],
          'only the archived membership matches, right after the write',
        );
        assert.equal(response.data[0].status, 'archived');
        assert.ok(!ids(response).includes(MEMBERSHIP), 'the membership without a status is filtered out');
      } finally {
        await pubnub.dataSync.removeChannel({ id: WINTER }).catch(() => undefined);
      }
    });

    // Not a sample: documents the limit the two samples above work around. A field of the membership payload is not filterable.
    it('filtering on a field of the membership payload is refused by the service', async () => {
      const api = server('datasync').dataSync;
      for (const parameters of [{ filter: 'role LIKE "*mod*"' }, { filterFast: 'role == "viewer"' }]) {
        await assert.rejects(
          () => api.getMemberships({ userId: ALICE, ...parameters }),
          (error: unknown) =>
            /400/.test(errorText(error)) &&
            /DS-1001/.test(errorText(error)) &&
            /Unknown field: role/.test(errorText(error)),
          `the service rejects ${JSON.stringify(parameters)}`,
        );
      }
    });

    it('getMembershipsCursorPagingExample: the cursor paging loop for memberships runs and lists the membership', async () => {
      const pubnub = server('datasync');
      await withLogs(async (lines) => {
        // snippet.getMembershipsCursorPagingExample
        let cursor: string | undefined;
        let hasNext = true;
        let page = 0;

        while (hasNext) {
          const response = await pubnub.dataSync.getMemberships({
            userId: 'user-alice',
            limit: 20,
            cursor,
          });
          console.log(`Page ${++page}:`, response.data);
          cursor = response.meta?.next_cursor ?? undefined;
          hasNext = response.meta?.has_next ?? false;
        }
        // snippet.end
        assert.ok(
          lines.some((line) => line.includes(MEMBERSHIP)),
          'a page lists the membership',
        );
      });
    });

    it('updateMembershipBasicUsage: setMembership replaces the membership payload', async () => {
      const pubnub = server('datasync');
      // snippet.updateMembershipBasicUsage
      const response = await pubnub.dataSync.setMembership({
        id: 'membership-alice-summer-sale',
        userId: 'user-alice',
        channelId: 'channel-summer-sale',
        data: {
          classVersion: 1,
          payload: { role: 'moderator' },
        },
      });
      console.log('setMembership response:', response.data);
      // snippet.end
      assert.equal(response.data.payload?.role, 'moderator');
    });

    it('patchMembershipBasicUsage: updateMembership patches one payload field', async () => {
      const pubnub = server('datasync');
      // snippet.patchMembershipBasicUsage
      const response = await pubnub.dataSync.updateMembership({
        id: 'membership-alice-summer-sale',
        replace: { '/payload/role': 'moderator' },
      });
      console.log('updateMembership response:', response.data);
      // snippet.end
      assert.equal(response.data.payload?.role, 'moderator');
    });
  });

  describe('entities (class product)', () => {
    it('createEntityBasicUsage: createEntity creates the product entity that later tests use', async () => {
      const pubnub = server('datasync');
      // snippet.createEntityBasicUsage
      const response = await pubnub.dataSync.createEntity({
        id: 'product-sneaker-42',
        class: 'product',
        data: {
          classVersion: 1,
          payload: { name: 'Retro Sneaker', price: 89.99, stock: 12 },
        },
      });
      console.log('createEntity response:', response.data);
      // snippet.end
      assert.equal(response.data.id, PRODUCT);
      assert.equal(response.data.entityClass, 'product');
      assert.deepEqual(response.data.payload, { name: 'Retro Sneaker', price: 89.99, stock: 12 });
    });

    it('getEntityBasicUsage: getEntity reads the product by id', async () => {
      const pubnub = server('datasync');
      // snippet.getEntityBasicUsage
      const response = await pubnub.dataSync.getEntity({ id: 'product-sneaker-42' });
      console.log('getEntity response:', response.data);
      // snippet.end
      assert.equal(response.data.id, PRODUCT);
      assert.equal(response.data.payload?.price, 89.99);
    });

    it('getEntitiesBasicUsage: getEntities lists products sorted by price descending, verified on the returned prices', async () => {
      const pubnub = server('datasync');
      // `sort` on a declared property is served from the same index as `filter` (eventually consistent), and the sample is
      // asserted to list the product created a moment ago, so wait until consecutive reads list it.
      await settled(
        async () => {
          assert.ok(
            ids(await pubnub.dataSync.getEntities({ class: 'product', sort: { price: 'desc' }, limit: 20 })).includes(
              PRODUCT,
            ),
          );
        },
        { timeout: 45_000, label: 'sorted product list includes the new product' },
      );
      // snippet.getEntitiesBasicUsage
      const response = await pubnub.dataSync.getEntities({
        class: 'product',
        sort: { price: 'desc' },
        limit: 20,
      });
      console.log('getEntities response:', response.data);
      console.log('getEntities meta:', response.meta);
      // snippet.end
      assert.ok(ids(response).includes(PRODUCT));
      const prices = response.data.map((e) => Number(e.payload?.price));
      assert.deepEqual(
        prices,
        [...prices].sort((a, b) => b - a),
        'sorted by price descending',
      );
    });

    it('getEntitiesFilterExample: getEntities with filter finds the product once the index has caught up', async () => {
      const pubnub = server('datasync');
      // `filter` is eventually consistent: wait until it holds on consecutive reads before running the sample (see `settled`).
      await settled(
        async () => {
          assert.ok(
            ids(
              await pubnub.dataSync.getEntities({
                class: 'product',
                filter: 'name LIKE "*sneaker*" && !(status == "discontinued")',
              }),
            ).includes(PRODUCT),
          );
        },
        { timeout: 45_000, label: 'filter index caught up with the new product' },
      );
      // snippet.getEntitiesFilterExample
      // Reference a declared property by its `name` (not its `path`), and combine conditions with `&&`
      // and `||`.
      const response = await pubnub.dataSync.getEntities({
        class: 'product',
        filter: 'name LIKE "*sneaker*" && !(status == "discontinued")',
      });
      console.log('getEntities (filter) response:', response.data);
      // snippet.end
      assert.ok(ids(response).includes(PRODUCT));
    }).timeout(60000);

    it('getEntitiesFilterFastExample: getEntities with filterFast finds the product at once', async () => {
      const pubnub = server('datasync');
      // snippet.getEntitiesFilterFastExample
      const response = await pubnub.dataSync.getEntities({
        class: 'product',
        filterFast: 'price < 100 && stock > 0',
      });
      console.log('getEntities (filterFast) response:', response.data);
      // snippet.end
      assert.ok(ids(response).includes(PRODUCT));
    });

    it('getEntitiesCursorPagingExample: the cursor paging loop for products runs and lists the product', async () => {
      const pubnub = server('datasync');
      await withLogs(async (lines) => {
        // snippet.getEntitiesCursorPagingExample
        let cursor: string | undefined;
        let hasNext = true;
        let page = 0;

        while (hasNext) {
          const response = await pubnub.dataSync.getEntities({
            class: 'product',
            filterFast: 'price < 100',
            limit: 20,
            cursor,
          });
          console.log(`Page ${++page}:`, response.data);
          cursor = response.meta?.next_cursor ?? undefined;
          hasNext = response.meta?.has_next ?? false;
        }
        // snippet.end
        assert.ok(
          lines.some((line) => line.includes(PRODUCT)),
          'a page lists the product',
        );
      });
    });

    it('updateEntityBasicUsage: setEntity replaces the product and sets the price and stock later tests rely on', async () => {
      const pubnub = server('datasync');
      // snippet.updateEntityBasicUsage
      const response = await pubnub.dataSync.setEntity({
        id: 'product-sneaker-42',
        data: {
          classVersion: 1,
          payload: { name: 'Retro Sneaker', price: 79.99, stock: 8 },
        },
      });
      console.log('setEntity response:', response.data);
      // snippet.end
      assert.deepEqual(response.data.payload, { name: 'Retro Sneaker', price: 79.99, stock: 8 });
    });

    it('patchEntityBasicUsage: updateEntity patches the price and the stock stays the same', async () => {
      const pubnub = server('datasync');
      // snippet.patchEntityBasicUsage
      const response = await pubnub.dataSync.updateEntity({
        id: 'product-sneaker-42',
        replace: { '/payload/price': 79.99 },
      });
      console.log('updateEntity response:', response.data);
      // snippet.end
      assert.equal(response.data.payload?.price, 79.99);
      assert.equal(response.data.payload?.stock, 8);
    });

    it('updateEntityCombinedPatchExample: one patch call with all six JSON Patch operations applies, and the eTag it was guarded by is stale afterwards', async () => {
      const pubnub = server('datasync');
      const seeded = await pubnub.dataSync.setEntity({
        id: PRODUCT,
        data: {
          classVersion: 1,
          payload: {
            name: 'Retro Sneaker',
            price: 79.99,
            stock: 8,
            tags: [],
            legacy: { field: 'old' },
            legacyName: 'Retro',
          },
        },
      });
      const before = seeded.data.eTag;
      await assert.rejects(
        () =>
          pubnub.dataSync.updateEntity({
            id: PRODUCT,
            replace: { '/payload/price': 70 },
            ifMatchesEtag: 'StUvWxYzAbCdEf',
          }),
        (error: unknown) => /\b(412|403)\b/.test(errorText(error)),
        'the example eTag is rejected',
      );
      // The sample text keeps the example eTag. The request carries the real one, so the guarded patch can succeed.
      useRealEtag(pubnub.dataSync, 'updateEntity', 'StUvWxYzAbCdEf', before);
      // snippet.updateEntityCombinedPatchExample
      // A single `updateEntity` call can mix `add`, `replace`, `remove`, `move`, `copy`, and `test`. Add
      // `ifMatchesEtag` (the `eTag` from a prior read) to reject the patch with a 412 if the entity
      // changed since you read it, instead of silently overwriting a concurrent change.
      const response = await pubnub.dataSync.updateEntity({
        id: 'product-sneaker-42',
        test: { '/payload/stock': 8 },
        replace: { '/payload/price': 74.99 },
        add: { '/payload/tags/0': 'clearance' },
        remove: ['/payload/legacy/field'],
        move: [{ from: '/payload/legacyName', path: '/payload/displayName' }],
        copy: [{ from: '/payload/displayName', path: '/payload/previousName' }],
        ifMatchesEtag: 'StUvWxYzAbCdEf',
      });
      console.log('updateEntity (combined patch) response:', response.data);
      // snippet.end
      const payload = response.data.payload as Record<string, unknown>;
      assert.equal(payload.price, 74.99);
      assert.deepEqual(payload.tags, ['clearance']);
      assert.deepEqual(payload.legacy, {});
      assert.equal(payload.displayName, 'Retro');
      assert.equal(payload.previousName, 'Retro');
      assert.ok(!('legacyName' in payload), 'move removed the source');
      await assert.rejects(
        () => pubnub.dataSync.updateEntity({ id: PRODUCT, replace: { '/payload/price': 70 }, ifMatchesEtag: before }),
        (error: unknown) => /\b(412|403)\b/.test(errorText(error)),
        'the old eTag is rejected after the patch',
      );
    });

    // Not samples: behaviour the DataSync page promises in prose.
    it('entity ids with a dot are stored verbatim, returned verbatim and found by filterFast', async () => {
      const api = server('datasync').dataSync;
      const id = 'product.676';
      await api.removeEntity({ id }).catch(() => undefined);
      try {
        const created = await api.createEntity({
          id,
          class: 'product',
          data: { classVersion: 1, payload: { name: 'Dot Sneaker', price: 10, stock: 1 } },
        });
        assert.equal(created.data.id, id, 'the service keeps a dotted id verbatim');
        assert.equal((await api.getEntity({ id })).data.id, id);
        // `id` is a built-in filterable field, so a strongly consistent filter finds the dotted id right away.
        const found = await api.getEntities({ class: 'product', filterFast: `id == "${id}"` });
        assert.deepEqual(ids(found), [id]);
      } finally {
        await api.removeEntity({ id }).catch(() => undefined);
      }
    });

    it('an entity can be created again with the same id right after it was deleted', async () => {
      // (addDataSyncListener recreates the product it deletes without a retry loop.)
      const api = server('datasync').dataSync;
      const id = 'product.678';
      const body = { classVersion: 1, payload: { name: 'Recreate Sneaker', price: 12, stock: 2 } };
      await api.removeEntity({ id }).catch(() => undefined);
      try {
        await api.createEntity({ id, class: 'product', data: body });
        await api.removeEntity({ id });
        const again = await api.createEntity({ id, class: 'product', data: body });
        assert.equal(again.data.id, id, 'the id can be reused straight after the delete');
      } finally {
        await api.removeEntity({ id }).catch(() => undefined);
      }
    });

    it('a duplicate create of an existing id is refused with 409 and leaves the stored object unchanged', async () => {
      const api = server('datasync').dataSync;
      const before = (await api.getEntity({ id: PRODUCT })).data;
      await assert.rejects(
        () =>
          api.createEntity({
            id: PRODUCT,
            class: 'product',
            data: { classVersion: 1, payload: { name: 'Other', price: 1, stock: 1 } },
          }),
        (error: unknown) => /409/.test(errorText(error)) && /DS-0301/.test(errorText(error)),
      );
      assert.deepEqual((await api.getEntity({ id: PRODUCT })).data.payload, before.payload);
    });

    it('every filter, sort and patch line shown in the DataSync page fragments is accepted or refused by the service as documented', async () => {
      const api = server('datasync').dataSync;
      const accepted = async (
        query: Pick<PubNub.DataSync.GetEntitiesParameters, 'filter' | 'filterFast' | 'sort'>,
      ): Promise<void> => {
        await api.getEntities({ ...query, class: 'product', limit: 5 });
      };
      for (const fragment of filterFragments) {
        await accepted(fragment).catch((error) => {
          throw new Error(`filter fragment ${JSON.stringify(fragment)} was rejected: ${errorText(error)}`);
        });
      }
      // Two sort fragments order by `type`, a property the sample class `product` does not declare (the docs example implies a
      // class that has both `type` and `price`). The service refuses a sort field that no property declares, with 403 from the
      // Access Manager service (the same answer as for an undeclared projection). That is a docs example written for a
      // different class, not a syntax error, so the test expects the refusal and keeps the finding visible. Every other sort
      // fragment must be accepted.
      const needsUndeclaredType = (fragment: (typeof sortFragments)[number]): boolean =>
        JSON.stringify(fragment.sort).includes('type');
      for (const fragment of sortFragments) {
        if (needsUndeclaredType(fragment)) {
          await assert.rejects(
            accepted(fragment),
            (error: unknown) => /\b(400|403)\b/.test(errorText(error)),
            `undeclared sort field ${JSON.stringify(fragment)}`,
          );
        } else {
          await accepted(fragment).catch((error) => {
            throw new Error(`sort fragment ${JSON.stringify(fragment)} was rejected: ${errorText(error)}`);
          });
        }
      }

      // Patch forms: apply each line to a scratch entity that holds every field the lines touch.
      const id = 'product.679';
      await api.removeEntity({ id }).catch(() => undefined);
      try {
        await api.createEntity({
          id,
          class: 'product',
          data: {
            classVersion: 1,
            status: 'active',
            payload: {
              name: 'Patch Sneaker',
              price: 99,
              stock: 3,
              tags: [],
              tempFlag: true,
              legacy: { field: 'old' },
              legacyName: 'Retro',
              displayName: 'Retro',
            },
          },
        });
        for (const fragment of patchFragments) {
          const response = await api.updateEntity({ id, ...fragment }).catch((error) => {
            throw new Error(`patch fragment ${JSON.stringify(fragment)} was rejected: ${errorText(error)}`);
          });
          assert.equal(response.status, 200, `patch fragment ${JSON.stringify(fragment)}`);
        }
        // Spot check the result of the chain: add, replace, remove, move and copy all took effect.
        const payload = (await api.getEntity({ id })).data.payload as Record<string, unknown>;
        assert.deepEqual(payload.tags, ['featured']);
        assert.equal(payload.price, 79.99);
        assert.ok(!('tempFlag' in payload));
        assert.ok(!('legacyName' in payload));
        assert.equal(payload.previousName, 'Retro');
      } finally {
        await api.removeEntity({ id }).catch(() => undefined);
      }
    }).timeout(120_000);
  });

  // The event rules of the keyset must be on for every object kind used below (Admin Portal, DataSync tab). A kind without a rule
  // makes the matching test fail on its missing event.
  describe('events and subscriptions', () => {
    it('dataSyncEntitySubscribeExample: the entity subscribe sample connects, and an updated entity arrives as an event', async () => {
      const pubnub = server('datasync');
      await withLogs(async (lines) => {
        const ready = connected(pubnub, { channels: [PRODUCT] });
        // snippet.dataSyncEntitySubscribeExample
        // DataSync objects publish create/update/delete events over a `dataSync` listener. Create a
        // DataSync SDK entity for the object, subscribe to it, and attach the listener.
        const productSubscription = pubnub.dataSyncEntity('product-sneaker-42').subscription();
        productSubscription.onDataSync = (event) => console.log(event.message.event, event.message.data);
        productSubscription.subscribe();
        // snippet.end
        await ready;
        try {
          await pubnub.dataSync.updateEntity({ id: PRODUCT, replace: { '/payload/stock': 7 } });
          await eventually(
            () =>
              assert.ok(lines.some((l) => l.startsWith('update') && l.includes(PRODUCT) && l.includes('"stock":7'))),
            { timeout: 30_000, label: 'update event logged' },
          );
        } finally {
          productSubscription.unsubscribe();
        }
      });
    }).timeout(60000);

    it('subscribeToDataSyncEntity: subscribing to one entity delivers the new stock in the event payload', async () => {
      const pubnub = server('datasync');
      await withLogs(async (lines) => {
        const ready = connected(pubnub, { channels: [PRODUCT] });
        // snippet.subscribeToDataSyncEntity
        // Observe one entity.
        const entitySubscription = pubnub.dataSyncEntity('product-sneaker-42').subscription();

        entitySubscription.onDataSync = (event) => {
          console.log(event.message.event, event.message.data);
        };

        entitySubscription.subscribe();
        // snippet.end
        await ready;
        try {
          await pubnub.dataSync.updateEntity({ id: PRODUCT, replace: { '/payload/stock': 6 } });
          await eventually(() => assert.ok(lines.some((l) => l.startsWith('update') && l.includes('"stock":6'))), {
            timeout: 30_000,
            label: 'update event with the new stock',
          });
        } finally {
          entitySubscription.unsubscribe();
        }
      });
    }).timeout(60000);

    it('observeDataSyncEntitiesByPattern: a wildcard subscription on the admin projection channel receives the event for a newly created dotted id', async () => {
      const pubnub = server('datasync');
      const member = 'product.676';
      await pubnub.dataSync.removeEntity({ id: member }).catch(() => undefined);
      await withLogs(async (lines) => {
        const ready = connected(pubnub, { channels: ['__admin__product.*'] });
        // snippet.observeDataSyncEntitiesByPattern
        // Because the identifier is used verbatim, a wildcard identifier subscribes to the matching
        // channel pattern and one subscription serves the whole set. `event.channel` reports the concrete
        // delivery channel, while `event.subscription` reports the pattern that matched it.
        const patternSubscription = pubnub.dataSyncEntity('product.*').subscription({ projection: 'admin' });

        patternSubscription.onDataSync = (event) => {
          // event.channel      -> '__admin__product.676'
          // event.subscription -> '__admin__product.*'
          console.log('changed:', event.message.data.id);
        };

        patternSubscription.subscribe();
        // snippet.end
        await ready;
        try {
          await pubnub.dataSync.createEntity({
            id: member,
            class: 'product',
            data: { classVersion: 1, payload: { name: 'Pattern Sneaker', price: 10, stock: 1 } },
          });
          await eventually(() => assert.ok(lines.includes('changed: ' + member)), {
            timeout: 30_000,
            label: 'event for an entity that matches the pattern',
          });
        } finally {
          patternSubscription.unsubscribe();
          await pubnub.dataSync.removeEntity({ id: member }).catch(() => undefined);
        }
      });
    }).timeout(60000);

    it('combineDataSyncSubscriptions: a user and an entity subscription combined in one set both deliver events to one listener', async () => {
      const pubnub = server('datasync');
      const member = 'product.677';
      await pubnub.dataSync.removeEntity({ id: member }).catch(() => undefined);
      await withLogs(async (lines) => {
        const ready = connected(pubnub, { channels: ['product.*', ALICE] });
        // snippet.combineDataSyncSubscriptions
        // A DataSync subscription is an ordinary `subscription`, so it composes into a set with any other
        // subscription.
        const productsSubscription = pubnub.dataSyncEntity('product.*').subscription();
        const aliceSubscription = pubnub.dataSyncUser('user-alice').subscription();

        const dataSyncSubscriptionSet = productsSubscription.addSubscription(aliceSubscription);
        dataSyncSubscriptionSet.onDataSync = (event) => console.log(event.message.objectType, event.message.event);
        dataSyncSubscriptionSet.subscribe();
        // snippet.end
        await ready;
        try {
          await pubnub.dataSync.updateUser({ id: ALICE, replace: { '/payload/name': 'Alice C.' } });
          await pubnub.dataSync.createEntity({
            id: member,
            class: 'product',
            data: { classVersion: 1, payload: { name: 'Set Sneaker', price: 11, stock: 1 } },
          });
          await eventually(() => assert.ok(lines.includes('user update') && lines.includes('entity create')), {
            timeout: 30_000,
            label: 'one set receives user and entity events',
          });
        } finally {
          dataSyncSubscriptionSet.unsubscribe();
          await pubnub.dataSync.removeEntity({ id: member }).catch(() => undefined);
        }
      });
    }).timeout(60000);

    it('addDataSyncListener: the listener switch sees update, delete and create events for one product', async () => {
      const pubnub = server('datasync');
      await withLogs(async (lines) => {
        const ready = connected(pubnub, { channels: [PRODUCT] });
        // snippet.addDataSyncListener
        // Create a DataSync SDK entity for the object and attach the listener.
        const dataSyncObjectId = 'product-sneaker-42';
        const dataSyncListenerSubscription = pubnub.dataSyncEntity(dataSyncObjectId).subscription();

        dataSyncListenerSubscription.onDataSync = (event) => {
          const change = event.message;

          // This channel can also receive relationship events and events about connected entities. Only
          // handle events for the observed product. `Product` is a class of your own, so its events
          // report `type: 'entity'`.
          if (change.type !== 'entity' || change.data.id !== dataSyncObjectId) return;

          switch (change.event) {
            case 'create':
              console.log('Product created:', change.data.id);
              break;
            case 'update': {
              // `payload` is typed as the generic SDK `Payload` union (it can be a string, number, array,
              // and so on for other message types), but a DataSync entity payload is always the JSON
              // object declared by its class, so it is safe to read it as a record here.
              const payload =
                'payload' in change.data ? (change.data.payload as Record<string, unknown> | undefined) : undefined;
              console.log('New price:', payload?.price);
              break;
            }
            case 'delete':
              console.log('Product deleted:', change.data.id);
              break;
          }
        };

        dataSyncListenerSubscription.subscribe();
        // snippet.end
        await ready;
        try {
          await pubnub.dataSync.updateEntity({ id: PRODUCT, replace: { '/payload/price': 69.5 } });
          await eventually(() => assert.ok(lines.some((l) => l.includes('New price: 69.5'))), {
            timeout: 30_000,
            label: 'update branch',
          });
          await pubnub.dataSync.removeEntity({ id: PRODUCT });
          await eventually(() => assert.ok(lines.some((l) => l.includes('Product deleted: ' + PRODUCT))), {
            timeout: 30_000,
            label: 'delete branch',
          });
          // The service accepts the same id straight after a delete (see the recreate test above), so no retry loop here.
          await pubnub.dataSync.createEntity({
            id: PRODUCT,
            class: 'product',
            data: { classVersion: 1, payload: { name: 'Retro Sneaker', price: 74.99, stock: 8 } },
          });
          await eventually(() => assert.ok(lines.some((l) => l.includes('Product created: ' + PRODUCT))), {
            timeout: 30_000,
            label: 'create branch',
          });
        } finally {
          dataSyncListenerSubscription.unsubscribe();
        }
      });
    }).timeout(60000);

    it('dataSyncProjectionSubscriptions: two projection subscriptions connect, and unsubscribing one leaves the other subscribed', async () => {
      const pubnub = server('datasync');
      // The sample is written without semicolons, so the formatter must not touch it.
      /* eslint-disable prettier/prettier */
      // snippet.dataSyncProjectionSubscriptions
      const user = pubnub.dataSyncUser('user-alice')

      const base = user.subscription()                        // observes `user-alice`
      const admin = user.subscription({ projection: 'admin' }) // observes `__admin__user-alice`
      // snippet.end
      /* eslint-enable prettier/prettier */
      // The docs promise two independent data channels: the object itself and `__<projection>__<id>`.
      const ready = connected(pubnub, { channels: [ALICE, '__admin__' + ALICE] });
      base.subscribe();
      admin.subscribe();
      await ready;
      // "Unsubscribing one leaves the other subscribed": drop the base one and check the admin channel is still active.
      base.unsubscribe();
      assert.ok(pubnub.getSubscribedChannels().includes('__admin__' + ALICE), 'the admin projection stays subscribed');
      assert.ok(!pubnub.getSubscribedChannels().includes(ALICE), 'the base channel is gone');
      admin.unsubscribe();
    });
  });

  describe('relationships (class ProductOwner)', () => {
    // Bob is the owning end of the link. No sample creates him, so he is set up here and removed by the after hook.
    before(async () => {
      const created = await server('datasync').dataSync.createUser({
        id: BOB,
        data: { classVersion: 1, payload: { name: 'Bob', type: 'seller' } },
      });
      assert.equal(created.data.id, BOB);
    });

    it('createRelationshipBasicUsage: createRelationship links the seller to the product with the fixed id that later tests use', async () => {
      const pubnub = server('datasync');
      // snippet.createRelationshipBasicUsage
      const response = await pubnub.dataSync.createRelationship({
        id: 'rel-bob-owns-sneaker-42',
        class: 'ProductOwner',
        entityAId: 'seller-bob',
        entityBId: 'product-sneaker-42',
        data: {
          classVersion: 1,
          payload: { since: '2026-07-13' },
        },
      });
      console.log('createRelationship response:', response.data);
      // snippet.end
      assert.equal(response.data.id, REL);
      assert.equal(response.data.relationshipClass, 'ProductOwner');
      assert.equal(response.data.entityAId, BOB);
      assert.equal(response.data.entityBId, PRODUCT);
      assert.deepEqual(response.data.payload, { since: '2026-07-13' });
    });

    it('getRelationshipBasicUsage: getRelationship reads the link by its fixed id', async () => {
      const pubnub = server('datasync');
      // snippet.getRelationshipBasicUsage
      const response = await pubnub.dataSync.getRelationship({
        id: 'rel-bob-owns-sneaker-42',
      });
      console.log('getRelationship response:', response.data);
      // snippet.end
      assert.equal(response.data.id, REL);
      assert.equal(response.data.entityBId, PRODUCT);
    });

    it('getRelationshipsBasicUsage: getRelationships lists exactly the link from the seller side', async () => {
      const pubnub = server('datasync');
      // Exact list: wait until consecutive reads show the link created a moment ago (a plain list is not documented as strongly consistent).
      await settled(
        async () => {
          const listed = await pubnub.dataSync.getRelationships({ class: 'ProductOwner', entityAId: BOB, limit: 20 });
          assert.deepEqual(ids(listed), [REL]);
        },
        { timeout: 45_000, label: 'Bob lists exactly his link' },
      );
      // snippet.getRelationshipsBasicUsage
      const response = await pubnub.dataSync.getRelationships({
        class: 'ProductOwner',
        entityAId: 'seller-bob',
        limit: 20,
      });
      console.log('getRelationships response:', response.data);
      console.log('getRelationships meta:', response.meta);
      // snippet.end
      // Exact list: legitimate because the before hook removed Bob (and every link of his) before this run created him.
      assert.deepEqual(ids(response), [REL]);
    });

    it('getRelationshipsByEntityBIdExample: getRelationships by entity B id lists the same link from the product side', async () => {
      const pubnub = server('datasync');
      await settled(
        async () => {
          const listed = await pubnub.dataSync.getRelationships({
            class: 'ProductOwner',
            entityBId: PRODUCT,
            limit: 20,
          });
          assert.deepEqual(ids(listed), [REL]);
        },
        { timeout: 45_000, label: 'the product lists exactly the link' },
      );
      // snippet.getRelationshipsByEntityBIdExample
      // Pass `entityBId` instead of `entityAId` to list relationships where the entity is on the second
      // side of the link.
      const response = await pubnub.dataSync.getRelationships({
        class: 'ProductOwner',
        entityBId: 'product-sneaker-42',
        limit: 20,
      });
      console.log('getRelationships (entityBId) response:', response.data);
      // snippet.end
      // Exact list: the product was removed by the before hook and recreated by this run, with every link it had.
      assert.deepEqual(ids(response), [REL]);
    });

    it('updateRelationshipBasicUsage: setRelationship replaces the link and adds a tier to its payload', async () => {
      const pubnub = server('datasync');
      // snippet.updateRelationshipBasicUsage
      const response = await pubnub.dataSync.setRelationship({
        id: 'rel-bob-owns-sneaker-42',
        entityAId: 'seller-bob',
        entityBId: 'product-sneaker-42',
        data: {
          classVersion: 1,
          payload: { since: '2026-07-13', tier: 'gold' },
        },
      });
      console.log('setRelationship response:', response.data);
      // snippet.end
      assert.deepEqual(response.data.payload, { since: '2026-07-13', tier: 'gold' });
    });

    it('getRelationshipsFilterExample: a negated filter keeps the gold link once the index has caught up', async () => {
      const pubnub = server('datasync');
      // `filter` is eventually consistent: wait until it holds on consecutive reads before running the sample (see `settled`).
      await settled(
        async () => {
          assert.ok(
            ids(
              await pubnub.dataSync.getRelationships({ class: 'ProductOwner', filter: '!(tier == "platinum")' }),
            ).includes(REL),
          );
        },
        { timeout: 45_000, label: 'filter index caught up with the relationship' },
      );
      // snippet.getRelationshipsFilterExample
      const response = await pubnub.dataSync.getRelationships({
        class: 'ProductOwner',
        filter: '!(tier == "platinum")',
      });
      console.log('getRelationships (filter) response:', response.data);
      // snippet.end
      assert.ok(ids(response).includes(REL), 'tier is gold, so the negated filter keeps it');
    }).timeout(60000);

    it('getRelationshipsFilterFastExample: filterFast on tier finds the link at once', async () => {
      const pubnub = server('datasync');
      // snippet.getRelationshipsFilterFastExample
      const response = await pubnub.dataSync.getRelationships({
        class: 'ProductOwner',
        filterFast: 'tier == "gold"',
      });
      console.log('getRelationships (filterFast) response:', response.data);
      // snippet.end
      assert.ok(ids(response).includes(REL));
    });

    it('getRelationshipsCursorPagingExample: the cursor paging loop for relationships runs and lists the link', async () => {
      const pubnub = server('datasync');
      await withLogs(async (lines) => {
        // snippet.getRelationshipsCursorPagingExample
        let cursor: string | undefined;
        let hasNext = true;
        let page = 0;

        while (hasNext) {
          const response = await pubnub.dataSync.getRelationships({
            class: 'ProductOwner',
            entityAId: 'seller-bob',
            limit: 20,
            cursor,
          });
          console.log(`Page ${++page}:`, response.data);
          cursor = response.meta?.next_cursor ?? undefined;
          hasNext = response.meta?.has_next ?? false;
        }
        // snippet.end
        assert.ok(
          lines.some((line) => line.includes(REL)),
          'a page lists the relationship',
        );
      });
    });

    it('patchRelationshipBasicUsage: updateRelationship patches the tier of the link', async () => {
      const pubnub = server('datasync');
      // snippet.patchRelationshipBasicUsage
      const response = await pubnub.dataSync.updateRelationship({
        id: 'rel-bob-owns-sneaker-42',
        replace: { '/payload/tier': 'platinum' },
      });
      console.log('updateRelationship response:', response.data);
      // snippet.end
      assert.equal(response.data.payload?.tier, 'platinum');
      assert.equal(response.data.payload?.since, '2026-07-13');
    });
  });

  // Removal comes last: each sample removes an object the blocks above created, in dependency order.
  describe('removal', () => {
    it('removeRelationshipBasicUsage: removeRelationship deletes the link and a read afterwards answers 404', async () => {
      const pubnub = server('datasync');
      // snippet.removeRelationshipBasicUsage
      const response = await pubnub.dataSync.removeRelationship({
        id: 'rel-bob-owns-sneaker-42',
      });
      console.log('removeRelationship response status:', response.status);
      // snippet.end
      assert.ok(response.status >= 200 && response.status < 300);
      await assert.rejects(
        () => pubnub.dataSync.getRelationship({ id: REL }),
        (error: unknown) => /404/.test(errorText(error)),
      );
    });

    it('removeMembershipBasicUsage: removeMembership deletes the membership and a read afterwards answers 404', async () => {
      const pubnub = server('datasync');
      // snippet.removeMembershipBasicUsage
      const response = await pubnub.dataSync.removeMembership({
        id: 'membership-alice-summer-sale',
      });
      console.log('removeMembership response status:', response.status);
      // snippet.end
      assert.ok(response.status >= 200 && response.status < 300);
      await assert.rejects(
        () => pubnub.dataSync.getMembership({ id: MEMBERSHIP }),
        (error: unknown) => /404/.test(errorText(error)),
      );
    });

    it('removeEntityBasicUsage: removeEntity deletes the product and a read afterwards answers 404', async () => {
      const pubnub = server('datasync');
      // snippet.removeEntityBasicUsage
      const response = await pubnub.dataSync.removeEntity({ id: 'product-sneaker-42' });
      console.log('removeEntity response status:', response.status);
      // snippet.end
      assert.ok(response.status >= 200 && response.status < 300);
      await assert.rejects(
        () => pubnub.dataSync.getEntity({ id: PRODUCT }),
        (error: unknown) => /404/.test(errorText(error)),
      );
    });

    it('removeChannelBasicUsage: removeChannel deletes the DataSync channel and a read afterwards answers 404', async () => {
      const pubnub = server('datasync');
      // snippet.removeChannelBasicUsage
      const response = await pubnub.dataSync.removeChannel({ id: 'channel-summer-sale' });
      console.log('removeChannel response status:', response.status);
      // snippet.end
      assert.ok(response.status >= 200 && response.status < 300);
      await assert.rejects(
        () => pubnub.dataSync.getChannel({ id: SUMMER }),
        (error: unknown) => /404/.test(errorText(error)),
      );
    });

    it('removeUserBasicUsage: removeUser deletes Alice and a read afterwards answers 404', async () => {
      const pubnub = server('datasync');
      // snippet.removeUserBasicUsage
      const response = await pubnub.dataSync.removeUser({ id: 'user-alice' });
      console.log('removeUser response status:', response.status);
      // snippet.end
      assert.ok(response.status >= 200 && response.status < 300);
      await assert.rejects(
        () => pubnub.dataSync.getUser({ id: ALICE }),
        (error: unknown) => /404/.test(errorText(error)),
      );
    });
  });
});
