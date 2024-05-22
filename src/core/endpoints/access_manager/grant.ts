/**
 * PAM Grant REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import * as PAM from '../../types/api/access-manager';
import { KeySet, Query } from '../../types/api';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Resources `read` permission.
 */
const READ_PERMISSION = false;

/**
 * Resources `write` permission.
 */
const WRITE_PERMISSION = false;

/**
 * Resources `delete` permission.
 */
const DELETE_PERMISSION = false;

/**
 * Resources `get` permission.
 */
const GET_PERMISSION = false;

/**
 * Resources `update` permission.
 */
const UPDATE_PERMISSION = false;

/**
 * Resources `manage` permission.
 */
const MANAGE_PERMISSION = false;

/**
 * Resources `join` permission.
 */
const JOIN_PERMISSION = false;
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = PAM.GrantParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
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
   * Permissions grant human-readable result.
   */
  message: string;

  /**
   * Granted permissions' information.
   */
  payload: PAM.PermissionsResponse;

  /**
   * Name of the service which provided response.
   */
  service: string;
};
// endregion

/**
 * Grant permissions request.
 *
 * @internal
 */
export class GrantRequest extends AbstractRequest<PAM.PermissionsResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply defaults.
    this.parameters.channels ??= [];
    this.parameters.channelGroups ??= [];
    this.parameters.uuids ??= [];
    this.parameters.read ??= READ_PERMISSION;
    this.parameters.write ??= WRITE_PERMISSION;
    this.parameters.delete ??= DELETE_PERMISSION;
    this.parameters.get ??= GET_PERMISSION;
    this.parameters.update ??= UPDATE_PERMISSION;
    this.parameters.manage ??= MANAGE_PERMISSION;
    this.parameters.join ??= JOIN_PERMISSION;
  }

  operation(): RequestOperation {
    return RequestOperation.PNAccessManagerGrant;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey, publishKey, secretKey },
      uuids = [],
      channels = [],
      channelGroups = [],
      authKeys = [],
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (!publishKey) return 'Missing Publish Key';
    if (!secretKey) return 'Missing Secret Key';

    if (uuids.length !== 0 && authKeys.length === 0) return 'authKeys are required for grant request on uuids';

    if (uuids.length && (channels.length !== 0 || channelGroups.length !== 0))
      return 'Both channel/channel group and uuid cannot be used in the same request';
  }

  async parse(response: TransportResponse): Promise<PAM.PermissionsResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    return serviceResponse.payload;
  }

  protected get path(): string {
    return `/v2/auth/grant/sub-key/${this.parameters.keySet.subscribeKey}`;
  }

  protected get queryParameters(): Query {
    const {
      channels,
      channelGroups,
      authKeys,
      uuids,
      read,
      write,
      manage,
      delete: del,
      get,
      join,
      update,
      ttl,
    } = this.parameters;

    return {
      ...(channels && channels?.length > 0 ? { channel: channels.join(',') } : {}),
      ...(channelGroups && channelGroups?.length > 0 ? { 'channel-group': channelGroups.join(',') } : {}),
      ...(authKeys && authKeys?.length > 0 ? { auth: authKeys.join(',') } : {}),
      ...(uuids && uuids?.length > 0 ? { 'target-uuid': uuids.join(',') } : {}),
      r: read ? '1' : '0',
      w: write ? '1' : '0',
      m: manage ? '1' : '0',
      d: del ? '1' : '0',
      g: get ? '1' : '0',
      j: join ? '1' : '0',
      u: update ? '1' : '0',
      ...(ttl || ttl === 0 ? { ttl } : {}),
    };
  }
}
