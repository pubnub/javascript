/**
 * Add Message Action REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
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
type RequestParameters = MessageAction.AddMessageActionParameters & {
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
  data: MessageAction.MessageAction;
};
// endregion

/**
 * Add Message Reaction request.
 *
 * @internal
 */
export class AddMessageActionRequest extends AbstractRequest<MessageAction.AddMessageActionResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.POST });
  }

  operation(): RequestOperation {
    return RequestOperation.PNAddMessageActionOperation;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey },
      action,
      channel,
      messageTimetoken,
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (!channel) return 'Missing message channel';
    if (!messageTimetoken) return 'Missing message timetoken';
    if (!action) return 'Missing Action';
    if (!action.value) return 'Missing Action.value';
    if (!action.type) return 'Missing Action.type';
    if (action.type.length > 15) return 'Action.type value exceed maximum length of 15';
  }

  async parse(response: TransportResponse): Promise<MessageAction.AddMessageActionResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    return { data: serviceResponse.data };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channel,
      messageTimetoken,
    } = this.parameters;

    return `/v1/message-actions/${subscribeKey}/channel/${encodeString(channel)}/message/${messageTimetoken}`;
  }

  protected get headers(): Record<string, string> | undefined {
    return { 'Content-Type': 'application/json' };
  }

  protected get body(): ArrayBuffer | string | undefined {
    return JSON.stringify(this.parameters.action);
  }
}
