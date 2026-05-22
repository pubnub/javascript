/**
 * Update Channel REST API module.
 *
 * Full resource replacement via PUT.
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
type RequestParameters = DataSync.UpdateChannelParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Update Channel request.
 *
 * @internal
 */
export class UpdateChannelRequest<
  Response extends DataSync.UpdateChannelResponse,
> extends AbstractRequest<Response, Response> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.PUT });
  }

  operation(): RequestOperation {
    return RequestOperation.PNUpdateChannelOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.id) return 'Channel id cannot be empty';
    if (!this.parameters.channel) return 'Channel cannot be empty';
    if (this.parameters.channel.entityClassVersion === undefined || this.parameters.channel.entityClassVersion === null)
      return 'Entity class version cannot be empty';
  }

  protected get headers(): Record<string, string> | undefined {
    let headers = super.headers ?? {};

    if (this.parameters.ifMatchesEtag)
      headers = { ...headers, 'If-Match': this.parameters.ifMatchesEtag };

    return {
      ...headers,
      'Content-Type': 'application/vnd.pubnub.objects.channel+json;version=1',
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      id,
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/channels/${encodeString(id)}`;
  }

  protected get body(): ArrayBuffer | string | undefined {
    return JSON.stringify({ data: this.parameters.channel });
  }
}
