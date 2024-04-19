/**
 * Cryptor module.
 */

/**
 * Data encrypted by {@link CryptoModule}.
 */
export type EncryptedDataType = {
  /**
   * Encrypted data.
   */
  data: ArrayBuffer | string;

  /**
   * Used cryptor's metadata.
   */
  metadata: ArrayBuffer | null;
};

/**
 * Cryptor algorithm interface.
 */
export interface ICryptor {
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
   * Encrypt provided source {@link ArrayBuffer}.
   *
   * @param data - Source {@link ArrayBuffer} for encryption.
   *
   * @returns Encrypted data object.
   *
   * @throws Error if unknown data type has been passed.
   */
  encryptFileData(data: ArrayBuffer): Promise<EncryptedDataType>;
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
  decrypt(data: EncryptedDataType): ArrayBuffer;

  /**
   * Decrypt provided encrypted {@link ArrayBuffer} File object.
   *
   * @param file - Encrypted {@link ArrayBuffer} for decryption.
   *
   * @returns Decrypted data as {@link ArrayBuffer}.
   *
   * @throws Error if unknown data type has been passed.
   */
  decryptFileData(file: EncryptedDataType): Promise<ArrayBuffer>;
  // endregion
}
