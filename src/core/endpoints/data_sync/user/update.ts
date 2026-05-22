/**
 * Update User REST API module.
 *
 * Full resource replacement via PUT.
 *
 * @internal
 */

import { TransportMethod } from '../../../types/transport-request';
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
type RequestParameters = DataSync.UpdateUserParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Update User request.
 *
 * @internal
 */
export class UpdateUserRequest<
  Response extends DataSync.UpdateUserResponse,
> extends AbstractRequest<Response, Response> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.PUT });
  }

  operation(): RequestOperation {
    return RequestOperation.PNUpdateUserOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.id) return 'User id cannot be empty';
    if (!this.parameters.user) return 'User cannot be empty';
    if (this.parameters.user.entityClassVersion === undefined || this.parameters.user.entityClassVersion === null)
      return 'Entity class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.ifMatchesEtag)
      headers = { ...headers, 'If-Match': this.parameters.ifMatchesEtag };

    return {
      ...headers,
      'Content-Type': 'application/vnd.pubnub.objects.user+json;version=1',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      id,
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/users/${encodeString(id)}`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    return JSON.stringify({ data: this.parameters.user });
  }
}
