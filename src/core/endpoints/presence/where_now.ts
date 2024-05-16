/**
 * `uuid` presence REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import * as Presence from '../../types/api/presence';
import { encodeString } from '../../utils';
import { KeySet } from '../../types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = Required<Presence.WhereNowParameters> & {
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
   * Where now human-readable result.
   */
  message: string;

  /**
   * Retrieved channels with `uuid` subscriber.
   */
  payload?: {
    /**
     * List of channels to which `uuid` currently subscribed.
     */
    channels: string[];
  };

  /**
   * Name of the service which provided response.
   */
  service: string;
};
// endregion

/**
 * Get `uuid` presence request.
 *
 * @internal
 */
export class WhereNowRequest extends AbstractRequest<Presence.WhereNowResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNWhereNowOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.keySet.subscribeKey) return 'Missing Subscribe Key';
  }

  async parse(response: TransportResponse): Promise<Presence.WhereNowResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    if (!serviceResponse.payload) return { channels: [] };

    return { channels: serviceResponse.payload.channels };
  }
  protected get path(): string {
    const {
      keySet: { subscribeKey },
      uuid,
    } = this.parameters;

    return `/v2/presence/sub-key/${subscribeKey}/uuid/${encodeString(uuid)}`;
  }
}
