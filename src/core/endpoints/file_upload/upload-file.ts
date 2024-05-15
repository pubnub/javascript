/**
 * Upload file REST API request.
 */

import { TransportResponse } from '../../types/transport-response';
import { TransportMethod, TransportRequest } from '../../types/transport-request';
import { AbstractRequest } from '../../components/request';
import * as FileSharing from '../../types/api/file-sharing';
import RequestOperation from '../../constants/operations';
import { PubNubFileInterface } from '../../types/file';

/**
 * File Upload request.
 *
 * @internal
 */
export class UploadFileRequest extends AbstractRequest<FileSharing.UploadFileResponse> {
  constructor(private readonly parameters: FileSharing.UploadFileParameters) {
    super({ method: TransportMethod.POST });

    // Use file's actual mime type if available.
    const mimeType = parameters.file.mimeType;
    if (mimeType) {
      parameters.formFields = parameters.formFields.map((entry) => {
        if (entry.name === 'Content-Type') return { name: entry.name, value: mimeType };
        return entry;
      });
    }
  }

  operation(): RequestOperation {
    return RequestOperation.PNPublishFileOperation;
  }

  validate(): string | undefined {
    const { fileId, fileName, file, uploadUrl } = this.parameters;

    if (!fileId) return "Validation failed: file 'id' can't be empty";
    if (!fileName) return "Validation failed: file 'name' can't be empty";
    if (!file) return "Validation failed: 'file' can't be empty";
    if (!uploadUrl) return "Validation failed: file upload 'url' can't be empty";
  }

  async parse(response: TransportResponse): Promise<FileSharing.UploadFileResponse> {
    return {
      status: response.status,
      message: response.body ? UploadFileRequest.decoder.decode(response.body) : 'OK',
    };
  }

  request(): TransportRequest {
    return {
      ...super.request(),
      origin: new URL(this.parameters.uploadUrl).origin,
      timeout: 300,
    };
  }

  protected get path(): string {
    const { pathname, search } = new URL(this.parameters.uploadUrl);

    return `${pathname}${search}`;
  }

  protected get body(): ArrayBuffer | PubNubFileInterface | string | undefined {
    return this.parameters.file;
  }

  protected get formData(): Record<string, string>[] | undefined {
    return this.parameters.formFields;
  }
}
