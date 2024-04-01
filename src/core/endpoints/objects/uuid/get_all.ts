/**
 * Get All UUID Metadata REST API module.
 */

import { createValidationError, PubnubError } from '../../../../errors/pubnub-error';
import { TransportResponse } from '../../../types/transport-response';
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
 * Whether to fetch total count or not.
 */
const INCLUDE_TOTAL_COUNT = false;

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
type RequestParameters = AppContext.GetAllMetadataParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

export class GetAllUUIDMetadataRequest<
  Response extends AppContext.GetAllUUIDMetadataResponse<Custom>,
  Custom extends AppContext.CustomData = AppContext.CustomData,
> extends AbstractRequest<Response> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply default request parameters.
    parameters.include ??= {};
    parameters.include.customFields ??= INCLUDE_CUSTOM_FIELDS;
    parameters.include.totalCount ??= INCLUDE_TOTAL_COUNT;
    parameters.limit ??= LIMIT;
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetAllUUIDMetadataOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    const serviceResponse = this.deserializeResponse<Response>(response);

    if (!serviceResponse)
      throw new PubnubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );

    return serviceResponse;
  }

  protected get path(): string {
    return `/v2/objects/${this.parameters.keySet.subscribeKey}/uuids`;
  }

  protected get queryParameters(): Query {
    const { include, page, filter, sort, limit } = this.parameters;
    const sorting = Object.entries(sort ?? {}).map(([option, order]) =>
      order !== null ? `${option}:${order}` : option,
    );

    return {
      include: ['status', 'type', ...(include!.customFields ? ['custom'] : [])].join(','),
      count: `${include!.totalCount!}`,
      ...(filter ? { filter } : {}),
      ...(page?.next ? { start: page.next } : {}),
      ...(page?.prev ? { end: page.prev } : {}),
      ...(limit ? { limit } : {}),
      ...(sorting.length ? { sort: sorting } : {}),
    };
  }
}
