import assert from '../harness/assert.js';
import type PubNub from 'pubnub';
import { page, step, check, skipStep } from '../harness/step.js';
import { connected, eventually } from '../harness/wait.js';
import { filterFragments, patchFragments, sortFragments } from '../fixtures/datasync-fragments.js';

/**
 * docs/sdks/javascript/api-reference/datasync.md, plus the four DataSync samples of the subscribe page
 * (addDataSyncListener, subscribeToDataSyncEntity, observeDataSyncEntitiesByPattern, combineDataSyncSubscriptions).
 * Those four live here because they need the same fixtures. They are still reported under this page.
 *
 * Keyset: `secured` (Access Manager and DataSync). Every snippet runs as `world.server`, the client that holds the
 * secret key and signs each request, so no token plumbing is needed. Token-holder behaviour (Alice, Bob) belongs
 * to the Access Manager module.
 *
 * Classes: users, channels and memberships use the Global classes PubNub seeds. Entities need the `product` class
 * and relationships need `ProductOwner`. Both come from provision/datasync-classes.json. While a class is missing,
 * its steps skip as `blocked-by:datasyncClassProduct` and `blocked-by:datasyncClassProductOwner`.
 *
 * Events: DataSync publishes events only for class versions with an event rule, and that rule is switched on in
 * the Admin Portal (no Admin API endpoint). The `datasyncEvents` check probes which object kinds publish. Event
 * steps skip with `needs-feature:datasync-events` (an allowed skip, see harness/policy.ts) for the kinds that do not.
 *
 * Two snippet ids differ from the docs: `createChannelBasicUsage` (also used by the subscribe page) and
 * `getMembershipBasicUsage` (also used by the App Context page) became `createDataSyncChannelBasicUsage` and
 * `getDataSyncMembershipBasicUsage`, because snippet ids are unique across the app. The datasync page embeds the
 * old names from basic-usage/data-sync.ts and needs the new ones when it switches to this app.
 *
 * Doc inconsistencies the steps work around, all found by live runs:
 * - The membership and relationship create samples set no `id`, but the get, set, patch and remove samples use
 *   fixed ids. The create steps remove the generated object and recreate it with the id the later samples use.
 * - The two membership filter samples used to filter on `role`, which the Global Membership class does not declare
 *   (the service answers 400 DS-1001). They now filter on the built-in `status` field. The check
 *   `datasyncMembershipFilterRejected` records that payload fields stay unfilterable.
 *
 * Phase P2 (App Context era data model, after Access Manager in P1). Sneaker Drop role: DataSync is the shop's
 * live catalogue. Alice (`user-alice`, a shopper) joins the `channel-summer-sale` drop, Bob (`seller-bob`) owns the
 * `product-sneaker-42` entity through a `ProductOwner` relationship. The steps run in the page's order: users,
 * channels, memberships, entities, events, relationships, then removal.
 *
 * Proves: each docs call against the live service returns what the page says (ids with the run suffix, payloads,
 * eTags, sorting, filters, cursor paging) and that removed objects answer 404.
 * Does not prove: token-holder access (Access Manager module), projections that filter events, or event delivery
 * when the keyset's event rules are off. Those steps still prove the subscription connects, then skip with
 * `needs-feature:datasync-events`. Missing classes skip as `blocked-by:*`.
 * The signature and response blocks of the page are not run here.
 */
