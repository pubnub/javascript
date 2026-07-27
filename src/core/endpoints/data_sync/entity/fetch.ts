/**
 * Fetch Entity REST API module.
 *
 * @internal
 */

import { TransportResponse } from '../../../types/transport-response';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as DataSync from '../../../types/api/data-sync';
import { KeySet } from '../../../types/api';
import { encodeString } from '../../../utils';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = DataSync.FetchEntityParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Fetch Entity request.
 *
 * @internal
 */
export class FetchEntityRequest<Response extends DataSync.FetchEntityResponse> extends AbstractRequest<Response, Response> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNFetchEntityOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
    // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
    const parsed = this.deserializeResponse(response);
    return { ...parsed, status: response.status } as Response;
  }

  validate(): string | undefined {
    if (!this.parameters.id) return 'Entity id cannot be empty';
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      id,
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/entities/${encodeString(id)}`;
  }
}
