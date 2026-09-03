// region Grant token
import { Payload } from './index';

/**
 * Metadata which will be associated with access token.
 */
export type Metadata = Record<string, string | number | boolean | null>;

/**
 * Channel-specific token permissions.
 */
export type ChannelTokenPermissions = {
  /**
   * Whether `read` operations are permitted for corresponding level or not.
   */
  read?: boolean;

  /**
   * Whether `write` operations are permitted for corresponding level or not.
   */
  write?: boolean;

  /**
   * Whether `create` operations are permitted for corresponding level or not.
   *
   * Used by DataSync `Channel` grants (a DataSync Channel is an entity, granted through the reused
   * `channels` scope). Ignored for classic messaging channels.
   */
  create?: boolean;

  /**
   * Whether `get` operations are permitted for corresponding level or not.
   */
  get?: boolean;

  /**
   * Whether `manage` operations are permitted for corresponding level or not.
   */
  manage?: boolean;

  /**
   * Whether `update` operations are permitted for corresponding level or not.
   */
  update?: boolean;

  /**
   * Whether `join` operations are permitted for corresponding level or not.
   */
  join?: boolean;

  /**
   * Whether `delete` operations are permitted for corresponding level or not.
   */
  delete?: boolean;
};

/**
 * Space-specific token permissions.
 */
type SpaceTokenPermissions = ChannelTokenPermissions;

/**
 * Channel group-specific token permissions.
 */
export type ChannelGroupTokenPermissions = {
  /**
   * Whether `read` operations are permitted for corresponding level or not.
   */
  read?: boolean;

  /**
   * Whether `manage` operations are permitted for corresponding level or not.
   */
  manage?: boolean;
};

/**
 * Uuid-specific token permissions.
 */
export type UuidTokenPermissions = {
  /**
   * Whether `create` operations are permitted for corresponding level or not.
   *
   * Used by DataSync `User` grants (a DataSync User is an entity, granted through the reused
   * `users` / `uuids` scope). Ignored for App Context UUID-metadata grants.
   */
  create?: boolean;

  /**
   * Whether `get` operations are permitted for corresponding level or not.
   */
  get?: boolean;

  /**
   * Whether `update` operations are permitted for corresponding level or not.
   */
  update?: boolean;

  /**
   * Whether `delete` operations are permitted for corresponding level or not.
   */
  delete?: boolean;
};

/**
 * User-specific token permissions.
 *
 * DataSync `User` resources only support the CRUD operations; `read` / `write` / `manage` / `join`
 * remain classic messaging concepts and are intentionally not part of this type.
 */
export type UserTokenPermissions = {
  /**
   * Whether `create` operations are permitted for corresponding level or not.
   */
  create?: boolean;

  /**
   * Whether `get` operations are permitted for corresponding level or not.
   */
  get?: boolean;

  /**
   * Whether `update` operations are permitted for corresponding level or not.
   */
  update?: boolean;

  /**
   * Whether `delete` operations are permitted for corresponding level or not.
   */
  delete?: boolean;
};

/**
 * DataSync entity-level token permissions.
 *
 * Applies to DataSync entities, relationships, and memberships. Only the CRUD-relevant operations
 * are exposed.
 */
export type DataSyncTokenPermissions = {
  /**
   * Whether `create` operations are permitted for corresponding level or not.
   */
  create?: boolean;

  /**
   * Whether `get` operations are permitted for corresponding level or not.
   */
  get?: boolean;

  /**
   * Whether `update` operations are permitted for corresponding level or not.
   */
  update?: boolean;

  /**
   * Whether `delete` operations are permitted for corresponding level or not.
   */
  delete?: boolean;
};

/**
 * DataSync permission scopes.
 *
 * Carried in the grant token `resources` / `patterns` sections and serialized to the wire keys
 * `datasync:entities` / `datasync:relationships` / `datasync:memberships`.
 */
