/**
 * Legacy Cryptography module interface.
 */

import { PubNubFileConstructor, PubNubFileInterface } from '../types/file';

export interface Cryptography<Types> {
  // region Encryption
  /**
   * Encrypt provided source data using specific encryption {@link key}.
   *
   * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` data.
   * @param input - Source data for encryption.
   *
   * @returns Encrypted data as object or stream (depending on from source data type).
   *
   * @throws Error if unknown data type has been passed.
   */
  encrypt(key: string, input: Types): Promise<Types>;

  /**
   * Decrypt provided encrypted data using specific decryption {@link key}.
   *
   * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` data.
   * @param input - Encrypted data for decryption.
   *
   * @returns Decrypted data as object or stream (depending on from encrypted data type).
   *
   * @throws Error if unknown data type has been passed.
   */
  decrypt(key: string, input: Types): Promise<Types>;

  /**
   * Encrypt provided `PubNub` File object using specific encryption {@link key}.
   *
   * @param key - Key for `PubNub` File object encryption. <br/>**Note:** Same key should be
   * used to `decrypt` data.
   * @param file - Source `PubNub` File object for encryption.
   * @param File - Class constructor for `PubNub` File object.
   *
   * @returns Encrypted data as `PubNub` File object.
   *
   * @throws Error if file is empty or contains unsupported data type.
   */
  encryptFile(
    key: string,
    file: PubNubFileInterface,
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    File: PubNubFileConstructor<PubNubFileInterface, any>,
  ): Promise<PubNubFileInterface | undefined>;

  /**
   * Decrypt provided `PubNub` File object using specific decryption {@link key}.
   *
   * @param key - Key for `PubNub` File object decryption. <br/>**Note:** Should be the same
   * as used to `encrypt` data.
   * @param file - Encrypted `PubNub` File object for decryption.
   * @param File - Class constructor for `PubNub` File object.
   *
   * @returns Decrypted data as `PubNub` File object.
   *
   * @throws Error if file is empty or contains unsupported data type.
   */
  decryptFile(
    key: string,
    file: PubNubFileInterface,
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    File: PubNubFileConstructor<PubNubFileInterface, any>,
  ): Promise<PubNubFileInterface | undefined>;
}
