/**
 * Get Entities REST API module.
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
type RequestParameters = DataSync.GetEntitiesParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Get Entities request.
 *
 * @internal
 */
export class GetEntitiesRequest<Response extends DataSync.GetEntitiesResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply defaults.
    parameters.limit ??= DEFAULT_LIMIT;
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetDataSyncEntitiesOperation;
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
    const { entityClass, entityClassVersion, entityClassLevel, cursor, limit, filter, filterFast, sort } =
      this.parameters;
    const sorting = DataSync.serializeDataSyncSort(sort);

    return {
      entity_class: entityClass,
      ...(entityClassVersion !== undefined ? { entity_class_version: `${entityClassVersion}` } : {}),
      ...(entityClassLevel ? { entity_class_level: entityClassLevel } : {}),
      ...(cursor ? { cursor } : {}),
      ...(limit ? { limit: `${limit}` } : {}),
      ...(filter ? { filter } : {}),
      ...(filterFast ? { filter_fast: filterFast } : {}),
      ...(sorting.length ? { sort: sorting } : {}),
    };
  }
}
