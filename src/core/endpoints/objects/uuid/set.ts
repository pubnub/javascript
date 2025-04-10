/**
 * Set UUID Metadata REST API module.
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
type RequestParameters = AppContext.SetUUIDMetadataParameters<AppContext.CustomData> & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Set UUID Metadata request.
 *
 * @internal
 */
export class SetUUIDMetadataRequest<
  Response extends AppContext.SetUUIDMetadataResponse<Custom>,
  Custom extends AppContext.CustomData = AppContext.CustomData,
> extends AbstractRequest<Response, Response> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.PATCH });

    // Apply default request parameters.
    parameters.include ??= {};
    parameters.include.customFields ??= INCLUDE_CUSTOM_FIELDS;

    // Remap for backward compatibility.
    if (this.parameters.userId) this.parameters.uuid = this.parameters.userId;
  }

  operation(): RequestOperation {
    return RequestOperation.PNSetUUIDMetadataOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.uuid) return "'uuid' cannot be empty";
    if (!this.parameters.data) return 'Data cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    if (this.parameters.ifMatchesEtag) {
      return { ...(super.headers ?? {}), 'If-Match': this.parameters.ifMatchesEtag };
    } else {
      return super.headers;
    }
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      uuid,
    } = this.parameters;

    return `/v2/objects/${subscribeKey}/uuids/${encodeString(uuid!)}`;
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
