/**
 * Remove Membership REST API module.
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
type RequestParameters = DataSync.RemoveMembershipParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Remove Membership request.
 *
 * @internal
 */
export class RemoveMembershipRequest<Response extends DataSync.RemoveMembershipResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.DELETE });
  }

  operation(): RequestOperation {
    return RequestOperation.PNRemoveMembershipOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.id) return 'Membership id cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.ifMatchesEtag) headers = { ...headers, 'If-Match': this.parameters.ifMatchesEtag };

    return Object.keys(headers).length > 0 ? headers : undefined;
  }

  async parse(response: TransportResponse): Promise<Response> {
    return { status: response.status } as Response;
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      id,
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/memberships/${encodeString(id)}`;
  }
}
