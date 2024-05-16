/**
 * Announce heartbeat REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import * as Presence from '../../types/api/presence';
import { KeySet, Query } from '../../types/api';
import { encodeNames } from '../../utils';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = Presence.PresenceHeartbeatParameters & {
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
   * Presence heartbeat announce human-readable result.
   */
  message: string;

  /**
   * Name of the service which provided response.
   */
  service: string;
};
// endregion

/**
 * Announce `uuid` presence request.
 *
 * @internal
 */
export class HeartbeatRequest extends AbstractRequest<Presence.PresenceHeartbeatResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNHeartbeatOperation;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey },
      channels = [],
      channelGroups = [],
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (channels.length === 0 && channelGroups.length === 0)
      return 'Please provide a list of channels and/or channel-groups';
  }

  async parse(response: TransportResponse): Promise<Presence.PresenceHeartbeatResponse> {
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
      channels,
    } = this.parameters;

    return `/v2/presence/sub-key/${subscribeKey}/channel/${encodeNames(channels ?? [], ',')}/heartbeat`;
  }

  protected get queryParameters(): Query {
    const { channelGroups, state, heartbeat } = this.parameters;
    const query: Record<string, string> = { heartbeat: `${heartbeat}` };

    if (channelGroups && channelGroups.length !== 0) query['channel-group'] = channelGroups.join(',');
    if (state) query.state = JSON.stringify(state);

    return query;
  }
}
