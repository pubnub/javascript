/**
 * PAM Audit REST API module.
 *
 * @internal
 */

import { TransportResponse } from '../../types/transport-response';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import * as PAM from '../../types/api/access-manager';
import { KeySet, Query } from '../../types/api';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Auth keys for which permissions should be audited.
 */
const AUTH_KEYS: string[] = [];
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = PAM.AuditParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};

/**
 * Service success response.
 */
type ServiceResponse = {
  /**
   * Request result status code.
   */
  status: number;

  /**
   * Permissions audit human-readable result.
   */
  message: string;

  /**
   * Retrieved permissions information.
   */
  payload: PAM.PermissionsResponse;

  /**
   * Name of the service which provided response.
   */
  service: string;
};
// endregion

/**
 * Permissions audit request.
 *
 * @internal
 */
export class AuditRequest extends AbstractRequest<PAM.PermissionsResponse, ServiceResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply default request parameters.
    this.parameters.authKeys ??= AUTH_KEYS;
  }

  operation(): RequestOperation {
    return RequestOperation.PNAccessManagerAudit;
  }

  validate(): string | undefined {
    if (!this.parameters.keySet.subscribeKey) return 'Missing Subscribe Key';
  }

  async parse(response: TransportResponse): Promise<PAM.PermissionsResponse> {
    return this.deserializeResponse(response).payload;
  }

  protected get path(): string {
    return `/v2/auth/audit/sub-key/${this.parameters.keySet.subscribeKey}`;
  }

  protected get queryParameters(): Query {
    const { channel, channelGroup, authKeys } = this.parameters;

    return {
      ...(channel ? { channel } : {}),
      ...(channelGroup ? { 'channel-group': channelGroup } : {}),
      ...(authKeys && authKeys.length ? { auth: authKeys.join(',') } : {}),
    };
  }
}
