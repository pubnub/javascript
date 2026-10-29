/**
 * AES-GCM cryptor module.
 *
 * @internal
 */

import { PassThrough } from 'stream';

import { toArrayBuffer } from '../../../core/components/cryptography/bytes';
import { ICryptor, EncryptedDataType, EncryptedStream } from './ICryptor';
import NodeCryptoPrimitives from '../../primitives/node';

/**
 * AES-GCM cryptor.
 *
 * Decrypt-only AES-256-GCM cryptor for payloads produced by other PubNub SDKs. Cryptor metadata stored in the
 * header is `nonce (12 bytes)` and the authentication tag (16 bytes) is appended to the ciphertext:
 * `ciphertext || authentication tag`.
 *
 * **Note:** Encryption isn't supported and cryptor can't be used as crypto module default cryptor.
 *
 * @internal
 */
export default class AesGcmCryptor implements ICryptor {
  /**
   * Cryptor unique identifier.
   */
  static IDENTIFIER = 'ACGM';

  /**
   * Nonce length.
   */
  static NONCE_LENGTH = 12;

  /**
   * Authentication tag length.
   */
  static TAG_LENGTH = 16;

  /**
   * Cryptor metadata length (nonce only).
   */
  static METADATA_LENGTH = AesGcmCryptor.NONCE_LENGTH;

  /**
   * Generic decryption error message (doesn't reveal which part of the payload failed authentication).
   */
  static DECRYPTION_ERROR = 'Decryption error: unable to decrypt data';

  /**
   * Unsupported encryption error message.
   */
  static ENCRYPTION_ERROR = 'Encryption error: AES-GCM cryptor (ACGM) supports decryption only.';

  /**
   * {@link string|String} to {@link ArrayBuffer} response decoder.
   */
  static encoder = new TextEncoder();

  /**
   * Native crypto primitives.
   */
  private static primitives = new NodeCryptoPrimitives();

  /**
   * Data decryption cipher key.
   */
  cipherKey: string;

  /**
   * Raw decryption key (SHA-256 digest of the cipher key).
   */
  private key?: Promise<Uint8Array>;

  constructor({ cipherKey }: { cipherKey: string }) {
    this.cipherKey = cipherKey;
  }

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  // region Encryption

  encrypt(_data: BufferSource | string): EncryptedDataType {
    throw new Error(AesGcmCryptor.ENCRYPTION_ERROR);
  }

  async encryptStream(_stream: NodeJS.ReadableStream): Promise<EncryptedStream> {
    throw new Error(AesGcmCryptor.ENCRYPTION_ERROR);
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  // region Decryption

  async decrypt(input: EncryptedDataType): Promise<ArrayBuffer> {
    const data = typeof input.data === 'string' ? AesGcmCryptor.encoder.encode(input.data) : input.data;

    if (!input.metadata || input.metadata.byteLength !== AesGcmCryptor.METADATA_LENGTH)
      throw new Error('Decryption error: invalid metadata');
    if (data.byteLength <= AesGcmCryptor.TAG_LENGTH) throw new Error('Decryption error: empty content');

    return toArrayBuffer(await this.decryptBytes(new Uint8Array(input.metadata), new Uint8Array(data)));
  }

  /**
   * Decrypt provided encrypted stream object.
   *
   * **Note:** AES-GCM authenticates the whole message (authentication tag is the last 16 bytes of the stream), so the
   * stream is buffered in memory and decrypted data is written to the output stream only after successful
   * authentication.
   *
   * @param stream - Encrypted stream object for decryption.
   *
   * @returns Decrypted data as {@link Readable} stream.
   */
  async decryptStream(stream: EncryptedStream) {
    if (stream.metadataLength !== AesGcmCryptor.METADATA_LENGTH) throw new Error('Decryption error: invalid metadata');

    const decryptedStream = new PassThrough();
    const chunks: Buffer[] = [];

    const onReadable = () => {
      let data = stream.stream.read();

      while (data !== null) {
        if (data) chunks.push(typeof data === 'string' ? Buffer.from(data) : data);
        data = stream.stream.read();
      }
    };
    stream.stream.on('readable', onReadable);
    stream.stream.on('end', () => {
      const payload = Buffer.concat(chunks);

      // Content validated asynchronously (like authentication) to report errors after the stream has been returned.
      const decrypt = async () => {
        if (payload.byteLength <= AesGcmCryptor.METADATA_LENGTH + AesGcmCryptor.TAG_LENGTH)
          throw new Error('Decryption error: empty content');

        return this.decryptBytes(
          payload.subarray(0, AesGcmCryptor.METADATA_LENGTH),
          payload.subarray(AesGcmCryptor.METADATA_LENGTH),
        );
      };

      decrypt().then(
        (decrypted) => decryptedStream.end(Buffer.from(decrypted)),
        (error) => decryptedStream.destroy(error),
      );
    });

    // Header has been read from the `readable` event handler: drain data which already has been buffered, because
    // a fully buffered source may not emit `readable` again.
    onReadable();

    return decryptedStream;
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  get identifier() {
    return AesGcmCryptor.IDENTIFIER;
  }

  /**
   * Authenticate and decrypt data.
   *
   * @param nonce - Cryptor metadata (nonce).
   * @param data - Encrypted data with appended authentication tag.
   *
   * @returns Decrypted data.
   *
   * @throws Error with generic message if data can't be authenticated.
   */
  private async decryptBytes(nonce: Uint8Array, data: Uint8Array) {
    try {
      return await AesGcmCryptor.primitives.aesGcmDecrypt(await this.getKey(), nonce, data);
    } catch (_error) {
      // Native error intentionally not exposed: wrong key and modified payload should be indistinguishable.
      throw new Error(AesGcmCryptor.DECRYPTION_ERROR);
    }
  }

  /**
   * Compute raw decryption key (cached).
   *
   * @returns SHA-256 digest of the cipher key.
   */
  private getKey() {
    if (!this.key) {
      this.key = AesGcmCryptor.primitives.sha256(AesGcmCryptor.encoder.encode(this.cipherKey));
      this.key.catch(() => (this.key = undefined));
    }

    return this.key;
  }
  // endregion

  /**
   * Serialize cryptor information to string.
   *
   * @returns Serialized cryptor information.
   */
  toString() {
    return 'AesGcmCryptor {}';
  }
}