export type DataSyncTokenScopes = {
  /**
   * Object containing DataSync `entity` permissions.
   *
   * Keys are concrete entity ids (e.g. `order-456`) for `resources` or RegEx patterns
   * (e.g. `order-*`) for `patterns`.
   */
  entities?: Record<string, DataSyncTokenPermissions>;

  /**
   * Object containing DataSync `relationship` permissions.
   *
   * Keys are composite relationship ids (e.g. `user.A:channel.X`).
   */
  relationships?: Record<string, DataSyncTokenPermissions>;

  /**
   * Object containing DataSync `membership` permissions.
   *
   * Keys are composite membership ids (e.g. `user-123:channel-X`).
   */
  memberships?: Record<string, DataSyncTokenPermissions>;
};

/**
 * Per-resource DataSync projection assignment.
 *
 * Each id maps to the single projection name the principal is "looking through" for that resource
 * (use `__default__` for the base projection).
 *
 * Covers every DataSync resource kind — entities, relationships, users, channels, and memberships.
 */
export type DataSyncProjectionScope = {
  /**
   * Entity id -> projection name.
   *
   * Keys are concrete entity ids (e.g. `user.A`) for `resources` or RegEx patterns
   * (e.g. `user.*`) for `patterns`.
   */
  entities?: Record<string, string>;

  /**
   * Relationship id -> projection name.
   */
  relationships?: Record<string, string>;

  /**
   * DataSync `User` id -> projection name.
   *
   * Projections for DataSync Users are keyed by `datasync:users:<id>` on the wire, unlike the
   * `User` *permissions*, which reuse the un-prefixed `users` grant scope.
   */
  users?: Record<string, string>;

  /**
   * DataSync `Channel` id -> projection name.
   *
   * Projections for DataSync Channels are keyed by `datasync:channels:<id>` on the wire, unlike the
   * `Channel` *permissions*, which reuse the un-prefixed `channels` grant scope.
   */
  channels?: Record<string, string>;

  /**
   * Membership id -> projection name.
   */
  memberships?: Record<string, string>;
};

/**
 * DataSync projection permissions for grant token requests.
 *
 * Encoded into the `pn-projections` key within the token's `meta` section. Exact (`res`) match
 * takes priority over pattern (`pat`) match.
 */
export type DataSyncProjections = {
  /**
   * Projection assignments for concrete resources.
   */
  resources?: DataSyncProjectionScope;

  /**
   * Projection assignments for resources which match a RegEx pattern.
   */
  patterns?: DataSyncProjectionScope;
};

/**
 * Generate access token with permissions.
 *
 * Generate time-limited access token with required permissions for App Context objects.
 */
export type ObjectsGrantTokenParameters = {
  /**
   * Total number of minutes for which the token is valid.
   *
   * The minimum allowed value is `1`.
   * The maximum is `43,200` minutes (`30` days).
   */
  ttl: number;

  /**
   * Object containing resource permissions.
   */
  resources?: {
    /**
     * Object containing `spaces` metadata permissions.
     */
    spaces?: Record<string, SpaceTokenPermissions>;

    /**
     * Object containing `users` permissions.
     */
    users?: Record<string, UserTokenPermissions>;
  };

  /**
   * Object containing permissions to multiple resources specified by a RegEx pattern.
   */
  patterns?: {
    /**
     * Object containing `spaces` metadata permissions.
     */
    spaces?: Record<string, SpaceTokenPermissions>;

    /**
     * Object containing `users` permissions.
     */
    users?: Record<string, UserTokenPermissions>;
  };

  /**
   * Extra metadata to be published with the request.
   *
   * **Important:** Values must be scalar only; `arrays` or `objects` aren't supported.
   */
  meta?: Metadata;

  /**
   * Single `userId` which is authorized to use the token to make API requests to PubNub.
   */
  authorizedUserId?: string;
};

/**
 * Grant scopes which may appear in both the `resources` and `patterns` sections.
 *
 * Keys are concrete resource ids for `resources` and RegEx patterns for `patterns`.
 */
