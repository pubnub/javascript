import PubNub from 'pubnub';
import { hasRunSuffix } from '../fixtures/names.js';
import type { Env } from './env.js';

/**
 * Janitor for DataSync objects on the datasync keyset (called from janitor.ts).
 *
 *  1. remove this run's memberships, relationships, entities, users and channels (ids carry `-r<runId>`)
 *  2. sweep objects with any run suffix that are older than six hours (crashed earlier runs)
 *  3. report residue: objects created during the run window without a run suffix
 *
 * It uses the secret key client, lists every kind with paging and removes in dependency order. Classes that do
 * not exist yet (`product`, `ProductOwner`) are skipped quietly. Objects that carry a run suffix but belong to the
 * Access Manager token tests are cleaned the same way, because they live on the same keyset.
 */

// Same six hour rule as janitor.ts. MAX_PAGES bounds a sweep if the service keeps returning cursors.
const SIX_HOURS = 6 * 60 * 60 * 1000;
const MAX_PAGES = 50;

export interface DataSyncJanitorReport {
  log: string[];
  residue: string[];
}

interface Listed {
  id: string;
  createdAt?: string;
}

interface Page {
  data: Listed[];
  meta?: { has_next?: boolean; next_cursor?: string | null };
}

async function listAll(fetchPage: (cursor?: string) => Promise<Page>): Promise<Listed[]> {
  const out: Listed[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await fetchPage(cursor);
    out.push(...response.data.map((o) => ({ id: o.id, createdAt: o.createdAt })));
    cursor = response.meta?.next_cursor ?? undefined;
    if (!response.meta?.has_next || !cursor) break;
  }
  return out;
}

// DS-0100 is the service code for an unknown class. `product` and `ProductOwner` are provisioned by hand (provision/), so a
// keyset without them is normal and not a janitor failure.
function missingClass(error: unknown): boolean {
  const status = (error as { status?: { statusCode?: number; errorData?: unknown } } | undefined)?.status;
  return status?.statusCode === 404 && /DS-0100/.test(JSON.stringify(status.errorData ?? {}));
}

export async function sweepDataSync(env: Env, runId: string, since: Date): Promise<DataSyncJanitorReport> {
  const log: string[] = [];
  const residue: string[] = [];
  if (!env.datasync) {
    log.push('datasync keyset not configured, no DataSync objects to clean');
    return { log, residue };
  }
  const client = new PubNub({ ...env.datasync, userId: `janitor-ds-r${runId}`, logLevel: PubNub.LogLevel.None, heartbeatInterval: 0 });
  const ds = client.dataSync;
  const now = Date.now();
  const mine = new RegExp(`-r${runId}(?=\\.|$)`);

  // Delete this run's objects and any old suffixed ones. Everything else is left alone (a human may own it).
  const doomed = (o: Listed): boolean => {
    if (mine.test(o.id)) return true;
    const created = o.createdAt ? Date.parse(o.createdAt) : 0;
    return hasRunSuffix(o.id) && created > 0 && now - created > SIX_HOURS;
  };
  const note = (kind: string, o: Listed): void => {
    const created = o.createdAt ? Date.parse(o.createdAt) : 0;
    if (!hasRunSuffix(o.id) && created >= since.getTime()) residue.push(`dataSync ${kind}:${o.id}`);
  };

  // Dependency order: memberships and relationships reference users, channels and entities, so they go first.
  const kinds: Array<{
    kind: string;
    list: () => Promise<Listed[]>;
    remove: (id: string) => Promise<unknown>;
    optionalClass?: boolean;
  }> = [
    { kind: 'membership', list: () => listAll((cursor) => ds.getMemberships({ limit: 100, cursor })), remove: (id) => ds.removeMembership({ id }) },
    {
      kind: 'relationship',
      list: () => listAll((cursor) => ds.getRelationships({ class: 'ProductOwner', limit: 100, cursor })),
      remove: (id) => ds.removeRelationship({ id }),
      optionalClass: true,
    },
    {
      kind: 'entity',
      list: () => listAll((cursor) => ds.getEntities({ class: 'product', limit: 100, cursor })),
      remove: (id) => ds.removeEntity({ id }),
      optionalClass: true,
    },
    { kind: 'user', list: () => listAll((cursor) => ds.getUsers({ limit: 100, cursor })), remove: (id) => ds.removeUser({ id }) },
    { kind: 'channel', list: () => listAll((cursor) => ds.getChannels({ limit: 100, cursor })), remove: (id) => ds.removeChannel({ id }) },
  ];

  try {
    for (const { kind, list, remove, optionalClass } of kinds) {
      let objects: Listed[];
      try {
        objects = await list();
      } catch (error) {
        if (optionalClass && missingClass(error)) {
          log.push(`DataSync ${kind}: class not provisioned, skipped`);
        } else {
          log.push(`DataSync ${kind}: listing failed, skipped (${(error as Error).message ?? error})`);
        }
        continue;
      }
      let removed = 0;
      for (const object of objects) {
        if (doomed(object)) {
          try {
            await remove(object.id);
            removed += 1;
          } catch {
            // Already removed by a cascade (deleting a user removes its memberships).
          }
        } else {
          note(kind, object);
        }
      }
      log.push(`DataSync ${kind}s removed: ${removed}`);
    }
  } finally {
    client.destroy();
  }
  return { log, residue };
}
