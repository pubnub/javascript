/**
 * Fetch Entities REST API module.
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
type RequestParameters = DataSync.FetchEntitiesParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Fetch Entities request.
 *
 * @internal
 */
export class FetchEntitiesRequest<Response extends DataSync.FetchEntitiesResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply defaults.
    parameters.limit ??= DEFAULT_LIMIT;
  }

  operation(): RequestOperation {
    return RequestOperation.PNFetchEntitiesOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
    // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
    const parsed = this.deserializeResponse(response);
    return { ...parsed, status: response.status } as Response;
  }

  validate(): string | undefined {
    if (!this.parameters.entityClass) return 'Entity class cannot be empty';
  }

  protected get path(): string {
    return `/v1/datasync/subkeys/${this.parameters.keySet.subscribeKey}/entities`;
  }

  protected get queryParameters(): Query {
    const { entityClass, entityClassVersion, cursor, limit, filter, sort, filterAdvanced } = this.parameters;
    const sorting = DataSync.serializeDataSyncSort(sort);

    return {
      entity_class: entityClass,
      ...(entityClassVersion !== undefined ? { entity_class_version: `${entityClassVersion}` } : {}),
      ...(cursor ? { cursor } : {}),
      ...(limit ? { limit: `${limit}` } : {}),
      ...(filter ? { filter } : {}),
      ...(sorting.length ? { sort: sorting } : {}),
      ...(filterAdvanced ? { filter_advanced: filterAdvanced } : {}),
    };
  }
}
