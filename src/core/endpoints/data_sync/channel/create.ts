/**
 * Create Channel REST API module.
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
type RequestParameters = DataSync.CreateChannelParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Create Channel request.
 *
 * @internal
 */
export class CreateChannelRequest<Response extends DataSync.CreateChannelResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.POST });
  }

  operation(): RequestOperation {
    return RequestOperation.PNCreateDataSyncChannelOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
    // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
    const parsed = this.deserializeResponse(response);
    return { ...parsed, status: response.status } as Response;
  }

  validate(): string | undefined {
    if (!this.parameters.data) return 'Channel data cannot be empty';
    if (this.parameters.data.classVersion === undefined || this.parameters.data.classVersion === null)
      return 'Entity class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    const headers = super.headers ?? {};

    return {
      ...headers,
      'Content-Type': 'application/vnd.pubnub.objects.channel+json;version=1',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/channels`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    const { id, class: entityClass, classLevel, data } = this.parameters;

    return JSON.stringify({
      data: {
        ...(id !== undefined ? { id } : {}),
        ...(entityClass !== undefined ? { entityClass } : {}),
        entityClassVersion: data.classVersion,
        ...(classLevel !== undefined ? { entityClassLevel: classLevel } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.payload !== undefined ? { payload: data.payload } : {}),
      },
    });
  }
}
