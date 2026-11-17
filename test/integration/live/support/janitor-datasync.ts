/**
 * DataSync part of the janitor (called from janitor.ts for the datasync role). Removes only the object ids listed under
 * `dataSync` in resources.ts, in dependency order: relationships and memberships first, then entities, users and channels.
 * It never touches a DataSync class and never lists a class to delete what it finds. The only listings are the memberships and
 * relationships of a LISTED user, channel or entity, and one is removed only when both sides are listed.
 */
import type PubNub from 'pubnub';
import { CONCURRENCY, Ledger, MAX_PAGES, pool, retry, statusCode } from './janitor-util';
import type { DataSyncResources } from './resources';

interface Page<T> {
  data: T[];
  meta?: { has_next?: boolean; next_cursor?: string | null };
}

async function allPages<T>(fetch: (cursor?: string) => Promise<Page<T>>): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await retry(() => fetch(cursor));
    out.push(...response.data);
    cursor = response.meta?.next_cursor ?? undefined;
    if (!response.meta?.has_next || !cursor) break;
  }
  return out;
}

/** DS-0100 is the service code of an unknown class: a keyset without the `ProductOwner` class has no relationship to clean. */
function missingClass(error: unknown): boolean {
  const status = (error as { status?: { statusCode?: number; errorData?: unknown } } | undefined)?.status;
  return status?.statusCode === 404 && /DS-0100/.test(JSON.stringify(status.errorData ?? {}));
}

export async function cleanDataSync(client: PubNub, list: Partial<DataSyncResources>, ledger: Ledger): Promise<void> {
  const ds = client.dataSync;
  const users = list.users ?? [];
  const channels = list.channels ?? [];
  const entities = list.entities ?? [];
  const userSet = new Set(users);
  const channelSet = new Set(channels);
  const entitySet = new Set(entities);

  /** Gets the object first, so that an absent one is not reported as removed. A 404 means absent. */
  const remove = async (
    kind: string,
    id: string,
    get: () => Promise<unknown>,
    del: () => Promise<unknown>,
  ): Promise<void> => {
    try {
      await retry(get);
    } catch (error) {
      if (statusCode(error) !== 404) ledger.fail(`DataSync ${kind}`, id, error);
      return;
    }
    try {
      await retry(del);
      ledger.remove(`DataSync ${kind}`, id);
    } catch (error) {
      if (statusCode(error) !== 404) ledger.fail(`DataSync ${kind}`, id, error);
    }
  };

  // 1. Relationships. Listed ids first, then the `ProductOwner` relationships between a listed user and a listed entity
  // (the DataSync event probe creates one without an id of its own).
  await pool(list.relationships ?? [], CONCURRENCY, (id) =>
    remove(
      'relationship',
      id,
      () => ds.getRelationship({ id }),
      () => ds.removeRelationship({ id }),
    ),
  );
  await pool(users, CONCURRENCY, async (entityAId) => {
    try {
      const found = await allPages((cursor) =>
        ds.getRelationships({ class: 'ProductOwner', entityAId, limit: 100, cursor }),
      );
      for (const relationship of found) {
        const other = (relationship as { entityBId?: string }).entityBId ?? '';
        if (!entitySet.has(other) && !userSet.has(other)) {
          ledger.note(`DataSync relationship ${relationship.id} left in place, ${other} is not in resources.ts`);
          continue;
        }
        await remove(
          'relationship',
          relationship.id,
          async () => undefined,
          () => ds.removeRelationship({ id: relationship.id }),
        );
      }
    } catch (error) {
      if (missingClass(error)) ledger.note('DataSync class ProductOwner is not provisioned, no relationships to clean');
      else if (statusCode(error) !== 404) ledger.fail('DataSync relationships of user', entityAId, error);
    }
  });

  // 2. Memberships. Listed ids, then the memberships of a listed user to a listed channel.
  await pool(list.memberships ?? [], CONCURRENCY, (id) =>
    remove(
      'membership',
      id,
      () => ds.getMembership({ id }),
      () => ds.removeMembership({ id }),
    ),
  );
  await pool(users, CONCURRENCY, async (userId) => {
    try {
      const found = await allPages((cursor) => ds.getMemberships({ userId, limit: 100, cursor }));
      for (const membership of found) {
        const channelId = (membership as { channelId?: string }).channelId ?? '';
        if (!channelSet.has(channelId)) {
          ledger.note(
            `DataSync membership ${membership.id} left in place, channel ${channelId} is not in resources.ts`,
          );
          continue;
        }
        await remove(
          'membership',
          membership.id,
          async () => undefined,
          () => ds.removeMembership({ id: membership.id }),
        );
      }
    } catch (error) {
      if (statusCode(error) !== 404) ledger.fail('DataSync memberships of user', userId, error);
    }
  });

  // 3. Entities, users, channels.
  await pool(entities, CONCURRENCY, (id) =>
    remove(
      'entity',
      id,
      () => ds.getEntity({ id }),
      () => ds.removeEntity({ id }),
    ),
  );
  await pool(users, CONCURRENCY, (id) =>
    remove(
      'user',
      id,
      () => ds.getUser({ id }),
      () => ds.removeUser({ id }),
    ),
  );
  await pool(channels, CONCURRENCY, (id) =>
    remove(
      'channel',
      id,
      () => ds.getChannel({ id }),
      () => ds.removeChannel({ id }),
    ),
  );
}
