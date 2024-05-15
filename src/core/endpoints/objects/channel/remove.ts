/**
 * Remove Channel Metadata REST API module.
 */

import { createValidationError, PubNubError } from '../../../../errors/pubnub-error';
import { TransportResponse } from '../../../types/transport-response';
import { PubNubAPIError } from '../../../../errors/pubnub-api-error';
import { TransportMethod } from '../../../types/transport-request';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as AppContext from '../../../types/api/app-context';
import { encodeString } from '../../../utils';
import { KeySet } from '../../../types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = AppContext.RemoveChannelMetadataParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Remove Channel Metadata request.
 *
 * @internal
 */
export class RemoveChannelMetadataRequest<
  Response extends AppContext.RemoveChannelMetadataResponse,
> extends AbstractRequest<Response> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.DELETE });
  }

  operation(): RequestOperation {
    return RequestOperation.PNRemoveChannelMetadataOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.channel) return 'Channel cannot be empty';
  }

  async parse(response: TransportResponse): Promise<Response> {
    const serviceResponse = this.deserializeResponse<Response>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    return serviceResponse;
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channel,
    } = this.parameters;

    return `/v2/objects/${subscribeKey}/channels/${encodeString(channel)}`;
  }
}
