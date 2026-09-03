/**
 * PAM Grant Token REST API module.
 *
 * @internal
 */

import { TransportResponse } from '../../types/transport-response';
import { TransportMethod } from '../../types/transport-request';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import * as PAM from '../../types/api/access-manager';
import { KeySet } from '../../types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = (PAM.GrantTokenParameters | PAM.ObjectsGrantTokenParameters) & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};

/**
 * Permissions group payload.
 *
 * User can configure permissions per-resource or per-resource which match RegExp.
 */
type PermissionPayload = {
  /**
   * Object containing `uuid` metadata permissions.
   */
  uuids?: Record<string, number>;

  /**
   * Object containing `user` permissions.
   */
  users?: Record<string, number>;

  /**
   * Object containing `channel` permissions.
   */
  channels?: Record<string, number>;

  /**
   * Object containing `channel group` permissions.
   */
  groups?: Record<string, number>;

  /**
   * Object containing DataSync `entity` permissions.
   */
  'datasync:entities'?: Record<string, number>;

  /**
   * Object containing DataSync `relationship` permissions.
   */
  'datasync:relationships'?: Record<string, number>;

  /**
   * Object containing DataSync `membership` permissions.
   */
  'datasync:memberships'?: Record<string, number>;

  /**
   * Extra metadata to be published with the request.
   *
   * **Important:** Values must be scalar only; `arrays` or `objects` aren't supported.
   */
  meta?: PAM.Metadata;
};

/**
 * Encoded DataSync projections payload, stored under the `pn-projections` meta key.
 */
type ProjectionsPayload = Record<'res' | 'pat', Record<string, string>>;

/**
 * Wire-level `meta` section.
 *
 * Holds user-supplied scalar metadata plus the SDK-injected `pn-projections` object.
 */
type MetaPayload = Record<string, PAM.Metadata[string] | ProjectionsPayload>;

/**
 * Service success response.
 */
type ServiceResponse = {
  /**
   * Request result status code.
   */
  status: number;

  /**
   * Request processing result data.
   */
  data: {
    /**
     * Permissions token grant human-readable result.
     */
    message: string;

    /**
     * Generate token with requested permissions.
     */
    token: string;
  };

  /**
   * Name of the service which provided response.
   */
  service: string;
};
// endregion

/**
 * Grant token permissions request.
 *
 * @internal
 */