export default page('api-reference/datasync', 'P2', (world) => {
  const secured = { keyset: 'datasync' as const };
  const api = (): PubNub['dataSync'] => world.server.dataSync;

  // ---- helpers -----------------------------------------------------------------------------------------------

  // The SDK error carries the service answer in `status`. Assertions match on this one string so a changed status
  // code or DS- error code shows up in the failure message.
  const errorText = (error: unknown): string => {
    const status = (error as { status?: { errorData?: unknown; statusCode?: number } } | undefined)?.status;
    return `${status?.statusCode ?? ''} ${JSON.stringify(status?.errorData ?? {})}`;
  };
  const missingClass = (error: unknown): boolean => /404/.test(errorText(error)) && /DS-0100/.test(errorText(error));

  // DS-0100 with HTTP 404 means the class does not exist on the keyset. These probes are cached promises, so the
  // whole page asks the service once. Any other error is a real failure and is re-thrown.
  let productClass: Promise<boolean> | undefined;
  let ownerClass: Promise<boolean> | undefined;
  const hasProductClass = (): Promise<boolean> =>
    (productClass ??= api()
      .getEntities({ class: 'product', limit: 1 })
      .then(() => true, (error) => (missingClass(error) ? false : Promise.reject(error))));
  const hasOwnerClass = (): Promise<boolean> =>
    (ownerClass ??= api()
      .getRelationships({ class: 'ProductOwner', limit: 1 })
      .then(() => true, (error) => (missingClass(error) ? false : Promise.reject(error))));

  // Event probe: DataSync only publishes events for class versions whose event rule is on, and nothing in the API
  // reports that. So the page writes one object of each kind while listening, once, and remembers what arrived.
  type EventKind = 'user' | 'channel' | 'membership' | 'entity' | 'relationship';
  const EVENT_LABEL: Record<EventKind, string> = {
    user: 'User v1',
    channel: 'Channel v1',
    membership: 'Membership v1',
    entity: 'product v1',
    relationship: 'ProductOwner v1',
  };
  /** How long the probe waits for the create events of its own writes. */
  const PROBE_WINDOW_MS = 20_000;
  let eventProbe: Promise<Set<EventKind>> | undefined;

  /** Creates one object of each kind while listening, and reports the kinds that produced a create event. */
  async function probeEvents(): Promise<Set<EventKind>> {
    const client = world.server;
    const found = new Set<EventKind>();
    const [userId, channelId, productId] = [world.n('ds-probe-user'), world.n('ds-probe-channel'), world.n('ds-probe-product')];
    const subscriptions = [
      client.dataSyncUser(userId).subscription(),
      client.dataSyncChannel(channelId).subscription(),
      client.dataSyncEntity(productId).subscription(),
    ];
    for (const subscription of subscriptions) {
      subscription.onDataSync = (event) => {
        if (event.message.event === 'create') found.add(event.message.objectType as EventKind);
      };
    }
    const ready = connected(client, { channels: [userId, channelId, productId] });
    subscriptions.forEach((s) => s.subscribe());
    await ready;
    const withProduct = await hasProductClass();
    const withOwner = withProduct && (await hasOwnerClass());
    const expected = new Set<EventKind>(['user', 'channel', 'membership']);
    if (withProduct) expected.add('entity');
    if (withOwner) expected.add('relationship');
    const dataSync = client.dataSync;
    await dataSync.createUser({ id: userId, data: { classVersion: 1, payload: { name: 'Probe' } } });
    await dataSync.createChannel({ id: channelId, data: { classVersion: 1, payload: { name: 'Probe' } } });
    await dataSync.createMembership({ userId, channelId, data: { classVersion: 1 } });
    if (withProduct) {
      await dataSync.createEntity({ id: productId, class: 'product', data: { classVersion: 1, payload: { name: 'Probe', price: 1 } } });
    }
    if (withOwner) {
      await dataSync.createRelationship({ class: 'ProductOwner', entityAId: userId, entityBId: productId, data: { classVersion: 1 } });
    }
    try {
      await eventually(() => assert.ok([...expected].every((kind) => found.has(kind))), { timeout: PROBE_WINDOW_MS, interval: 500, label: 'probe events' });
    } catch {
      // Whatever arrived is what is switched on.
    }
    for (const subscription of subscriptions) subscription.unsubscribe();
    // Deleting an entity removes its relationships, deleting a user or channel removes its memberships.
    if (withProduct) await dataSync.removeEntity({ id: productId }).catch(() => undefined);
    await dataSync.removeUser({ id: userId }).catch(() => undefined);
    await dataSync.removeChannel({ id: channelId }).catch(() => undefined);
    return found;
  }
  const events = (): Promise<Set<EventKind>> => (eventProbe ??= probeEvents());

  /** The kinds among `kinds` whose create event the probe did not see. Empty when every needed event rule is on. */
  async function offKinds(...kinds: EventKind[]): Promise<EventKind[]> {
    const on = await events();
    return kinds.filter((kind) => !on.has(kind));
  }

  /**
   * Skips the calling step when `off` is not empty.
   *
   * The skip is `needs-feature:datasync-events`: the keyset lacks a switch that only the Admin Portal can set (DataSync
   * tab, "Select entities to sync", no Admin API endpoint). That tag is an allowed skip, it does not count against
   * `DOCS_SNIPPETS_SKIP_BUDGET`, and `DOCS_SNIPPETS_REQUIRE_FEATURES=datasync-events` turns it into a failure for a CI job whose
   * keyset has the rules on. The detail names the class versions whose create event did not arrive within the probe
   * window, so the skip says what was observed (no event) and what to do, not a guess about why.
   *
   * Event steps call this only after their subscription is connected (see `eventStep` users). With the rules off the
   * step has still proved that the snippet's subscription code runs and the SDK connects to the data channels
   * (wildcard and projection channels included). Only the delivery of events is left unverified, and that is
   * exactly what the skip reports.
   */
  function skipUnlessEvents(off: EventKind[]): void {
    if (off.length > 0) {
      skipStep(
        'needs-feature:datasync-events',
        `subscription connected, but no create event arrived within ${PROBE_WINDOW_MS / 1000} s for ${off.map((k) => EVENT_LABEL[k]).join(', ')}, ` +
          `so event delivery was not verified. Switch the event rule on for each in the Admin Portal, DataSync tab, then rerun.`,
      );
    }
  }

  // Live ids of the fixed objects the docs samples use. Snippets show the plain literal, the staging rewrite
  // suffixes it, and the assertions use these to compare with what the service returned.
  const user = (): string => world.n('user-alice');
  const channel = (): string => world.n('channel-summer-sale');
  const membership = (): string => world.n('membership-alice-summer-sale');
  const product = (): string => world.n('product-sneaker-42');
  const seller = (): string => world.n('seller-bob');
  const relationship = (): string => world.n('rel-bob-owns-sneaker-42');

  const ids = (response: { data: Array<{ id: string }> }): string[] => response.data.map((o) => o.id);

  // ---- preconditions -----------------------------------------------------------------------------------------

  // Precondition, no snippet. Skips (not fails) when the `product` class is not provisioned, and every entity step
  // then skips as `blocked-by:datasyncClassProduct`. Provisioning is a separate approved action (provision/).
  check('datasyncClassProduct', { ...secured, proves: 'Precondition: the product class exists on the keyset, otherwise dependent DataSync steps skip.' }, async () => {
    if (!(await hasProductClass())) {
      skipStep('blocked-by:datasync-class-missing (product v1), run provision/provision-datasync.ts --apply after approval');
    }
    const klass = await api().getEntities({ class: 'product', classVersion: 1, limit: 1 });
    assert.equal(klass.status, 200);
  });

  // Same for the `ProductOwner` relationship class. `needs` the product class because a relationship links entities.
  check('datasyncClassProductOwner', { ...secured, needs: ['datasyncClassProduct'], proves: 'Precondition: the ProductOwner relationship class exists on the keyset.' }, async () => {
    if (!(await hasOwnerClass())) {
      skipStep('blocked-by:datasync-class-missing (ProductOwner v1), run provision/provision-datasync.ts --apply after approval');
    }
  });

  // Runs the event probe and logs which object kinds publish events. Never fails: event steps decide on their own
  // whether to skip. The long timeout covers the probe window plus connect time.
  check('datasyncEvents', { ...secured, timeout: 90_000, proves: 'Probes which DataSync object kinds publish events, so event steps can skip when event rules are off.' }, async () => {
    const on = await events();
    console.log(`DataSync event rules on: ${[...on].map((k) => EVENT_LABEL[k]).join(', ') || 'none'}`);
  });

  // ---- users -------------------------------------------------------------------------------------------------

  // Creates Alice, the root of the user fixtures. Asserts the echoed payload and that an eTag is returned (later
  // steps rely on it). Every user step `needs` this one.
  step('createUserBasicUsage', { ...secured, proves: 'createUser creates Alice, echoes the payload and returns an eTag.' }, async () => {
    const pubnub = world.server;
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
    assert.equal(response.data.id, user());
    assert.equal(response.data.entityClassVersion, 1);
    assert.deepEqual(response.data.payload, { name: 'Alice', type: 'shopper' });
    assert.ok(response.data.eTag, 'response carries an eTag');
  });

  // Reads Alice back by id.
  step('getUserBasicUsage', { ...secured, needs: ['createUserBasicUsage'], proves: 'getUser reads Alice back by id.' }, async () => {
    const pubnub = world.server;
    // snippet.getUserBasicUsage
    const response = await pubnub.dataSync.getUser({ id: 'user-alice' });
    console.log('getUser response:', response.data);
    // snippet.end
    assert.equal(response.data.id, user());
    assert.equal(response.data.payload?.name, 'Alice');
  });

  // Lists users sorted by `createdAt`. The sort is verified on the returned timestamps, since the snippet only logs.
  step('getUsersBasicUsage', { ...secured, needs: ['createUserBasicUsage'], proves: 'getUsers lists users sorted by createdAt, verified on the returned timestamps.' }, async () => {
    const pubnub = world.server;
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
    assert.deepEqual(created, [...created].sort((a, b) => a - b), 'sorted by createdAt ascending');
  });

  // `filter` runs on eventually consistent storage, so the step polls with the same expression until Alice is
  // indexed, then runs the snippet once.
  step('getUsersFilterExample', { ...secured, needs: ['createUserBasicUsage'], timeout: 60_000, proves: 'getUsers with filter finds Alice once the eventually consistent index has caught up.' }, async () => {
    const pubnub = world.server;
    // `filter` is eventually consistent, so wait until the service indexed the user before running the sample.
    await eventually(async () => {
      assert.ok(ids(await api().getUsers({ filter: 'name LIKE "*Alice*"' })).includes(user()));
    }, { timeout: 45_000, label: 'filter index caught up with the new user' });
    // snippet.getUsersFilterExample
    // `filter` runs over properties declared with filtering mode `full` and is evaluated against
    // eventually consistent storage.
    const response = await pubnub.dataSync.getUsers({
      filter: 'name LIKE "*Alice*"',
    });
    console.log('getUsers (filter) response:', response.data);
    // snippet.end
    assert.ok(ids(response).includes(user()), 'the filter finds Alice');
  });

  // `filterFast` is strongly consistent, so no wait is needed right after the create.
  step('getUsersFilterFastExample', { ...secured, needs: ['createUserBasicUsage'], proves: 'getUsers with filterFast finds Alice at once.' }, async () => {
    const pubnub = world.server;
    // snippet.getUsersFilterFastExample
    // `filterFast` is evaluated against strongly consistent storage, so it matches an object you just
    // wrote.
    const response = await pubnub.dataSync.getUsers({
      filterFast: 'type == "shopper"',
    });
    console.log('getUsers (filterFast) response:', response.data);
    // snippet.end
    assert.ok(ids(response).includes(user()), 'filterFast sees the user right after the write');
  });

  // Cursor loop from the page. Console output is captured to prove the loop ran and listed Alice. Real multi-page
  // paging is covered by the check `datasyncCursorPaging`.
  step('getUsersCursorPagingExample', { ...secured, needs: ['createUserBasicUsage'], proves: 'The cursor paging loop for users runs and lists Alice.' }, async () => {
    const pubnub = world.server;
    await world.withConsole(async (logs) => {
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
      assert.ok(logs.lines.some((line) => line.startsWith('Page 1:')), 'the loop ran at least once');
      assert.ok(logs.lines.some((line) => line.includes(user())), 'a page lists Alice');
    });
  });

  // `setUser` with `ifMatchesEtag`. The docs show an example eTag (a registered placeholder), so the step stores
  // Alice's real eTag first. Afterwards it replays the old eTag to prove the guard rejects stale writes. Records a
  // docs bug: the page promises 412, the service answers 403.
  step('updateUserBasicUsage', { ...secured, needs: ['createUserBasicUsage'], proves: 'setUser with ifMatchesEtag replaces Alice and a stale eTag is rejected.' }, async () => {
    const pubnub = world.server;
    // The sample shows an example eTag. Use the real one, otherwise the guard (correctly) rejects the write.
    world.setPh('userEtag', (await api().getUser({ id: user() })).data.eTag);
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
    assert.notEqual(response.data.eTag, world.ph('userEtag'), 'the write produced a new eTag');
    await assert.rejects(
      () => api().setUser({ id: user(), data: { classVersion: 1, payload: { name: 'stale' } }, ifMatchesEtag: world.ph('userEtag') }),
      // The docs promise 412. The service answers 403 "Forbidden" from "Access Manager" (live finding).
      (error: unknown) => /\b(412|403)\b/.test(errorText(error)),
      'the old eTag is now stale',
    );
  });

  // JSON Patch style `updateUser`. Needs the previous step so the starting name is known.
  step('patchUserBasicUsage', { ...secured, needs: ['updateUserBasicUsage'], proves: 'updateUser applies a patch to the user name.' }, async () => {
    const pubnub = world.server;
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

  // ---- channels ----------------------------------------------------------------------------------------------

  // Creates the drop channel. Renamed from `createChannelBasicUsage` because that id is also used by another page
  // (ids are unique across the app).
  step('createDataSyncChannelBasicUsage', { ...secured, proves: 'createChannel creates the drop channel and echoes the payload.' }, async () => {
    const pubnub = world.server;
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
    assert.equal(response.data.id, channel());
    assert.deepEqual(response.data.payload, { name: 'Summer Sale', type: 'promotion' });
  });

  // Reads the channel back.
  step('getChannelBasicUsage', { ...secured, needs: ['createDataSyncChannelBasicUsage'], proves: 'getChannel reads the DataSync channel back by id.' }, async () => {
    const pubnub = world.server;
    // snippet.getChannelBasicUsage
    const response = await pubnub.dataSync.getChannel({ id: 'channel-summer-sale' });
    console.log('getChannel response:', response.data);
    // snippet.end
    assert.equal(response.data.id, channel());
    assert.equal(response.data.payload?.name, 'Summer Sale');
  });

  // Lists channels, checks the page envelope (`data` array and `meta.has_next`).
  step('getChannelsBasicUsage', { ...secured, needs: ['createDataSyncChannelBasicUsage'], proves: 'getChannels lists channels with the data array and meta.has_next envelope.' }, async () => {
    const pubnub = world.server;
    // snippet.getChannelsBasicUsage
    const response = await pubnub.dataSync.getChannels({ limit: 20 });
    console.log('getChannels response:', response.data);
    console.log('getChannels meta:', response.meta);
    // snippet.end
    assert.ok(Array.isArray(response.data));
    assert.equal(typeof response.meta?.has_next, 'boolean');
  });

  // Polls until the eventually consistent `filter` index contains the new channel, then runs the snippet.
  step('getChannelsFilterExample', { ...secured, needs: ['createDataSyncChannelBasicUsage'], timeout: 60_000, proves: 'getChannels with filter finds the new channel once the index has caught up.' }, async () => {
    const pubnub = world.server;
    await eventually(async () => {
      assert.ok(ids(await api().getChannels({ filter: 'name LIKE "*Sale*"' })).includes(channel()));
    }, { timeout: 45_000, label: 'filter index caught up with the new channel' });
    // snippet.getChannelsFilterExample
    const response = await pubnub.dataSync.getChannels({
      filter: 'name LIKE "*Sale*"',
    });
    console.log('getChannels (filter) response:', response.data);
    // snippet.end
    assert.ok(ids(response).includes(channel()));
  });

  // Strongly consistent filter, no wait.
  step('getChannelsFilterFastExample', { ...secured, needs: ['createDataSyncChannelBasicUsage'], proves: 'getChannels with filterFast finds the channel at once.' }, async () => {
    const pubnub = world.server;
    // snippet.getChannelsFilterFastExample
    const response = await pubnub.dataSync.getChannels({
      filterFast: 'type == "promotion"',
    });
    console.log('getChannels (filterFast) response:', response.data);
    // snippet.end
    assert.ok(ids(response).includes(channel()));
  });

  // Cursor loop with console capture, same pattern as for users.
  step('getChannelsCursorPagingExample', { ...secured, needs: ['createDataSyncChannelBasicUsage'], proves: 'The cursor paging loop for channels runs and lists the channel.' }, async () => {
    const pubnub = world.server;
    await world.withConsole(async (logs) => {
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
      assert.ok(logs.lines.some((line) => line.includes(channel())), 'a page lists the channel');
    });
  });

  // Full replace with `setChannel`.
  step('updateChannelBasicUsage', { ...secured, needs: ['createDataSyncChannelBasicUsage'], proves: 'setChannel replaces the channel payload.' }, async () => {
    const pubnub = world.server;
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

  // Patches one field and checks the other payload fields survive.
  step('patchChannelBasicUsage', { ...secured, needs: ['updateChannelBasicUsage'], proves: 'updateChannel patches one field and the other payload fields survive.' }, async () => {
    const pubnub = world.server;
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

  // ---- memberships -------------------------------------------------------------------------------------------

  // Creates Alice's membership with the fixed id that the later samples read, set, patch and remove.
  step('createMembershipBasicUsage', { ...secured, needs: ['createUserBasicUsage', 'createDataSyncChannelBasicUsage'], proves: 'createMembership links Alice to the channel with the fixed id that later steps use.' }, async () => {
    const pubnub = world.server;
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
    assert.equal(response.data.id, membership());
    assert.equal(response.data.userId, user());
    assert.equal(response.data.channelId, channel());
    assert.equal(response.data.relationshipClass, 'Membership');
    assert.deepEqual(response.data.payload, { role: 'viewer' });
  });

  // Reads the membership by its fixed id. Renamed from `getMembershipBasicUsage` (id clash with the App Context
  // page).
  step('getDataSyncMembershipBasicUsage', { ...secured, needs: ['createMembershipBasicUsage'], proves: 'getMembership reads the membership by its fixed id.' }, async () => {
    const pubnub = world.server;
    // snippet.getDataSyncMembershipBasicUsage
    const response = await pubnub.dataSync.getMembership({
      id: 'membership-alice-summer-sale',
    });
    console.log('getMembership response:', response.data);
    // snippet.end
    assert.equal(response.data.id, membership());
    assert.equal(response.data.payload?.role, 'viewer');
  });

  // Lists Alice's memberships. Expects exactly the one from the fixture.
  step('getMembershipsBasicUsage', { ...secured, needs: ['createMembershipBasicUsage'], proves: 'getMemberships lists exactly the membership of Alice.' }, async () => {
    const pubnub = world.server;
    // snippet.getMembershipsBasicUsage
    const response = await pubnub.dataSync.getMemberships({
      userId: 'user-alice',
      limit: 20,
    });
    console.log('getMemberships response:', response.data);
    console.log('getMemberships meta:', response.meta);
    // snippet.end
    assert.deepEqual(ids(response), [membership()]);
    assert.equal(response.data[0].channelId, channel());
  });

  // Same list from the channel side, expects Alice as the only member.
  step('getMembershipsByChannelIdExample', { ...secured, needs: ['createMembershipBasicUsage'], proves: 'getMemberships by channel id lists Alice as the only member.' }, async () => {
    const pubnub = world.server;
    // snippet.getMembershipsByChannelIdExample
    // Pass `channelId` instead of `userId` to list the members of a channel rather than a user's
    // memberships.
    const response = await pubnub.dataSync.getMemberships({
      channelId: 'channel-summer-sale',
      limit: 20,
    });
    console.log('getMemberships (channelId) response:', response.data);
    // snippet.end
    assert.deepEqual(response.data.map((m) => m.userId), [user()]);
  });

  // ---- membership filters --------------------------------------------------------------------------------------
  //
  // The Global Membership class declares no payload properties and cannot be extended, so a membership `payload`
  // is never indexed and filters cannot reach it. What a membership offers are the built-in fields: `id`,
  // `createdAt`, `updatedAt`, `status`, `createdBy` and `modifiedBy`. Of these `status` is the one an application
  // sets itself (a free-form lifecycle string), which makes it the natural field to filter memberships on. Both
  // filter tiers accept the built-in fields without any class declaration (probed live: both answer on a fresh write).
  //
  // Both samples need two memberships of Alice, one that matches and one that does not. The memberships created by
  // `createMembershipBasicUsage` carry no `status`. The helper below adds a second membership of Alice, on a second
  // channel, with `status: 'archived'`. The two samples then have to return exactly that one and leave the
  // original membership out.

  /** Creates the channel `channel-winter-sale` and Alice's archived membership on it. Returns the cleanup. */
  async function seedArchivedMembership(): Promise<{ id: string; cleanup: () => Promise<void> }> {
    const channelId = world.n('channel-winter-sale');
    const id = world.n('membership-alice-winter-sale');
    await api().createChannel({ id: channelId, data: { classVersion: 1, payload: { name: 'Winter Sale 2026' } } });
    await api().createMembership({ id, userId: user(), channelId, data: { classVersion: 1, status: 'archived' } });
    // Removing the channel also removes the memberships that point at it.
    return { id, cleanup: () => api().removeChannel({ id: channelId }).then(() => undefined) };
  }

  // Seeds a second, archived membership (see the section comment) so the filter has something to exclude, waits for
  // the eventually consistent index, then always cleans the seed in `finally`.
  step('getMembershipsFilterExample', { ...secured, needs: ['createMembershipBasicUsage'], timeout: 60_000, proves: 'getMemberships with filter excludes a seeded archived membership once the index has caught up.' }, async () => {
    const pubnub = world.server;
    const seeded = await seedArchivedMembership();
    try {
      // `filter` is eventually consistent, so wait until the service indexed the new membership.
      await eventually(async () => {
        assert.ok(ids(await api().getMemberships({ userId: user(), filter: 'status LIKE "arch*"' })).includes(seeded.id));
      }, { timeout: 45_000, label: 'filter index caught up with the new membership' });
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
      assert.deepEqual(ids(response), [seeded.id], 'only the archived membership matches');
      assert.ok(!ids(response).includes(membership()), 'the membership without a status is filtered out');
      const unfiltered = await api().getMemberships({ userId: user() });
      assert.ok(ids(unfiltered).length >= 2 && ids(unfiltered).includes(membership()), 'without the filter both memberships are listed');
    } finally {
      await seeded.cleanup();
    }
  });

  // Same seed, strongly consistent filter, so no wait.
  step('getMembershipsFilterFastExample', { ...secured, needs: ['createMembershipBasicUsage'], proves: 'getMemberships with filterFast excludes the seeded archived membership at once.' }, async () => {
    const pubnub = world.server;
    const seeded = await seedArchivedMembership();
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
      assert.deepEqual(ids(response), [seeded.id], 'only the archived membership matches, right after the write');
      assert.equal(response.data[0].status, 'archived');
      assert.ok(!ids(response).includes(membership()), 'the membership without a status is filtered out');
    } finally {
      await seeded.cleanup();
    }
  });

  // Documents the limit the two samples above work around: a field of the membership `payload` is not filterable.
  check('datasyncMembershipFilterRejected', { ...secured, proves: 'Filtering on a field of the membership payload is refused, which is the limit the filter samples work around.' }, async () => {
    for (const parameters of [{ filter: 'role LIKE "*mod*"' }, { filterFast: 'role == "viewer"' }]) {
      await assert.rejects(
        () => api().getMemberships({ userId: user(), ...parameters }),
        (error: unknown) => /400/.test(errorText(error)) && /DS-1001/.test(errorText(error)) && /Unknown field: role/.test(errorText(error)),
        `the service rejects ${JSON.stringify(parameters)}`,
      );
    }
  });

  // Cursor loop over Alice's memberships with console capture.
  step('getMembershipsCursorPagingExample', { ...secured, needs: ['createMembershipBasicUsage'], proves: 'The cursor paging loop for memberships runs and lists the membership.' }, async () => {
    const pubnub = world.server;
    await world.withConsole(async (logs) => {
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
      assert.ok(logs.lines.some((line) => line.includes(membership())), 'a page lists the membership');
    });
  });

  // Full replace of the membership payload.
  step('updateMembershipBasicUsage', { ...secured, needs: ['createMembershipBasicUsage'], proves: 'setMembership replaces the membership payload.' }, async () => {
    const pubnub = world.server;
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

  // Patch of one payload field. `needs` the update so the starting value is known.
  step('patchMembershipBasicUsage', { ...secured, needs: ['updateMembershipBasicUsage'], proves: 'updateMembership patches one payload field.' }, async () => {
    const pubnub = world.server;
    // snippet.patchMembershipBasicUsage
    const response = await pubnub.dataSync.updateMembership({
      id: 'membership-alice-summer-sale',
      replace: { '/payload/role': 'moderator' },
    });
    console.log('updateMembership response:', response.data);
    // snippet.end
    assert.equal(response.data.payload?.role, 'moderator');
  });

  // ---- entities (class `product`) ----------------------------------------------------------------------------

  const entity = { ...secured, needs: ['datasyncClassProduct', 'createEntityBasicUsage'] };

  // Creates the `product` entity, the object most later steps use. Skips with the class precondition.
  step('createEntityBasicUsage', { ...secured, needs: ['datasyncClassProduct'], proves: 'createEntity creates the product entity that later steps use.' }, async () => {
    const pubnub = world.server;
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
    assert.equal(response.data.id, product());
    assert.equal(response.data.entityClass, 'product');
    assert.deepEqual(response.data.payload, { name: 'Retro Sneaker', price: 89.99, stock: 12 });
  });

  // Reads the product by id.
  step('getEntityBasicUsage', { ...entity, proves: 'getEntity reads the product by id.' }, async () => {
    const pubnub = world.server;
    // snippet.getEntityBasicUsage
    const response = await pubnub.dataSync.getEntity({ id: 'product-sneaker-42' });
    console.log('getEntity response:', response.data);
    // snippet.end
    assert.equal(response.data.id, product());
    assert.equal(response.data.payload?.price, 89.99);
  });

  // Lists products sorted by price descending, verified on the returned prices.
  step('getEntitiesBasicUsage', { ...entity, proves: 'getEntities lists products sorted by price descending, verified on the returned prices.' }, async () => {
    const pubnub = world.server;
    // snippet.getEntitiesBasicUsage
    const response = await pubnub.dataSync.getEntities({
      class: 'product',
      sort: { price: 'desc' },
      limit: 20,
    });
    console.log('getEntities response:', response.data);
    console.log('getEntities meta:', response.meta);
    // snippet.end
    assert.ok(ids(response).includes(product()));
    const prices = response.data.map((e) => Number(e.payload?.price));
    assert.deepEqual(prices, [...prices].sort((a, b) => b - a), 'sorted by price descending');
  });

  // Polls until the eventually consistent `filter` finds the product, then runs the snippet.
  step('getEntitiesFilterExample', { ...entity, timeout: 60_000, proves: 'getEntities with filter finds the product once the index has caught up.' }, async () => {
    const pubnub = world.server;
    await eventually(async () => {
      const found = await api().getEntities({ class: 'product', filter: 'name LIKE "*sneaker*" && !(status == "discontinued")' });
      assert.ok(ids(found).includes(product()));
    }, { timeout: 45_000, label: 'filter index caught up with the new product' });
    // snippet.getEntitiesFilterExample
    // Reference a declared property by its `name` (not its `path`), and combine conditions with `&&`
    // and `||`.
    const response = await pubnub.dataSync.getEntities({
      class: 'product',
      filter: 'name LIKE "*sneaker*" && !(status == "discontinued")',
    });
    console.log('getEntities (filter) response:', response.data);
    // snippet.end
    assert.ok(ids(response).includes(product()));
  });

  // Strongly consistent filter on declared properties, no wait.
  step('getEntitiesFilterFastExample', { ...entity, proves: 'getEntities with filterFast finds the product at once.' }, async () => {
    const pubnub = world.server;
    // snippet.getEntitiesFilterFastExample
    const response = await pubnub.dataSync.getEntities({
      class: 'product',
      filterFast: 'price < 100 && stock > 0',
    });
    console.log('getEntities (filterFast) response:', response.data);
    // snippet.end
    assert.ok(ids(response).includes(product()));
  });

  // Cursor loop over products with console capture.
  step('getEntitiesCursorPagingExample', { ...entity, proves: 'The cursor paging loop for products runs and lists the product.' }, async () => {
    const pubnub = world.server;
    await world.withConsole(async (logs) => {
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
      assert.ok(logs.lines.some((line) => line.includes(product())), 'a page lists the product');
    });
  });

  // Full replace. Sets the price and stock that later patch steps assert against.
  step('updateEntityBasicUsage', { ...entity, proves: 'setEntity replaces the product and sets the price and stock later steps rely on.' }, async () => {
    const pubnub = world.server;
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

  // Patch of the price only, stock must stay 8.
  step('patchEntityBasicUsage', { ...secured, needs: ['updateEntityBasicUsage'], proves: 'updateEntity patches the price and the stock stays the same.' }, async () => {
    const pubnub = world.server;
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

  // Mixes all six JSON Patch operations in one call. The patch only applies to a payload that has the touched
  // fields, so the step first rewrites the entity with them and stores its eTag in the `entityEtag` placeholder.
  // After the snippet it replays the old eTag to prove the guard rejects it (403 on the service, 412 on the page).
  step('updateEntityCombinedPatchExample', { ...secured, needs: ['patchEntityBasicUsage'], proves: 'One patch call with all six JSON Patch operations applies, and a stale eTag is rejected.' }, async () => {
    const pubnub = world.server;
    // The patch needs a payload it can apply to: stock 8 for `test`, an existing `tags` array, `legacy.field`
    // to remove and `legacyName` to move.
    const seeded = await api().setEntity({
      id: product(),
      data: {
        classVersion: 1,
        payload: { name: 'Retro Sneaker', price: 79.99, stock: 8, tags: [], legacy: { field: 'old' }, legacyName: 'Retro' },
      },
    });
    world.setPh('entityEtag', seeded.data.eTag);
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
      () => api().updateEntity({ id: product(), replace: { '/payload/price': 70 }, ifMatchesEtag: world.ph('entityEtag') }),
      (error: unknown) => /\b(412|403)\b/.test(errorText(error)),
      'the old eTag is rejected after the patch',
    );
  });

  // ---- first-run probes that need no events ------------------------------------------------------------------
  //
  // These are harness checks (no snippet markers). They settle questions that the event steps depend on, so a failure
  // of an event step can be told apart from a wrong assumption about ids or timing.

  /**
   * The pattern samples use entity ids with a dot (`product.676`) and subscribe to `product.*`. The wildcard needs a
   * dot in the id, so first prove the service stores such ids, returns them verbatim, and filters on them.
   */
  check('datasyncDotIds', { ...secured, needs: ['datasyncClassProduct'], proves: 'Entity ids with a dot are stored verbatim, returned verbatim and found by filterFast.' }, async () => {
    const id = world.n('product.676');
    try {
      const created = await api().createEntity({ id, class: 'product', data: { classVersion: 1, payload: { name: 'Dot Sneaker', price: 10, stock: 1 } } });
      assert.equal(created.data.id, id, 'the service keeps a dotted id verbatim');
      assert.equal((await api().getEntity({ id })).data.id, id);
      // `id` is a built-in filterable field, so a strongly consistent filter finds the dotted id right away.
      const found = await api().getEntities({ class: 'product', filterFast: `id == "${id}"` });
      assert.deepEqual(ids(found), [id]);
    } finally {
      await api().removeEntity({ id }).catch(() => undefined);
    }
  });

  /**
   * `addDataSyncListener` deletes the observed product and creates it again with the same id so the later steps can
   * use it. Find out whether the service accepts the create straight after the delete, so the step does not need a
   * retry loop that would hide a real problem. A failure here prints what the service said.
   */
  check('datasyncDeleteRecreate', { ...secured, needs: ['datasyncClassProduct'], proves: 'An entity can be created again with the same id right after it was deleted.' }, async () => {
    // (Used by addDataSyncListener, which recreates the product it deletes without a retry loop.)
    const id = world.n('product.678');
    const body = { classVersion: 1, payload: { name: 'Recreate Sneaker', price: 12, stock: 2 } };
    try {
      await api().createEntity({ id, class: 'product', data: body });
      await api().removeEntity({ id });
      const again = await api().createEntity({ id, class: 'product', data: body });
      assert.equal(again.data.id, id, 'the id can be reused straight after the delete');
    } finally {
      await api().removeEntity({ id }).catch(() => undefined);
    }
  });

  /**
   * The four fragment blocks of the page (filter and sort options, patch forms) are not snippets. This runs every
   * line of fixtures/datasync-fragments.ts against the service so none of them is only decoration.
   *
   * Filters run against class `product`. `filterFast` is strongly consistent and runs at once. `filter` runs on
   * eventually consistent storage, so each of those is polled until the service accepts it. A 400 is not retried:
   * it means the expression is invalid, which is what this check exists to find.
   */
  check('datasyncFragments', { ...secured, needs: ['datasyncClassProduct'], timeout: 120_000, proves: 'Every filter, sort and patch line shown in the DataSync page fragments is accepted or refused by the service as documented.' }, async () => {
    const accepted = async (query: Pick<PubNub.DataSync.GetEntitiesParameters, 'filter' | 'filterFast' | 'sort'>): Promise<void> => {
      await api().getEntities({ ...query, class: 'product', limit: 5 });
    };
    for (const fragment of filterFragments) {
      await accepted(fragment).catch((error) => {
        throw new Error(`filter fragment ${JSON.stringify(fragment)} was rejected: ${errorText(error)}`);
      });
    }
    // Two sort fragments order by `type`, a property the sample class `product` does not declare (the docs example
    // implies a class that has both `type` and `price`). The service refuses a sort field that no property declares,
    // with 403 from the Access Manager service (the same answer as for an undeclared projection). That is a docs
    // example written for a different class, not a syntax error, so the check expects the refusal and keeps the
    // finding visible. Every other sort fragment must be accepted.
    const needsUndeclaredType = (fragment: (typeof sortFragments)[number]): boolean => JSON.stringify(fragment.sort).includes('type');
    for (const fragment of sortFragments) {
      if (needsUndeclaredType(fragment)) {
        await assert.rejects(accepted(fragment), (error: unknown) => /\b(400|403)\b/.test(errorText(error)), `undeclared sort field ${JSON.stringify(fragment)}`);
      } else {
        await accepted(fragment).catch((error) => {
          throw new Error(`sort fragment ${JSON.stringify(fragment)} was rejected: ${errorText(error)}`);
        });
      }
    }

    // Patch forms: apply each line to a scratch entity that holds every field the lines touch.
    const id = world.n('product.679');
    try {
      await api().createEntity({
        id,
        class: 'product',
        data: {
          classVersion: 1,
          status: 'active',
          payload: { name: 'Patch Sneaker', price: 99, stock: 3, tags: [], tempFlag: true, legacy: { field: 'old' }, legacyName: 'Retro', displayName: 'Retro' },
        },
      });
      for (const fragment of patchFragments) {
        const response = await api().updateEntity({ id, ...fragment }).catch((error) => {
          throw new Error(`patch fragment ${JSON.stringify(fragment)} was rejected: ${errorText(error)}`);
        });
        assert.equal(response.status, 200, `patch fragment ${JSON.stringify(fragment)}`);
      }
      // Spot check the result of the chain: add, replace, remove, move and copy all took effect.
      const payload = (await api().getEntity({ id })).data.payload as Record<string, unknown>;
      assert.deepEqual(payload.tags, ['featured']);
      assert.equal(payload.price, 79.99);
      assert.ok(!('tempFlag' in payload));
      assert.ok(!('legacyName' in payload));
      assert.equal(payload.previousName, 'Retro');
    } finally {
      await api().removeEntity({ id }).catch(() => undefined);
    }
  });

  // ---- real-time events (subscribe page samples and the datasync page sample) ---------------------------------

  const eventStep = { ...secured, needs: ['datasyncClassProduct', 'createEntityBasicUsage', 'datasyncEvents'], timeout: 60_000 };
  const logged = (lines: string[], text: string): boolean => lines.some((line) => line.includes(text));

  // Subscribe-page sample. `connected` is registered before the snippet subscribes because statuses are not
  // replayed. The event check happens only after `skipUnlessEvents`, so with event rules off the step still proves
  // the subscription connects.
  step('dataSyncEntitySubscribeExample', { ...eventStep, proves: 'The entity subscribe sample connects, and a changed entity arrives as an event when event rules are on.' }, async () => {
    // The probe result is cached, so this decides the skip up front but the skip itself is thrown only after the
    // subscription connected (below).
    const off = await offKinds('entity');
    const pubnub = world.server;
    await world.withConsole(async (logs) => {
      const ready = connected(pubnub, { channels: [product()] });
      // snippet.dataSyncEntitySubscribeExample
      // DataSync objects publish create/update/delete events over a `dataSync` listener. Create a
      // DataSync SDK entity for the object, subscribe to it, and attach the listener.
      const productSubscription = pubnub.dataSyncEntity('product-sneaker-42').subscription();
      productSubscription.onDataSync = (event) => console.log(event.message.event, event.message.data);
      productSubscription.subscribe();
      // snippet.end
      await ready;
      try {
        skipUnlessEvents(off);
        await api().updateEntity({ id: product(), replace: { '/payload/stock': 7 } });
        await eventually(() => assert.ok(logged(logs.lines, 'update') && logged(logs.lines, product())), { label: 'update event logged' });
      } finally {
        productSubscription.unsubscribe();
      }
    });
  });

  // Subscribe-page sample that observes one entity. Same connect-first, skip-if-no-events structure. Asserts the new
  // stock arrives in the event payload.
  step('subscribeToDataSyncEntity', { ...eventStep, proves: 'Subscribing to one entity delivers the new stock in the event payload when event rules are on.' }, async () => {
    const off = await offKinds('entity');
    const pubnub = world.server;
    await world.withConsole(async (logs) => {
      const ready = connected(pubnub, { channels: [product()] });
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
        skipUnlessEvents(off);
        await api().updateEntity({ id: product(), replace: { '/payload/stock': 6 } });
        await eventually(() => assert.ok(logs.lines.some((l) => l.startsWith('update') && l.includes('"stock":6'))), { label: 'update event with the new stock' });
      } finally {
        entitySubscription.unsubscribe();
      }
    });
  });

  // Wildcard subscription on the `admin` projection channel (`__admin__<id>`). Creates a dotted id that matches the
  // pattern and waits for its event. Cleans up the extra entity in `finally`.
  step('observeDataSyncEntitiesByPattern', { ...eventStep, proves: 'A wildcard subscription on the admin projection channel receives the event for a newly created dotted id.' }, async () => {
    const off = await offKinds('entity');
    const pubnub = world.server;
    const member = world.n('product.676');
    await world.withConsole(async (logs) => {
      const ready = connected(pubnub, { channels: [`__admin__${world.n('product.*')}`] });
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
        skipUnlessEvents(off);
        await api().createEntity({ id: member, class: 'product', data: { classVersion: 1, payload: { name: 'Pattern Sneaker', price: 10, stock: 1 } } });
        await eventually(() => assert.ok(logged(logs.lines, `changed: ${member}`)), { label: 'event for an entity that matches the pattern' });
      } finally {
        patternSubscription.unsubscribe();
        await api().removeEntity({ id: member }).catch(() => undefined);
      }
    });
  });

  // Combines a user and an entity subscription into one set. Needs events on for both kinds. Triggers one update of
  // each and expects both on the one listener.
  step('combineDataSyncSubscriptions', { ...eventStep, proves: 'A user and an entity subscription combined in one set both deliver events to one listener.' }, async () => {
    const off = await offKinds('entity', 'user');
    const pubnub = world.server;
    const member = world.n('product.677');
    await world.withConsole(async (logs) => {
      const ready = connected(pubnub, { channels: [world.n('product.*'), user()] });
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
        skipUnlessEvents(off);
        await api().updateUser({ id: user(), replace: { '/payload/name': 'Alice C.' } });
        await api().createEntity({ id: member, class: 'product', data: { classVersion: 1, payload: { name: 'Set Sneaker', price: 11, stock: 1 } } });
        await eventually(() => assert.ok(logs.lines.includes('user update') && logs.lines.includes('entity create')), { label: 'one set receives user and entity events' });
      } finally {
        dataSyncSubscriptionSet.unsubscribe();
        await api().removeEntity({ id: member }).catch(() => undefined);
      }
    });
  });

  // Exercises all three branches of the sample's `switch`: update, then delete, then create. Deleting and recreating
  // the product with the same id is safe because the check `datasyncDeleteRecreate` proved the service allows it,
  // and the product is back for the steps that follow.
  step('addDataSyncListener', { ...eventStep, proves: 'The listener switch sees update, delete and create events in that order for one product.' }, async () => {
    const off = await offKinds('entity');
    const pubnub = world.server;
    await world.withConsole(async (logs) => {
      const ready = connected(pubnub, { channels: [product()] });
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
        skipUnlessEvents(off);
        await api().updateEntity({ id: product(), replace: { '/payload/price': 69.5 } });
        await eventually(() => assert.ok(logged(logs.lines, 'New price: 69.5')), { label: 'update branch' });
        // Delete and recreate, which covers the other two branches and leaves the product for the later steps.
        await api().removeEntity({ id: product() });
        await eventually(() => assert.ok(logged(logs.lines, `Product deleted: ${product()}`)), { label: 'delete branch' });
        // The check datasyncDeleteRecreate proved that the service accepts the same id straight after a delete, so no retry
        // loop here: a failure should show up as a failure.
        await api().createEntity({ id: product(), class: 'product', data: { classVersion: 1, payload: { name: 'Retro Sneaker', price: 74.99, stock: 8 } } });
        await eventually(() => assert.ok(logged(logs.lines, `Product created: ${product()}`)), { label: 'create branch' });
      } finally {
        dataSyncListenerSubscription.unsubscribe();
      }
    });
  });

  // The projection sample of the "DataSync SDK entities" section of the subscribe page. It only builds two
  // subscriptions, so it needs no event rules. The harness then subscribes both and checks the two data channels.
  step('dataSyncProjectionSubscriptions', { ...secured, proves: 'Two projection subscriptions connect, and unsubscribing one leaves the other subscribed.' }, async () => {
    const pubnub = world.server;
    // snippet.dataSyncProjectionSubscriptions
    const user = pubnub.dataSyncUser('user-alice')

    const base = user.subscription()                        // observes `user-alice`
    const admin = user.subscription({ projection: 'admin' }) // observes `__admin__user-alice`
    // snippet.end
    // The docs promise two independent data channels: the object itself and `__<projection>__<id>`.
    const ready = connected(pubnub, { channels: [world.n('user-alice'), `__admin__${world.n('user-alice')}`] });
    base.subscribe();
    admin.subscribe();
    await ready;
    // "Unsubscribing one leaves the other subscribed": drop the base one and check the admin channel is still active.
    base.unsubscribe();
    assert.ok(pubnub.getSubscribedChannels().includes(`__admin__${world.n('user-alice')}`), 'the admin projection stays subscribed');
    assert.ok(!pubnub.getSubscribedChannels().includes(world.n('user-alice')), 'the base channel is gone');
    admin.unsubscribe();
  });

  // ---- relationships (class `ProductOwner`) ------------------------------------------------------------------

  const link = { ...secured, needs: ['datasyncClassProductOwner', 'createRelationshipBasicUsage'] };

  // Fixture, no snippet. Creates Bob as a user, the owning end of the `ProductOwner` link. Bob is a DataSync user,
  // not an Access Manager token holder.
  check('datasyncSellerFixture', { ...secured, needs: ['datasyncClassProductOwner', 'createEntityBasicUsage'], proves: 'Fixture: Bob exists as a DataSync user, the owning end of the ProductOwner link.' }, async () => {
    const created = await api().createUser({ id: seller(), data: { classVersion: 1, payload: { name: 'Bob', type: 'seller' } } });
    assert.equal(created.data.id, seller());
  });

  // Creates the `ProductOwner` link from the seller to the product with the fixed id that the later samples use.
  // `needs` the seller fixture because both ends must exist.
  step('createRelationshipBasicUsage', { ...secured, needs: ['datasyncSellerFixture'], proves: 'createRelationship links the seller to the product with the fixed id that later steps use.' }, async () => {
    const pubnub = world.server;
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
    assert.equal(response.data.id, relationship());
    assert.equal(response.data.relationshipClass, 'ProductOwner');
    assert.equal(response.data.entityAId, seller());
    assert.equal(response.data.entityBId, product());
    assert.deepEqual(response.data.payload, { since: '2026-07-13' });
  });

  // Reads the link by its fixed id.
  step('getRelationshipBasicUsage', { ...link, proves: 'getRelationship reads the link by its fixed id.' }, async () => {
    const pubnub = world.server;
    // snippet.getRelationshipBasicUsage
    const response = await pubnub.dataSync.getRelationship({
      id: 'rel-bob-owns-sneaker-42',
    });
    console.log('getRelationship response:', response.data);
    // snippet.end
    assert.equal(response.data.id, relationship());
    assert.equal(response.data.entityBId, product());
  });

  // Lists links from the seller side, expects exactly the fixture.
  step('getRelationshipsBasicUsage', { ...link, proves: 'getRelationships lists exactly the fixture link from the seller side.' }, async () => {
    const pubnub = world.server;
    // snippet.getRelationshipsBasicUsage
    const response = await pubnub.dataSync.getRelationships({
      class: 'ProductOwner',
      entityAId: 'seller-bob',
      limit: 20,
    });
    console.log('getRelationships response:', response.data);
    console.log('getRelationships meta:', response.meta);
    // snippet.end
    assert.deepEqual(ids(response), [relationship()]);
  });

  // Same list from the product side.
  step('getRelationshipsByEntityBIdExample', { ...link, proves: 'getRelationships by entity B id lists the same link from the product side.' }, async () => {
    const pubnub = world.server;
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
    assert.deepEqual(ids(response), [relationship()]);
  });

  // Full replace that adds a `tier` to the payload, which the filter steps then query.
  step('updateRelationshipBasicUsage', { ...link, proves: 'setRelationship replaces the link and adds a tier to its payload.' }, async () => {
    const pubnub = world.server;
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

  // Negated eventually consistent filter. Polls until the link is indexed. Tier is `gold` at this point, so the link
  // must be kept.
  step('getRelationshipsFilterExample', { ...secured, needs: ['updateRelationshipBasicUsage'], timeout: 60_000, proves: 'A negated filter keeps the gold link once the index has caught up.' }, async () => {
    const pubnub = world.server;
    await eventually(async () => {
      const found = await api().getRelationships({ class: 'ProductOwner', filter: '!(tier == "platinum")' });
      assert.ok(ids(found).includes(relationship()));
    }, { timeout: 45_000, label: 'filter index caught up with the relationship' });
    // snippet.getRelationshipsFilterExample
    const response = await pubnub.dataSync.getRelationships({
      class: 'ProductOwner',
      filter: '!(tier == "platinum")',
    });
    console.log('getRelationships (filter) response:', response.data);
    // snippet.end
    assert.ok(ids(response).includes(relationship()), 'tier is gold, so the negated filter keeps it');
  });

  // Strongly consistent filter on `tier`, no wait.
  step('getRelationshipsFilterFastExample', { ...secured, needs: ['updateRelationshipBasicUsage'], proves: 'filterFast on tier finds the link at once.' }, async () => {
    const pubnub = world.server;
    // snippet.getRelationshipsFilterFastExample
    const response = await pubnub.dataSync.getRelationships({
      class: 'ProductOwner',
      filterFast: 'tier == "gold"',
    });
    console.log('getRelationships (filterFast) response:', response.data);
    // snippet.end
    assert.ok(ids(response).includes(relationship()));
  });

  // Cursor loop over the seller's links with console capture.
  step('getRelationshipsCursorPagingExample', { ...secured, needs: ['updateRelationshipBasicUsage'], proves: 'The cursor paging loop for relationships runs and lists the link.' }, async () => {
    const pubnub = world.server;
    await world.withConsole(async (logs) => {
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
      assert.ok(logs.lines.some((line) => line.includes(relationship())), 'a page lists the relationship');
    });
  });

  // Patch of the tier. Runs after the filter steps, which rely on tier `gold`.
  step('patchRelationshipBasicUsage', { ...secured, needs: ['updateRelationshipBasicUsage'], proves: 'updateRelationship patches the tier of the link.' }, async () => {
    const pubnub = world.server;
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

  // ---- cursor paging, harness side ----------------------------------------------------------------------------

  // Harness side of paging: pages by one so `next_cursor`, `has_next` and no-duplicates are really exercised, which
  // the page-size-20 samples never do.
  check('datasyncCursorPaging', { ...secured, needs: ['createUserBasicUsage', 'createDataSyncChannelBasicUsage'], proves: 'Paging one item at a time returns next_cursor and has_next correctly and never repeats an item.' }, async () => {
    // The samples ask for 20 per page and the keyset holds a handful of objects, so they never leave page one.
    // Page by one over the two objects of this run to prove `next_cursor` and `has_next` work as described.
    const seen: string[] = [];
    let cursor: string | undefined;
    let pages = 0;
    for (;;) {
      const response = await api().getChannels({ filterFast: 'type == "promotion"', limit: 1, cursor });
      pages += 1;
      seen.push(...ids(response));
      cursor = response.meta?.next_cursor ?? undefined;
      if (!response.meta?.has_next) break;
      assert.ok(cursor, 'has_next true comes with a next_cursor');
      assert.ok(pages < 50, 'paging terminates');
    }
    assert.ok(seen.includes(channel()), 'paging by one still reaches the channel');
    assert.equal(new Set(seen).size, seen.length, 'no object appears twice');
  });

  // ---- removal, last --------------------------------------------------------------------------------------------

  // Removal runs last and in dependency order (link, membership, entity, channel, user), so earlier steps can rely
  // on the fixtures. Each step proves the 404 afterwards.
  step('removeRelationshipBasicUsage', { ...secured, needs: ['patchRelationshipBasicUsage'], proves: 'removeRelationship deletes the link and a read afterwards answers 404.' }, async () => {
    const pubnub = world.server;
    // snippet.removeRelationshipBasicUsage
    const response = await pubnub.dataSync.removeRelationship({
      id: 'rel-bob-owns-sneaker-42',
    });
    console.log('removeRelationship response status:', response.status);
    // snippet.end
    assert.ok(response.status >= 200 && response.status < 300);
    await assert.rejects(() => api().getRelationship({ id: relationship() }), (error: unknown) => /404/.test(errorText(error)));
  });

  // Removes the membership, then proves it answers 404.
  step('removeMembershipBasicUsage', { ...secured, needs: ['patchMembershipBasicUsage'], proves: 'removeMembership deletes the membership and a read afterwards answers 404.' }, async () => {
    const pubnub = world.server;
    // snippet.removeMembershipBasicUsage
    const response = await pubnub.dataSync.removeMembership({
      id: 'membership-alice-summer-sale',
    });
    console.log('removeMembership response status:', response.status);
    // snippet.end
    assert.ok(response.status >= 200 && response.status < 300);
    await assert.rejects(() => api().getMembership({ id: membership() }), (error: unknown) => /404/.test(errorText(error)));
  });

  // Removes the product (also removes its links), then proves 404.
  step('removeEntityBasicUsage', { ...secured, needs: ['datasyncClassProduct', 'createEntityBasicUsage'], proves: 'removeEntity deletes the product and a read afterwards answers 404.' }, async () => {
    const pubnub = world.server;
    // snippet.removeEntityBasicUsage
    const response = await pubnub.dataSync.removeEntity({ id: 'product-sneaker-42' });
    console.log('removeEntity response status:', response.status);
    // snippet.end
    assert.ok(response.status >= 200 && response.status < 300);
    await assert.rejects(() => api().getEntity({ id: product() }), (error: unknown) => /404/.test(errorText(error)));
  });

  // Removes the channel, then proves 404.
  step('removeChannelBasicUsage', { ...secured, needs: ['createDataSyncChannelBasicUsage'], proves: 'removeChannel deletes the DataSync channel and a read afterwards answers 404.' }, async () => {
    const pubnub = world.server;
    // snippet.removeChannelBasicUsage
    const response = await pubnub.dataSync.removeChannel({ id: 'channel-summer-sale' });
    console.log('removeChannel response status:', response.status);
    // snippet.end
    assert.ok(response.status >= 200 && response.status < 300);
    await assert.rejects(() => api().getChannel({ id: channel() }), (error: unknown) => /404/.test(errorText(error)));
  });

  // Removes Alice (the janitor also sweeps by run suffix), then proves 404.
  step('removeUserBasicUsage', { ...secured, needs: ['createUserBasicUsage'], proves: 'removeUser deletes Alice and a read afterwards answers 404.' }, async () => {
    const pubnub = world.server;
    // snippet.removeUserBasicUsage
    const response = await pubnub.dataSync.removeUser({ id: 'user-alice' });
    console.log('removeUser response status:', response.status);
    // snippet.end
    assert.ok(response.status >= 200 && response.status < 300);
    await assert.rejects(() => api().getUser({ id: user() }), (error: unknown) => /404/.test(errorText(error)));
  });

  // Removes the one fixture no sample removes (Bob).
  check('datasyncTeardown', { ...secured, proves: 'Teardown removes the one fixture no sample removes (Bob).' }, async () => {
    // Fixtures that no sample removes. The janitor also sweeps by run suffix, this keeps the keyset tidy on success.
    await api().removeUser({ id: seller() }).catch(() => undefined);
  });
});
