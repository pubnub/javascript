/**
 * Get All Channel Metadata REST API module.
 */

import { createValidationError, PubNubError } from '../../../../errors/pubnub-error';
import { TransportResponse } from '../../../types/transport-response';
import { PubNubAPIError } from '../../../../errors/pubnub-api-error';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as AppContext from '../../../types/api/app-context';
import { KeySet, Query } from '../../../types/api';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether `Channel` custom fields should be included in response or not.
 */
const INCLUDE_CUSTOM_FIELDS = false;

/**
 * Whether total number of channels should be included in response or not.
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
type RequestParameters<Custom extends AppContext.CustomData = AppContext.CustomData> =
  AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>> & {
    /**
     * PubNub REST API access key set.
     */
    keySet: KeySet;
  };
// endregion

/**
 * Get All Channels Metadata request.
 *
 * @internal
 */
export class GetAllChannelsMetadataRequest<
  Response extends AppContext.GetAllChannelMetadataResponse<Custom>,
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
    return RequestOperation.PNGetAllChannelMetadataOperation;
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
    return `/v2/objects/${this.parameters.keySet.subscribeKey}/channels`;
  }

  protected get queryParameters(): Query {
    const { include, page, filter, sort, limit } = this.parameters;
    let sorting: string | string[] = '';
    if (typeof sort === 'string') sorting = sort;
    else
      sorting = Object.entries(sort ?? {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));

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
