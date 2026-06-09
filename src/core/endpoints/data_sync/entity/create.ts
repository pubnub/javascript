/**
 * Create Entity REST API module.
 *
 * @internal
 */

import { TransportMethod } from '../../../types/transport-request';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as DataSync from '../../../types/api/data-sync';
import { KeySet } from '../../../types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = DataSync.CreateEntityParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Create Entity request.
 *
 * @internal
 */
export class CreateEntityRequest<Response extends DataSync.CreateEntityResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.POST });
  }

  operation(): RequestOperation {
    return RequestOperation.PNCreateEntityOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.entity) return 'Entity cannot be empty';
    if (!this.parameters.entity.entityClass) return 'Entity class cannot be empty';
    if (this.parameters.entity.entityClassVersion === undefined || this.parameters.entity.entityClassVersion === null)
      return 'Entity class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.idempotencyKey) headers = { ...headers, 'Idempotency-Key': this.parameters.idempotencyKey };

    return {
      ...headers,
      'Content-Type': 'application/vnd.pubnub.objects.entity+json;version=1',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/entities`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    return JSON.stringify({ data: this.parameters.entity });
  }
}
