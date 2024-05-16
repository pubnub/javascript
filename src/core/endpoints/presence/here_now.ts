/**
 * Channels / channel groups presence REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { KeySet, Payload, Query } from '../../types/api';
import * as Presence from '../../types/api/presence';
import { encodeNames } from '../../utils';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether `uuid` should be included in response or not.
 */
const INCLUDE_UUID = true;

/**
 * Whether state associated with `uuid` should be included in response or not.
 */
const INCLUDE_STATE = false;
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = Presence.HereNowParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};

/**
 * Service success response.
 */
type BasicServiceResponse = {
  /**
   * Request result status code.
   */
  status: number;

  /**
   * Here now human-readable result.
   */
  message: string;

  /**
   * Name of the service which provided response.
   */
  service: string;
};

/**
 * Single channel here now service response.
 */
type SingleChannelServiceResponse = BasicServiceResponse & {
  /**
   * List of received channel subscribers.
   *
   * **Note:** Field is missing if `uuid` and `state` not included.
   */
  uuids?: (string | { uuid: string; state?: Payload })[];

  /**
   * Total number of active subscribers.
   */
  occupancy: number;
};

/**
 * Multiple channels / channel groups here now service response.
 */
type MultipleChannelServiceResponse = BasicServiceResponse & {
  /**
   * Retrieved channels' presence.
   */
  payload: {
    /**
     * Total number of channels for which presence information received.
     */
    total_channels: number;

    /**
     * Total occupancy for all retrieved channels.
     */
    total_occupancy: number;

    /**
     * List of channels to which `uuid` currently subscribed.
     */
    channels?: {
      [p: string]: {
        /**
         * List of received channel subscribers.
         *
         * **Note:** Field is missing if `uuid` and `state` not included.
         */
        uuids: (string | { uuid: string; state?: Payload })[];

        /**
         * Total number of active subscribers in single channel.
         */
        occupancy: number;
      };
    };
  };
};

/**
 * Here now REST API service success response.
 */
type ServiceResponse = SingleChannelServiceResponse | MultipleChannelServiceResponse;
// endregion

/**
 * Channel presence request.
 *
 * @internal
 */
export class HereNowRequest extends AbstractRequest<Presence.HereNowResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply defaults.
    this.parameters.queryParameters ??= {};
    this.parameters.includeUUIDs ??= INCLUDE_UUID;
    this.parameters.includeState ??= INCLUDE_STATE;
  }

  operation(): RequestOperation {
    const { channels = [], channelGroups = [] } = this.parameters;
    return channels.length === 0 && channelGroups.length === 0
      ? RequestOperation.PNGlobalHereNowOperation
      : RequestOperation.PNHereNowOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.keySet.subscribeKey) return 'Missing Subscribe Key';
  }

  async parse(response: TransportResponse): Promise<Presence.HereNowResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    // Extract general presence information.
    const totalChannels = 'occupancy' in serviceResponse ? 1 : serviceResponse.payload.total_channels;
    const totalOccupancy =
      'occupancy' in serviceResponse ? serviceResponse.occupancy : serviceResponse.payload.total_channels;
    const channelsPresence: Presence.HereNowResponse['channels'] = {};
    let channels: Required<MultipleChannelServiceResponse['payload']>['channels'] = {};

    // Remap single channel presence to multiple channels presence response.
    if ('occupancy' in serviceResponse) {
      const channel = this.parameters.channels![0];
      channels[channel] = { uuids: serviceResponse.uuids ?? [], occupancy: totalOccupancy };
    } else channels = serviceResponse.payload.channels ?? {};

    Object.keys(channels).forEach((channel) => {
      const channelEntry = channels[channel];
      channelsPresence[channel] = {
        occupants: this.parameters.includeUUIDs!
          ? channelEntry.uuids.map((uuid) => {
              if (typeof uuid === 'string') return { uuid, state: null };
              return uuid;
            })
          : [],
        name: channel,
        occupancy: channelEntry.occupancy,
      };
    });

    return {
      totalChannels,
      totalOccupancy,
      channels: channelsPresence,
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channels,
      channelGroups,
    } = this.parameters;
    let path = `/v2/presence/sub-key/${subscribeKey}`;

    if ((channels && channels.length > 0) || (channelGroups && channelGroups.length > 0))
      path += `/channel/${encodeNames(channels ?? [], ',')}`;

    return path;
  }

  protected get queryParameters(): Query {
    const { channelGroups, includeUUIDs, includeState, queryParameters } = this.parameters;

    return {
      ...(!includeUUIDs! ? { disable_uuids: '1' } : {}),
      ...(includeState ?? false ? { state: '1' } : {}),
      ...(channelGroups && channelGroups.length > 0 ? { 'channel-group': channelGroups.join(',') } : {}),
      ...queryParameters!,
    };
  }
}
