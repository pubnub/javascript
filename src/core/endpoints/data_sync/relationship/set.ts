/**
 * Set Relationship REST API module.
 *
 * Full resource replacement via PUT.
 *
 * @internal
 */

import { TransportMethod } from '../../../types/transport-request';
import { TransportResponse } from '../../../types/transport-response';
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
type RequestParameters = DataSync.SetRelationshipParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Set Relationship request.
 *
 * @internal
 */
export class SetRelationshipRequest<Response extends DataSync.SetRelationshipResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.PUT });
  }

  operation(): RequestOperation {
    return RequestOperation.PNSetDataSyncRelationshipOperation;
  }

  async parse(response: TransportResponse): Promise<Response> {
    // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
    // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
    const parsed = this.deserializeResponse(response);
    return { ...parsed, status: response.status } as Response;
  }

  validate(): string | undefined {
    if (!this.parameters.id) return 'Relationship id cannot be empty';
    if (!this.parameters.entityAId) return 'Entity A id cannot be empty';
    if (!this.parameters.entityBId) return 'Entity B id cannot be empty';
    if (!this.parameters.data) return 'Relationship data cannot be empty';
    if (!this.parameters.data.classVersion) return 'Relationship class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.ifMatchesEtag) headers = { ...headers, 'If-Match': this.parameters.ifMatchesEtag };

    return {
      ...headers,
      'Content-Type': 'application/vnd.pubnub.objects.relationship+json;version=1',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      id,
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/relationships/${encodeString(id)}`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    const { entityAId, entityBId, data } = this.parameters;

    return JSON.stringify({
      data: {
        entityAId,
        entityBId,
        relationshipClassVersion: data.classVersion,
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.payload !== undefined ? { payload: data.payload } : {}),
      },
    });
  }
}