type CommonGrantScopes = {
  /**
   * Object containing `channel` permissions.
   */
  channels?: Record<string, ChannelTokenPermissions>;

  /**
   * Object containing `channel group` permissions.
   */
  groups?: Record<string, ChannelGroupTokenPermissions>;

  /**
   * Object containing DataSync entity-level permissions.
   */
  dataSync?: DataSyncTokenScopes;
};

/**
 * Principal grant scope.
 *
 * `users` and `uuids` name the same underlying target, so only one of them may be supplied in a
 * single grant — providing both is a compile-time error (and is rejected at runtime as well).
 */
type PrincipalGrantScopes =
  | {
      /**
       * Object containing `user` permissions.
       *
       * Preferred DataSync terminology for granting permissions on `User` resources (create / get /
       * update / delete). May be combined with `channels`, `groups`, and `dataSync` in a single
       * grant, but not with the deprecated {@link PrincipalGrantScopes.uuids | uuids} scope.
       */
      users?: Record<string, UserTokenPermissions>;

      uuids?: never;
    }
  | {
      /**
       * Object containing `uuid` metadata permissions.
       *
       * @deprecated Legacy App Context terminology. For DataSync `User` grants prefer `users`.
       * `uuids` remains for App Context UUID-metadata permissions.
       */
      uuids?: Record<string, UuidTokenPermissions>;

      users?: never;
    };

/**
 * Permission scopes accepted by the `resources` and `patterns` sections of a grant.
 */
export type GrantScopes = CommonGrantScopes & PrincipalGrantScopes;

/**
 * Generate token with permissions.
 *
 * Generate time-limited access token with required permissions for resources.
 */
export type GrantTokenParameters = {
  /**
   * Total number of minutes for which the token is valid.
   *
   * The minimum allowed value is `1`.
   * The maximum is `43,200` minutes (`30` days).
   */
  ttl: number;

  /**
   * Object containing resource permissions.
   *
   * Keys within each scope are concrete resource ids. `users` and `uuids` are mutually exclusive.
   */
  resources?: GrantScopes;

  /**
   * Object containing permissions to multiple resources specified by a RegEx pattern.
   *
   * Keys within each scope are RegEx patterns. `users` and `uuids` are mutually exclusive.
   */
  patterns?: GrantScopes;

  /**
   * Extra metadata to be published with the request.
   *
   * **Important:** Values must be scalar only; `arrays` or `objects` aren't supported.
   */
  meta?: Metadata;

  /**
   * DataSync projection permissions.
   *
   * Encoded into the `pn-projections` key within the token's `meta` section.
   */
  dataSyncProjections?: DataSyncProjections;

  /**
   * Single `uuid` which is authorized to use the token to make API requests to PubNub.
   */
  authorized_uuid?: string;
};

/**
 * Response with generated access token.
 */
export type GrantTokenResponse = string;
// endregion

// region Revoke
/**
 * Access token for which permissions should be revoked.
 */
export type RevokeParameters = string;

/**
 * Response with revoked access token.
 */
export type RevokeTokenResponse = Record<string, unknown>;
// endregion

// --------------------------------------------------------
// -------------------- Token parse -----------------------
// --------------------------------------------------------
// region Parsed token

/**
 * Decoded access token representation.
 */
