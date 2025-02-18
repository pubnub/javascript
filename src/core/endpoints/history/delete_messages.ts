/**
 * Delete messages REST API module.
 *
 * @internal
 */

import type { TransportResponse } from '../../types/transport-response';
import { TransportMethod } from '../../types/transport-request';
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
type RequestParameters = History.DeleteMessagesParameters & {
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
};
// endregion

/**
 * Delete messages from channel history.
 *
 * @internal
 */
export class DeleteMessageRequest extends AbstractRequest<History.DeleteMessagesResponse, ServiceResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.DELETE });
  }

  operation(): RequestOperation {
    return RequestOperation.PNDeleteMessagesOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.keySet.subscribeKey) return 'Missing Subscribe Key';
    if (!this.parameters.channel) return 'Missing channel';
  }

  async parse(response: TransportResponse): Promise<History.DeleteMessagesResponse> {
    return super.parse(response).then((_) => ({}));
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channel,
    } = this.parameters;

    return `/v3/history/sub-key/${subscribeKey}/channel/${encodeString(channel)}`;
  }

  protected get queryParameters(): Query {
    const { start, end } = this.parameters;

    return {
      ...(start ? { start } : {}),
      ...(end ? { end } : {}),
    };
  }
}
