/**
 * Messages count REST API module.
 */

import { createValidationError, PubnubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import * as History from '../../types/api/history';
import { KeySet, Query } from '../../types/api';
import { encodeString } from '../../utils';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = History.MessageCountParameters & {
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
   * Whether service response represent error or not.
   */
  error: boolean;

  /**
   * Human-readable error explanation.
   */
  error_message: string;

  /**
   * Map of channel names to the number of counted messages.
   */
  channels: Record<string, number>;

  /**
   * Map of channel names to pre-computed REST API paths to fetch more.
   */
  more: {
    [p: string]: {
      /**
       * Pre-computed message count REST API url to fetch more information.
       */
      url: string;
      /**
       * Whether there is more information available or not.
       */
      is_more: boolean;
    };
  };
};
// endregion

export class MessageCountRequest extends AbstractRequest<History.MessageCountResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNMessageCounts;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey },
      channels,
      timetoken,
      channelTimetokens,
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (!channels) return 'Missing channels';
    if (timetoken && channelTimetokens) return '`timetoken` and `channelTimetokens` are incompatible together';
    if (!timetoken && !channelTimetokens) return '`timetoken` or `channelTimetokens` need to be set';
    if (channelTimetokens && channelTimetokens.length && channelTimetokens.length !== channels.length)
      return 'Length of `channelTimetokens` and `channels` do not match';
  }

  async parse(response: TransportResponse): Promise<History.MessageCountResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse)
      throw new PubnubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );

    return { channels: serviceResponse.channels };
  }

  protected get path(): string {
    return `/v3/history/sub-key/${this.parameters.keySet.subscribeKey}/message-counts/${encodeString(
      this.parameters.channels.join(','),
    )}`;
  }

  protected get queryParameters(): Query {
    let { channelTimetokens } = this.parameters;
    if (this.parameters.timetoken) channelTimetokens = [this.parameters.timetoken];

    return {
      ...(channelTimetokens!.length === 1 ? { timetoken: channelTimetokens![0] } : {}),
      ...(channelTimetokens!.length > 1 ? { channelsTimetoken: channelTimetokens!.join(',') } : {}),
    };
  }
}