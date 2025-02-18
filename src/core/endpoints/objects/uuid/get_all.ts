/**
 * Get All UUID Metadata REST API module.
 *
 * @internal
 */

import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as AppContext from '../../../types/api/app-context';
import { KeySet, Query } from '../../../types/api';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether `Channel` custom field should be included by default or not.
 */
const INCLUDE_CUSTOM_FIELDS = false;

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
type RequestParameters<Custom extends AppContext.CustomData = AppContext.CustomData> =
  AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>> & {
    /**
     * PubNub REST API access key set.
     */
    keySet: KeySet;
  };
// endregion

/**
 * Get All UUIDs Metadata request.
 *
 * @internal
 */
export class GetAllUUIDMetadataRequest<
  Response extends AppContext.GetAllUUIDMetadataResponse<Custom>,
  Custom extends AppContext.CustomData = AppContext.CustomData,
> extends AbstractRequest<Response, Response> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply default request parameters.
    parameters.include ??= {};
    parameters.include.customFields ??= INCLUDE_CUSTOM_FIELDS;
    parameters.limit ??= LIMIT;
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetAllUUIDMetadataOperation;
  }

  protected get path(): string {
    return `/v2/objects/${this.parameters.keySet.subscribeKey}/uuids`;
  }

  protected get queryParameters(): Query {
    const { include, page, filter, sort, limit } = this.parameters;
    let sorting: string | string[] = '';
    if (typeof sort === 'string') sorting = sort;
    else
      sorting = Object.entries(sort ?? {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));

    return {
      include: ['status', 'type', ...(include!.customFields ? ['custom'] : [])].join(','),
      ...(include!.totalCount !== undefined ? { count: `${include!.totalCount}` } : {}),
      ...(filter ? { filter } : {}),
      ...(page?.next ? { start: page.next } : {}),
      ...(page?.prev ? { end: page.prev } : {}),
      ...(limit ? { limit } : {}),
      ...(sorting.length ? { sort: sorting } : {}),
    };
  }
}