export class GrantTokenRequest extends AbstractRequest<PAM.GrantTokenResponse, ServiceResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.POST });

    // Apply defaults.
    this.parameters.resources ??= {};
    this.parameters.patterns ??= {};
  }

  operation(): RequestOperation {
    return RequestOperation.PNAccessManagerGrantToken;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey, publishKey, secretKey },
      resources,
      patterns,
    } = this.parameters;

    // DataSync projections are a standalone grant target — a request carrying only projections
    // (no resources / patterns permissions) is still valid.
    const hasProjections = this.buildProjections() !== undefined;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (!publishKey) return 'Missing Publish Key';
    if (!secretKey) return 'Missing Secret Key';
    if (!resources && !patterns && !hasProjections) return 'Missing either Resources or Patterns';

    // A grant may not carry two synonyms for the same target: `users` / `uuids` both map to the
    // uuid wire scope, `spaces` / `channels` both map to the channel wire scope, and
    // `authorizedUserId` / `authorized_uuid` both name the principal. Everything else combines
    // freely, so a single token can grant DataSync `users`, `channels`, `groups`, and `dataSync`
    // together. `uuids` / `spaces` / `authorized_uuid` are the deprecated App Context terminology;
    // prefer `users` / `channels` / `authorizedUserId`.
    const hasScope = (scope: string) =>
      scope in (this.parameters.resources ?? {}) || scope in (this.parameters.patterns ?? {});

    if (hasScope('users') && hasScope('uuids'))
      return 'Cannot mix `users` with `uuids` — `uuids` is deprecated App Context terminology; use `users`';
    if (hasScope('spaces') && hasScope('channels'))
      return 'Cannot mix `spaces` with `channels` — `spaces` is deprecated terminology; use `channels`';
    if ('authorizedUserId' in this.parameters && 'authorized_uuid' in this.parameters)
      return 'Cannot mix `authorizedUserId` with `authorized_uuid` — use `authorizedUserId`';

    let permissionsEmpty = true;
    [this.parameters.resources, this.parameters.patterns].forEach((refPerm) => {
      Object.keys(refPerm ?? {}).forEach((scope) => {
        // @ts-expect-error Permissions with backward compatibility.
        if (refPerm && permissionsEmpty && Object.keys(refPerm[scope] ?? {}).length > 0) {
          permissionsEmpty = false;
        }
      });
    });

    if (permissionsEmpty && !hasProjections) return 'Missing values for either Resources or Patterns';
  }

  async parse(response: TransportResponse): Promise<PAM.GrantTokenResponse> {
    return this.deserializeResponse(response).data.token;
  }

  protected get path(): string {
    return `/v3/pam/${this.parameters.keySet.subscribeKey}/grant`;
  }

  protected get headers(): Record<string, string> | undefined {
    return { ...(super.headers ?? {}), 'Content-Type': 'application/json' };
  }

  protected get body(): string {
    const { ttl, meta } = this.parameters;
    const body: Record<string, unknown> = { ...(ttl || ttl === 0 ? { ttl } : {}) };
    // `authorizedUserId` is the preferred User-terminology principal; `authorized_uuid` is the
    // legacy App Context name. Either binds the token to a single principal.
    const uuid =
      ('authorizedUserId' in this.parameters ? this.parameters.authorizedUserId : undefined) ??
      ('authorized_uuid' in this.parameters ? this.parameters.authorized_uuid : undefined);

    const permissions: Record<string, MetaPayload | string | Record<string, PermissionPayload>> = {};
    const resourcePermissions: PermissionPayload = {};
    const patternPermissions: PermissionPayload = {};
    const mapPermissions = (
      name: string,
      permissionBit: number,
      type: keyof PermissionPayload,
      permissions: PermissionPayload,
    ) => {
      if (!permissions[type]) permissions[type] = {};
      permissions[type]![name] = permissionBit;
    };

    const { resources, patterns } = this.parameters;
    [resources, patterns].forEach((refPerm, idx) => {
      const target = idx === 0 ? resourcePermissions : patternPermissions;
      let channelsPermissions: Record<string, PAM.ChannelTokenPermissions> = {};
      let channelGroupsPermissions: Record<string, PAM.ChannelGroupTokenPermissions> = {};
      let uuidsPermissions: Record<string, PAM.UuidTokenPermissions> = {};
      let usersPermissions: Record<string, PAM.UserTokenPermissions> = {};

      if (!target.channels) target.channels = {};
      if (!target.groups) target.groups = {};
      if (!target.uuids) target.uuids = {};
      if (!target.users) target.users = {};
      // @ts-expect-error Not used, needed for api backward compatibility
      if (!target.spaces) target.spaces = {};

      if (refPerm) {
        // `spaces` (deprecated) still collapses onto the channel wire scope. `users` and `uuids`
        // are distinct wire keys: `users` maps to `users`, `uuids` maps to `uuids`. Validation
        // already rejects providing both members of a synonym pair. `spaces` is read intentionally
        // as the legacy fallback for channels.
        const legacyRefPerm = refPerm as {
          channels?: Record<string, PAM.ChannelTokenPermissions>;
          groups?: Record<string, PAM.ChannelGroupTokenPermissions>;
          uuids?: Record<string, PAM.UuidTokenPermissions>;
          users?: Record<string, PAM.UserTokenPermissions>;
          spaces?: Record<string, PAM.ChannelTokenPermissions>;
        };
        channelsPermissions =
          'channels' in legacyRefPerm
            ? (legacyRefPerm.channels ?? {})
            : 'spaces' in legacyRefPerm
              ? (legacyRefPerm.spaces ?? {})
              : {};
        channelGroupsPermissions = 'groups' in legacyRefPerm ? (legacyRefPerm.groups ?? {}) : {};
        uuidsPermissions = 'uuids' in legacyRefPerm ? (legacyRefPerm.uuids ?? {}) : {};
        usersPermissions = 'users' in legacyRefPerm ? (legacyRefPerm.users ?? {}) : {};
      }

      Object.keys(channelsPermissions).forEach((channel) =>
        mapPermissions(channel, this.extractPermissions(channelsPermissions[channel]), 'channels', target),
      );

      Object.keys(channelGroupsPermissions).forEach((groups) =>
        mapPermissions(groups, this.extractPermissions(channelGroupsPermissions[groups]), 'groups', target),
      );

      Object.keys(uuidsPermissions).forEach((uuids) =>
        mapPermissions(uuids, this.extractPermissions(uuidsPermissions[uuids]), 'uuids', target),
      );

      Object.keys(usersPermissions).forEach((users) =>
        mapPermissions(users, this.extractPermissions(usersPermissions[users]), 'users', target),
      );

      if (refPerm && 'dataSync' in refPerm) this.mapDataSyncPermissions(refPerm.dataSync, target, mapPermissions);
    });

    if (uuid) permissions.uuid = `${uuid}`;
    permissions.resources = resourcePermissions;
    permissions.patterns = patternPermissions;

    // Merge DataSync projections into `meta` under `pn-projections`, preserving user-supplied meta.
    // `pn-projections` is omitted entirely when no projections are set.
    const projections = this.buildProjections();
    permissions.meta = { ...(meta ?? {}), ...(projections ? { 'pn-projections': projections } : {}) };
    body.permissions = permissions;

    return JSON.stringify(body);
  }

  /**
   * Serialize DataSync entity-level permissions into a resources / patterns target.
   *
   * The `datasync:*` wire keys are only written when their scope map is non-empty, so tokens that
   * don't use DataSync stay byte-for-byte identical.
   *
   * @param dataSync - User provided DataSync permission scopes.
   * @param target - Resources or patterns payload to populate.
   * @param mapPermissions - Helper which writes a single bit-encoded permission into the target.
   */
  private mapDataSyncPermissions(
    dataSync: PAM.DataSyncTokenScopes | undefined,
    target: PermissionPayload,
    mapPermissions: (
      name: string,
      permissionBit: number,
      type: keyof PermissionPayload,
      target: PermissionPayload,
    ) => void,
  ) {
    if (!dataSync) return;

    const dataSyncScopes: [keyof PAM.DataSyncTokenScopes, keyof PermissionPayload][] = [
      ['entities', 'datasync:entities'],
      ['relationships', 'datasync:relationships'],
      ['memberships', 'datasync:memberships'],
    ];

    dataSyncScopes.forEach(([scope, wireKey]) => {
      const scopePermissions = dataSync[scope];
      if (!scopePermissions) return;

      Object.keys(scopePermissions).forEach((id) =>
        mapPermissions(id, this.extractPermissions(scopePermissions[id]), wireKey, target),
      );
    });
  }

  /**
   * Build the `pn-projections` meta payload from DataSync projection parameters.
   *
   * Each projection scope is encoded into a flat composite key (`datasync:<type>:<id>`) mapped to
   * the projection name. Every DataSync resource kind uses the `datasync:` prefix here — including
   * `users` and `channels`, whose *permissions* are carried by the un-prefixed grant scopes. The
   * `res` / `pat` sub-objects are omitted when empty.
   *
   * @returns Encoded projections payload, or `undefined` when no projections are set.
   */
  private buildProjections(): ProjectionsPayload | undefined {
    const projections = 'dataSyncProjections' in this.parameters ? this.parameters.dataSyncProjections : undefined;
    if (!projections) return undefined;

    const encodeScope = (scope?: PAM.DataSyncProjectionScope) => {
      const encoded: Record<string, string> = {};
      if (!scope) return encoded;

      (['entities', 'relationships', 'users', 'channels', 'memberships'] as const).forEach((type) => {
        const assignments = scope[type];
        if (assignments)
          Object.keys(assignments).forEach((id) => (encoded[`datasync:${type}:${id}`] = assignments[id]));
      });

      return encoded;
    };

    const result = {} as ProjectionsPayload;
    const res = encodeScope(projections.resources);
    const pat = encodeScope(projections.patterns);
    if (Object.keys(res).length > 0) result.res = res;
    if (Object.keys(pat).length > 0) result.pat = pat;

    return Object.keys(result).length > 0 ? result : undefined;
  }

  /**
   * Extract permissions bit from permission configuration object.
   *
   * @param permissions - User provided scope-based permissions.
   *
   * @returns Permissions bit.
   */
  private extractPermissions(
    permissions:
      | PAM.UuidTokenPermissions
      | PAM.ChannelTokenPermissions
      | PAM.ChannelGroupTokenPermissions
      | PAM.DataSyncTokenPermissions,
  ): number {
    let permissionsResult = 0;

    if ('join' in permissions && permissions.join) permissionsResult |= 128;
    if ('update' in permissions && permissions.update) permissionsResult |= 64;
    if ('get' in permissions && permissions.get) permissionsResult |= 32;
    if ('create' in permissions && permissions.create) permissionsResult |= 16;
    if ('delete' in permissions && permissions.delete) permissionsResult |= 8;
    if ('manage' in permissions && permissions.manage) permissionsResult |= 4;
    if ('write' in permissions && permissions.write) permissionsResult |= 2;
    if ('read' in permissions && permissions.read) permissionsResult |= 1;

    return permissionsResult;
  }
}
