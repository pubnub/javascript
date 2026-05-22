/**
 * Update Entity REST API module.
 *
 * Full resource replacement via PUT.
 * Note: `entityClass` is immutable and cannot be changed via update.
 *
 * @internal
 */

import { TransportMethod } from '../../../types/transport-request';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as DataSync from '../../../types/api/data-sync';
import { KeySet } from '../../../types/api';
import { encodeString } from '../../../utils';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = DataSync.UpdateEntityParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Update Entity request.
 *
 * @internal
 */
export class UpdateEntityRequest<
  Response extends DataSync.UpdateEntityResponse,
> extends AbstractRequest<Response, Response> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.PUT });
  }

  operation(): RequestOperation {
    return RequestOperation.PNUpdateEntityOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.id) return 'Entity id cannot be empty';
    if (!this.parameters.entity) return 'Entity cannot be empty';
    if (this.parameters.entity.entityClassVersion === undefined || this.parameters.entity.entityClassVersion === null)
      return 'Entity class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.ifMatchesEtag)
      headers = { ...headers, 'If-Match': this.parameters.ifMatchesEtag };

    return {
      ...headers,
      'Content-Type': 'application/vnd.pubnub.objects.entity+json;version=1',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      id,
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/entities/${encodeString(id)}`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    return JSON.stringify({ data: this.parameters.entity });
  }
}
