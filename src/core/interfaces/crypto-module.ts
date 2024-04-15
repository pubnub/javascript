/**
 * Crypto module.
 */

import { PubNubFileConstructor, PubNubFileInterface } from '../types/file';
import { Payload } from '../types/api';

/**
 * Crypto module configuration.
 */
export type CryptoModuleConfiguration<C> = {
  default: C;
  cryptors?: C[];
};

export type CryptorConfiguration = {
  /**
   * Data encryption / decryption key.
   */
  cipherKey?: string;

  /**
   * Request sign secret key.
   */
  secretKey?: string;

  /**
   * Whether random initialization vector should be used or not.
   *
   * @default `true`
   */
  useRandomIVs?: boolean;

  /**
   * Custom data encryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data encryption.
   */
  customEncrypt?: (data: string | Payload) => string;

  /**
   * Custom data decryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data decryption.
   */
  customDecrypt?: (data: string) => string;
};

/**
 * Base crypto module interface.
 */
export interface CryptoModule {
  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  // region Encryption

  /**
   * Encrypt data.
   *
   * @param data - Data which should be encrypted using `CryptoModule`.
   *
   * @returns Data encryption result.
   */
  encrypt(data: ArrayBuffer | string): ArrayBuffer | string;

  /**
   * Encrypt file object.
   *
   * @param file - File object with data for encryption.
   * @param File - File object constructor to create instance for encrypted data representation.
   *
   * @returns Asynchronous file encryption result.
   */
  encryptFile(
    file: PubNubFileInterface,
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    File: PubNubFileConstructor<PubNubFileInterface, any>,
  ): Promise<PubNubFileInterface | undefined>;
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  // region Decryption

  /**
   * Encrypt data.
   *
   * @param data - Dta which should be encrypted using `CryptoModule`.
   *
   * @returns Data decryption result.
   */
  decrypt(data: ArrayBuffer | string): ArrayBuffer | Payload | null;

  /**
   * Decrypt file object.
   *
   * @param file - Encrypted file object with data for decryption.
   * @param File - File object constructor to create instance for decrypted data representation.
   *
   * @returns Asynchronous file decryption result.
   */
  decryptFile(
    file: PubNubFileInterface,
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    File: PubNubFileConstructor<PubNubFileInterface, any>,
  ): Promise<PubNubFileInterface | undefined>;
  // endregion
}

export abstract class AbstractCryptoModule<C> implements CryptoModule {
  /**
   * `String` to {@link ArrayBuffer} response decoder.
   */
  protected static encoder = new TextEncoder();

  /**
   *  {@link ArrayBuffer} to {@link string} decoder.
   */
  protected static decoder = new TextDecoder();

  defaultCryptor: C;
  cryptors: C[];

  // --------------------------------------------------------
  // --------------- Convenience functions ------------------
  // --------------------------------------------------------
  // region Convenience functions

  /**
   * Construct crypto module with legacy cryptor for encryption and both legacy and AES-CBC
   * cryptors for decryption.
   *
   * @param config Cryptors configuration options.
   *
   * @returns Crypto module which encrypts data using legacy cryptor.
   *
   * @throws Error if `config.cipherKey` not set.
   */
  static legacyCryptoModule(config: CryptorConfiguration): CryptoModule {
    throw new Error('Should be implemented by concrete crypto module implementation.');
  }

  /**
   * Construct crypto module with AES-CBC cryptor for encryption and both AES-CBC and legacy
   * cryptors for decryption.
   *
   * @param config Cryptors configuration options.
   *
   * @returns Crypto module which encrypts data using AES-CBC cryptor.
   *
   * @throws Error if `config.cipherKey` not set.
   */
  static aesCbcCryptoModule(config: CryptorConfiguration): CryptoModule {
    throw new Error('Should be implemented by concrete crypto module implementation.');
  }
  // endregion

  constructor(configuration: CryptoModuleConfiguration<C>) {
    this.defaultCryptor = configuration.default;
    this.cryptors = configuration.cryptors ?? [];
  }

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  // region Encryption

  /**
   * Encrypt data.
   *
   * @param data - Data which should be encrypted using {@link CryptoModule}.
   *
   * @returns Data encryption result.
   */
  abstract encrypt(data: ArrayBuffer | string): ArrayBuffer | string;

  /**
   * Encrypt file object.
   *
   * @param file - File object with data for encryption.
   * @param File - File object constructor to create instance for encrypted data representation.
   *
   * @returns Asynchronous file encryption result.
   */
  abstract encryptFile(
    file: PubNubFileInterface,
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    File: PubNubFileConstructor<PubNubFileInterface, any>,
  ): Promise<PubNubFileInterface | undefined>;
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  // region Decryption

  /**
   * Encrypt data.
   *
   * @param data - Dta which should be encrypted using `CryptoModule`.
   *
   * @returns Data decryption result.
   */
  abstract decrypt(data: ArrayBuffer | string): ArrayBuffer | Payload | null;

  /**
   * Decrypt file object.
   *
   * @param file - Encrypted file object with data for decryption.
   * @param File - File object constructor to create instance for decrypted data representation.
   *
   * @returns Asynchronous file decryption result.
   */
  abstract decryptFile(
    file: PubNubFileInterface,
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    File: PubNubFileConstructor<PubNubFileInterface, any>,
  ): Promise<PubNubFileInterface | undefined>;
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Retrieve list of module's cryptors.
   */
  protected getAllCryptors() {
    return [this.defaultCryptor, ...this.cryptors];
  }
  // endregion
}
