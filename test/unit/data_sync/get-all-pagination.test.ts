/**
 * Unit tests for pagination on the DataSync list ("get all") endpoints — pure request building and
 * response parsing
 *
 */

import assert from 'assert';

import { GetRelationshipsRequest } from '../../../src/core/endpoints/data_sync/relationship/get-all';
import { GetMembershipsRequest } from '../../../src/core/endpoints/data_sync/membership/get-all';
import { GetChannelsRequest } from '../../../src/core/endpoints/data_sync/channel/get-all';
import { GetEntitiesRequest } from '../../../src/core/endpoints/data_sync/entity/get-all';
import { GetUsersRequest } from '../../../src/core/endpoints/data_sync/user/get-all';
import { TransportResponse } from '../../../src/core/types/transport-response';
import * as DataSync from '../../../src/core/types/api/data-sync';
import { KeySet, Query } from '../../../src/core/types/api';

const keySet: KeySet = { subscribeKey: 'demo-sub-key', publishKey: 'demo-pub-key' };

/** Pagination parameters shared by every list endpoint. */
type PagedOverrides = { cursor?: string; limit?: number };

/**
 * Minimal request contract these tests exercise: build the transport request (for query
 * parameters) and parse a service response envelope.
 */
type ListRequest = {
  request: () => { queryParameters?: Query };
  parse: (response: TransportResponse) => Promise<{
    status: number;
    data: unknown[];
    links?: DataSync.DataSyncLinks;
    meta?: DataSync.DataSyncPageMeta;
  }>;
};

/** Every DataSync list endpoint, with its required non-pagination parameters pre-filled. */
const endpoints: { name: string; request: (overrides?: PagedOverrides) => ListRequest }[] = [
  {
    name: 'getEntities',
    request: (overrides = {}) =>
      new GetEntitiesRequest<DataSync.GetEntitiesResponse>({ keySet, entityClass: 'Customer', ...overrides }),
  },
  {
    name: 'getRelationships',
    request: (overrides = {}) =>
      new GetRelationshipsRequest<DataSync.GetRelationshipsResponse>({
        keySet,
        relationshipClass: 'MEMBER_OF',
        ...overrides,
      }),
  },
  {
    name: 'getUsers',
    request: (overrides = {}) => new GetUsersRequest<DataSync.GetUsersResponse>({ keySet, ...overrides }),
  },
  {
    name: 'getChannels',
    request: (overrides = {}) => new GetChannelsRequest<DataSync.GetChannelsResponse>({ keySet, ...overrides }),
  },
  {
    name: 'getMemberships',
    request: (overrides = {}) => new GetMembershipsRequest<DataSync.GetMembershipsResponse>({ keySet, ...overrides }),
  },
];

/** Wrap a service response body into the transport response shape `parse()` consumes. */
const serviceResponse = (body: Record<string, unknown>, status = 200): TransportResponse => {
  const encoded = new TextEncoder().encode(JSON.stringify(body));

  return {
    url: 'https://ps.pndsn.com/v1/datasync/subkeys/demo-sub-key/entities',
    status,
    headers: { 'content-type': 'application/json' },
    body: encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer,
  };
};

