/**
 * Fetch Memberships REST API module.
 *
 * @internal
 */

import { TransportResponse } from '../../../types/transport-response';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as DataSync from '../../../types/api/data-sync';
import { KeySet, Query } from '../../../types/api';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Default number of items per page.
 */
const DEFAULT_LIMIT = 20;
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = DataSync.FetchMembershipsParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Fetch Memberships request.
 *
 * @internal
 */
export class FetchMembershipsRequest<Response extends DataSync.FetchMembershipsResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply defaults.
    parameters.limit ??= DEFAULT_LIMIT;
  }

  operation(): RequestOperation {
    return RequestOperation.PNFetchMembershipsOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
    // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
    const parsed = this.deserializeResponse(response);
    return { ...parsed, status: response.status } as Response;
  }

  protected get path(): string {
    return `/v1/datasync/subkeys/${this.parameters.keySet.subscribeKey}/memberships`;
  }

  protected get queryParameters(): Query {
    const { userId, channelId, relationshipClassVersion, cursor, limit, filter, sort, filterAdvanced } =
      this.parameters;
    const sorting = DataSync.serializeDataSyncSort(sort);

    return {
      ...(userId ? { user_id: userId } : {}),
      ...(channelId ? { channel_id: channelId } : {}),
      ...(relationshipClassVersion !== undefined ? { relationship_class_version: `${relationshipClassVersion}` } : {}),
      ...(cursor ? { cursor } : {}),
      ...(limit ? { limit: `${limit}` } : {}),
      ...(filter ? { filter } : {}),
      ...(sorting.length ? { sort: sorting } : {}),
      ...(filterAdvanced ? { filter_advanced: filterAdvanced } : {}),
    };
  }
}
