/**
 * Create Membership REST API module.
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
type RequestParameters = DataSync.CreateMembershipParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Create Membership request.
 *
 * @internal
 */
export class CreateMembershipRequest<Response extends DataSync.CreateMembershipResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.POST });
  }

  operation(): RequestOperation {
    return RequestOperation.PNCreateDataSyncMembershipOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
    // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
    const parsed = this.deserializeResponse(response);
    return { ...parsed, status: response.status } as Response;
  }

  validate(): string | undefined {
    if (!this.parameters.userId) return 'User id cannot be empty';
    if (!this.parameters.channelId) return 'Channel id cannot be empty';
    if (!this.parameters.data) return 'Membership data cannot be empty';
    if (!this.parameters.data.classVersion) return 'Relationship class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    const headers = super.headers ?? {};

    return {
      ...headers,
      'Content-Type': 'application/vnd.pubnub.objects.membership+json;version=1',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/memberships`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    const { id, userId, channelId, data } = this.parameters;

    return JSON.stringify({
      data: {
        ...(id !== undefined ? { id } : {}),
        userId,
        channelId,
        relationshipClassVersion: data.classVersion,
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.payload !== undefined ? { payload: data.payload } : {}),
      },
    });
  }
}
