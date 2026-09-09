/**
 * Update Entity REST API module.
 *
 * Partial update via JSON Patch (RFC 6902).
 * Accepts `add`/`replace`/`test` (JSON Pointer key-value pairs), `remove`
 * (JSON Pointer paths), and `move`/`copy` (JSON Pointer from/path pairs), and
 * converts them to JSON Patch operations. Paths are sent verbatim.
 *
 * @internal
 */

import { TransportMethod } from '../../../types/transport-request';
import { TransportResponse } from '../../../types/transport-response';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as DataSync from '../../../types/api/data-sync';
import { toJsonPatchOperations } from '../../../types/api/data-sync';
import { KeySet } from '../../../types/api';
import { encodeString } from '../../../utils';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = DataSync.UpdateEntityParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Update Entity request.
 *
 * @internal
 */
export class UpdateEntityRequest<Response extends DataSync.UpdateEntityResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.PATCH });
  }

  operation(): RequestOperation {
    return RequestOperation.PNUpdateDataSyncEntityOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
    // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
    const parsed = this.deserializeResponse(response);
    return { ...parsed, status: response.status } as Response;
  }

  validate(): string | undefined {
    if (!this.parameters.id) return 'Entity id cannot be empty';

    const { add, replace, remove, move, copy, test } = this.parameters;
    const hasAdd = add && Object.keys(add).length > 0;
    const hasReplace = replace && Object.keys(replace).length > 0;
    const hasRemove = remove && remove.length > 0;
    const hasMove = move && move.length > 0;
    const hasCopy = copy && copy.length > 0;
    const hasTest = test && Object.keys(test).length > 0;
    if (!hasAdd && !hasReplace && !hasRemove && !hasMove && !hasCopy && !hasTest)
      return 'At least one of add, replace, remove, move, copy, or test must be provided';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.ifMatchesEtag) headers = { ...headers, 'If-Match': this.parameters.ifMatchesEtag };

    return {
      ...headers,
      'Content-Type': 'application/json-patch+json',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      id,
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/entities/${encodeString(id)}`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    const { add, replace, remove, move, copy, test } = this.parameters;

    const jsonPatchOps = toJsonPatchOperations({ add, replace, remove, move, copy, test });
    return JSON.stringify(jsonPatchOps);
  }
}
