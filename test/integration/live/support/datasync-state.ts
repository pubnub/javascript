/**
 * State handling of the DataSync page (api-reference/datasync.test.ts). The samples create objects with literal ids that
 * persist on the keyset, so the page removes exactly those objects before and after its run. It never touches a DataSync
 * class (those are provisioned elsewhere) and never removes an object it does not list here.
 */
import type PubNub from 'pubnub';
import { DATASYNC_PAGE_OBJECTS as PAGE_OBJECTS } from './resources';
import { settled } from './wait';

/** The SDK error carries the service answer in `status`. Assertions match on this string, so a changed code shows in the failure. */
export const errorText = (error: unknown): string => {
  const status = (error as { status?: { errorData?: unknown; statusCode?: number } } | undefined)?.status;
  return `${status?.statusCode ?? ''} ${JSON.stringify(status?.errorData ?? {})}`;
};

/**
 * Removes the page's literal objects in dependency order: relationships and memberships first, then the entities, users and
 * channels they reference. A missing object is fine (404 is swallowed), so it works as the reset before the run and as the
 * best effort cleanup after it. Removing an entity, user or channel also removes the links that point at it.
 */
export async function removePageObjects(client: PubNub): Promise<void> {
  const api = client.dataSync;
  const quietly = (run: () => Promise<unknown>): Promise<void> =>
    run().then(
      () => undefined,
      () => undefined,
    );
  await Promise.all(PAGE_OBJECTS.relationships.map((id) => quietly(() => api.removeRelationship({ id }))));
  await Promise.all(PAGE_OBJECTS.memberships.map((id) => quietly(() => api.removeMembership({ id }))));
  await Promise.all(PAGE_OBJECTS.entities.map((id) => quietly(() => api.removeEntity({ id }))));
  await Promise.all(PAGE_OBJECTS.users.map((id) => quietly(() => api.removeUser({ id }))));
  await Promise.all(PAGE_OBJECTS.channels.map((id) => quietly(() => api.removeChannel({ id }))));
}

/**
 * Waits until the lists the page's exact-list samples read show nothing of the page's objects: no membership of Alice or of the
 * summer channel, no link of Bob or of the sneaker. `removePageObjects` does not observe its own effect, and the memberships and
 * links disappear as a cascade of removing their end, so a list read right after could still show a leftover. The reads must be
 * empty on consecutive polls (`settled`).
 */
export async function untilPageObjectsGone(client: PubNub): Promise<void> {
  const api = client.dataSync;
  await settled(
    async () => {
      const [byUser, byChannel, bySeller, byProduct] = await Promise.all([
        api.getMemberships({ userId: 'user-alice', limit: 20 }),
        api.getMemberships({ channelId: 'channel-summer-sale', limit: 20 }),
        api.getRelationships({ class: 'ProductOwner', entityAId: 'seller-bob', limit: 20 }),
        api.getRelationships({ class: 'ProductOwner', entityBId: 'product-sneaker-42', limit: 20 }),
      ]);
      const left = [...byUser.data, ...byChannel.data, ...bySeller.data, ...byProduct.data].map((o) => o.id);
      if (left.length > 0) throw new Error(`still listed after the reset: ${[...new Set(left)].join(', ')}`);
    },
    { timeout: 45_000, label: 'page objects gone from the lists' },
  );
}
