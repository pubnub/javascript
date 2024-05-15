/**
 * Manage channels enabled for device push REST API module.
 */

import { TransportResponse } from '../../types/transport-response';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { KeySet, Query } from '../../types/api';
import * as Push from '../../types/api/push';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Environment for which APNS2 notifications
 */
const ENVIRONMENT = 'development';

/**
 * Maximum number of channels in `list` response.
 */
const MAX_COUNT = 1000;
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = (Push.ManageDeviceChannelsParameters | Push.RemoveDeviceParameters) & {
  /**
   * Action which should be performed.
   */
  action: 'add' | 'remove' | 'remove-device' | 'list';

  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Base push notification request.
 *
 * @internal
 */
export class BasePushNotificationChannelsRequest<R> extends AbstractRequest<R> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply request defaults
    if (this.parameters.pushGateway === 'apns2') this.parameters.environment ??= ENVIRONMENT;
    if (this.parameters.count && this.parameters.count > MAX_COUNT) this.parameters.count = MAX_COUNT;
  }

  operation(): RequestOperation {
    throw Error('Should be implemented in subclass.');
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey },
      action,
      device,
      pushGateway,
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (!device) return 'Missing Device ID (device)';
    if (
      (action === 'add' || action === 'remove') &&
      (!('channels' in this.parameters) || this.parameters.channels.length === 0)
    )
      return 'Missing Channels';

    if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns2)';
    if (this.parameters.pushGateway === 'apns2' && !this.parameters.topic) return 'Missing APNS2 topic';
  }

  async parse(_response: TransportResponse): Promise<R> {
    throw Error('Should be implemented in subclass.');
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      action,
      device,
      pushGateway,
    } = this.parameters;

    let path =
      pushGateway === 'apns2'
        ? `/v2/push/sub-key/${subscribeKey}/devices-apns2/${device}`
        : `/v1/push/sub-key/${subscribeKey}/devices/${device}`;
    if (action === 'remove-device') path = `${path}/remove`;

    return path;
  }

  protected get queryParameters(): Query {
    const { start, count } = this.parameters;
    let query: Query = {
      type: this.parameters.pushGateway,
      ...(start ? { start } : {}),
      ...(count && count > 0 ? { count } : {}),
    };

    if ('channels' in this.parameters) query[this.parameters.action] = this.parameters.channels.join(',');
    if (this.parameters.pushGateway === 'apns2') {
      const { environment, topic } = this.parameters;
      query = { ...query, environment: environment!, topic };
    }

    return query;
  }
}
