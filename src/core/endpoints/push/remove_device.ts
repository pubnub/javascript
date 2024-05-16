/**
 * Unregister Device push REST API module.
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
type RequestParameters = Push.RemoveDeviceParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};

/**
 * Service success response.
 */
type ServiceResponse = [0 | 1, string];
// endregion

/**
 * Unregister device push notifications request.
 *
 * @internal
 */
// prettier-ignore
export class RemoveDevicePushNotificationRequest extends BasePushNotificationChannelsRequest<
  Push.RemoveDeviceResponse
> {
  constructor(parameters: RequestParameters) {
    super({ ...parameters, action: 'remove-device' });
  }

  operation(): RequestOperation {
    return RequestOperation.PNRemoveAllPushNotificationsOperation;
  }

  async parse(response: TransportResponse): Promise<Push.ManageDeviceChannelsResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse)
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );

    return {};
  }
}