describe('DataSync list endpoints pagination', () => {
  describe('response envelope pass-through', () => {
    endpoints.forEach(({ name, request }) => {
      it(`${name} preserves every \`meta\` and \`links\` field verbatim`, async () => {
        const links = {
          self: '/v1/datasync/subkeys/demo-sub-key/entities?cursor=TjIw&limit=20&sort=-createdAt',
          next: '/v1/datasync/subkeys/demo-sub-key/entities?cursor=TjQw&limit=20&sort=-createdAt',
        };
        const meta = { next_cursor: 'TjQw', has_next: true, limit: 20 };

        const parsed = await request().parse(serviceResponse({ data: [{ id: 'a' }], links, meta }));

        assert.deepStrictEqual(parsed.meta, meta, '`meta` is not remapped, renamed or trimmed');
        assert.deepStrictEqual(parsed.links, links, '`links` is not remapped, renamed or trimmed');
        assert.deepStrictEqual(parsed.data, [{ id: 'a' }]);
        assert.strictEqual(parsed.status, 200, 'HTTP status surfaced on the envelope');
      });

      it(`${name} preserves extra HATEOAS links the service adds`, async () => {
        // `Links` allows additional properties for related resources — they must survive parsing.
        const links = {
          self: '/v1/datasync/subkeys/demo-sub-key/entities?limit=20',
          next: null,
          entityClass: '/v1/datasync/subkeys/demo-sub-key/entity-classes/Customer',
          relationships: '/v1/datasync/subkeys/demo-sub-key/relationships?entity_a_id=a',
        };

        const parsed = await request().parse(
          serviceResponse({ data: [{ id: 'a' }], links, meta: { has_next: false } }),
        );

        assert.deepStrictEqual(parsed.links, links);
        assert.strictEqual(parsed.links?.entityClass, links.entityClass);
      });

      it(`${name} keeps last-page \`null\` cursors as \`null\``, async () => {
        const parsed = await request().parse(
          serviceResponse({
            data: [],
            links: { self: '/v1/datasync/subkeys/demo-sub-key/entities?cursor=TjQw&limit=20', next: null },
            meta: { next_cursor: null, has_next: false, limit: 20 },
          }),
        );

        assert.strictEqual(parsed.meta?.next_cursor, null, 'null is not coerced to undefined');
        assert.strictEqual(parsed.meta?.has_next, false);
        assert.strictEqual(parsed.links?.next, null);
        assert.deepStrictEqual(parsed.data, []);
      });

      it(`${name} accepts the spec-minimal \`meta\` (\`has_next\` only)`, async () => {
        // `has_next` is the only required `Meta` field; nothing may be invented around it.
        const parsed = await request().parse(serviceResponse({ data: [{ id: 'a' }], meta: { has_next: true } }));

        assert.deepStrictEqual(parsed.meta, { has_next: true }, 'no synthesized `meta` keys');
        assert.strictEqual(parsed.meta?.next_cursor, undefined);
        assert.strictEqual(parsed.meta?.limit, undefined);
      });

      it(`${name} accepts an envelope with neither \`links\` nor \`meta\``, async () => {
        // Both are optional in `ResponseEnvelope`, so their absence must not break parsing.
        const parsed = await request().parse(serviceResponse({ data: [{ id: 'a' }] }));

        assert.strictEqual('links' in parsed, false);
        assert.strictEqual('meta' in parsed, false);
        assert.deepStrictEqual(parsed.data, [{ id: 'a' }]);
        assert.strictEqual(parsed.status, 200);
      });
    });
  });

  describe('cursor and limit query serialization', () => {
    endpoints.forEach(({ name, request }) => {
      it(`${name} sends \`meta.next_cursor\` back as the \`cursor\` query parameter`, async () => {
        const page1 = await request().parse(
          serviceResponse({ data: [{ id: 'a' }], meta: { next_cursor: 'TjIw', has_next: true, limit: 2 } }),
        );
        const cursor = page1.meta?.next_cursor ?? undefined;
        const query = request({ cursor, limit: 2 }).request().queryParameters;

        assert.strictEqual(query?.cursor, 'TjIw');
        assert.strictEqual(query?.limit, '2');
      });

      it(`${name} omits \`cursor\` on the first page and defaults \`limit\` to 20`, () => {
        const query = request().request().queryParameters;

        assert.strictEqual('cursor' in (query ?? {}), false, 'no cursor key for the first page');
        assert.strictEqual(query?.limit, '20');
      });
    });
  });

  describe('pagination types match', () => {
    it('`Meta` requires only `has_next`; `next_cursor` and `limit` are optional', () => {
      // Compile-time guards: these assignments fail to typecheck if the type drifts from the spec.
      const minimal: DataSync.DataSyncPageMeta = { has_next: false };
      const full: DataSync.DataSyncPageMeta = { has_next: true, next_cursor: 'TjIw', limit: 20 };
      const lastPage: DataSync.DataSyncPageMeta = { has_next: false, next_cursor: null };

      assert.deepStrictEqual(
        [minimal.has_next, full.next_cursor, full.limit, lastPage.next_cursor],
        [false, 'TjIw', 20, null],
      );
    });

    it('`Links` requires `self`, allows a nullable `next` and arbitrary extra links', () => {
      const minimal: DataSync.DataSyncLinks = { self: '/v1/datasync/subkeys/demo-sub-key/entities' };
      const paginated: DataSync.DataSyncLinks = { self: '/entities?cursor=TjIw', next: null };
      const related: DataSync.DataSyncLinks = { self: '/entities', entityClass: '/entity-classes/Customer' };

      assert.deepStrictEqual(
        [minimal.self, paginated.next, related.entityClass],
        ['/v1/datasync/subkeys/demo-sub-key/entities', null, '/entity-classes/Customer'],
      );
    });
  });
});
