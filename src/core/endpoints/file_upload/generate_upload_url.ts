/**
 * Generate file upload URL REST API request.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
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
type RequestParameters = FileSharing.GenerateFileUploadUrlParameters & {
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
   * File upload URL generation result status code.
   */
  status: number;

  /**
   * PubNub Service response.
   */
  data: {
    /**
     * Unique file identifier.
     *
     * Unique file identifier, and it's {@link name} can be used to download file from the channel
     * later.
     */
    id: string;

    /**
     * Actual file name under which file has been stored.
     *
     * File name and unique {@link id} can be used to download file from the channel later.
     *
     * **Note:** Actual file name may be different from the one which has been used during file
     * upload.
     */
    name: string;
  };

  /**
   * PubNub service response extension.
   */
  file_upload_request: {
    /**
     * Pre-signed URL for file upload.
     */
    url: string;

    /**
     * HTTP method which should be used for file upload.
     */
    method: string;

    /**
     * Expiration date (ISO 8601 format) for the pre-signed upload request.
     */
    expiration_date: string;

    /**
     * An array of form fields to be used in the pre-signed POST request.
     *
     * **Important:** Form data fields should be passed in exact same order as received from
     * the PubNub service.
     */
    form_fields: {
      /**
       * Form data field name.
       */
      name: string;
      /**
       * Form data field value.
       */
      value: string;
    }[];
  };
};
// endregion

/**
 * Generate File Upload Url request.
 *
 * @internal
 */
export class GenerateFileUploadUrlRequest extends AbstractRequest<FileSharing.GenerateFileUploadUrlResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super({ method: TransportMethod.POST });
  }

  operation(): RequestOperation {
    return RequestOperation.PNGenerateUploadUrlOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.channel) return "channel can't be empty";
    if (!this.parameters.name) return "'name' can't be empty";
  }

  async parse(response: TransportResponse): Promise<FileSharing.GenerateFileUploadUrlResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    return {
      id: serviceResponse.data.id,
      name: serviceResponse.data.name,
      url: serviceResponse.file_upload_request.url,
      formFields: serviceResponse.file_upload_request.form_fields,
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channel,
    } = this.parameters;

    return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/generate-upload-url`;
  }

  protected get headers(): Record<string, string> | undefined {
    return { 'Content-Type': 'application/json' };
  }

  protected get body(): ArrayBuffer | string | undefined {
    return JSON.stringify({ name: this.parameters.name });
  }
}
