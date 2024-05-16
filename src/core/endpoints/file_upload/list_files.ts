/**
 * List Files REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
import { AbstractRequest } from '../../components/request';
import * as FileSharing from '../../types/api/file-sharing';
import RequestOperation from '../../constants/operations';
import { KeySet, Query } from '../../types/api';
import { encodeString } from '../../utils';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Number of files to return in response.
 */
const LIMIT = 100;
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = FileSharing.ListFilesParameters & {
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

  /**
   * List of shared files for specified channel.
   */
  data: FileSharing.SharedFile[];

  /**
   * Next files list page token.
   */
  next: string;

  /**
   * Number of returned files.
   */
  count: number;
};
// endregion

/**
 * Files List request.
 *
 * @internal
 */
export class FilesListRequest extends AbstractRequest<FileSharing.ListFilesResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply default request parameters.
    this.parameters.limit ??= LIMIT;
  }

  operation(): RequestOperation {
    return RequestOperation.PNListFilesOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.channel) return "channel can't be empty";
  }

  async parse(response: TransportResponse): Promise<FileSharing.ListFilesResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    return serviceResponse;
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channel,
    } = this.parameters;

    return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/files`;
  }

  protected get queryParameters(): Query {
    const { limit, next } = this.parameters;

    return { limit: limit!, ...(next ? { next } : {}) };
  }
}
