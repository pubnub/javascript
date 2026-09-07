/**
 * PubNub DataSync API type definitions.
 *
 * Types for Entity Class CRUD operations.
 */

// --------------------------------------------------------
// -------------------- Common Types ----------------------
// --------------------------------------------------------

/**
 * Filterable field definition for entity classes.
 */
export type FilterableField = {
  /** Unique semantic identifier for the property. */
  name: string;

  /** JSON Pointer (RFC 6901) to the property location. */
  path: string;

  /** Data type of the property value. */
  valueKind: 'string' | 'number' | 'boolean' | 'date' | 'datetime';

  /**
   * Whether the property should be indexed for full-text search.
   * @default false
   */
  enabledAdvancedFiltering?: boolean;

  /**
   * Whether the property can have null values.
   * @default true
   */
  isNullable?: boolean;
};

/**
 * Cursor-based pagination metadata returned by the server.
 *
 * Forward pagination details.
 * `has_next` is the only field the service
 * guarantees, while `next_cursor` and `limit` are optional. Pagination is forward-only — there is
 * no previous-page cursor.
 */
export type DataSyncPageMeta = {
  /** Whether there are more results after this page. */
  has_next: boolean;

  /**
   * cursor for the next page, passed back as the `cursor` request parameter.
   *
   * `null` when there are no more results (`has_next` is `false`).
   */
  next_cursor?: string | null;

  /** The limit applied to this page (may differ from the requested `limit`). */
  limit?: number;
};

/**
 * navigation links.
 */
export type DataSyncLinks = {
  /** Link to the current page, with all query parameters applied. */
  self: string;

  /** Link to the next page, including its cursor. `null` when there are no more results. */
  next?: string | null;

  /** Additional links for related resources. */
  [key: string]: string | null | undefined;
};

/**
 * Common parameters for paginated list requests.
 */
type PagedRequestParameters = {
  /** Opaque cursor for pagination. Omit for the first page. */
  cursor?: string;

  /**
   * Maximum number of items per page.
   * @default 20
   * @max 100
   */
  limit?: number;

  /**
   *
   * Supports the full expression grammar (logical operators and nested conditions), so an object
   * written moments earlier may not be matched yet. Use {@link filterFast} when the query must see
   * the latest writes.
   */
  filter?: string;

  /**
   * Filter expression evaluated against strongly consistent storage.
   *
   * Reflects the latest writes, but accepts only a limited number of conditions. Use {@link filter}
   * for complex queries.
   */
  filterFast?: string;

  /**
   * Sort expression.
   *
   * Comma-separated list of property names to sort by, each optionally
   * suffixed with `:desc` (ascending by default). Only payload properties
   * with `filtering` other than `none` in the class definition are
   * accepted.
   * e.g. `"+name,-reatedAt"`), or a map of field → direction that is serialized to the
   * `field:order` form the service expects (e.g. `{ firstName: 'desc' }` → `firstName:desc`).
   */
  sort?: DataSyncSort;
};

/**
 * Sorting options for paginated DataSync list requests.
 *
 * Prefer the object form (`{ firstName: 'desc' }`), which is normalized to the `field:order`
 * form the service expects. A raw string is passed through unchanged.
 */
export type DataSyncSort = string | Record<string, 'asc' | 'desc' | null>;

/**
 * Class hierarchy level used to disambiguate classes that share a name at different levels.
 *
 * `Global` targets a class provided by the service; `SubKey` targets one defined on the key set.
 * Mirrors the event-side `DataSyncClassLevel` reported on subscribe messages.
 */
export type ClassLevel = 'Global' | 'SubKey';

/**
 * Serialize a {@link DataSyncSort} into the query value the service expects.
 *
 * A raw string is passed through unchanged. An object is turned into a list of `field:order`
 * entries (a `null` direction emits the bare field name, letting the service apply its default
 * ascending order). Mirrors the App Context `getAllChannelMetadata` sort handling.
 *
 * @internal
 */
