/**
 * Get Relationships REST API module.
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
type RequestParameters = DataSync.GetRelationshipsParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Get Relationships request.
 *
 * @internal
 */
export class GetRelationshipsRequest<Response extends DataSync.GetRelationshipsResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply defaults.
    parameters.limit ??= DEFAULT_LIMIT;
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetDataSyncRelationshipsOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
    // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
    const parsed = this.deserializeResponse(response);
    return { ...parsed, status: response.status } as Response;
  }

  validate(): string | undefined {
    if (!this.parameters.class) return 'Relationship class cannot be empty';
  }

  protected get path(): string {
    return `/v1/datasync/subkeys/${this.parameters.keySet.subscribeKey}/relationships`;
  }

  protected get queryParameters(): Query {
    const {
      class: relationshipClass,
      classVersion,
      entityAId,
      entityBId,
      cursor,
      limit,
      filter,
      filterFast,
      sort,
    } = this.parameters;
    const sorting = DataSync.serializeDataSyncSort(sort);

    return {
      relationship_class: relationshipClass,
      ...(classVersion !== undefined ? { relationship_class_version: `${classVersion}` } : {}),
      ...(entityAId ? { entity_a_id: entityAId } : {}),
      ...(entityBId ? { entity_b_id: entityBId } : {}),
      ...(cursor ? { cursor } : {}),
      ...(limit ? { limit: `${limit}` } : {}),
      ...(filter ? { filter } : {}),
      ...(filterFast ? { filter_fast: filterFast } : {}),
      ...(sorting.length ? { sort: sorting } : {}),
    };
  }
}
