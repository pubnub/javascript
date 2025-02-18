/**
 * Get UUID Metadata REST API module.
 *
 * @internal
 */

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
 * Whether UUID custom field should be included by default or not.
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
type RequestParameters = AppContext.GetUUIDMetadataParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Get UUID Metadata request.
 *
 * @internal
 */
export class GetUUIDMetadataRequest<
  Response extends AppContext.GetUUIDMetadataResponse<Custom>,
  Custom extends AppContext.CustomData = AppContext.CustomData,
> extends AbstractRequest<Response, Response> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply default request parameters.
    parameters.include ??= {};
    parameters.include.customFields ??= INCLUDE_CUSTOM_FIELDS;

    // Remap for backward compatibility.
    if (this.parameters.userId) this.parameters.uuid = this.parameters.userId;
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetUUIDMetadataOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.uuid) return "'uuid' cannot be empty";
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      uuid,
    } = this.parameters;

    return `/v2/objects/${subscribeKey}/uuids/${encodeString(uuid!)}`;
  }

  protected get queryParameters(): Query {
    const { include } = this.parameters;

    return { include: ['status', 'type', ...(include!.customFields ? ['custom'] : [])].join(',') };
  }
}
