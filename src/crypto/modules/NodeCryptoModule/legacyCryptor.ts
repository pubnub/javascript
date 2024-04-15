/**
 * Legacy cryptor module.
 */

import PubNubFile, { PubNubFileParameters } from '../../../file/modules/node';
import { CryptorConfiguration } from '../../../core/interfaces/crypto-module';
import Crypto from '../../../core/components/cryptography/index';
import { PubNubFileConstructor } from '../../../core/types/file';
import { encode } from '../../../core/components/base64_codec';
import { PubNubError } from '../../../errors/pubnub-error';
import { ILegacyCryptor } from './ILegacyCryptor';
import { EncryptedDataType } from './ICryptor';
import FileCryptor from '../node';

/**
 * Legacy cryptor.
 */
export default class LegacyCryptor implements ILegacyCryptor {
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

  encrypt(data: string): EncryptedDataType {
    if (data.length === 0) throw new Error('Encryption error: empty content');

    return {
      data: this.cryptor.encrypt(data),
      metadata: null,
    };
  }

  async encryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>) {
    if (!this.config.cipherKey) throw new PubNubError('File encryption error: cipher key not set.');

    return this.fileCryptor.encryptFile(this.config.cipherKey, file, File);
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
    if (!this.config.cipherKey) throw new PubNubError('File decryption error: cipher key not set.');

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
