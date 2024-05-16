/**
 * List Device push enabled channels REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { BasePushNotificationChannelsRequest } from './push';
import RequestOperation from '../../constants/operations';
import * as Push from '../../types/api/push';
import { KeySet } from '../../types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = Push.ListDeviceChannelsParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};

/**
 * Service success response.
 */
type ServiceResponse = string[];
// endregion

/**
 * List device push enabled channels request.
 *
 * @internal
 */
// prettier-ignore
export class ListDevicePushNotificationChannelsRequest extends BasePushNotificationChannelsRequest<
  Push.ListDeviceChannelsResponse
> {
  constructor(parameters: RequestParameters) {
    super({ ...parameters, action: 'list' });
  }

  operation(): RequestOperation {
    return RequestOperation.PNPushNotificationEnabledChannelsOperation;
  }

  async parse(response: TransportResponse): Promise<Push.ListDeviceChannelsResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse)
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );

    return { channels: serviceResponse };
  }
}
