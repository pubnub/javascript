/**
 * List channel group channels REST API module.
 *
 * @internal
 */

import { TransportResponse } from '../../types/transport-response';
import * as ChannelGroups from '../../types/api/channel-groups';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { encodeString } from '../../utils';
import { KeySet } from '../../types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = ChannelGroups.ListChannelGroupChannelsParameters & {
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
   * List channel group channels human-readable result.
   */
  message: string;

  /**
   * Name of the service which provided response.
   */
  service: string;

  /**
   * Whether response represent service error or not.
   */
  error: boolean;

  /**
   * Retrieved registered channels information.
   */
  payload: {
    /**
     * Channel group for which channels has been received.
     */
    group: string;

    /**
     * List of channels registered in channel {@link group}.
     */
    channels: string[];
  };
};
// endregion

/**
 * List Channel Group Channels request.
 *
 * @internal
 */
export class ListChannelGroupChannels extends AbstractRequest<
  ChannelGroups.ListChannelGroupChannelsResponse,
  ServiceResponse
> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNChannelsForGroupOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.keySet.subscribeKey) return 'Missing Subscribe Key';
    if (!this.parameters.channelGroup) return 'Missing Channel Group';
  }

  async parse(response: TransportResponse): Promise<ChannelGroups.ListChannelGroupChannelsResponse> {
    return { channels: this.deserializeResponse(response).payload.channels };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channelGroup,
    } = this.parameters;

    return `/v1/channel-registration/sub-key/${subscribeKey}/channel-group/${encodeString(channelGroup)}`;
  }
}
