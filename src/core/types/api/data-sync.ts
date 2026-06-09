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
 */
export type DataSyncPageMeta = {
  /** Opaque cursor for the next page. Null if no more results. */
  next_cursor: string | null;

  /** Opaque cursor for the previous page. Null if first page. */
  prev_cursor: string | null;

  /** Whether there are more results after this page. */
  has_next: boolean;

  /** Whether there are results before this page. */
  has_prev: boolean;

  /** The limit applied to this page. */
  limit: number;
};

/**
 * HATEOAS navigation links.
 */
export type DataSyncLinks = {
  /** Link to the current page. */
  self: string;

  /** Link to the next page, if available. */
  next?: string | null;

  /** Link to the previous page, if available. */
  prev?: string | null;

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

  /** Filter expression for results. */
  filter?: string;

  /**
   * Sort expression. Comma-separated fields, optionally prefixed with + (asc) or - (desc).
   * Example: "+name,-createdAt"
   */
  sort?: string;
};

/**
 * Single-entity response envelope.
 */
type DataSyncEntityResponse<T> = {
  /** HTTP status code. */
  status: number;

  /** Response data. */
  data: T;

  /** HATEOAS links. */
  links?: DataSyncLinks;

  /** Response metadata. */
  meta?: DataSyncPageMeta;
};

/**
 * Paged list response envelope.
 */
