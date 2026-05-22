/**
 * Create Channel REST API module.
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
type RequestParameters = DataSync.CreateChannelParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Create Channel request.
 *
 * @internal
 */
export class CreateChannelRequest<
  Response extends DataSync.CreateChannelResponse,
> extends AbstractRequest<Response, Response> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.POST });
  }

  operation(): RequestOperation {
    return RequestOperation.PNCreateChannelOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.channel) return 'Channel cannot be empty';
    if (this.parameters.channel.entityClassVersion === undefined || this.parameters.channel.entityClassVersion === null)
      return 'Entity class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.idempotencyKey)
      headers = { ...headers, 'Idempotency-Key': this.parameters.idempotencyKey };

    return {
      ...headers,
      'Content-Type': 'application/vnd.pubnub.objects.channel+json;version=1',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/channels`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    return JSON.stringify({ data: this.parameters.channel });
  }
}
