/**
 * Delete channel group REST API module.
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
type RequestParameters = ChannelGroups.DeleteChannelGroupParameters & {
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
   * Delete channel group human-readable result.
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
 * Channel group delete request.
 *
 * @internal
 */
export class DeleteChannelGroupRequest extends AbstractRequest<
  ChannelGroups.DeleteChannelGroupResponse,
  ServiceResponse
> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNRemoveGroupOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.keySet.subscribeKey) return 'Missing Subscribe Key';
    if (!this.parameters.channelGroup) return 'Missing Channel Group';
  }

  async parse(response: TransportResponse): Promise<ChannelGroups.DeleteChannelGroupResponse> {
    return super.parse(response).then((_) => ({}));
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channelGroup,
    } = this.parameters;

    return `/v1/channel-registration/sub-key/${subscribeKey}/channel-group/${encodeString(channelGroup)}/remove`;
  }
}
