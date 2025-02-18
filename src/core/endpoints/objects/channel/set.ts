/**
 * Set Channel Metadata REST API module.
 *
 * @internal
 */

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
> extends AbstractRequest<Response, Response> {
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

  protected get headers(): Record<string, string> | undefined {
    if (this.parameters.ifMatchesEtag) {
      return { 'If-Match': this.parameters.ifMatchesEtag };
    } else {
      return undefined;
    }
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
