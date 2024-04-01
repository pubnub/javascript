/**
 * Time REST API module.
 */

import { createValidationError, PubnubError } from '../../errors/pubnub-error';
import { TransportResponse } from '../types/transport-response';
import { AbstractRequest } from '../components/request';
import RequestOperation from '../constants/operations';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Service success response.
 */
export type TimeResponse = {
  /**
   * High-precision time when published data has been received by the PubNub service.
   */
  timetoken: string;
};

/**
 * Service success response.
 */
type ServiceResponse = [string];
// endregion

export class TimeRequest extends AbstractRequest<TimeResponse> {
  constructor() {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNTimeOperation;
  }

  async parse(response: TransportResponse): Promise<TimeResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse)
      throw new PubnubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );

    return { timetoken: serviceResponse[0] };
  }

  protected get path(): string {
    return '/time/0';
  }
}
