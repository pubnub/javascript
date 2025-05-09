/**
 * Get UUID Memberships REST API module.
 *
 * @internal
 */

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
 * Whether `Membership` custom field should be included in response or not.
 */
const INCLUDE_CUSTOM_FIELDS = false;

/**
 * Whether membership's `status` field should be included in response or not.
 */
const INCLUDE_STATUS = false;

/**
 * Whether membership's `type` field should be included in response or not.
 */
const INCLUDE_TYPE = false;

/**
 * Whether total number of memberships should be included in response or not.
 */
const INCLUDE_TOTAL_COUNT = false;

/**
 * Whether `Channel` fields should be included in response or not.
 */
const INCLUDE_CHANNEL_FIELDS = false;

/**
 * Whether `Channel` status field should be included in response or not.
 */
const INCLUDE_CHANNEL_STATUS_FIELD = false;

/**
 * Whether `Channel` type field should be included in response or not.
 */
const INCLUDE_CHANNEL_TYPE_FIELD = false;

/**
 * Whether `Channel` custom field should be included in response or not.
 */
const INCLUDE_CHANNEL_CUSTOM_FIELDS = false;

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
type RequestParameters = AppContext.GetMembershipsParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Get UUID Memberships request.
 *
 * @internal
 */
export class GetUUIDMembershipsRequest<
  Response extends AppContext.GetMembershipsResponse<MembersCustom, UUIDCustom>,
  MembersCustom extends AppContext.CustomData = AppContext.CustomData,
  UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
> extends AbstractRequest<Response, Response> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply default request parameters.
    parameters.include ??= {};
    parameters.include.customFields ??= INCLUDE_CUSTOM_FIELDS;
    parameters.include.totalCount ??= INCLUDE_TOTAL_COUNT;
    parameters.include.statusField ??= INCLUDE_STATUS;
    parameters.include.typeField ??= INCLUDE_TYPE;
    parameters.include.channelFields ??= INCLUDE_CHANNEL_FIELDS;
    parameters.include.customChannelFields ??= INCLUDE_CHANNEL_CUSTOM_FIELDS;
    parameters.include.channelStatusField ??= INCLUDE_CHANNEL_STATUS_FIELD;
    parameters.include.channelTypeField ??= INCLUDE_CHANNEL_TYPE_FIELD;
    parameters.limit ??= LIMIT;

    // Remap for backward compatibility.
    if (this.parameters.userId) this.parameters.uuid = this.parameters.userId;
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetMembershipsOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.uuid) return "'uuid' cannot be empty";
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      uuid,
    } = this.parameters;

    return `/v2/objects/${subscribeKey}/uuids/${encodeString(uuid!)}/channels`;
  }

  protected get queryParameters(): Query {
    const { include, page, filter, sort, limit } = this.parameters;
    let sorting: string | string[] = '';
    if (typeof sort === 'string') sorting = sort;
    else
      sorting = Object.entries(sort ?? {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
    const includeFlags: string[] = [];

    if (include!.statusField) includeFlags.push('status');
    if (include!.typeField) includeFlags.push('type');
    if (include!.customFields) includeFlags.push('custom');
    if (include!.channelFields) includeFlags.push('channel');
    if (include!.channelStatusField) includeFlags.push('channel.status');
    if (include!.channelTypeField) includeFlags.push('channel.type');
    if (include!.customChannelFields) includeFlags.push('channel.custom');

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
}