export function serializeDataSyncSort(sort?: DataSyncSort): string | string[] {
  if (typeof sort === 'string') return sort;
  return Object.entries(sort ?? {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
}

/**
 * Single-entity response envelope.
 *
 * `status` is the HTTP status code added by the SDK; `data`, `links` and `meta` come from the
 *  service response and are passed through verbatim.
 */
type DataSyncEntityResponse<T> = {
  /** HTTP status code. */
  status: number;

  /** Response data. */
  data: T;

  /** HATEOAS links, when the service provides them for the resource. */
  links?: DataSyncLinks;

  /** Response metadata, when the service provides it for the resource. */
  meta?: DataSyncPageMeta;
};

/**
 * Paged list response envelope.
 *
 * `status` is the HTTP status code added by the SDK; `data`, `links` and `meta` come from the
 * service and are passed through verbatim. Use
 * `meta.has_next` / `meta.next_cursor` to page forward by feeding the cursor back in as `cursor`.
 */
type DataSyncPagedResponse<T> = {
  /** HTTP status code. */
  status: number;

  /** Array of response items. */
  data: T[];

  /** HATEOAS links for pagination (`self`, `next`, plus any related-resource links). */
  links?: DataSyncLinks;

  /** Cursor-based pagination metadata. */
  meta?: DataSyncPageMeta;
};

// --------------------------------------------------------
// -------------- Patch Operation Types -------------------
// --------------------------------------------------------

/**
 * JSON Patch operation as defined by RFC 6902.
 *
 * Internal request format. Developers use `add`/`replace`/`remove`/`move`/`copy`/`test` keyed by
 * JSON Pointer instead. `from` is the source location for `move`/`copy`; `value` carries the
 * operand for `add`/`replace`/`test`.
 *
 * @internal
 */
export type JsonPatchOperation = {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: unknown;
  from?: string;
};

/**
 * A source → destination path pair (JSON Pointer) for JSON Patch `move` and `copy` operations.
 */
export type PatchMovePath = {
  /** JSON Pointer source path, used verbatim (RFC 6902 `from`). */
  from: string;

  /** JSON Pointer destination path, used verbatim (RFC 6902 `path`). */
  path: string;
};

/**
 * JSON Patch input keyed by JSON Pointer, converted to RFC 6902 operations before sending.
 *
 * @internal
 */
export type JsonPatchInput = {
  /** Fields to add (JSON Pointer → value). */
  add?: Record<string, unknown>;

  /** Fields to replace (JSON Pointer → value). */
  replace?: Record<string, unknown>;

  /** JSON Pointer paths to remove. */
  remove?: string[];

  /** Source → destination path pairs to move. */
  move?: PatchMovePath[];

  /** Source → destination path pairs to copy. */
  copy?: PatchMovePath[];

  /** Fields to test (JSON Pointer → expected value). */
  test?: Record<string, unknown>;
};

/**
 * Convert user-friendly patch input to JSON Patch operations (request format).
 *
 * `path`/`from` are passed through verbatim — callers supply the exact RFC 6901 pointer. Do not
 * reintroduce dot-notation translation here: splitting on `.` makes stored field names that
 * contain a `.` unaddressable.
 *
 * - Each key in `add` becomes an "add" operation.
 * - Each key in `replace` becomes a "replace" operation.
 * - Each entry in `remove` becomes a "remove" operation.
 * - Each `{ from, path }` pair in `move` becomes a "move" operation.
 * - Each `{ from, path }` pair in `copy` becomes a "copy" operation.
 * - Each key in `test` becomes a "test" operation.
 *
 * @internal
 */
export function toJsonPatchOperations(input: JsonPatchInput): JsonPatchOperation[] {
  const { add, replace, remove, move, copy, test } = input;
  const ops: JsonPatchOperation[] = [];

  if (add) {
    for (const [path, value] of Object.entries(add)) {
      ops.push({ op: 'add', path, value });
    }
  }

  if (replace) {
    for (const [path, value] of Object.entries(replace)) {
      ops.push({ op: 'replace', path, value });
    }
  }

  if (remove) {
    for (const path of remove) {
      ops.push({ op: 'remove', path });
    }
  }

  if (move) {
    for (const { from, path } of move) {
      ops.push({ op: 'move', from, path });
    }
  }

  if (copy) {
    for (const { from, path } of copy) {
      ops.push({ op: 'copy', from, path });
    }
  }

  if (test) {
    for (const [path, value] of Object.entries(test)) {
      ops.push({ op: 'test', path, value });
    }
  }

  return ops;
}

// --------------------------------------------------------
// ------------------- Entity Types -----------------------
// --------------------------------------------------------

/**
 * Entity data properties for create requests.
 *
 * The mutable, versioned payload of an entity. `class` (immutable) and `id` live at the
 * top level of {@link CreateEntityParameters}; everything that can change over the entity's
 * lifetime is grouped here under `data`.
 *
 * Each field below documents the JSON Pointer to use when changing it later with
 * `updateEntity` ({@link UpdateEntityParameters}) — the create-time parameter name and the
 * patch path are not always the same.
 */
export type CreateEntityData = {
  /**
   * Version of the entity class schema.
   *
   * To change this later, patch `/entityClassVersion` — the stored property name, which is what
   * responses and real-time events carry. It is *not* `/data/classVersion`.
   *
   * @example
   * ```typescript
   * // create
   * await pubnub.dataSync.createEntity({ class: 'Customer', data: { classVersion: 1 } });
   * // later: bump the version
   * await pubnub.dataSync.updateEntity({ id, replace: { '/entityClassVersion': 2 } });
   * ```
   */
  classVersion: number;

  /**
   * Optional lifecycle status.
   *
   * To change this later, patch `/status`.
   *
   * @example
   * ```typescript
   * await pubnub.dataSync.updateEntity({ id, replace: { '/status': 'inactive' } });
   * ```
   */
  status?: string;

  /**
   * User-defined JSON payload conforming to the entity class schema.
   *
   * To change a payload field later, patch `/payload/<fieldName>`; nest deeper with more segments.
   * A field name that contains a `.` is written as-is (`/payload/user.name`).
   *
   * @example
   * ```typescript
   * // create
   * await pubnub.dataSync.createEntity({
   *   class: 'Customer',
   *   data: { classVersion: 1, payload: { creditScore: 720, address: { city: 'Pune' } } },
   * });
   * // later: one top-level field, one nested field, one field whose name contains a dot
   * await pubnub.dataSync.updateEntity({
   *   id,
   *   replace: { '/payload/creditScore': 810, '/payload/address/city': 'Mumbai' },
   *   add: { '/payload/user.name': 'Alice' },
   *   remove: ['/payload/address/line2'],
   * });
   * ```
   */
  payload?: Record<string, unknown>;
};

/**
 * Entity data properties for update (PUT) requests.
 *
 * The mutable, versioned payload of an entity. `id` lives at the top level of
 * {@link SetEntityParameters}. `entityClass` is immutable after creation and therefore
 * has no place in updates.
 */
export type SetEntityData = {
  /**
   * Version of the entity class schema.
   *
   * With `updateEntity` (PATCH) the same value is addressed as `/entityClassVersion`.
   */
  classVersion: number;

  /** Optional lifecycle status. */
  status?: string;

  /** User-defined JSON payload conforming to the entity class schema. */
  payload?: Record<string, unknown>;
};

/**
 * Entity resource as returned from the server.
 */
export type EntityObject = {
  /** Unique identifier (UUID). */
  id: string;

  /** Entity class this entity belongs to. */
  entityClass: string;

  /** Version of the entity class schema. */
  entityClassVersion: number;

  /** Lifecycle status. */
  status?: string;

  /** User-defined JSON payload. */
  payload?: Record<string, unknown>;

  /** Date and time the entity was created (ISO 8601). */
  createdAt: string;

  /** Date and time the entity was last updated (ISO 8601). */
  updatedAt: string;

  /** Content fingerprint for optimistic concurrency control. */
  eTag: string;

  /** Auto-deletion timestamp (ISO 8601). Entities expire at this time. */
  expiresAt: string;
};

// ----- Entity Request Parameters -----

/**
 * Create Entity request parameters.
 */
export type CreateEntityParameters = {
  /**
   * Optional entity ID.
   * Server auto-generates a UUID if not provided.
   */
  id?: string;

  /**
   * Entity class this entity belongs to. Set at creation time and immutable afterward.
   *
   * Stored on the entity as `entityClass` — the name it carries in responses and real-time event
   * payloads. Immutable, so it cannot be patched: `updateEntity` rejects `/entityClass`.
   */
  class: string;

  /**
   * Class hierarchy level of `class`. Set at creation time and immutable afterward.
   *
   * Omit to let the service apply its default.
   *
   * Stored on the entity as `entityClassLevel`. Immutable, so it cannot be patched.
   */
  classLevel?: ClassLevel;

  /**
   * Mutable, versioned entity data (class version, status, and payload).
   *
   * These fields map into the request body envelope. `id` and `class` are kept at the top
   * level because they identify the resource, while everything in `data` is what the entity
   * carries and can change over its lifetime.
   */
  data: CreateEntityData;
};

/**
 * Get Entity request parameters.
 */
export type GetEntityParameters = {
  /** Entity ID. */
  id: string;
};

/**
 * Get All Entities request parameters.
 *
 * `entityClass` is required — entities are always listed within the context of their class.
 */
export type GetEntitiesParameters = PagedRequestParameters & {
  /** Entity class name to filter by (required). */
  entityClass: string;

  /**
   * Entity class version. If not provided, the server returns entities for the latest version.
   */
  entityClassVersion?: number;

  /**
   * Level of the entity class, used to disambiguate a class name defined at both levels.
   *
   * `Global` targets the service-provided class; `SubKey` targets one defined on the key set.
   */
  entityClassLevel?: ClassLevel;
};

/**
 * Set Entity request parameters (full replacement via PUT).
 *
 * `entityClass` is immutable after creation — only `classVersion`, `status`,
 * and `payload` can be updated.
 */
export type SetEntityParameters = {
  /** Entity ID. */
  id: string;

  /** Complete, mutable entity data for replacement (excludes immutable `entityClass`). */
  data: SetEntityData;

  /**
   * ETag for optimistic concurrency control.
   * If provided, the update only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;
};

/**
 * Update Entity request parameters (partial update via JSON Patch RFC 6902).
 *
 * Uses `add`, `replace`, and `remove` with JSON Pointer (RFC 6901) field paths.
 *
 * Patch paths address the entity's **stored property names** — the same keys that come
 * back in responses and real-time events — not the grouped parameter names used by
 * {@link CreateEntityParameters}:
 *
 * - `classVersion` → `/entityClassVersion` (not `/data/classVersion`)
 * - `status` → `/status`
 * - a payload field → `/payload/<fieldName>`, e.g. `/payload/address/city` for a nested one.
 *   A field name that contains a `.` is written as-is (`/payload/user.name`).
 *
 * `entityClass` and `entityClassLevel` are immutable and cannot be patched.
 *
 * At least one of `add`, `replace`, or `remove` must be provided.
 */
export type UpdateEntityParameters = {
  /** Entity ID. */
  id: string;

  /**
   * Fields to add, keyed by JSON Pointer.
   *
   * Each key is a JSON Pointer to the target field, used exactly as provided.
   * The SDK converts these to JSON Patch "add" operations.
   *
   * @example
   * ```typescript
   * add: {
   *   '/payload/tags/0': 'priority',
   *   '/payload/profile/displayName': 'Alice',
   * }
   * ```
   */
  add?: Record<string, unknown>;

  /**
   * Fields to replace, keyed by JSON Pointer.
   *
   * Each key is a JSON Pointer to the target field, used exactly as provided.
   * The SDK converts these to JSON Patch "replace" operations.
   *
   * @example
   * ```typescript
   * replace: {
   *   '/status': 'active',
   *   '/payload/score': 300,
   * }
   * ```
   */
  replace?: Record<string, unknown>;

  /**
   * Array of JSON Pointer field paths to remove.
   *
   * The SDK converts these to JSON Patch "remove" operations.
   *
   * @example
   * ```typescript
   * remove: ['/payload/tempFlag', '/payload/legacyField']
   * ```
   */
  remove?: string[];

  /**
   * Source → destination path pairs to move (RFC 6902 "move").
   *
   * The value at each `from` is removed and re-added at `path`. Both are JSON Pointers used
   * exactly as provided (prefix with `/payload` to target payload fields).
   *
   * @example
   * ```typescript
   * move: [{ from: '/payload/legacyName', path: '/payload/displayName' }]
   * ```
   */
  move?: PatchMovePath[];

  /**
   * Source → destination path pairs to copy (RFC 6902 "copy").
   *
   * The value at each `from` is duplicated to `path`. Both are JSON Pointers used exactly as
   * provided (prefix with `/payload` to target payload fields).
   *
   * @example
   * ```typescript
   * copy: [{ from: '/payload/displayName', path: '/payload/previousName' }]
   * ```
   */
  copy?: PatchMovePath[];

  /**
   * Fields to test (JSON Pointer keys → expected value; RFC 6902 "test").
   *
   * The patch fails if the value at any path does not equal the expected value. Keys are used
   * exactly as provided (prefix with `/payload` for payload fields).
   *
   * @example
   * ```typescript
   * test: { '/status': 'active' }
   * ```
   */
  test?: Record<string, unknown>;

  /**
   * ETag for optimistic concurrency control.
   * If provided, the patch only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;
};

/**
 * Remove Entity request parameters.
 */
export type RemoveEntityParameters = {
  /** Entity ID. */
  id: string;

  /**
   * ETag for optimistic concurrency control.
   * If provided, the delete only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;
};

// ----- Entity Response Types -----

/** Response for creating an entity. */
export type CreateEntityResponse = DataSyncEntityResponse<EntityObject>;

/** Response for getting a single entity. */
export type GetEntityResponse = DataSyncEntityResponse<EntityObject>;

/** Response for listing entities. */
export type GetEntitiesResponse = DataSyncPagedResponse<EntityObject>;

/** Response for updating an entity (PUT). */
export type SetEntityResponse = DataSyncEntityResponse<EntityObject>;

/** Response for patching an entity (PATCH). */
export type UpdateEntityResponse = DataSyncEntityResponse<EntityObject>;

/** Response for removing an entity. */
export type RemoveEntityResponse = {
  /** HTTP status code. */
  status: number;
};

// --------------------------------------------------------
// --------------- Relationship Types ---------------------
// --------------------------------------------------------

/**
 * Relationship data properties for create requests.
 *
 * The mutable, versioned payload of a relationship. `id`, `class`, `entityAId`, and `entityBId`
 * live at the top level of {@link CreateRelationshipParameters} (identity + immutable structure);
 * everything that can change over the relationship's lifetime is grouped here under `data`.
 *
 * Each field below documents the JSON Pointer to use when changing it later with
 * `updateRelationship` ({@link UpdateRelationshipParameters}) — the create-time parameter name
 * and the patch path are not always the same.
 */
export type CreateRelationshipData = {
  /**
   * Version of the relationship class schema.
   *
   * To change this later, patch `/relationshipClassVersion` — the stored property name, which is
   * what responses and real-time events carry. It is *not* `/data/classVersion`.
   *
   * @example
   * ```typescript
   * await pubnub.dataSync.updateRelationship({ id, replace: { '/relationshipClassVersion': 2 } });
   * ```
   */
  classVersion: number;

  /**
   * Optional lifecycle status.
   *
   * To change this later, patch `/status`.
   */
  status?: string;

  /**
   * User-defined JSON payload.
   *
   * To change a payload field later, patch `/payload/<fieldName>`; nest deeper with more segments.
   * A field name that contains a `.` is written as-is (`/payload/user.name`).
   *
   * @example
   * ```typescript
   * // create
   * await pubnub.dataSync.createRelationship({
   *   class: 'RequestedBy', entityAId, entityBId,
   *   data: { classVersion: 1, payload: { label: 'primary', linkedAt: '2026-07-06T10:00:00.000Z' } },
   * });
   * // later
   * await pubnub.dataSync.updateRelationship({
   *   id,
   *   replace: { '/payload/label': 'secondary' },
   *   move: [{ from: '/payload/linkedAt', path: '/payload/linkedOn' }],
   * });
   * ```
   */
  payload?: Record<string, unknown>;
};

/**
 * Relationship data properties for update (PUT) requests.
 *
 * The mutable, versioned payload of a relationship. `id`, `entityAId`, and `entityBId` live at the
 * top level of {@link SetRelationshipParameters}. `relationshipClass` is immutable after creation
 * and therefore has no place in updates. The server rejects a PUT that omits `classVersion`.
 */
export type SetRelationshipData = {
  /**
   * Version of the relationship class schema.
   *
   * With `updateRelationship` (PATCH) the same value is addressed as `/relationshipClassVersion`.
   */
  classVersion: number;

  /** Optional lifecycle status. */
  status?: string;

  /** User-defined JSON payload. */
  payload?: Record<string, unknown>;
};

/**
 * Relationship resource as returned from the server.
 */
export type RelationshipObject = {
  /** Unique identifier. */
  id: string;

  /** First entity ID in the relationship. */
  entityAId: string;

  /** Second entity ID in the relationship. */
  entityBId: string;

  /** Relationship class this relationship belongs to. */
  relationshipClass: string;

  /** Version of the relationship class schema. */
  relationshipClassVersion: number;

  /** Lifecycle status. */
  status?: string;

  /** User-defined JSON payload. */
  payload?: Record<string, unknown>;

  /** Date and time the relationship was created (ISO 8601). */
  createdAt: string;

  /** Date and time the relationship was last updated (ISO 8601). */
  updatedAt: string;

  /** Content fingerprint for optimistic concurrency control. */
  eTag: string;

  /** Auto-deletion timestamp (ISO 8601). */
  expiresAt: string;
};

// ----- Relationship Request Parameters -----

/**
 * Create Relationship request parameters.
 */
export type CreateRelationshipParameters = {
  /**
   * Optional relationship ID.
   * Server auto-generates a UUID if not provided.
   */
  id?: string;

  /**
   * Relationship class this relationship belongs to. Set at creation time and immutable afterward.
   *
   * Stored on the relationship as `relationshipClass` — the name it carries in responses and
   * real-time event payloads. Immutable, so it cannot be patched.
   */
  class: string;

  /** First entity ID in the relationship. Immutable after creation, so it cannot be patched. */
  entityAId: string;

  /** Second entity ID in the relationship. Immutable after creation, so it cannot be patched. */
  entityBId: string;

  /** Mutable, versioned relationship data (class version, status, and payload). */
  data: CreateRelationshipData;
};

/**
 * Get Relationship request parameters.
 */
export type GetRelationshipParameters = {
  /** Relationship ID. */
  id: string;
};

/**
 * Get All Relationships request parameters.
 */
export type GetRelationshipsParameters = PagedRequestParameters & {
  /** Relationship class name (required by the server). */
  relationshipClass: string;

  /** Relationship class version. */
  relationshipClassVersion?: number;

  /** Filter relationships by first entity ID. */
  entityAId?: string;

  /** Filter relationships by second entity ID. */
  entityBId?: string;
};

/**
 * Set Relationship request parameters (full replacement via PUT).
 */
export type SetRelationshipParameters = {
  /** Relationship ID. */
  id: string;

  /** First entity ID in the relationship. */
  entityAId: string;

  /** Second entity ID in the relationship. */
  entityBId: string;

  /** Complete, mutable relationship data for replacement (excludes immutable `relationshipClass`). */
  data: SetRelationshipData;

  /**
   * ETag for optimistic concurrency control.
   * If provided, the update only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;
};

/**
 * Update Relationship request parameters (partial update via JSON Patch RFC 6902).
 *
 * Uses `add`, `replace`, and `remove` with JSON Pointer (RFC 6901) field paths.
 *
 * Patch paths address the relationship's **stored property names** — the same keys that come
 * back in responses and real-time events — not the grouped parameter names used by
 * {@link CreateRelationshipParameters}:
 *
 * - `classVersion` → `/relationshipClassVersion` (not `/data/classVersion`)
 * - `status` → `/status`
 * - a payload field → `/payload/<fieldName>`, e.g. `/payload/address/city` for a nested one.
 *   A field name that contains a `.` is written as-is (`/payload/user.name`).
 *
 * `relationshipClass`, `entityAId`, and `entityBId` are immutable and cannot be patched.
 *
 * At least one of `add`, `replace`, or `remove` must be provided.
 */
export type UpdateRelationshipParameters = {
  /** Relationship ID. */
  id: string;

  /**
   * Fields to add, keyed by JSON Pointer.
   *
   * Each key is a JSON Pointer to the target field, used exactly as provided (prefix with
   * `/payload` to target payload fields). The SDK converts these to JSON Patch "add" operations.
   *
   * @example
   * ```typescript
   * add: {
   *   '/payload/tags/0': 'mentor',
   * }
   * ```
   */
  add?: Record<string, unknown>;

  /**
   * Fields to replace, keyed by JSON Pointer.
   *
   * Each key is a JSON Pointer to the target field, used exactly as provided (prefix with
   * `/payload` to target payload fields). The SDK converts these to JSON Patch "replace" operations.
   *
   * @example
   * ```typescript
   * replace: {
   *   '/payload/role': 'admin',
   *   '/payload/permissions/read': true,
   * }
   * ```
   */
  replace?: Record<string, unknown>;

  /**
   * Array of JSON Pointer field paths to remove.
   *
   * The SDK converts these to JSON Patch "remove" operations.
   *
   * @example
   * ```typescript
   * remove: ['/payload/tempFlag', '/payload/legacyField']
   * ```
   */
  remove?: string[];

  /**
   * Source → destination path pairs to move (RFC 6902 "move"). Both paths are JSON Pointers used
   * as provided (prefix with `/payload` to target payload fields); the value at `from` is
   * removed and re-added at `path`.
   */
  move?: PatchMovePath[];

  /**
   * Source → destination path pairs to copy (RFC 6902 "copy"). Both paths are JSON Pointers used
   * as provided (prefix with `/payload` to target payload fields); the value at `from` is duplicated to `path`.
   */
  copy?: PatchMovePath[];

  /**
   * Fields to test (JSON Pointer keys → expected value; RFC 6902 "test"). The patch fails if the
   * value at any path does not equal the expected value. Keys are used as provided (prefix with
   * `/payload` for payload fields).
   */
  test?: Record<string, unknown>;

  /**
   * ETag for optimistic concurrency control.
   * If provided, the patch only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;
};

/**
 * Remove Relationship request parameters.
 */
export type RemoveRelationshipParameters = {
  /** Relationship ID. */
  id: string;

  /**
   * ETag for optimistic concurrency control.
   * If provided, the delete only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;
};

// ----- Relationship Response Types -----

/** Response for creating a relationship. */
export type CreateRelationshipResponse = DataSyncEntityResponse<RelationshipObject>;

/** Response for getting a single relationship. */
export type GetRelationshipResponse = DataSyncEntityResponse<RelationshipObject>;

/** Response for listing relationships. */
export type GetRelationshipsResponse = DataSyncPagedResponse<RelationshipObject>;

/** Response for updating a relationship (PUT). */
export type SetRelationshipResponse = DataSyncEntityResponse<RelationshipObject>;

/** Response for patching a relationship (PATCH). */
export type UpdateRelationshipResponse = DataSyncEntityResponse<RelationshipObject>;

/** Response for removing a relationship. */
export type RemoveRelationshipResponse = {
  /** HTTP status code. */
  status: number;
};

// --------------------------------------------------------
// ------------------ User Types --------------------------
// --------------------------------------------------------

/**
 * User data properties for create requests.
 *
 * The mutable, versioned payload of a user. `id` lives at the top level of
 * {@link CreateUserParameters}; everything that can change over the user's lifetime is here.
 *
 * Each field below documents the JSON Pointer to use when changing it later with `updateUser`
 * ({@link UpdateUserParameters}) — the create-time parameter name and the patch path are not
 * always the same.
 */
export type CreateUserData = {
  /**
   * Version of the entity class schema.
   *
   * To change this later, patch `/entityClassVersion` — the stored property name, which is what
   * responses and real-time events carry. It is *not* `/data/classVersion`.
   *
   * @example
   * ```typescript
   * await pubnub.dataSync.updateUser({ id, replace: { '/entityClassVersion': 2 } });
   * ```
   */
  classVersion: number;

  /**
   * Optional lifecycle status.
   *
   * To change this later, patch `/status`.
   */
  status?: string;

  /**
   * User-defined JSON payload conforming to the entity class schema.
   *
   * To change a payload field later, patch `/payload/<fieldName>`; nest deeper with more segments.
   * A field name that contains a `.` is written as-is (`/payload/user.name`).
   *
   * @example
   * ```typescript
   * // create
   * await pubnub.dataSync.createUser({
   *   data: { classVersion: 1, payload: { email: 'alice@acme.test', isActive: true } },
   * });
   * // later
   * await pubnub.dataSync.updateUser({
   *   id,
   *   replace: { '/payload/email': 'alice.v@acme.test' },
   *   remove: ['/payload/isActive'],
   * });
   * ```
   */
  payload?: Record<string, unknown>;
};

/**
 * User resource as returned from the server.
 */
export type UserObject = {
  /** Unique identifier (UUID). */
  id: string;

  /** Version of the entity class schema. */
  entityClassVersion: number;

  /** Lifecycle status. */
  status?: string;

  /** User-defined JSON payload. */
  payload?: Record<string, unknown>;

  /** Date and time the user was created (ISO 8601). */
  createdAt: string;

  /** Date and time the user was last updated (ISO 8601). */
  updatedAt: string;

  /** Content fingerprint for optimistic concurrency control. */
  eTag: string;

  /** Auto-deletion timestamp (ISO 8601). Users expire at this time. */
  expiresAt: string;
};

// ----- User Request Parameters -----

/**
 * Create User request parameters.
 */
export type CreateUserParameters = {
  /**
   * Optional user ID.
   * Server auto-generates a UUID if not provided.
   */
  id?: string;

  /**
   * Entity class this user belongs to. Set at creation time and immutable afterward.
   *
   * Must be `User` or one of its subclasses. Omit to let the service apply the default (`User`).
   *
   * Stored on the user as `entityClass` — the name it carries in responses and real-time event
   * payloads. Immutable, so it cannot be patched: `updateUser` rejects `/entityClass`.
   */
  class?: string;

  /**
   * Class hierarchy level of the user's entity class. Set at creation time and immutable afterward.
   *
   * Omit to let the service apply its default.
   *
   * Stored on the user as `entityClassLevel`. Immutable, so it cannot be patched.
   */
  classLevel?: ClassLevel;

  /** Mutable, versioned user data (class version, status, and payload). */
  data: CreateUserData;
};

/**
 * User data properties for update (PUT) requests.
 *
 * The mutable, versioned payload of a user. `id` lives at the top level of
 * {@link SetUserParameters}.
 */
export type SetUserData = {
  /**
   * Version of the entity class schema.
   *
   * With `updateUser` (PATCH) the same value is addressed as `/entityClassVersion`.
   */
  classVersion: number;

  /** Optional lifecycle status. */
  status?: string;

  /** User-defined JSON payload conforming to the entity class schema. */
  payload?: Record<string, unknown>;
};

/**
 * Get User request parameters.
 */
export type GetUserParameters = {
  /** User ID. */
  id: string;
};

/**
 * Get All Users request parameters.
 */
export type GetUsersParameters = PagedRequestParameters & {
  /**
   * Entity class name to filter by.
   *
   * Optional — unlike {@link GetEntitiesParameters.entityClass}, users are listed across every user
   * class when omitted.
   */
  entityClass?: string;

  /**
   * Entity class version. If not provided, the server returns users for the latest version.
   */
  entityClassVersion?: number;

  /**
   * Level of the entity class, used to disambiguate a class name defined at both levels.
   *
   * `Global` targets the service-provided class; `SubKey` targets one defined on the key set.
   */
  entityClassLevel?: ClassLevel;
};

/**
 * Set User request parameters (full replacement via PUT).
 */
export type SetUserParameters = {
  /** User ID. */
  id: string;

  /** Complete, mutable user data for replacement. */
  data: SetUserData;

  /**
   * ETag for optimistic concurrency control.
   * If provided, the update only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;
};

/**
 * Update User request parameters (partial update via JSON Patch RFC 6902).
 *
 * Uses `add`, `replace`, and `remove` with JSON Pointer (RFC 6901) field paths.
 *
 * Patch paths address the user's **stored property names** — the same keys that come
 * back in responses and real-time events — not the grouped parameter names used by
 * {@link CreateUserParameters}:
 *
 * - `classVersion` → `/entityClassVersion` (not `/data/classVersion`)
 * - `status` → `/status`
 * - a payload field → `/payload/<fieldName>`, e.g. `/payload/address/city` for a nested one.
 *   A field name that contains a `.` is written as-is (`/payload/user.name`).
 *
 * `entityClass` and `entityClassLevel` are immutable and cannot be patched.
 *
 * At least one of `add`, `replace`, or `remove` must be provided.
 */
export type UpdateUserParameters = {
  /** User ID. */
  id: string;

  /**
   * Fields to add, keyed by JSON Pointer (used exactly as provided).
   * The SDK converts these to JSON Patch "add" operations.
   */
  add?: Record<string, unknown>;

  /**
   * Fields to replace, keyed by JSON Pointer (used exactly as provided).
   * The SDK converts these to JSON Patch "replace" operations.
   */
  replace?: Record<string, unknown>;

  /**
   * Array of JSON Pointer field paths to remove (used exactly as provided).
   * The SDK converts these to JSON Patch "remove" operations.
   */
  remove?: string[];

  /**
   * Source → destination path pairs to move (RFC 6902 "move"). Both paths are JSON Pointers used
   * as provided (prefix with `/payload` to target payload fields); the value at `from` is
   * removed and re-added at `path`.
   */
  move?: PatchMovePath[];

  /**
   * Source → destination path pairs to copy (RFC 6902 "copy"). Both paths are JSON Pointers used
   * as provided (prefix with `/payload` to target payload fields); the value at `from` is duplicated to `path`.
   */
  copy?: PatchMovePath[];

  /**
   * Fields to test (JSON Pointer keys → expected value; RFC 6902 "test"). The patch fails if the
   * value at any path does not equal the expected value. Keys are used as provided (prefix with
   * `/payload` for payload fields).
   */
  test?: Record<string, unknown>;

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;
};

/**
 * Remove User request parameters.
 */
export type RemoveUserParameters = {
  /** User ID. */
  id: string;

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;
};

// ----- User Response Types -----

/** Response for creating a user. */
export type CreateUserResponse = DataSyncEntityResponse<UserObject>;

/** Response for getting a single user. */
export type GetUserResponse = DataSyncEntityResponse<UserObject>;

/** Response for listing users. */
export type GetUsersResponse = DataSyncPagedResponse<UserObject>;

/** Response for updating a user (PUT). */
export type SetUserResponse = DataSyncEntityResponse<UserObject>;

/** Response for patching a user (PATCH). */
export type UpdateUserResponse = DataSyncEntityResponse<UserObject>;

/** Response for removing a user. */
export type RemoveUserResponse = {
  /** HTTP status code. */
  status: number;
};

// --------------------------------------------------------
// ----------------- Channel Types ------------------------
// --------------------------------------------------------

/**
 * Channel data properties for create requests.
 *
 * The mutable, versioned payload of a channel. `id` lives at the top level of
 * {@link CreateChannelParameters}; everything that can change over the channel's lifetime is here.
 *
 * Each field below documents the JSON Pointer to use when changing it later with `updateChannel`
 * ({@link UpdateChannelParameters}) — the create-time parameter name and the patch path are not
 * always the same.
 */
export type CreateChannelData = {
  /**
   * Version of the entity class schema.
   *
   * To change this later, patch `/entityClassVersion` — the stored property name, which is what
   * responses and real-time events carry. It is *not* `/data/classVersion`.
   *
   * @example
   * ```typescript
   * await pubnub.dataSync.updateChannel({ id, replace: { '/entityClassVersion': 2 } });
   * ```
   */
  classVersion: number;

  /**
   * Optional lifecycle status.
   *
   * To change this later, patch `/status`.
   */
  status?: string;

  /**
   * User-defined JSON payload conforming to the entity class schema.
   *
   * To change a payload field later, patch `/payload/<fieldName>`; nest deeper with more segments.
   * A field name that contains a `.` is written as-is (`/payload/user.name`).
   *
   * @example
   * ```typescript
   * // create
   * await pubnub.dataSync.createChannel({
   *   data: { classVersion: 1, payload: { name: 'engineering', memberCount: 1 } },
   * });
   * // later
   * await pubnub.dataSync.updateChannel({
   *   id,
   *   replace: { '/payload/memberCount': 42 },
   *   add: { '/payload/category': 'general' },
   * });
   * ```
   */
  payload?: Record<string, unknown>;
};

/**
 * Channel data properties for update (PUT) requests.
 *
 * The mutable, versioned payload of a channel. `id` lives at the top level of
 * {@link SetChannelParameters}.
 */
export type SetChannelData = {
  /**
   * Version of the entity class schema.
   *
   * With `updateChannel` (PATCH) the same value is addressed as `/entityClassVersion`.
   */
  classVersion: number;

  /** Optional lifecycle status. */
  status?: string;

  /** User-defined JSON payload conforming to the entity class schema. */
  payload?: Record<string, unknown>;
};

/**
 * Channel resource as returned from the server.
 */
export type ChannelObject = {
  /** Unique identifier (UUID). */
  id: string;

  /** Version of the entity class schema. */
  entityClassVersion: number;

  /** Lifecycle status. */
  status?: string;

  /** User-defined JSON payload. */
  payload?: Record<string, unknown>;

  /** Date and time the channel was created (ISO 8601). */
  createdAt: string;

  /** Date and time the channel was last updated (ISO 8601). */
  updatedAt: string;

  /** Content fingerprint for optimistic concurrency control. */
  eTag: string;

  /** Auto-deletion timestamp (ISO 8601). Channels expire at this time. */
  expiresAt: string;
};

// ----- Channel Request Parameters -----

/**
 * Create Channel request parameters.
 */
export type CreateChannelParameters = {
  /**
   * Optional channel ID.
   * Server auto-generates a UUID if not provided.
   */
  id?: string;

  /**
   * Entity class this channel belongs to. Set at creation time and immutable afterward.
   *
   * Must be `Channel` or one of its subclasses. Omit to let the service apply the default
   * (`Channel`).
   *
   * Stored on the channel as `entityClass` — the name it carries in responses and real-time event
   * payloads. Immutable, so it cannot be patched: `updateChannel` rejects `/entityClass`.
   */
  class?: string;

  /**
   * Class hierarchy level of the channel's entity class. Set at creation time and immutable
   * afterward.
   *
   * Omit to let the service apply its default.
   *
   * Stored on the channel as `entityClassLevel`. Immutable, so it cannot be patched.
   */
  classLevel?: ClassLevel;

  /** Mutable, versioned channel data (class version, status, and payload). */
  data: CreateChannelData;
};

/**
 * Get Channel request parameters.
 */
export type GetChannelParameters = {
  /** Channel ID. */
  id: string;
};

/**
 * Get All Channels request parameters.
 */
export type GetChannelsParameters = PagedRequestParameters & {
  /**
   * Entity class name to filter by.
   *
   * Optional — unlike {@link GetEntitiesParameters.entityClass}, channels are listed across every
   * channel class when omitted.
   */
  entityClass?: string;

  /**
   * Entity class version. If not provided, the server returns channels for the latest version.
   */
  entityClassVersion?: number;

  /**
   * Level of the entity class, used to disambiguate a class name defined at both levels.
   *
   * `Global` targets the service-provided class; `SubKey` targets one defined on the key set.
   */
  entityClassLevel?: ClassLevel;
};

/**
 * Set Channel request parameters (full replacement via PUT).
 */
export type SetChannelParameters = {
  /** Channel ID. */
  id: string;

  /** Complete, mutable channel data for replacement. */
  data: SetChannelData;

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;
};

/**
 * Update Channel request parameters (partial update via JSON Patch RFC 6902).
 *
 * Uses `add`, `replace`, and `remove` with JSON Pointer (RFC 6901) field paths.
 *
 * Patch paths address the channel's **stored property names** — the same keys that come
 * back in responses and real-time events — not the grouped parameter names used by
 * {@link CreateChannelParameters}:
 *
 * - `classVersion` → `/entityClassVersion` (not `/data/classVersion`)
 * - `status` → `/status`
 * - a payload field → `/payload/<fieldName>`, e.g. `/payload/address/city` for a nested one.
 *   A field name that contains a `.` is written as-is (`/payload/user.name`).
 *
 * `entityClass` and `entityClassLevel` are immutable and cannot be patched.
 *
 * At least one of `add`, `replace`, or `remove` must be provided.
 */
export type UpdateChannelParameters = {
  /** Channel ID. */
  id: string;

  /**
   * Fields to add, keyed by JSON Pointer (used exactly as provided).
   * The SDK converts these to JSON Patch "add" operations.
   */
  add?: Record<string, unknown>;

  /**
   * Fields to replace, keyed by JSON Pointer (used exactly as provided).
   * The SDK converts these to JSON Patch "replace" operations.
   */
  replace?: Record<string, unknown>;

  /**
   * Array of JSON Pointer field paths to remove (used exactly as provided).
   * The SDK converts these to JSON Patch "remove" operations.
   */
  remove?: string[];

  /**
   * Source → destination path pairs to move (RFC 6902 "move"). Both paths are JSON Pointers used
   * as provided (prefix with `/payload` to target payload fields); the value at `from` is
   * removed and re-added at `path`.
   */
  move?: PatchMovePath[];

  /**
   * Source → destination path pairs to copy (RFC 6902 "copy"). Both paths are JSON Pointers used
   * as provided (prefix with `/payload` to target payload fields); the value at `from` is duplicated to `path`.
   */
  copy?: PatchMovePath[];

  /**
   * Fields to test (JSON Pointer keys → expected value; RFC 6902 "test"). The patch fails if the
   * value at any path does not equal the expected value. Keys are used as provided (prefix with
   * `/payload` for payload fields).
   */
  test?: Record<string, unknown>;

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;
};

/**
 * Remove Channel request parameters.
 */
export type RemoveChannelParameters = {
  /** Channel ID. */
  id: string;

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;
};

// ----- Channel Response Types -----

/** Response for creating a channel. */
export type CreateChannelResponse = DataSyncEntityResponse<ChannelObject>;

/** Response for getting a single channel. */
export type GetChannelResponse = DataSyncEntityResponse<ChannelObject>;

/** Response for listing channels. */
export type GetChannelsResponse = DataSyncPagedResponse<ChannelObject>;

/** Response for updating a channel (PUT). */
export type SetChannelResponse = DataSyncEntityResponse<ChannelObject>;

/** Response for patching a channel (PATCH). */
export type UpdateChannelResponse = DataSyncEntityResponse<ChannelObject>;

/** Response for removing a channel. */
export type RemoveChannelResponse = {
  /** HTTP status code. */
  status: number;
};

// --------------------------------------------------------
// ---------------- Membership Types ----------------------
// --------------------------------------------------------

/**
 * Membership data properties for create requests.
 *
 * The mutable, versioned payload of a membership. `id`, `userId`, and `channelId` live at the
 * top level of {@link CreateMembershipParameters} (identity + immutable structure); everything
 * that can change over the membership's lifetime is grouped here under `data`.
 *
 * Each field below documents the JSON Pointer to use when changing it later with
 * `updateMembership` ({@link UpdateMembershipParameters}) — the create-time parameter name and
 * the patch path are not always the same.
 */
export type CreateMembershipData = {
  /**
   * Version of the Membership relationship class.
   *
   * To change this later, patch `/relationshipClassVersion` — the stored property name, which is
   * what responses and real-time events carry. It is *not* `/data/classVersion`.
   *
   * @example
   * ```typescript
   * await pubnub.dataSync.updateMembership({ id, replace: { '/relationshipClassVersion': 2 } });
   * ```
   */
  classVersion: number;

  /**
   * Optional lifecycle status.
   *
   * To change this later, patch `/status`.
   */
  status?: string;

  /**
   * User-defined JSON payload.
   *
   * To change a payload field later, patch `/payload/<fieldName>`; nest deeper with more segments.
   * A field name that contains a `.` is written as-is (`/payload/user.name`).
   *
   * @example
   * ```typescript
   * // create
   * await pubnub.dataSync.createMembership({
   *   userId, channelId,
   *   data: { classVersion: 1, payload: { role: 'member', notificationsEnabled: true } },
   * });
   * // later
   * await pubnub.dataSync.updateMembership({
   *   id,
   *   replace: { '/payload/role': 'moderator' },
   *   remove: ['/payload/notificationsEnabled'],
   * });
   * ```
   */
  payload?: Record<string, unknown>;
};

/**
 * Membership data properties for update (PUT) requests.
 *
 * The mutable, versioned payload of a membership. `id`, `userId`, and `channelId` live at the top
 * level of {@link SetMembershipParameters}. The server rejects a PUT that omits `classVersion`
 * (`SYN-0004: must not be null`), mirroring {@link SetRelationshipData}.
 */
export type SetMembershipData = {
  /**
   * Version of the Membership relationship class.
   *
   * With `updateMembership` (PATCH) the same value is addressed as `/relationshipClassVersion`.
   */
  classVersion: number;

  /** Optional lifecycle status. */
  status?: string;

  /** User-defined JSON payload. */
  payload?: Record<string, unknown>;
};

/**
 * Membership resource as returned from the server.
 *
 * A membership is a `Membership`-class relationship between a channel (`entityAId`) and a user
 * (`entityBId`), exposed on the REST response as `channelId` / `userId`.
 */
export type MembershipObject = {
  /** Unique identifier. */
  id: string;

  /** Channel ID reference. */
  channelId: string;

  /** User ID reference. */
  userId: string;

  /**
   * Relationship class this membership belongs to — `Membership`, or one of its descendant classes.
   *
   * Server-assigned: the create/set endpoints take no class parameter, so it is never chosen by
   * the caller.
   */
  relationshipClass: string;

  /** Version of the relationship class schema. */
  relationshipClassVersion: number;

  /** Lifecycle status. */
  status?: string;

  /** User-defined JSON payload. */
  payload?: Record<string, unknown>;

  /** Date and time the membership was created (ISO 8601). */
  createdAt: string;

  /** Date and time the membership was last updated (ISO 8601). */
  updatedAt: string;

  /** Content fingerprint for optimistic concurrency control. */
  eTag: string;

  /** Auto-deletion timestamp (ISO 8601). */
  expiresAt: string;
};

// ----- Membership Request Parameters -----

/**
 * Create Membership request parameters.
 */
export type CreateMembershipParameters = {
  /**
   * Optional membership ID.
   * Server auto-generates a UUID if not provided.
   */
  id?: string;

  /** User ID reference. Immutable after creation, so it cannot be patched. */
  userId: string;

  /** Channel ID reference. Immutable after creation, so it cannot be patched. */
  channelId: string;

  /** Mutable, versioned membership data (class version, status, and payload). */
  data: CreateMembershipData;
};

/**
 * Get Membership request parameters.
 */
export type GetMembershipParameters = {
  /** Membership ID. */
  id: string;
};

/**
 * Get All Memberships request parameters.
 */
export type GetMembershipsParameters = PagedRequestParameters & {
  /** Filter memberships by user ID. */
  userId?: string;

  /** Filter memberships by channel ID. */
  channelId?: string;

  /**
   * Schema version of the relationship class.
   * If not provided, the server uses the latest version.
   */
  relationshipClassVersion?: number;
};

/**
 * Set Membership request parameters (full replacement via PUT).
 */
export type SetMembershipParameters = {
  /** Membership ID. */
  id: string;

  /** User ID reference. */
  userId: string;

  /** Channel ID reference. */
  channelId: string;

  /** Complete, mutable membership data for replacement. */
  data: SetMembershipData;

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;
};

/**
 * Update Membership request parameters (partial update via JSON Patch RFC 6902).
 *
 * Uses `add`, `replace`, and `remove` with JSON Pointer (RFC 6901) field paths.
 *
 * Patch paths address the membership's **stored property names** — the same keys that come
 * back in responses and real-time events — not the grouped parameter names used by
 * {@link CreateMembershipParameters}:
 *
 * - `classVersion` → `/relationshipClassVersion` (not `/data/classVersion`)
 * - `status` → `/status`
 * - a payload field → `/payload/<fieldName>`, e.g. `/payload/address/city` for a nested one.
 *   A field name that contains a `.` is written as-is (`/payload/user.name`).
 *
 * `userId` and `channelId` are immutable and cannot be patched.
 *
 * At least one of `add`, `replace`, or `remove` must be provided.
 */
export type UpdateMembershipParameters = {
  /** Membership ID. */
  id: string;

  /**
   * Fields to add, keyed by JSON Pointer (used exactly as provided).
   * The SDK converts these to JSON Patch "add" operations.
   */
  add?: Record<string, unknown>;

  /**
   * Fields to replace, keyed by JSON Pointer (used exactly as provided).
   * The SDK converts these to JSON Patch "replace" operations.
   */
  replace?: Record<string, unknown>;

  /**
   * Array of JSON Pointer field paths to remove (used exactly as provided).
   * The SDK converts these to JSON Patch "remove" operations.
   */
  remove?: string[];

  /**
   * Source → destination path pairs to move (RFC 6902 "move"). Both paths are JSON Pointers used
   * as provided (prefix with `/payload` to target payload fields); the value at `from` is
   * removed and re-added at `path`.
   */
  move?: PatchMovePath[];

  /**
   * Source → destination path pairs to copy (RFC 6902 "copy"). Both paths are JSON Pointers used
   * as provided (prefix with `/payload` to target payload fields); the value at `from` is duplicated to `path`.
   */
  copy?: PatchMovePath[];

  /**
   * Fields to test (JSON Pointer keys → expected value; RFC 6902 "test"). The patch fails if the
   * value at any path does not equal the expected value. Keys are used as provided (prefix with
   * `/payload` for payload fields).
   */
  test?: Record<string, unknown>;

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;
};

/**
 * Remove Membership request parameters.
 */
export type RemoveMembershipParameters = {
  /** Membership ID. */
  id: string;

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;
};

// ----- Membership Response Types -----

/** Response for creating a membership. */
export type CreateMembershipResponse = DataSyncEntityResponse<MembershipObject>;

/** Response for getting a single membership. */
export type GetMembershipResponse = DataSyncEntityResponse<MembershipObject>;

/** Response for listing memberships. */
export type GetMembershipsResponse = DataSyncPagedResponse<MembershipObject>;

/** Response for updating a membership (PUT). */
export type SetMembershipResponse = DataSyncEntityResponse<MembershipObject>;

/** Response for patching a membership (PATCH). */
export type UpdateMembershipResponse = DataSyncEntityResponse<MembershipObject>;

/** Response for removing a membership. */
export type RemoveMembershipResponse = {
  /** HTTP status code. */
  status: number;
};
