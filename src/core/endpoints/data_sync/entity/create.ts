/**
 * Create Entity REST API module.
 *
 * @internal
 */

import { TransportMethod } from '../../../types/transport-request';
import { TransportResponse } from '../../../types/transport-response';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as DataSync from '../../../types/api/data-sync';
import { KeySet } from '../../../types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = DataSync.CreateEntityParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Create Entity request.
 *
 * @internal
 */
export class CreateEntityRequest<Response extends DataSync.CreateEntityResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.POST });
  }

  operation(): RequestOperation {
    return RequestOperation.PNCreateEntityOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
    // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
    const parsed = this.deserializeResponse(response);
    return { ...parsed, status: response.status } as Response;
  }

  validate(): string | undefined {
    if (!this.parameters.class) return 'Entity class cannot be empty';
    if (!this.parameters.data) return 'Entity data cannot be empty';
    if (this.parameters.data.classVersion === undefined || this.parameters.data.classVersion === null)
      return 'Entity class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    const headers = super.headers ?? {};

    return {
      ...headers,
      'Content-Type': 'application/vnd.pubnub.objects.entity+json;version=1',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/entities`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    const { id, class: entityClass, data } = this.parameters;

    return JSON.stringify({
      data: {
        ...(id !== undefined ? { id } : {}),
        entityClass,
        entityClassVersion: data.classVersion,
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.payload !== undefined ? { payload: data.payload } : {}),
      },
    });
  }
}
