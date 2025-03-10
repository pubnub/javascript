/**
 * Remove Message Action REST API module.
 *
 * @internal
 */

import { TransportResponse } from '../../types/transport-response';
import { TransportMethod } from '../../types/transport-request';
import * as MessageAction from '../../types/api/message-action';
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
type RequestParameters = MessageAction.RemoveMessageActionParameters & {
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
   * Request processing result data.
   */
  data: Record<string, unknown>;
};
// endregion

/**
 * Remove specific message action request.
 *
 * @internal
 */
export class RemoveMessageAction extends AbstractRequest<MessageAction.RemoveMessageActionResponse, ServiceResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.DELETE });
  }

  operation(): RequestOperation {
    return RequestOperation.PNRemoveMessageActionOperation;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey },
      channel,
      messageTimetoken,
      actionTimetoken,
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (!channel) return 'Missing message action channel';
    if (!messageTimetoken) return 'Missing message timetoken';
    if (!actionTimetoken) return 'Missing action timetoken';
  }

  async parse(response: TransportResponse): Promise<MessageAction.RemoveMessageActionResponse> {
    return super.parse(response).then(({ data }) => ({ data }));
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channel,
      actionTimetoken,
      messageTimetoken,
    } = this.parameters;

    return `/v1/message-actions/${subscribeKey}/channel/${encodeString(
      channel,
    )}/message/${messageTimetoken}/action/${actionTimetoken}`;
  }
}
