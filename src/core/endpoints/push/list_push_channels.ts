/**
 * List Device push enabled channels REST API module.
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
  Push.ListDeviceChannelsResponse,
  ServiceResponse
> {
  constructor(parameters: RequestParameters) {
    super({ ...parameters, action: 'list' });
  }

  operation(): RequestOperation {
    return RequestOperation.PNPushNotificationEnabledChannelsOperation;
  }

  async parse(response: TransportResponse): Promise<Push.ListDeviceChannelsResponse> {
    return { channels: this.deserializeResponse(response) };
  }
}
