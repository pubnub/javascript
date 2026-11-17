/**
 * State handling of the DataSync page (api-reference/datasync.test.ts). The samples create objects with literal ids that
 * persist on the keyset, so the page removes exactly those objects before and after its run. It never touches a DataSync
 * class (those are provisioned elsewhere) and never removes an object it does not list here.
 */
import type PubNub from 'pubnub';
import { DATASYNC_PAGE_OBJECTS as PAGE_OBJECTS } from './resources';

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
