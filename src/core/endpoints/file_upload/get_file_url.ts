/**
 * File sharing REST API module.
 */

import { TransportResponse } from '../../types/transport-response';
import { TransportMethod } from '../../types/transport-request';
import { AbstractRequest } from '../../components/request';
import * as FileSharing from '../../types/api/file-sharing';
import RequestOperation from '../../constants/operations';
import { encodeString } from '../../utils';
import { KeySet } from '../../types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = FileSharing.FileUrlParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};
// endregion

/**
 * File download Url generation request.
 *
 * Local request which generates Url to download shared file from the specific channel.
 *
 * @internal
 */
export class GetFileDownloadUrlRequest extends AbstractRequest<FileSharing.FileUrlResponse> {
  /**
   * Construct file download Url generation request.
   *
   * @param parameters - Request configuration.
   */
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.LOCAL });
  }

  operation(): RequestOperation {
    return RequestOperation.PNGetFileUrlOperation;
  }

  validate(): string | undefined {
    const { channel, id, name } = this.parameters;

    if (!channel) return "channel can't be empty";
    if (!id) return "file id can't be empty";
    if (!name) return "file name can't be empty";
  }

  async parse(response: TransportResponse): Promise<FileSharing.FileUrlResponse> {
    return response.url;
  }

  protected get path(): string {
    const {
      channel,
      id,
      name,
      keySet: { subscribeKey },
    } = this.parameters;

    return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/files/${id}/${name}`;
  }
}
