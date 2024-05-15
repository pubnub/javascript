/**
 * Download File REST API module.
 */

import { PubNubBasicFileParameters, PubNubFileConstructor, PubNubFileInterface } from '../../types/file';
import { TransportResponse } from '../../types/transport-response';
import { CryptoModule } from '../../interfaces/crypto-module';
import { Cryptography } from '../../interfaces/cryptography';
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
type RequestParameters = FileSharing.DownloadFileParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;

  /**
   * File object constructor.
   */
  PubNubFile: PubNubFileConstructor<PubNubFileInterface, PubNubBasicFileParameters>;

  /**
   * Send file decryption module.
   */
  crypto?: CryptoModule;

  /**
   * Legacy cryptography module.
   */
  cryptography?: Cryptography<ArrayBuffer>;
};
// endregion

/**
 * Download File request.
 *
 * @internal
 */
export class DownloadFileRequest<
  PlatformFile extends Partial<PubNubFileInterface> = Record<string, unknown>,
> extends AbstractRequest<PlatformFile> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNDownloadFileOperation;
  }

  validate(): string | undefined {
    const { channel, id, name } = this.parameters;

    if (!channel) return "channel can't be empty";
    if (!id) return "file id can't be empty";
    if (!name) return "file name can't be empty";
  }

  async parse(response: TransportResponse): Promise<PlatformFile> {
    const { cipherKey, crypto, cryptography, name, PubNubFile } = this.parameters;
    const mimeType = response.headers['content-type'];
    let decryptedFile: PubNubFileInterface | undefined;
    let body = response.body!;

    if (PubNubFile.supportsEncryptFile && (cipherKey || crypto)) {
      if (cipherKey && cryptography) body = await cryptography.decrypt(cipherKey, body);
      else if (!cipherKey && crypto)
        decryptedFile = await crypto.decryptFile(PubNubFile.create({ data: body, name: name, mimeType }), PubNubFile);
    }

    return (
      decryptedFile
        ? decryptedFile
        : PubNubFile.create({
            data: body,
            name,
            mimeType,
          })
    ) as PlatformFile;
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channel,
      id,
      name,
    } = this.parameters;

    return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/files/${id}/${name}`;
  }
}
