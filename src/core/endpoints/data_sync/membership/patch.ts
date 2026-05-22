/**
 * Patch Membership REST API module.
 *
 * Partial update via JSON Patch (RFC 6902).
 * Accepts `add` and `replace` (dot-notation key-value pairs) and `remove`
 * (dot-notation paths) and converts them to JSON Patch operations on the wire.
 *
 * @internal
 */

import { TransportMethod } from '../../../types/transport-request';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import * as DataSync from '../../../types/api/data-sync';
import { toJsonPatchOperations } from '../../../types/api/data-sync';
import { KeySet } from '../../../types/api';
import { encodeString } from '../../../utils';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = DataSync.PatchMembershipParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Patch Membership request.
 *
 * @internal
 */
export class PatchMembershipRequest<Response extends DataSync.PatchMembershipResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.PATCH });
  }

  operation(): RequestOperation {
    return RequestOperation.PNPatchMembershipOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.id) return 'Membership id cannot be empty';

    const hasAdd = this.parameters.add && Object.keys(this.parameters.add).length > 0;
    const hasReplace = this.parameters.replace && Object.keys(this.parameters.replace).length > 0;
    const hasRemove = this.parameters.remove && this.parameters.remove.length > 0;
    if (!hasAdd && !hasReplace && !hasRemove) return 'At least one of add, replace, or remove must be provided';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.ifMatchesEtag) headers = { ...headers, 'If-Match': this.parameters.ifMatchesEtag };

    if (this.parameters.idempotencyKey) headers = { ...headers, 'Idempotency-Key': this.parameters.idempotencyKey };

    return {
      ...headers,
      'Content-Type': 'application/json-patch+json',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      id,
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/memberships/${encodeString(id)}`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    // Prefix all field paths with 'payload.' so users write simple field names
    // and the SDK produces '/payload/<field>' on the wire.
    const prefixWithPayload = (input: Record<string, unknown>) =>
      Object.fromEntries(Object.entries(input).map(([key, value]) => [`payload.${key}`, value]));

    const prefixedAdd = this.parameters.add ? prefixWithPayload(this.parameters.add) : undefined;
    const prefixedReplace = this.parameters.replace ? prefixWithPayload(this.parameters.replace) : undefined;
    const prefixedRemove = this.parameters.remove ? this.parameters.remove.map((key) => `payload.${key}`) : undefined;

    // Convert add/replace/remove (dot notation) to JSON Patch operations (JSON Pointer notation).
    const jsonPatchOps = toJsonPatchOperations(prefixedAdd, prefixedReplace, prefixedRemove);
    return JSON.stringify(jsonPatchOps);
  }
}
