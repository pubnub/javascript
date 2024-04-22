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
  data: Buffer | string;

  /**
   * Used cryptor's metadata.
   */
  metadata: Buffer | null;
};

/**
 * {@link Readable} stream encrypted by {@link CryptoModule}.
 */
export type EncryptedStream = {
  /**
   * Stream with encrypted content.
   */
  stream: NodeJS.ReadableStream;

  /**
   * Length of encrypted data in {@link Readable} stream.
   */
  metadataLength: number;

  /**
   * Used cryptor's metadata.
   */
  metadata?: Buffer | undefined;
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
  encrypt(data: BufferSource | string): EncryptedDataType;

  /**
   * Encrypt provided source {@link Readable} stream.
   *
   * @param stream - Stream for encryption.
   *
   * @returns Encrypted stream object.
   *
   * @throws Error if unknown data type has been passed.
   */
  encryptStream(stream: NodeJS.ReadableStream): Promise<EncryptedStream>;
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
   * Decrypt provided encrypted stream object.
   *
   * @param stream - Encrypted stream object for decryption.
   *
   * @returns Decrypted data as {@link Readable} stream.
   *
   * @throws Error if unknown data type has been passed.
   */
  decryptStream(stream: EncryptedStream): Promise<NodeJS.ReadableStream>;
  // endregion
}
