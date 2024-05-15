/**
 * Set Channel Metadata REST API module.
 */

import { createValidationError, PubNubError } from '../../../../errors/pubnub-error';
import { TransportResponse } from '../../../types/transport-response';
import { PubNubAPIError } from '../../../../errors/pubnub-api-error';
import { TransportMethod } from '../../../types/transport-request';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as AppContext from '../../../types/api/app-context';
import { KeySet, Query } from '../../../types/api';
import { encodeString } from '../../../utils';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether `Channel` custom field should be included by default or not.
 */
const INCLUDE_CUSTOM_FIELDS = true;
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = AppContext.SetChannelMetadataParameters<AppContext.CustomData> & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Set Channel Metadata request.
 *
 * @internal
 */
export class SetChannelMetadataRequest<
  Response extends AppContext.SetChannelMetadataResponse<Custom>,
  Custom extends AppContext.CustomData = AppContext.CustomData,
> extends AbstractRequest<Response> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.PATCH });

    // Apply default request parameters.
    parameters.include ??= {};
    parameters.include.customFields ??= INCLUDE_CUSTOM_FIELDS;
  }

  operation(): RequestOperation {
    return RequestOperation.PNSetChannelMetadataOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.channel) return 'Channel cannot be empty';
    if (!this.parameters.data) return 'Data cannot be empty';
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

  protected get queryParameters(): Query {
    return {
      include: ['status', 'type', ...(this.parameters.include!.customFields ? ['custom'] : [])].join(','),
    };
  }

  protected get body(): ArrayBuffer | string | undefined {
    return JSON.stringify(this.parameters.data);
  }
}