type DataSyncPagedResponse<T> = {
  /** HTTP status code. */
  status: number;

  /** Array of response items. */
  data: T[];

  /** HATEOAS links for pagination. */
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
 * Internal wire format. Developers use `add`/`replace`/`remove` with dot notation instead.
 *
 * @internal
 */
export type JsonPatchOperation = {
  op: 'add' | 'remove' | 'replace';
  path: string;
  value?: unknown;
};

/**
 * Convert dot-notation path to JSON Pointer (RFC 6901).
 *
 * "config.ttlSec"           → "/config/ttlSec"
 * "filterableFields.0.name" → "/filterableFields/0/name"
 *
 * @internal
 */
export function toJsonPointer(dotPath: string): string {
  return '/' + dotPath.split('.').join('/');
}

/**
 * Convert `add`, `replace`, and `remove` parameters to JSON Patch operations (wire format).
 *
 * - Each key in `add` becomes an "add" operation.
 * - Each key in `replace` becomes a "replace" operation.
 * - Each entry in `remove` becomes a "remove" operation.
 *
 * @internal
 */
export function toJsonPatchOperations(
  add?: Record<string, unknown>,
  replace?: Record<string, unknown>,
  remove?: string[],
): JsonPatchOperation[] {
  const ops: JsonPatchOperation[] = [];

  if (add) {
    for (const [dotPath, value] of Object.entries(add)) {
      ops.push({ op: 'add', path: toJsonPointer(dotPath), value });
    }
  }

  if (replace) {
    for (const [dotPath, value] of Object.entries(replace)) {
      ops.push({ op: 'replace', path: toJsonPointer(dotPath), value });
    }
  }

  if (remove) {
    for (const dotPath of remove) {
      ops.push({ op: 'remove', path: toJsonPointer(dotPath) });
    }
  }

  return ops;
}

// --------------------------------------------------------
// ------------------- Entity Types -----------------------
// --------------------------------------------------------

/**
 * Entity properties for create requests.
 *
 * Includes `entityClass` since it must be set at creation time and is immutable afterward.
 */
export type CreateEntityProperties = {
  /** Entity class this entity belongs to. */
  entityClass: string;

  /** Version of the entity class schema. */
  entityClassVersion: number;

  /** Optional lifecycle status. */
  status?: string;

  /** User-defined JSON payload conforming to the entity class schema. */
  payload?: Record<string, unknown>;
};

/**
 * Entity properties for update (PUT) requests.
 *
 * `entityClass` is immutable after creation and therefore excluded from updates.
 */
export type UpdateEntityProperties = {
  /** Version of the entity class schema. */
  entityClassVersion: number;

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
  expiresAt?: string;
};

// ----- Entity Request Parameters -----

/**
 * Create Entity request parameters.
 */
export type CreateEntityParameters = {
  /**
   * Entity properties to create.
   *
   * All entity properties go inside `entity` because they map to the request body envelope.
   * Unlike EntityClass (where `name`/`version` are URL path params), Entity creation
   * posts to a collection URL with all fields in the body.
   */
  entity: CreateEntityProperties & {
    /**
     * Optional entity ID.
     * Server auto-generates a UUID if not provided.
     */
    id?: string;
  };

  /**
   * UUIDv4 idempotency key for safe retries.
   * Auto-generated if not provided.
   */
  idempotencyKey?: string;
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
export type GetAllEntitiesParameters = PagedRequestParameters & {
  /** Entity class name to filter by (required). */
  entityClass: string;

  /**
   * Entity class version. If not provided, the server returns entities for the latest version.
   */
  entityClassVersion?: number;

  /**
   * Advanced filter expression for complex queries.
   *
   * Supports logical operators and nested conditions for sophisticated filtering
   * beyond what the basic `filter` parameter provides.
   */
  filterAdvanced?: string;
};

/**
 * Update Entity request parameters (full replacement via PUT).
 *
 * `entityClass` is immutable after creation — only `entityClassVersion`, `status`,
 * and `payload` can be updated.
 */
export type UpdateEntityParameters = {
  /** Entity ID. */
  id: string;

  /** Complete entity properties for replacement (excludes immutable `entityClass`). */
  entity: UpdateEntityProperties;

  /**
   * ETag for optimistic concurrency control.
   * If provided, the update only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;
};

/**
 * Patch Entity request parameters (partial update via JSON Patch RFC 6902).
 *
 * Uses `add`, `replace`, and `remove` with dot-notation field paths.
 * The SDK converts these to JSON Patch operations on the wire.
 *
 * At least one of `add`, `replace`, or `remove` must be provided.
 */
export type PatchEntityParameters = {
  /** Entity ID. */
  id: string;

  /**
   * Fields to add, using dot-notation keys.
   *
   * Each key is a dot-delimited path to the target field.
   * The SDK converts these to JSON Patch "add" operations.
   *
   * @example
   * ```typescript
   * add: {
   *   'payload.tags.0': 'priority',
   *   'payload.profile.displayName': 'Alice',
   * }
   * ```
   */
  add?: Record<string, unknown>;

  /**
   * Fields to replace, using dot-notation keys.
   *
   * Each key is a dot-delimited path to the target field.
   * The SDK converts these to JSON Patch "replace" operations.
   *
   * @example
   * ```typescript
   * replace: {
   *   'status': 'active',
   *   'payload.score': 300,
   * }
   * ```
   */
  replace?: Record<string, unknown>;

  /**
   * Array of dot-notation field paths to remove.
   *
   * The SDK converts these to JSON Patch "remove" operations.
   *
   * @example
   * ```typescript
   * remove: ['payload.tempFlag', 'payload.legacyField']
   * ```
   */
  remove?: string[];

  /**
   * ETag for optimistic concurrency control.
   * If provided, the patch only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;

  /**
   * UUIDv4 idempotency key for safe retries.
   * Auto-generated if not provided.
   */
  idempotencyKey?: string;
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
export type GetAllEntitiesResponse = DataSyncPagedResponse<EntityObject>;

/** Response for updating an entity (PUT). */
export type UpdateEntityResponse = DataSyncEntityResponse<EntityObject>;

/** Response for patching an entity (PATCH). */
export type PatchEntityResponse = DataSyncEntityResponse<EntityObject>;

/** Response for removing an entity. */
export type RemoveEntityResponse = {
  /** HTTP status code. */
  status: number;
};

// --------------------------------------------------------
// --------------- Relationship Types ---------------------
// --------------------------------------------------------

/**
 * Relationship properties for create requests.
 *
 * Both `entityAId` and `entityBId` must be set at creation time.
 */
export type CreateRelationshipProperties = {
  /** First entity ID in the relationship. */
  entityAId: string;

  /** Second entity ID in the relationship. */
  entityBId: string;

  /** Relationship class this relationship belongs to. */
  relationshipClass: string;

  /** Version of the relationship class schema. */
  relationshipClassVersion: number;

  /** Optional lifecycle status. */
  status?: string;

  /** User-defined JSON payload. */
  payload?: Record<string, unknown>;
};

/**
 * Relationship properties for update (PUT) requests.
 *
 * PUT is a full replacement — `entityAId` and `entityBId` are required.
 */
export type UpdateRelationshipProperties = {
  /** First entity ID in the relationship. */
  entityAId: string;

  /** Second entity ID in the relationship. */
  entityBId: string;

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
  expiresAt?: string;
};

// ----- Relationship Request Parameters -----

/**
 * Create Relationship request parameters.
 */
export type CreateRelationshipParameters = {
  /**
   * Relationship properties to create.
   *
   * All relationship properties go inside `relationship` because they map to the request body envelope.
   */
  relationship: CreateRelationshipProperties & {
    /**
     * Optional relationship ID.
     * Server auto-generates a UUID if not provided.
     */
    id?: string;
  };

  /**
   * UUIDv4 idempotency key for safe retries.
   * Auto-generated if not provided.
   */
  idempotencyKey?: string;
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
export type GetAllRelationshipsParameters = PagedRequestParameters & {
  /** Relationship class name (required by the server). */
  relationshipClass: string;

  /** Relationship class version. */
  relationshipClassVersion?: number;

  /** Filter relationships by first entity ID. */
  entityAId?: string;

  /** Filter relationships by second entity ID. */
  entityBId?: string;

  /**
   * Advanced filter expression for complex queries.
   *
   * Supports logical operators and nested conditions for sophisticated filtering
   * beyond what the basic `filter` parameter provides.
   */
  filterAdvanced?: string;
};

/**
 * Update Relationship request parameters (full replacement via PUT).
 */
export type UpdateRelationshipParameters = {
  /** Relationship ID. */
  id: string;

  /** Complete relationship properties for replacement. */
  relationship: UpdateRelationshipProperties;

  /**
   * ETag for optimistic concurrency control.
   * If provided, the update only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;
};

/**
 * Patch Relationship request parameters (partial update via JSON Patch RFC 6902).
 *
 * Uses `add`, `replace`, and `remove` with dot-notation field paths.
 * The SDK converts these to JSON Patch operations on the wire.
 *
 * At least one of `add`, `replace`, or `remove` must be provided.
 */
export type PatchRelationshipParameters = {
  /** Relationship ID. */
  id: string;

  /**
   * Fields to add, using dot-notation keys.
   *
   * Each key is a dot-delimited path to the target field within `payload`.
   * The SDK converts these to JSON Patch "add" operations.
   *
   * @example
   * ```typescript
   * add: {
   *   'tags.0': 'mentor',
   * }
   * ```
   */
  add?: Record<string, unknown>;

  /**
   * Fields to replace, using dot-notation keys.
   *
   * Each key is a dot-delimited path to the target field within `payload`.
   * The SDK converts these to JSON Patch "replace" operations.
   *
   * @example
   * ```typescript
   * replace: {
   *   'role': 'admin',
   *   'permissions.read': true,
   * }
   * ```
   */
  replace?: Record<string, unknown>;

  /**
   * Array of dot-notation field paths to remove from `payload`.
   *
   * The SDK converts these to JSON Patch "remove" operations.
   *
   * @example
   * ```typescript
   * remove: ['tempFlag', 'legacyField']
   * ```
   */
  remove?: string[];

  /**
   * ETag for optimistic concurrency control.
   * If provided, the patch only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;

  /**
   * UUIDv4 idempotency key for safe retries.
   * Auto-generated if not provided.
   */
  idempotencyKey?: string;
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
export type GetAllRelationshipsResponse = DataSyncPagedResponse<RelationshipObject>;

/** Response for updating a relationship (PUT). */
export type UpdateRelationshipResponse = DataSyncEntityResponse<RelationshipObject>;

/** Response for patching a relationship (PATCH). */
export type PatchRelationshipResponse = DataSyncEntityResponse<RelationshipObject>;

/** Response for removing a relationship. */
export type RemoveRelationshipResponse = {
  /** HTTP status code. */
  status: number;
};

// --------------------------------------------------------
// ------------------ User Types --------------------------
// --------------------------------------------------------

/**
 * User properties for create requests.
 */
export type CreateUserProperties = {
  /** Version of the entity class schema. */
  entityClassVersion: number;

  /** Optional lifecycle status. */
  status?: string;

  /** User-defined JSON payload conforming to the entity class schema. */
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
  expiresAt?: string;
};

// ----- User Request Parameters -----

/**
 * Create User request parameters.
 */
export type CreateUserParameters = {
  /**
   * User properties to create.
   */
  user: CreateUserProperties & {
    /**
     * Optional user ID.
     * Server auto-generates a UUID if not provided.
     */
    id?: string;
  };

  /**
   * UUIDv4 idempotency key for safe retries.
   * Auto-generated if not provided.
   */
  idempotencyKey?: string;
};

/**
 * User properties for update (PUT) requests.
 */
export type UpdateUserProperties = {
  /** Version of the entity class schema. */
  entityClassVersion: number;

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
export type GetAllUsersParameters = PagedRequestParameters & {
  /**
   * Entity class version. If not provided, the server returns users for the latest version.
   */
  entityClassVersion?: number;

  /**
   * Advanced filter expression for complex queries.
   */
  filterAdvanced?: string;
};

/**
 * Update User request parameters (full replacement via PUT).
 */
export type UpdateUserParameters = {
  /** User ID. */
  id: string;

  /** Complete user properties for replacement. */
  user: UpdateUserProperties;

  /**
   * ETag for optimistic concurrency control.
   * If provided, the update only succeeds if the server's ETag matches.
   */
  ifMatchesEtag?: string;
};

/**
 * Patch User request parameters (partial update via JSON Patch RFC 6902).
 *
 * Uses `add`, `replace`, and `remove` with dot-notation field paths.
 * The SDK converts these to JSON Patch operations on the wire.
 *
 * At least one of `add`, `replace`, or `remove` must be provided.
 */
export type PatchUserParameters = {
  /** User ID. */
  id: string;

  /**
   * Fields to add, using dot-notation keys.
   * The SDK converts these to JSON Patch "add" operations.
   */
  add?: Record<string, unknown>;

  /**
   * Fields to replace, using dot-notation keys.
   * The SDK converts these to JSON Patch "replace" operations.
   */
  replace?: Record<string, unknown>;

  /**
   * Array of dot-notation field paths to remove.
   * The SDK converts these to JSON Patch "remove" operations.
   */
  remove?: string[];

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;

  /**
   * UUIDv4 idempotency key for safe retries.
   */
  idempotencyKey?: string;
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
export type GetAllUsersResponse = DataSyncPagedResponse<UserObject>;

/** Response for updating a user (PUT). */
export type UpdateUserResponse = DataSyncEntityResponse<UserObject>;

/** Response for patching a user (PATCH). */
export type PatchUserResponse = DataSyncEntityResponse<UserObject>;

/** Response for removing a user. */
export type RemoveUserResponse = {
  /** HTTP status code. */
  status: number;
};

// --------------------------------------------------------
// ----------------- Channel Types ------------------------
// --------------------------------------------------------

/**
 * Channel properties for create requests.
 */
export type CreateChannelProperties = {
  /** Version of the entity class schema. */
  entityClassVersion: number;

  /** Optional lifecycle status. */
  status?: string;

  /** User-defined JSON payload conforming to the entity class schema. */
  payload?: Record<string, unknown>;
};

/**
 * Channel properties for update (PUT) requests.
 */
export type UpdateChannelProperties = {
  /** Version of the entity class schema. */
  entityClassVersion: number;

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
  expiresAt?: string;
};

// ----- Channel Request Parameters -----

/**
 * Create Channel request parameters.
 */
export type CreateChannelParameters = {
  /**
   * Channel properties to create.
   */
  channel: CreateChannelProperties & {
    /**
     * Optional channel ID.
     * Server auto-generates a UUID if not provided.
     */
    id?: string;
  };

  /**
   * UUIDv4 idempotency key for safe retries.
   */
  idempotencyKey?: string;
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
export type GetAllChannelsParameters = PagedRequestParameters & {
  /**
   * Entity class version. If not provided, the server returns channels for the latest version.
   */
  entityClassVersion?: number;

  /**
   * Advanced filter expression for complex queries.
   */
  filterAdvanced?: string;
};

/**
 * Update Channel request parameters (full replacement via PUT).
 */
export type UpdateChannelParameters = {
  /** Channel ID. */
  id: string;

  /** Complete channel properties for replacement. */
  channel: UpdateChannelProperties;

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;
};

/**
 * Patch Channel request parameters (partial update via JSON Patch RFC 6902).
 *
 * Uses `add`, `replace`, and `remove` with dot-notation field paths.
 *
 * At least one of `add`, `replace`, or `remove` must be provided.
 */
export type PatchChannelParameters = {
  /** Channel ID. */
  id: string;

  /**
   * Fields to add, using dot-notation keys.
   * The SDK converts these to JSON Patch "add" operations.
   */
  add?: Record<string, unknown>;

  /**
   * Fields to replace, using dot-notation keys.
   * The SDK converts these to JSON Patch "replace" operations.
   */
  replace?: Record<string, unknown>;

  /**
   * Array of dot-notation field paths to remove.
   * The SDK converts these to JSON Patch "remove" operations.
   */
  remove?: string[];

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;

  /**
   * UUIDv4 idempotency key for safe retries.
   */
  idempotencyKey?: string;
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
export type GetAllChannelsResponse = DataSyncPagedResponse<ChannelObject>;

/** Response for updating a channel (PUT). */
export type UpdateChannelResponse = DataSyncEntityResponse<ChannelObject>;

/** Response for patching a channel (PATCH). */
export type PatchChannelResponse = DataSyncEntityResponse<ChannelObject>;

/** Response for removing a channel. */
export type RemoveChannelResponse = {
  /** HTTP status code. */
  status: number;
};

// --------------------------------------------------------
// ---------------- Membership Types ----------------------
// --------------------------------------------------------

/**
 * Membership properties for create requests.
 *
 * Both `userId` and `channelId` must be set at creation time.
 */
export type CreateMembershipProperties = {
  /** User ID reference. */
  userId: string;

  /** Channel ID reference. */
  channelId: string;

  /** Version of the Membership relationship class. */
  relationshipClassVersion: number;

  /** Optional lifecycle status. */
  status?: string;

  /** User-defined JSON payload. */
  payload?: Record<string, unknown>;
};

/**
 * Membership properties for update (PUT) requests.
 *
 * PUT is a full replacement — `userId` and `channelId` are required.
 */
export type UpdateMembershipProperties = {
  /** User ID reference. */
  userId: string;

  /** Channel ID reference. */
  channelId: string;

  /** Optional lifecycle status. */
  status?: string;

  /** User-defined JSON payload. */
  payload?: Record<string, unknown>;
};

/**
 * Membership resource as returned from the server.
 *
 * Note: server responses are shaped like a relationship — `entityAId` corresponds
 * to `channelId` and `entityBId` corresponds to `userId`.
 */
export type MembershipObject = {
  /** Unique identifier. */
  id: string;

  /** Channel ID (server returns this as `entityAId`). */
  entityAId: string;

  /** User ID (server returns this as `entityBId`). */
  entityBId: string;

  /** Relationship class. */
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
  expiresAt?: string;
};

// ----- Membership Request Parameters -----

/**
 * Create Membership request parameters.
 */
export type CreateMembershipParameters = {
  /**
   * Membership properties to create.
   */
  membership: CreateMembershipProperties & {
    /**
     * Optional membership ID.
     * Server auto-generates a UUID if not provided.
     */
    id?: string;
  };

  /**
   * UUIDv4 idempotency key for safe retries.
   */
  idempotencyKey?: string;
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
export type GetAllMembershipsParameters = PagedRequestParameters & {
  /** Filter memberships by user ID. */
  userId?: string;

  /** Filter memberships by channel ID. */
  channelId?: string;

  /**
   * Schema version of the relationship class.
   * If not provided, the server uses the latest version.
   */
  relationshipClassVersion?: number;

  /**
   * Advanced filter expression for complex queries.
   */
  filterAdvanced?: string;
};

/**
 * Update Membership request parameters (full replacement via PUT).
 */
export type UpdateMembershipParameters = {
  /** Membership ID. */
  id: string;

  /** Complete membership properties for replacement. */
  membership: UpdateMembershipProperties;

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;
};

/**
 * Patch Membership request parameters (partial update via JSON Patch RFC 6902).
 *
 * Uses `add`, `replace`, and `remove` with dot-notation field paths.
 *
 * At least one of `add`, `replace`, or `remove` must be provided.
 */
export type PatchMembershipParameters = {
  /** Membership ID. */
  id: string;

  /**
   * Fields to add, using dot-notation keys.
   * The SDK converts these to JSON Patch "add" operations.
   */
  add?: Record<string, unknown>;

  /**
   * Fields to replace, using dot-notation keys.
   * The SDK converts these to JSON Patch "replace" operations.
   */
  replace?: Record<string, unknown>;

  /**
   * Array of dot-notation field paths to remove.
   * The SDK converts these to JSON Patch "remove" operations.
   */
  remove?: string[];

  /**
   * ETag for optimistic concurrency control.
   */
  ifMatchesEtag?: string;

  /**
   * UUIDv4 idempotency key for safe retries.
   */
  idempotencyKey?: string;
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
export type GetAllMembershipsResponse = DataSyncPagedResponse<MembershipObject>;

/** Response for updating a membership (PUT). */
export type UpdateMembershipResponse = DataSyncEntityResponse<MembershipObject>;

/** Response for patching a membership (PATCH). */
export type PatchMembershipResponse = DataSyncEntityResponse<MembershipObject>;

/** Response for removing a membership. */
export type RemoveMembershipResponse = {
  /** HTTP status code. */
  status: number;
};
