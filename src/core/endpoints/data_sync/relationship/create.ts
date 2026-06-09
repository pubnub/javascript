/**
 * Create Relationship REST API module.
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
type RequestParameters = DataSync.CreateRelationshipParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Create Relationship request.
 *
 * @internal
 */
export class CreateRelationshipRequest<Response extends DataSync.CreateRelationshipResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.POST });
  }

  operation(): RequestOperation {
    return RequestOperation.PNCreateRelationshipOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.relationship) return 'Relationship cannot be empty';
    if (!this.parameters.relationship.entityAId) return 'Entity A id cannot be empty';
    if (!this.parameters.relationship.entityBId) return 'Entity B id cannot be empty';
    if (!this.parameters.relationship.relationshipClass) return 'Relationship class cannot be empty';
    if (!this.parameters.relationship.relationshipClassVersion) return 'Relationship class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.idempotencyKey) headers = { ...headers, 'Idempotency-Key': this.parameters.idempotencyKey };

    return {
      ...headers,
      'Content-Type': 'application/vnd.pubnub.objects.relationship+json;version=1',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/relationships`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    return JSON.stringify({ data: this.parameters.relationship });
  }
}
