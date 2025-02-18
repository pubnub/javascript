/**
 * Unregister Channels from Device push REST API module.
 *
 * @internal
 */

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
type RequestParameters = Push.ManageDeviceChannelsParameters & {
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
 * Unregister channels from device push request.
 *
 * @internal
 */
// prettier-ignore
export class RemoveDevicePushNotificationChannelsRequest extends BasePushNotificationChannelsRequest<
  Push.ManageDeviceChannelsResponse,
  ServiceResponse
> {
  constructor(parameters: RequestParameters) {
    super({ ...parameters, action: 'remove' });
  }

  operation(): RequestOperation {
    return RequestOperation.PNRemovePushNotificationEnabledChannelsOperation;
  }

  async parse(response: TransportResponse): Promise<Push.ManageDeviceChannelsResponse> {
    return super.parse(response).then((_) =>({}));
  }
}
