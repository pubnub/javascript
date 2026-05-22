/**
 * Get All Entities REST API module.
 *
 * @internal
 */

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
type RequestParameters = DataSync.GetAllEntitiesParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Get All Entities request.
 *
 * @internal
 */
export class GetAllEntitiesRequest<Response extends DataSync.GetAllEntitiesResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply defaults.
    parameters.limit ??= DEFAULT_LIMIT;
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetAllEntitiesOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.entityClass) return 'Entity class cannot be empty';
  }

  protected get path(): string {
    return `/v1/datasync/subkeys/${this.parameters.keySet.subscribeKey}/entities`;
  }

  protected get queryParameters(): Query {
    const { entityClass, entityClassVersion, cursor, limit, filter, sort, filterAdvanced } = this.parameters;

    return {
      entity_class: entityClass,
      ...(entityClassVersion !== undefined ? { entity_class_version: `${entityClassVersion}` } : {}),
      ...(cursor ? { cursor } : {}),
      ...(limit ? { limit: `${limit}` } : {}),
      ...(filter ? { filter } : {}),
      ...(sort ? { sort } : {}),
      ...(filterAdvanced ? { filter_advanced: filterAdvanced } : {}),
    };
  }
}
