/**
 * Get Message Actions REST API module.
 *
 * @internal
 */

import { TransportResponse } from '../../types/transport-response';
import * as MessageAction from '../../types/api/message-action';
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
type RequestParameters = MessageAction.GetMessageActionsParameters & {
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
   * Retrieved list of message actions.
   */
  data: MessageAction.MessageAction[];

  /**
   * More message actions fetch information.
   */
  more?: MessageAction.MoreMessageActions;
};
// endregion

/**
 * Fetch channel message actions request.
 *
 * @internal
 */
export class GetMessageActionsRequest extends AbstractRequest<
  MessageAction.GetMessageActionsResponse,
  ServiceResponse
> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetMessageActionsOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.keySet.subscribeKey) return 'Missing Subscribe Key';
    if (!this.parameters.channel) return 'Missing message channel';
  }

  async parse(response: TransportResponse): Promise<MessageAction.GetMessageActionsResponse> {
    const serviceResponse = this.deserializeResponse(response);
    let start: string | null = null;
    let end: string | null = null;

    if (serviceResponse.data.length > 0) {
      start = serviceResponse.data[0].actionTimetoken;
      end = serviceResponse.data[serviceResponse.data.length - 1].actionTimetoken;
    }

    return {
      data: serviceResponse.data,
      more: serviceResponse.more,
      start,
      end,
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channel,
    } = this.parameters;

    return `/v1/message-actions/${subscribeKey}/channel/${encodeString(channel)}`;
  }

  protected get queryParameters(): Query {
    const { limit, start, end } = this.parameters;

    return {
      ...(start ? { start } : {}),
      ...(end ? { end } : {}),
      ...(limit ? { limit } : {}),
    };
  }
}
