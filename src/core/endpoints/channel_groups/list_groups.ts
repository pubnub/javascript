/**
 * List All Channel Groups REST API module.
 *
 * @internal
 */

import { TransportResponse } from '../../types/transport-response';
import * as ChannelGroups from '../../types/api/channel-groups';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { KeySet } from '../../types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = {
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
   * List all channel groups human-readable result.
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
     * Subscription key for which list of channel groups has been received.
     */
    sub_key: string;

    /**
     * List of channel groups created for {@link sub_key}.
     */
    groups: string[];
  };
};
// endregion

/**
 * List all channel groups request.
 *
 * @internal
 */
export class ListChannelGroupsRequest extends AbstractRequest<
  ChannelGroups.ListAllChannelGroupsResponse,
  ServiceResponse
> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNChannelGroupsOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.keySet.subscribeKey) return 'Missing Subscribe Key';
  }

  async parse(response: TransportResponse): Promise<ChannelGroups.ListAllChannelGroupsResponse> {
    return { groups: this.deserializeResponse(response).payload.groups };
  }

  protected get path(): string {
    return `/v1/channel-registration/sub-key/${this.parameters.keySet.subscribeKey}/channel-group`;
  }
}