export type Token = {
  /**
   * Token version.
   */
  version: number;

  /**
   * Token generation date time.
   */
  timestamp: number;

  /**
   * Maximum duration (in minutes) during which token will be valid.
   */
  ttl: number;

  /**
   * Permissions granted to specific resources.
   */
  resources?: Partial<Record<'channels' | 'groups' | 'uuids', Record<string, Permissions | undefined>>> & {
    /**
     * Permissions granted to specific `User` resources through the `users` scope.
     */
    users?: Record<string, UserScopePermissions | undefined>;

    /**
     * DataSync entity-level permissions granted to specific resources.
     */
    dataSync?: DataSyncScopePermissions;
  };

  /**
   * Permissions granted to resources which match specified regular expression.
   */
  patterns?: Partial<Record<'channels' | 'groups' | 'uuids', Record<string, Permissions | undefined>>> & {
    /**
     * Permissions granted through the `users` scope to `User` resources which match specified
     * regular expression.
     */
    users?: Record<string, UserScopePermissions | undefined>;

    /**
     * DataSync entity-level permissions granted to resources which match specified regular expression.
     */
    dataSync?: DataSyncScopePermissions;
  };

  /**
   * The uuid that is exclusively authorized to use this token to make API requests.
   */
  authorized_uuid?: string;

  /**
   * PAM token content signature.
   */
  signature: ArrayBuffer;

  /**
   * Additional information which has been added to the token.
   */
  meta?: Payload;
};

/**
 * Granted resource permissions.
 *
 * **Note:** Following operations doesn't require any permissions:
 * - unsubscribe from channel / channel group
 * - where now
 */
export type Permissions = {
  /**
   * Resource read permission.
   *
   * Read permission required for:
   * - subscribe to channel / channel group (including presence versions `-pnpres`)
   * - here now
   * - get presence state
   * - set presence state
   * - fetch history
   * - fetch messages count
   * - list shared files
   * - download shared file
   * - enable / disable push notifications
   * - get message actions
   * - get history with message actions
   */
  read: boolean;

  /**
   * Resource write permission.
   *
   * Write permission required for:
   * - publish message / signal
   * - share file
   * - add message actions
   */
  write: boolean;

  /**
   * Resource manage permission.
   *
   * Manage permission required for:
   * - add / remove channels to / from the channel group
   * - list channels in group
   * - remove channel group
   * - set / remove channel members
   */
  manage: boolean;

  /**
   * Resource delete permission.
   *
   * Delete permission required for:
   * - delete messages from history
   * - delete shared file
   * - delete user metadata
   * - delete channel metadata
   * - remove message action
   */
  delete: boolean;

  /**
   * Resource get permission.
   *
   * Get permission required for:
   * - get user metadata
   * - get channel metadata
   * - get channel members
   */
  get: boolean;

  /**
   * Resource update permission.
   *
   * Update permissions required for:
   * - set user metadata
   * - set channel metadata
   * - set / remove user membership
   */
  update: boolean;

  /**
   * Resource `join` permission.
   *
   * `Join` permission required for:
   * - set / remove channel members
   */
  join: boolean;
};

/**
 * Granted `User` scope permissions.
 *
 * Decoded from the token `res` / `pat` wire key `usr`, which backs the `users` grant scope. Mirrors
 * {@link UserTokenPermissions}: only the CRUD-relevant operations apply, so `read` / `write` /
 * `manage` / `join` are intentionally not part of this type.
 */
export type UserScopePermissions = {
  /**
   * Resource `create` permission.
   */
  create: boolean;

  /**
   * Resource `get` permission.
   */
  get: boolean;

  /**
   * Resource `update` permission.
   */
  update: boolean;

  /**
   * Resource `delete` permission.
   */
  delete: boolean;
};

/**
 * Granted DataSync entity-level permissions.
 *
 * Applies to parsed DataSync entities, relationships, and memberships. Only the CRUD-relevant
 * operations are exposed.
 */
export type DataSyncPermissions = {
  /**
   * Resource `create` permission.
   */
  create: boolean;

  /**
   * Resource `get` permission.
   */
  get: boolean;

  /**
   * Resource `update` permission.
   */
  update: boolean;

  /**
   * Resource `delete` permission.
   */
  delete: boolean;
};

/**
 * Parsed DataSync permission scopes.
 *
 * Decoded from the token `res` / `pat` wire keys `datasync:entities` / `datasync:relationships` /
 * `datasync:memberships`.
 */
