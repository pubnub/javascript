/**
 * Legacy cryptor module.
 */

import { CryptorConfiguration } from '../../../core/interfaces/crypto-module';
import { PubNubFile, PubNubFileParameters } from '../../../file/modules/web';
import { LoggerManager } from '../../../core/components/logger-manager';
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

  /**
   * Update registered loggers' manager.
   *
   * @param [logger] - Logger, which crypto should use.
   */
  set logger(logger: LoggerManager) {
    this.cryptor.logger = logger;
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

  /**
   * Serialize cryptor information to string.
   *
   * @returns Serialized cryptor information.
   */
  toString() {
    const configurationEntries = Object.entries(this.config).reduce((acc, [key, value]) => {
      if (key === 'logger') return acc;
      acc.push(`${key}: ${typeof value === 'function' ? '<function>' : value}`);
      return acc;
    }, [] as string[]);
    return `${this.constructor.name} { ${configurationEntries.join(', ')} }`;
  }
}
