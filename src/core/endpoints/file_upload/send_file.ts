import { PubNubFileConstructor, PubNubFileInterface } from '../../types/file';
import { GenerateFileUploadUrlRequest } from './generate_upload_url';
import { CryptoModule } from '../../interfaces/crypto-module';
import { Cryptography } from '../../interfaces/cryptography';
import { AbstractRequest } from '../../components/request';
import * as FileSharing from '../../types/api/file-sharing';
import { PubNubError } from '../../../errors/pubnub-error';
import RequestOperation from '../../constants/operations';
import { UploadFileRequest } from './upload-file';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
import { KeySet } from '../../types/api';
import StatusCategory from '../../constants/categories';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters<FileParameters> = FileSharing.SendFileParameters<FileParameters> & {
  /**
   * How many times should retry file message publish.
   */
  fileUploadPublishRetryLimit: number;

  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;

  /**
   * {@link PubNub} File object constructor.
   */
  PubNubFile: PubNubFileConstructor<PubNubFileInterface, FileParameters>;

  /**
   * Request sending method.
   *
   * @param request - Request which should be processed.
   */
  sendRequest: <ResponseType>(request: AbstractRequest<ResponseType>) => Promise<ResponseType>;

  /**
   * File message publish method.
   *
   * @param parameters - File message request parameters.
   */
  publishFile: (
    parameters: FileSharing.PublishFileMessageParameters,
  ) => Promise<FileSharing.PublishFileMessageResponse>;

  /**
   * If passed, will encrypt the payloads.
   *
   * @deprecated Pass it to {@link crypto} module instead.
   */
  cipherKey?: string;

  /**
   * Published data encryption module.
   */
  crypto?: CryptoModule;

  /**
   * Legacy cryptography module.
   */
  cryptography?: Cryptography<ArrayBuffer>;
};
// endregion

/**
 * Send file composed request.
 *
 * @internal
 */
export class SendFileRequest<FileConstructorParameters> {
  /**
   * File object for upload.
   */
  private file?: PubNubFileInterface;

  constructor(private readonly parameters: RequestParameters<FileConstructorParameters>) {
    this.file = this.parameters.PubNubFile?.create(parameters.file);

    if (!this.file) throw new Error('File upload error: unable to create File object.');
  }

  /**
   * Process user-input and upload file.
   *
   * @returns File upload request response.
   */
  public async process(): Promise<FileSharing.SendFileResponse> {
    let fileName: string | undefined;
    let fileId: string | undefined;

    return this.generateFileUploadUrl()
      .then((result) => {
        fileName = result.name;
        fileId = result.id;
        return this.uploadFile(result);
      })
      .then((result) => {
        if (result.status !== 204) {
          throw new PubNubError('Upload to bucket was unsuccessful', {
            error: true,
            statusCode: result.status,
            category: StatusCategory.PNUnknownCategory,
            operation: RequestOperation.PNPublishFileOperation,
            errorData: { message: result.message },
          });
        }
      })
      .then(() => this.publishFileMessage(fileId!, fileName!))
      .catch((error: Error) => {
        if (error instanceof PubNubError) throw error;

        const apiError = !(error instanceof PubNubAPIError) ? PubNubAPIError.create(error) : error;
        throw new PubNubError('File upload error.', apiError.toStatus(RequestOperation.PNPublishFileOperation));
      });
  }

  /**
   * Generate pre-signed file upload Url.
   *
   * @returns File upload credentials.
   */
  private async generateFileUploadUrl(): Promise<FileSharing.GenerateFileUploadUrlResponse> {
    const request = new GenerateFileUploadUrlRequest({
      ...this.parameters,
      name: this.file!.name,
      keySet: this.parameters.keySet,
    });

    return this.parameters.sendRequest(request);
  }

  /**
   * Prepare and upload {@link PubNub} File object to remote storage.
   *
   * @param uploadParameters - File upload request parameters.
   *
   * @returns
   */
  private async uploadFile(uploadParameters: FileSharing.GenerateFileUploadUrlResponse) {
    const { cipherKey, PubNubFile, crypto, cryptography } = this.parameters;
    const { id, name, url, formFields } = uploadParameters;

    // Encrypt file if possible.
    if (this.parameters.PubNubFile!.supportsEncryptFile) {
      if (!cipherKey && crypto) this.file = (await crypto.encryptFile(this.file!, PubNubFile!))!;
      else if (cipherKey && cryptography)
        this.file = (await cryptography.encryptFile(cipherKey, this.file!, PubNubFile!))!;
    }

    return this.parameters.sendRequest(
      new UploadFileRequest({
        fileId: id,
        fileName: name,
        file: this.file!,
        uploadUrl: url,
        formFields,
      }),
    );
  }

  private async publishFileMessage(fileId: string, fileName: string): Promise<FileSharing.SendFileResponse> {
    let result: FileSharing.PublishFileMessageResponse = { timetoken: '0' };
    let retries = this.parameters.fileUploadPublishRetryLimit;
    let publishError: PubNubError | undefined;
    let wasSuccessful = false;

    do {
      try {
        result = await this.parameters.publishFile({ ...this.parameters, fileId, fileName });
        wasSuccessful = true;
      } catch (error: unknown) {
        if (error instanceof PubNubError) publishError = error;
        retries -= 1;
      }
    } while (!wasSuccessful && retries > 0);

    if (!wasSuccessful) {
      throw new PubNubError(
        'Publish failed. You may want to execute that operation manually using pubnub.publishFile',
        {
          error: true,
          category: publishError!.status?.category ?? StatusCategory.PNUnknownCategory,
          statusCode: publishError!.status?.statusCode ?? 0,
          channel: this.parameters.channel,
          id: fileId,
          name: fileName,
        },
      );
    } else return { status: 200, timetoken: result.timetoken, id: fileId, name: fileName };
  }
}
