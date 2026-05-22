/**
 * Get Channel REST API module.
 *
 * @internal
 */

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
type RequestParameters = DataSync.GetChannelParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * Get Channel request.
 *
 * @internal
 */
export class GetChannelRequest<Response extends DataSync.GetChannelResponse> extends AbstractRequest<
  Response,
  Response
> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetChannelOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.id) return 'Channel id cannot be empty';
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      id,
    } = this.parameters;

    return `/v1/datasync/subkeys/${subscribeKey}/channels/${encodeString(id)}`;
  }
}
