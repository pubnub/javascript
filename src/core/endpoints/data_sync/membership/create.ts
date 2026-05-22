/**
 * Create Membership REST API module.
 *
 * @internal
 */

import { TransportMethod } from '../../../types/transport-request';
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
export class CreateMembershipRequest<
  Response extends DataSync.CreateMembershipResponse,
> extends AbstractRequest<Response, Response> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.POST });
  }

  operation(): RequestOperation {
    return RequestOperation.PNCreateMembershipOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.membership) return 'Membership cannot be empty';
    if (!this.parameters.membership.userId) return 'User id cannot be empty';
    if (!this.parameters.membership.channelId) return 'Channel id cannot be empty';
    if (!this.parameters.membership.relationshipClassVersion) return 'Relationship class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.idempotencyKey)
      headers = { ...headers, 'Idempotency-Key': this.parameters.idempotencyKey };

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
    return JSON.stringify({ data: this.parameters.membership });
  }
}
