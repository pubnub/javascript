/**
 * Get Memberships REST API module.
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
type RequestParameters = DataSync.GetMembershipsParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Get Memberships request.
 *
 * @internal
 */
export class GetMembershipsRequest<Response extends DataSync.GetMembershipsResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply defaults.
    parameters.limit ??= DEFAULT_LIMIT;
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetDataSyncMembershipsOperation;
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
    const { userId, channelId, relationshipClassVersion, cursor, limit, filter, filterFast, sort } = this.parameters;
    const sorting = DataSync.serializeDataSyncSort(sort);

    return {
      ...(userId ? { user_id: userId } : {}),
      ...(channelId ? { channel_id: channelId } : {}),
      ...(relationshipClassVersion !== undefined ? { relationship_class_version: `${relationshipClassVersion}` } : {}),
      ...(cursor ? { cursor } : {}),
      ...(limit ? { limit: `${limit}` } : {}),
      ...(filter ? { filter } : {}),
      ...(filterFast ? { filter_fast: filterFast } : {}),
      ...(sorting.length ? { sort: sorting } : {}),
    };
  }
}
