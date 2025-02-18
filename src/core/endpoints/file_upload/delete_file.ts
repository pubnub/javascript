/**
 * Delete file REST API module.
 *
 * @internal
 */

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
type RequestParameters = FileSharing.DeleteFileParameters & {
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
   * Request processing result status code.
   */
  status: number;
};
// endregion

/**
 * Delete File request.
 *
 * @internal
 */
export class DeleteFileRequest extends AbstractRequest<FileSharing.DeleteFileResponse, ServiceResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.DELETE });
  }

  operation(): RequestOperation {
    return RequestOperation.PNDeleteFileOperation;
  }

  validate(): string | undefined {
    const { channel, id, name } = this.parameters;

    if (!channel) return "channel can't be empty";
    if (!id) return "file id can't be empty";
    if (!name) return "file name can't be empty";
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      id,
      channel,
      name,
    } = this.parameters;

    return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/files/${id}/${name}`;
  }
}
