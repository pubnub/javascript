/**
 * Signal REST API module.
 */

import { createValidationError, PubNubError } from '../../errors/pubnub-error';
import { TransportResponse } from '../types/transport-response';
import { AbstractRequest } from '../components/request';
import RequestOperation from '../constants/operations';
import { KeySet, Payload } from '../types/api';
import { encodeString } from '../utils';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
export type SignalParameters = {
  /**
   * Channel name to publish signal to.
   */
  channel: string;

  /**
   * Data which should be sent to the `channel`.
   *
   * The message may be any valid JSON type including objects, arrays, strings, and numbers.
   */
  message: Payload;
};

/**
 * Service success response.
 */
export type SignalResponse = {
  /**
   * High-precision time when published data has been received by the PubNub service.
   */
  timetoken: string;
};

/**
 * Request configuration parameters.
 */
type RequestParameters = SignalParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};

/**
 * Service success response.
 */
type ServiceResponse = [0 | 1, string, string];
// endregion

/**
 * Signal data (size-limited) publish request.
 *
 * @internal
 */
export class SignalRequest extends AbstractRequest<SignalResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNSignalOperation;
  }

  validate(): string | undefined {
    const {
      message,
      channel,
      keySet: { publishKey },
    } = this.parameters;

    if (!channel) return "Missing 'channel'";
    if (!message) return "Missing 'message'";
    if (!publishKey) return "Missing 'publishKey'";
  }

  async parse(response: TransportResponse): Promise<SignalResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse)
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );

    return { timetoken: serviceResponse[2] };
  }

  protected get path(): string {
    const {
      keySet: { publishKey, subscribeKey },
      channel,
      message,
    } = this.parameters;
    const stringifiedPayload = JSON.stringify(message);

    return `/signal/${publishKey}/${subscribeKey}/0/${encodeString(channel)}/0/${encodeString(stringifiedPayload)}`;
  }
}
