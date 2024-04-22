/**
 * AES-CBC cryptor module.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { PassThrough } from 'stream';

import { ICryptor, EncryptedDataType, EncryptedStream } from './ICryptor';

/**
 * AES-CBC cryptor.
 *
 * AES-CBC cryptor with enhanced cipher strength.
 */
export default class AesCbcCryptor implements ICryptor {
  /**
   * Cryptor block size.
   */
  static BLOCK_SIZE = 16;

  /**
   * {@link string|String} to {@link ArrayBuffer} response decoder.
   */
  static encoder = new TextEncoder();

  /**
   * Data encryption / decryption cipher key.
   */
  cipherKey: string;

  constructor({ cipherKey }: { cipherKey: string }) {
    this.cipherKey = cipherKey;
  }

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  // region Encryption

  encrypt(data: ArrayBuffer | string): EncryptedDataType {
    const iv = this.getIv();
    const key = this.getKey();
    const plainData = typeof data === 'string' ? AesCbcCryptor.encoder.encode(data) : data;
    const bPlain = Buffer.from(plainData);

    if (bPlain.byteLength === 0) throw new Error('Encryption error: empty content');

    const aes = createCipheriv(this.algo, key, iv);

    return {
      metadata: iv,
      data: Buffer.concat([aes.update(bPlain), aes.final()]),
    };
  }

  async encryptStream(stream: NodeJS.ReadableStream) {
    if (!stream.readable) throw new Error('Encryption error: empty stream');

    const output = new PassThrough();
    const bIv = this.getIv();
    const aes = createCipheriv(this.algo, this.getKey(), bIv);
    stream.pipe(aes).pipe(output);

    return {
      stream: output,
      metadata: bIv,
      metadataLength: AesCbcCryptor.BLOCK_SIZE,
    };
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  // region Decryption

  decrypt(input: EncryptedDataType) {
    const data = typeof input.data === 'string' ? new TextEncoder().encode(input.data) : input.data;

    if (data.byteLength <= 0) throw new Error('Decryption error: empty content');
    const aes = createDecipheriv(this.algo, this.getKey(), input.metadata!);
    const decryptedDataBuffer = Buffer.concat([aes.update(data), aes.final()]);

    return decryptedDataBuffer.buffer.slice(
      decryptedDataBuffer.byteOffset,
      decryptedDataBuffer.byteOffset + decryptedDataBuffer.length,
    );
  }

  async decryptStream(stream: EncryptedStream) {
    const decryptedStream = new PassThrough();
    let bIv = Buffer.alloc(0);
    let aes: ReturnType<typeof createDecipheriv> | null = null;

    const onReadable = () => {
      let data = stream.stream.read();

      while (data !== null) {
        if (data) {
          const bChunk = Buffer.from(data);
          const sliceLen = stream.metadataLength - bIv.byteLength;

          if (bChunk.byteLength < sliceLen) {
            bIv = Buffer.concat([bIv, bChunk]);
          } else {
            bIv = Buffer.concat([bIv, bChunk.slice(0, sliceLen)]);
            aes = createDecipheriv(this.algo, this.getKey(), bIv);
            aes.pipe(decryptedStream);
            aes.write(bChunk.slice(sliceLen));
          }
        }
        data = stream.stream.read();
      }
    };
    stream.stream.on('readable', onReadable);
    stream.stream.on('end', () => {
      if (aes) aes.end();
      decryptedStream.end();
    });

    return decryptedStream;
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  get identifier() {
    return 'ACRH';
  }

  /**
   * Cryptor algorithm.
   *
   * @returns Cryptor module algorithm.
   */
  private get algo() {
    return 'aes-256-cbc';
  }

  /**
   * Generate random initialization vector.
   *
   * @returns Random initialization vector.
   */
  private getIv() {
    return randomBytes(AesCbcCryptor.BLOCK_SIZE);
  }

  /**
   * Convert cipher key to the {@link Buffer}.
   *
   * @returns SHA256 encoded cipher key {@link Buffer}.
   */
  private getKey() {
    const sha = createHash('sha256');
    sha.update(Buffer.from(this.cipherKey, 'utf8'));
    return Buffer.from(sha.digest());
  }
  // endregion
}
