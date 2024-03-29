/**
 * Get Presence State REST API module.
 */

import { createValidationError, PubNubError } from '../../../models/PubNubError';
import { TransportResponse } from '../../types/transport-response';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { KeySet, Payload, Query } from '../../types/api';
import * as Presence from '../../types/api/presence';
import { encodeString } from '../../utils';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = Presence.GetPresenceStateParameters & {
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
   * Get presence state human-readable result.
   */
  message: string;

  /**
   * Name of the service which provided response.
   */
  service: string;

  /**
   * Whether response represent service error or not.
   */
  uuid: string;

  /**
   * Retrieved {@link uuid} per-channel associated presence state.
   */
  payload: Record<string, Payload> | Payload;
};
// endregion

/**
 * Get `uuid` presence state request.
 */
export class GetPresenceStateRequest extends AbstractRequest<Presence.GetPresenceStateResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply defaults.
    this.parameters.channels ??= [];
    this.parameters.channelGroups ??= [];
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetStateOperation;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey },
      channels,
      channelGroups,
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (channels && channels.length > 0 && channelGroups && channelGroups.length > 0)
      return 'Only `channels` or `channelGroups` can be specified at once.';
  }

  async parse(response: TransportResponse): Promise<Presence.GetPresenceStateResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse)
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );

    const { channels, channelGroups } = this.parameters;
    const state: { channels: Record<string, Payload> } = { channels: {} };

    if (channels?.length === 1 && channelGroups?.length === 0) state.channels[channels[0]] = serviceResponse.payload;
    else state.channels = serviceResponse.payload as Record<string, Payload>;

    return state;
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      uuid,
      channels,
    } = this.parameters;
    const stringifiedChannels = channels && channels.length > 0 ? encodeString(channels.join(',')) : ',';

    return `/v2/presence/sub-key/${subscribeKey}/channel/${stringifiedChannels}/uuid/${uuid}`;
  }

  protected get queryParameters(): Query {
    const { channelGroups } = this.parameters;
    if (!channelGroups || channelGroups.length === 0) return {};

    return { 'channel-group': channelGroups.join(',') };
  }
}
