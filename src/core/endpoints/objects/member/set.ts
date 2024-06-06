/**
 * Set Channel Members REST API module.
 */

import { createValidationError, PubNubError } from '../../../../errors/pubnub-error';
import { TransportResponse } from '../../../types/transport-response';
import { PubNubAPIError } from '../../../../errors/pubnub-api-error';
import { TransportMethod } from '../../../types/transport-request';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as AppContext from '../../../types/api/app-context';
import { KeySet, Query } from '../../../types/api';
import { encodeString } from '../../../utils';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether `Member` custom field should be included in response or not.
 */
const INCLUDE_CUSTOM_FIELDS = false;

/**
 * Whether total number of members should be included in response or not.
 */
const INCLUDE_TOTAL_COUNT = false;

/**
 * Whether `UUID` fields should be included in response or not.
 */
const INCLUDE_UUID_FIELDS = false;

/**
 * Whether `UUID` custom field should be included in response or not.
 */
const INCLUDE_UUID_CUSTOM_FIELDS = false;

/**
 * Number of objects to return in response.
 */
const LIMIT = 100;
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = AppContext.SetChannelMembersParameters<AppContext.CustomData> & {
  /**
   * Type of change in channel members list.
   */
  type: 'set' | 'delete';

  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Set Channel Members request.
 *
 * @internal
 */
export class SetChannelMembersRequest<
  Response extends AppContext.SetMembersResponse<MembersCustom, UUIDCustom>,
  MembersCustom extends AppContext.CustomData = AppContext.CustomData,
  UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
> extends AbstractRequest<Response> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.PATCH });

    // Apply default request parameters.
    parameters.include ??= {};
    parameters.include.customFields ??= INCLUDE_CUSTOM_FIELDS;
    parameters.include.totalCount ??= INCLUDE_TOTAL_COUNT;
    parameters.include.UUIDFields ??= INCLUDE_UUID_FIELDS;
    parameters.include.customUUIDFields ??= INCLUDE_UUID_CUSTOM_FIELDS;
    parameters.limit ??= LIMIT;
  }

  operation(): RequestOperation {
    return RequestOperation.PNSetMembersOperation;
  }

  validate(): string | undefined {
    const { channel, uuids } = this.parameters;

    if (!channel) return 'Channel cannot be empty';
    if (!uuids || uuids.length === 0) return 'UUIDs cannot be empty';
  }

  async parse(response: TransportResponse): Promise<Response> {
    const serviceResponse = this.deserializeResponse<Response>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    return serviceResponse;
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channel,
    } = this.parameters;

    return `/v2/objects/${subscribeKey}/channels/${encodeString(channel)}/uuids`;
  }

  protected get queryParameters(): Query {
    const { include, page, filter, sort, limit } = this.parameters;
    let sorting: string | string[] = '';
    if (typeof sort === 'string') sorting = sort;
    else
      sorting = Object.entries(sort ?? {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
    const includeFlags: string[] = ['uuid.status', 'uuid.type', 'type'];

    if (include!.customFields) includeFlags.push('custom');
    if (include!.UUIDFields) includeFlags.push('uuid');
    if (include!.customUUIDFields) includeFlags.push('uuid.custom');

    return {
      count: `${include!.totalCount!}`,
      ...(includeFlags.length > 0 ? { include: includeFlags.join(',') } : {}),
      ...(filter ? { filter } : {}),
      ...(page?.next ? { start: page.next } : {}),
      ...(page?.prev ? { end: page.prev } : {}),
      ...(limit ? { limit } : {}),
      ...(sorting.length ? { sort: sorting } : {}),
    };
  }

  protected get body(): string {
    const { uuids, type } = this.parameters;

    return JSON.stringify({
      [`${type}`]: uuids.map((uuid) => {
        if (typeof uuid === 'string') {
          return { uuid: { id: uuid } };
        } else {
          return { uuid: { id: uuid.id }, status: uuid.status, custom: uuid.custom };
        }
      }),
    });
  }
}
