/**
 * Announce leave REST API module.
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
type RequestParameters = Presence.PresenceLeaveParameters & {
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
   * Leave presence human-readable result.
   */
  message: string;

  /**
   * Performed presence action.
   */
  action: 'leave';

  /**
   * Name of the service which provided response.
   */
  service: string;
};
// endregion

/**
 * Announce user leave request.
 *
 * @internal
 */
export class PresenceLeaveRequest extends AbstractRequest<Presence.PresenceLeaveResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    if (this.parameters.channelGroups)
      this.parameters.channelGroups = Array.from(new Set(this.parameters.channelGroups));
    if (this.parameters.channels) this.parameters.channels = Array.from(new Set(this.parameters.channels));
  }

  operation(): RequestOperation {
    return RequestOperation.PNUnsubscribeOperation;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey },
      channels = [],
      channelGroups = [],
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (channels.length === 0 && channelGroups.length === 0)
      return 'At least one `channel` or `channel group` should be provided.';
  }

  async parse(response: TransportResponse): Promise<Presence.PresenceLeaveResponse> {
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

    return `/v2/presence/sub-key/${subscribeKey}/channel/${encodeNames(channels?.sort() ?? [], ',')}/leave`;
  }

  protected get queryParameters(): Query {
    const { channelGroups } = this.parameters;
    if (!channelGroups || channelGroups.length === 0) return {};

    return { 'channel-group': channelGroups.sort().join(',') };
  }
}
