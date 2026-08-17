/**
 * Set Channel REST API module.
 *
 * Full resource replacement via PUT.
 *
 * @internal
 */

import { TransportMethod } from '../../../types/transport-request';
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
type RequestParameters = DataSync.SetChannelParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Set Channel request.
 *
 * @internal
 */
export class SetChannelRequest<Response extends DataSync.SetChannelResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.PUT });
  }

  operation(): RequestOperation {
    return RequestOperation.PNSetDataSyncChannelOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
    // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
    const parsed = this.deserializeResponse(response);
    return { ...parsed, status: response.status } as Response;
  }

  validate(): string | undefined {
    if (!this.parameters.id) return 'Channel id cannot be empty';
    if (!this.parameters.data) return 'Channel data cannot be empty';
    if (this.parameters.data.classVersion === undefined || this.parameters.data.classVersion === null)
      return 'Entity class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.ifMatchesEtag) headers = { ...headers, 'If-Match': this.parameters.ifMatchesEtag };

    return {
      ...headers,
      'Content-Type': 'application/vnd.pubnub.objects.channel+json;version=1',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      id,
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/channels/${encodeString(id)}`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    const { data } = this.parameters;

    return JSON.stringify({
      data: {
        entityClassVersion: data.classVersion,
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.payload !== undefined ? { payload: data.payload } : {}),
      },
    });
  }
}