export type DataSyncScopePermissions = {
  /**
   * DataSync `entity` permissions keyed by concrete entity id or RegEx pattern.
   */
  entities?: Record<string, DataSyncPermissions | undefined>;

  /**
   * DataSync `relationship` permissions keyed by composite relationship id or RegEx pattern.
   */
  relationships?: Record<string, DataSyncPermissions | undefined>;

  /**
   * DataSync `membership` permissions keyed by composite membership id or RegEx pattern.
   */
  memberships?: Record<string, DataSyncPermissions | undefined>;
};

// endregion

// --------------------------------------------------------
// --------------------- Deprecated -----------------------
// --------------------------------------------------------
// region Deprecated

/**
 * Channel-specific permissions.
 *
 * Permissions include objects to the App Context Channel object as well.
 */
type ChannelPermissions = {
  /**
   * Whether `read` operations are permitted for corresponding level or not.
   */
  r?: 0 | 1;

  /**
   * Whether `write` operations are permitted for corresponding level or not.
   */
  w?: 0 | 1;

  /**
   * Whether `delete` operations are permitted for corresponding level or not.
   */
  d?: 0 | 1;

  /**
   * Whether `get` operations are permitted for corresponding level or not.
   */
  g?: 0 | 1;

  /**
   * Whether `update` operations are permitted for corresponding level or not.
   */
  u?: 0 | 1;

  /**
   * Whether `manage` operations are permitted for corresponding level or not.
   */
  m?: 0 | 1;

  /**
   * Whether `join` operations are permitted for corresponding level or not.
   */
  j?: 0 | 1;

  /**
   * Duration for which permissions has been granted.
   */
  ttl?: number;
};

/**
 * Channel group-specific permissions.
 */
type ChannelGroupPermissions = {
  /**
   * Whether `read` operations are permitted for corresponding level or not.
   */
  r?: 0 | 1;

  /**
   * Whether `manage` operations are permitted for corresponding level or not.
   */
  m?: 0 | 1;

  /**
   * Duration for which permissions has been granted.
   */
  ttl?: number;
};

/**
 * App Context User-specific permissions.
 */
type UserPermissions = {
  /**
   * Whether `get` operations are permitted for corresponding level or not.
   */
  g?: 0 | 1;

  /**
   * Whether `update` operations are permitted for corresponding level or not.
   */
  u?: 0 | 1;

  /**
   * Whether `delete` operations are permitted for corresponding level or not.
   */
  d?: 0 | 1;

  /**
   * Duration for which permissions has been granted.
   */
  ttl?: number;
};

/**
 * Common permissions audit response content.
 */
type BaseAuditResponse<
  Level extends 'channel' | 'channel+auth' | 'channel-group' | 'channel-group+auth' | 'user' | 'subkey',
> = {
  /**
   * Permissions level.
   */
  level: Level;

  /**
   * Subscription key at which permissions has been granted.
   */
  subscribe_key: string;

  /**
   * Duration for which permissions has been granted.
   */
  ttl?: number;
};

/**
 * Auth keys permissions for specified `level`.
 */
type AuthKeysPermissions<LevelPermissions> = {
  /**
   * Auth keys-based permissions for specified `level` permission.
   */
  auths: Record<string, LevelPermissions>;
};

/**
 * Single channel permissions audit result.
 */
type ChannelPermissionsResponse = BaseAuditResponse<'channel+auth'> & {
  /**
   * Name of channel for which permissions audited.
   */
  channel: string;
} & AuthKeysPermissions<ChannelPermissions>;

/**
 * Multiple channels permissions audit result.
 */
type ChannelsPermissionsResponse = BaseAuditResponse<'channel'> & {
  /**
   * Per-channel permissions.
   */
  channels: Record<string, ChannelPermissions & AuthKeysPermissions<ChannelPermissions>>;
};

/**
 * Single channel group permissions result.
 */
type ChannelGroupPermissionsResponse = BaseAuditResponse<'channel-group+auth'> & {
  /**
   * Name of channel group for which permissions audited.
   */
  'channel-group': string;
} & AuthKeysPermissions<ChannelGroupPermissions>;

