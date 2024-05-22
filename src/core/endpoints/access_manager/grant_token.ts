/**
 * PAM Grant Token REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
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
   * Extra metadata to be published with the request.
   *
   * **Important:** Values must be scalar only; `arrays` or `objects` aren't supported.
   */
  meta?: PAM.Metadata;
};

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
export class GrantTokenRequest extends AbstractRequest<PAM.GrantTokenResponse> {
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

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (!publishKey) return 'Missing Publish Key';
    if (!secretKey) return 'Missing Secret Key';
    if (!resources && !patterns) return 'Missing either Resources or Patterns';

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

    if (permissionsEmpty) return 'Missing values for either Resources or Patterns';
  }

  async parse(response: TransportResponse): Promise<PAM.GrantTokenResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    return serviceResponse.data.token;
  }

  protected get path(): string {
    return `/v3/pam/${this.parameters.keySet.subscribeKey}/grant`;
  }

  protected get headers(): Record<string, string> | undefined {
    return { 'Content-Type': 'application/json' };
  }

  protected get body(): string {
    const { ttl, meta } = this.parameters;
    const body: Record<string, unknown> = { ...(ttl || ttl === 0 ? { ttl } : {}) };
    const uuid = this.isVspPermissions(this.parameters)
      ? this.parameters.authorizedUserId
      : this.parameters.authorized_uuid;

    const permissions: Record<string, PAM.Metadata | string | Record<string, PermissionPayload>> = {};
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
    });

    if (uuid) permissions.uuid = `${uuid}`;
    permissions.resources = resourcePermissions;
    permissions.patterns = patternPermissions;
    permissions.meta = meta ?? {};
    body.permissions = permissions;

    return JSON.stringify(body);
  }

  /**
   * Extract permissions bit from permission configuration object.
   *
   * @param permissions - User provided scope-based permissions.
   *
   * @returns Permissions bit.
   */
  private extractPermissions(
    permissions: PAM.UuidTokenPermissions | PAM.ChannelTokenPermissions | PAM.ChannelGroupTokenPermissions,
  ): number {
    let permissionsResult = 0;

    if ('join' in permissions && permissions.join) permissionsResult |= 128;
    if ('update' in permissions && permissions.update) permissionsResult |= 64;
    if ('get' in permissions && permissions.get) permissionsResult |= 32;
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
