/**
 * Create Relationship REST API module.
 *
 * @internal
 */

import { TransportMethod } from '../../../types/transport-request';
import { TransportResponse } from '../../../types/transport-response';
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
    return RequestOperation.PNCreateDataSyncRelationshipOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
    // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
    const parsed = this.deserializeResponse(response);
    return { ...parsed, status: response.status } as Response;
  }

  validate(): string | undefined {
    if (!this.parameters.entityAId) return 'Entity A id cannot be empty';
    if (!this.parameters.entityBId) return 'Entity B id cannot be empty';
    if (!this.parameters.class) return 'Relationship class cannot be empty';
    if (!this.parameters.data) return 'Relationship data cannot be empty';
    if (!this.parameters.data.classVersion) return 'Relationship class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    const headers = super.headers ?? {};

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
    const { id, class: relationshipClass, entityAId, entityBId, data } = this.parameters;

    return JSON.stringify({
      data: {
        ...(id !== undefined ? { id } : {}),
        entityAId,
        entityBId,
        relationshipClass,
        relationshipClassVersion: data.classVersion,
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.payload !== undefined ? { payload: data.payload } : {}),
      },
    });
  }
}