/**
 * Multiple channel groups permissions audit result.
 */
type ChannelGroupsPermissionsResponse = BaseAuditResponse<'channel'> & {
  /**
   * Per-channel group permissions.
   */
  'channel-groups': Record<string, ChannelGroupPermissions & AuthKeysPermissions<ChannelGroupPermissions>>;
};

/**
 * App Context User permissions audit result.
 */
type UserPermissionsResponse = BaseAuditResponse<'user'> & {
  /**
   * Name of channel for which `user` permissions audited.
   */
  channel: string;
} & AuthKeysPermissions<UserPermissions>;

/**
 * Global sub-key level permissions audit result.
 */
type SubKeyPermissionsResponse = BaseAuditResponse<'subkey'> & {
  /**
   * Per-channel permissions.
   */
  channels: Record<string, ChannelPermissions & AuthKeysPermissions<ChannelPermissions>>;

  /**
   * Per-channel group permissions.
   */
  'channel-groups': Record<string, ChannelGroupPermissions & AuthKeysPermissions<ChannelGroupPermissions>>;

  /**
   * Per-object permissions.
   */
  objects: Record<string, UserPermissions & AuthKeysPermissions<UserPermissions>>;
};

/**
 * Response with permission information.
 */
export type PermissionsResponse =
  | ChannelPermissionsResponse
  | ChannelsPermissionsResponse
  | ChannelGroupPermissionsResponse
  | ChannelGroupsPermissionsResponse
  | UserPermissionsResponse
  | SubKeyPermissionsResponse;

// region Audit
/**
 * Audit permissions for provided auth keys / global permissions.
 *
 * Audit permissions on specific channel and / or channel group for the set of auth keys.
 */
export type AuditParameters = {
  /**
   * Name of channel for which channel-based permissions should be checked for {@link authKeys}.
   */
  channel?: string;

  /**
   * Name of channel group for which channel group-based permissions should be checked for {@link authKeys}.
   */
  channelGroup?: string;

  /**
   * List of auth keys for which permissions should be checked.
   *
   * Leave this empty to check channel / group -based permissions or global permissions.
   *
   * @default `[]`
   */
  authKeys?: string[];
};
// endregion

// region Grant
/**
 * Grant permissions for provided auth keys / global permissions.
 *
 * Grant permissions on specific channel and / or channel group for the set of auth keys.
 */
export type GrantParameters = {
  /**
   * List of channels for which permissions should be granted.
   */
  channels?: string[];

  /**
   * List of channel groups for which permissions should be granted.
   */
  channelGroups?: string[];

  /**
   * List of App Context UUID for which permissions should be granted.
   */
  uuids?: string[];

  /**
   * List of auth keys for which permissions should be granted on specified objects.
   *
   * Leave this empty to grant channel / group -based permissions or global permissions.
   */
  authKeys?: string[];

  /**
   * Whether `read` operations are permitted for corresponding level or not.
   *
   * @default `false`
   */
  read?: boolean;

  /**
   * Whether `write` operations are permitted for corresponding level or not.
   *
   * @default `false`
   */
  write?: boolean;

  /**
   * Whether `delete` operations are permitted for corresponding level or not.
   *
   * @default `false`
   */
  delete?: boolean;

  /**
   * Whether `get` operations are permitted for corresponding level or not.
   *
   * @default `false`
   */
  get?: boolean;

  /**
   * Whether `update` operations are permitted for corresponding level or not.
   *
   * @default `false`
   */
  update?: boolean;

  /**
   * Whether `manage` operations are permitted for corresponding level or not.
   *
   * @default `false`
   */
  manage?: boolean;

  /**
   * Whether `join` operations are permitted for corresponding level or not.
   *
   * @default `false`
   */
  join?: boolean;

  /**
   * For how long permissions should be effective (in minutes).
   *
   * @default `1440`
   */
  ttl?: number;
};
// endregion

// endregion
