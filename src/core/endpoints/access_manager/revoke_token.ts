/**
 * PAM Revoke Token REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
import { TransportMethod } from '../../types/transport-request';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import * as PAM from '../../types/api/access-manager';
import { encodeString } from '../../utils';
import { KeySet } from '../../types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = {
  /**
   * Access token for which permissions should be revoked.
   */
  token: string;

  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};

/**
 * Service success response.
 */
type ServiceResponse = {
  /**
   * Request result status code.
   */
  status: number;

  /**
   * Request processing result data.
   */
  data: Record<string, unknown>;

  /**
   * Name of the service which provided response.
   */
  service: string;
};
// endregion

/**
 * Access token revoke request.
 *
 * Invalidate token and permissions which has been granted for it.
 *
 * @internal
 */
export class RevokeTokenRequest extends AbstractRequest<PAM.RevokeTokenResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.DELETE });
  }

  operation(): RequestOperation {
    return RequestOperation.PNAccessManagerRevokeToken;
  }

  validate(): string | undefined {
    if (!this.parameters.keySet.secretKey) return 'Missing Secret Key';
    if (!this.parameters.token) return "token can't be empty";
  }

  async parse(response: TransportResponse): Promise<PAM.RevokeTokenResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    return {};
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      token,
    } = this.parameters;

    return `/v3/pam/${subscribeKey}/grant/${encodeString(token)}`;
  }
}
