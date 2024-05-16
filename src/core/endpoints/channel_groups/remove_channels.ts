/**
 * Remove channel group channels REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
import * as ChannelGroups from '../../types/api/channel-groups';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { KeySet, Query } from '../../types/api';
import { encodeString } from '../../utils';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = ChannelGroups.ManageChannelGroupChannelsParameters & {
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
   * Channel group channels manage human-readable result.
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
};
// endregion

/**
 * Remove channel group channels request.
 *
 * @internal
 */
// prettier-ignore
export class RemoveChannelGroupChannelsRequest extends AbstractRequest<
  ChannelGroups.ManageChannelGroupChannelsResponse
> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNRemoveChannelsFromGroupOperation;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey },
      channels,
      channelGroup,
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (!channelGroup) return 'Missing Channel Group';
    if (!channels) return 'Missing channels';
  }

  async parse(response: TransportResponse): Promise<ChannelGroups.ManageChannelGroupChannelsResponse> {
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
      channelGroup,
    } = this.parameters;

    return `/v1/channel-registration/sub-key/${subscribeKey}/channel-group/${encodeString(channelGroup)}`;
  }

  protected get queryParameters(): Query {
    return { remove: this.parameters.channels.join(',') };
  }
}
