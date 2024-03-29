/**
 * Legacy cryptor module.
 */

import { PubNubFile, PubNubFileParameters } from '../../../file/modules/web';
import { PubNubFileConstructor } from '../../../core/types/file';
import { Payload } from '../../../core/types/api';
import { EncryptedDataType } from './ICryptor';

/**
 * Legacy cryptor algorithm interface.
 */
export interface ILegacyCryptor {
  /**
   * Cryptor unique identifier.
   *
   * @returns Cryptor identifier.
   */
  get identifier(): string;

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------

  // region Encryption
  /**
   * Encrypt provided source data.
   *
   * @param data - Source data for encryption.
   *
   * @returns Encrypted data object.
   *
   * @throws Error if unknown data type has been passed.
   */
  encrypt(data: ArrayBuffer | string): EncryptedDataType;

  /**
   * Encrypt provided source {@link PubNub} File object.
   *
   * @param file - Source {@link PubNub} File object for encryption.
   * @param File - Class constructor for {@link PubNub} File object.
   *
   * @returns Encrypted data as {@link PubNub} File object.
   *
   * @throws Error if file is empty or contains unsupported data type.
   * @throws Error if cipher key not set.
   */
  encryptFile(
    file: PubNubFile,
    File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
  ): Promise<PubNubFile | undefined>;
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------

  // region Decryption
  /**
   * Decrypt provided encrypted data object.
   *
   * @param data - Encrypted data object for decryption.
   *
   * @returns Decrypted data.
   *
   * @throws Error if unknown data type has been passed.
   */
  decrypt(data: EncryptedDataType): Payload | null;

  /**
   * Decrypt provided encrypted {@link PubNub} File object.
   *
   * @param file - Encrypted {@link PubNub} File object for decryption.
   * @param File - Class constructor for {@link PubNub} File object.
   *
   * @returns Decrypted data as {@link PubNub} File object.
   *
   * @throws Error if file is empty or contains unsupported data type.
   * @throws Error if cipher key not set.
   */
  decryptFile(
    file: PubNubFile,
    File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
  ): Promise<PubNubFile | undefined>;
  // endregion
}
