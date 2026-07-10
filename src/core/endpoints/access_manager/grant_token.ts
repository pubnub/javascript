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

    if (
      this.isVspPermissions(this.parameters) &&
      ('channels' in (this.parameters.resources ?? {}) ||
        'uuids' in (this.parameters.resources ?? {}) ||
        'groups' in (this.parameters.resources ?? {}) ||
        'channels' in (this.parameters.patterns ?? {}) ||
        'uuids' in (this.parameters.patterns ?? {}) ||
        'groups' in (this.parameters.patterns ?? {}))
    )
      return (
        'Cannot mix `users`, `spaces` and `authorizedUserId` with `uuids`, `channels`,' +
        ' `groups` and `authorized_uuid`'
      );

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
    const uuid = this.isVspPermissions(this.parameters)
      ? this.parameters.authorizedUserId
      : this.parameters.authorized_uuid;

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

      if (!target.channels) target.channels = {};
      if (!target.groups) target.groups = {};
      if (!target.uuids) target.uuids = {};
      // @ts-expect-error Not used, needed for api backward compatibility
      if (!target.users) target.users = {};
      // @ts-expect-error Not used, needed for api backward compatibility
      if (!target.spaces) target.spaces = {};

      if (refPerm) {
        // Check whether working with legacy Objects permissions.
        if ('spaces' in refPerm || 'users' in refPerm) {
          channelsPermissions = refPerm.spaces ?? {};
          uuidsPermissions = refPerm.users ?? {};
        } else if ('channels' in refPerm || 'uuids' in refPerm || 'groups' in refPerm) {
          channelsPermissions = refPerm.channels ?? {};
          channelGroupsPermissions = refPerm.groups ?? {};
          uuidsPermissions = refPerm.uuids ?? {};
        }
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
   * the projection name. The `res` / `pat` sub-objects are omitted when empty.
   *
   * @returns Encoded projections payload, or `undefined` when no projections are set.
   */
  private buildProjections(): ProjectionsPayload | undefined {
    const projections = 'dataSyncProjections' in this.parameters ? this.parameters.dataSyncProjections : undefined;
    if (!projections) return undefined;

    const encodeScope = (scope?: PAM.DataSyncProjectionScope) => {
      const encoded: Record<string, string> = {};
      if (!scope) return encoded;

      (['entities', 'relationships', 'memberships'] as const).forEach((type) => {
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

  /**
   * Check whether provided parameters is part of legacy VSP access token configuration.
   *
   * @param parameters - Parameters which should be checked.
   *
   * @returns VSP request parameters if it is legacy configuration.
   */
  private isVspPermissions(
    parameters: PAM.GrantTokenParameters | PAM.ObjectsGrantTokenParameters,
  ): parameters is PAM.ObjectsGrantTokenParameters {
    return (
      'authorizedUserId' in parameters ||
      'spaces' in (parameters.resources ?? {}) ||
      'users' in (parameters.resources ?? {}) ||
      'spaces' in (parameters.patterns ?? {}) ||
      'users' in (parameters.patterns ?? {})
    );
  }
}
