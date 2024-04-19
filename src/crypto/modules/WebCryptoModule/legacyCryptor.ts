/**
 * Legacy cryptor module.
 */

import { CryptorConfiguration } from '../../../core/interfaces/crypto-module';
import { PubNubFile, PubNubFileParameters } from '../../../file/modules/web';
import Crypto from '../../../core/components/cryptography/index';
import { PubNubFileConstructor } from '../../../core/types/file';
import { encode } from '../../../core/components/base64_codec';
import { PubNubError } from '../../../errors/pubnub-error';
import { ILegacyCryptor } from './ILegacyCryptor';
import { EncryptedDataType } from './ICryptor';
import FileCryptor from '../web';

/**
 * Legacy cryptor.
 */
export default class LegacyCryptor implements ILegacyCryptor {
  /**
   * `string` to {@link ArrayBuffer} response decoder.
   */
  static encoder = new TextEncoder();

  /**
   *  {@link ArrayBuffer} to {@link string} decoder.
   */
  static decoder = new TextDecoder();

  /**
   * Legacy cryptor configuration.
   */
  config;

  /**
   * Configured file cryptor.
   */
  fileCryptor;

  /**
   * Configured legacy cryptor.
   */
  cryptor;

  constructor(config: CryptorConfiguration) {
    this.config = config;
    this.cryptor = new Crypto({ ...config });
    this.fileCryptor = new FileCryptor();
  }

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  // region Encryption

  encrypt(data: ArrayBuffer | string) {
    const stringData = typeof data === 'string' ? data : LegacyCryptor.decoder.decode(data);

    return {
      data: this.cryptor.encrypt(stringData),
      metadata: null,
    };
  }

  async encryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>) {
    if (!this.config.cipherKey) throw new PubNubError('File encryption error: cipher key not set.');

    return this.fileCryptor.encryptFile(this.config?.cipherKey, file, File);
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  // region Decryption

  decrypt(encryptedData: EncryptedDataType) {
    const data = typeof encryptedData.data === 'string' ? encryptedData.data : encode(encryptedData.data);

    return this.cryptor.decrypt(data);
  }

  async decryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>) {
    if (!this.config.cipherKey) throw new PubNubError('File encryption error: cipher key not set.');

    return this.fileCryptor.decryptFile(this.config.cipherKey, file, File);
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  get identifier() {
    return '';
  }
  // endregion
}
