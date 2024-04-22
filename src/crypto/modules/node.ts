/**
 * Legacy Node.js cryptography module.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { Readable, PassThrough, Transform } from 'stream';
import { Buffer } from 'buffer';

import PubNubFile, { PubNubFileParameters } from '../../file/modules/node';
import { Cryptography } from '../../core/interfaces/cryptography';
import { PubNubFileConstructor } from '../../core/types/file';

/**
 * Legacy cryptography implementation for Node.js-based {@link PubNub} client.
 */
export default class NodeCryptography implements Cryptography<string | ArrayBuffer | Buffer | Readable> {
  /**
   * Random initialization vector size.
   */
  static IV_LENGTH = 16;

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  // region Encryption

  public async encrypt(
    key: string,
    input: string | ArrayBuffer | Buffer | Readable,
  ): Promise<string | ArrayBuffer | Buffer | Transform> {
    const bKey = this.getKey(key);

    if (input instanceof Buffer) return this.encryptBuffer(bKey, input);
    if (input instanceof Readable) return this.encryptStream(bKey, input);
    if (typeof input === 'string') return this.encryptString(bKey, input);

    throw new Error('Encryption error: unsupported input format');
  }

  /**
   * Encrypt provided source {@link Buffer} using specific encryption {@link key}.
   *
   * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link Buffer}.
   * @param buffer - Source {@link Buffer} for encryption.
   *
   * @returns Encrypted data as {@link Buffer} object.
   */
  private encryptBuffer(key: Buffer, buffer: Buffer) {
    const bIv = this.getIv();
    const aes = createCipheriv(this.algo, key, bIv);

    return Buffer.concat([bIv, aes.update(buffer), aes.final()]);
  }

  /**
   * Encrypt provided source {@link Readable} stream using specific encryption {@link key}.
   *
   * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link Readable} stream.
   * @param stream - Source {@link Readable} stream for encryption.
   *
   * @returns Encrypted data as {@link Transform} object.
   */
  private async encryptStream(key: Buffer, stream: Readable) {
    const bIv = this.getIv();
    const aes = createCipheriv(this.algo, key, bIv).setAutoPadding(true);
    let initiated = false;

    return stream.pipe(aes).pipe(
      new Transform({
        transform(chunk, _, cb) {
          if (!initiated) {
            initiated = true;
            this.push(Buffer.concat([bIv, chunk]));
          } else this.push(chunk);

          cb();
        },
      }),
    );
  }

  /**
   * Encrypt provided source {@link string} using specific encryption {@link key}.
   *
   * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link string}.
   * @param text - Source {@link string} for encryption.
   *
   * @returns Encrypted data as byte {@link string}.
   */
  private encryptString(key: Buffer, text: string) {
    const bIv = this.getIv();
    const bPlaintext = Buffer.from(text);
    const aes = createCipheriv(this.algo, key, bIv);

    return Buffer.concat([bIv, aes.update(bPlaintext), aes.final()]).toString('utf8');
  }

  public async encryptFile(
    key: string,
    file: PubNubFile,
    File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
  ) {
    const bKey = this.getKey(key);

    /**
     * Buffer type check also covers `string` which converted to the `Buffer` during file object creation.
     */
    if (file.data instanceof Buffer) {
      if (file.data.byteLength <= 0) throw new Error('Encryption error: empty content.');

      return File.create({
        name: file.name,
        mimeType: file.mimeType,
        data: this.encryptBuffer(bKey, file.data),
      });
    }

    if (file.data instanceof Readable) {
      if (!file.contentLength || file.contentLength === 0) throw new Error('Encryption error: empty content.');

      return File.create({
        name: file.name,
        mimeType: file.mimeType,
        stream: await this.encryptStream(bKey, file.data),
      });
    }

    throw new Error('Cannot encrypt this file. In Node.js file encryption supports only string, Buffer or Stream.');
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  // region Decryption

  public async decrypt(key: string, input: string | ArrayBuffer | Buffer | Readable) {
    const bKey = this.getKey(key);
    if (input instanceof ArrayBuffer) {
      const decryptedBuffer = this.decryptBuffer(bKey, Buffer.from(input));

      return decryptedBuffer.buffer.slice(
        decryptedBuffer.byteOffset,
        decryptedBuffer.byteOffset + decryptedBuffer.length,
      );
    }
    if (input instanceof Buffer) return this.decryptBuffer(bKey, input);
    if (input instanceof Readable) return this.decryptStream(bKey, input);
    if (typeof input === 'string') return this.decryptString(bKey, input);

    throw new Error('Decryption error: unsupported input format');
  }

  /**
   * Decrypt provided encrypted {@link Buffer} using specific decryption {@link key}.
   *
   * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link Buffer}.
   * @param buffer - Encrypted {@link Buffer} for decryption.
   *
   * @returns Decrypted data as {@link Buffer} object.
   */
  private decryptBuffer(key: Buffer, buffer: Buffer) {
    const bIv = buffer.slice(0, NodeCryptography.IV_LENGTH);
    const bCiphertext = buffer.slice(NodeCryptography.IV_LENGTH);

    if (bCiphertext.byteLength <= 0) throw new Error('Decryption error: empty content');

    const aes = createDecipheriv(this.algo, key, bIv);

    return Buffer.concat([aes.update(bCiphertext), aes.final()]);
  }

  /**
   * Decrypt provided encrypted {@link Readable} stream using specific decryption {@link key}.
   *
   * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link Readable} stream.
   * @param stream - Encrypted {@link Readable} stream for decryption.
   *
   * @returns Decrypted data as {@link Readable} object.
   */
  private decryptStream(key: Buffer, stream: Readable) {
    let aes: ReturnType<typeof createDecipheriv> | null = null;
    const output = new PassThrough();
    let bIv = Buffer.alloc(0);

    const getIv = () => {
      let data = stream.read();

      while (data !== null) {
        if (data) {
          const bChunk = Buffer.from(data);
          const sliceLen = NodeCryptography.IV_LENGTH - bIv.byteLength;

          if (bChunk.byteLength < sliceLen) bIv = Buffer.concat([bIv, bChunk]);
          else {
            bIv = Buffer.concat([bIv, bChunk.slice(0, sliceLen)]);
            aes = createDecipheriv(this.algo, key, bIv);
            aes.pipe(output);
            aes.write(bChunk.slice(sliceLen));
          }
        }

        data = stream.read();
      }
    };

    stream.on('readable', getIv);
    stream.on('end', () => {
      if (aes) aes.end();
      output.end();
    });

    return output;
  }

  /**
   * Decrypt provided encrypted {@link string} using specific decryption {@link key}.
   *
   * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link string}.
   * @param text - Encrypted {@link string} for decryption.
   *
   * @returns Decrypted data as byte {@link string}.
   */
  private decryptString(key: Buffer, text: string) {
    const ciphertext = Buffer.from(text);
    const bIv = ciphertext.slice(0, NodeCryptography.IV_LENGTH);
    const bCiphertext = ciphertext.slice(NodeCryptography.IV_LENGTH);
    const aes = createDecipheriv(this.algo, key, bIv);

    return Buffer.concat([aes.update(bCiphertext), aes.final()]).toString('utf8');
  }

  public async decryptFile(
    key: string,
    file: PubNubFile,
    File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
  ) {
    const bKey = this.getKey(key);

    /**
     * Buffer type check also covers `string` which converted to the `Buffer` during file object creation.
     */
    if (file.data instanceof Buffer) {
      return File.create({
        name: file.name,
        mimeType: file.mimeType,
        data: this.decryptBuffer(bKey, file.data),
      });
    }

    if (file.data instanceof Readable) {
      return File.create({
        name: file.name,
        mimeType: file.mimeType,
        stream: this.decryptStream(bKey, file.data),
      });
    }

    throw new Error('Cannot decrypt this file. In Node.js file decryption supports only string, Buffer or Stream.');
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------

  // region Helpers
  /**
   * Cryptography algorithm.
   *
   * @returns Cryptography module algorithm.
   */
  private get algo() {
    return 'aes-256-cbc';
  }

  /**
   * Convert cipher key to the {@link Buffer}.
   *
   * @param key - String cipher key.
   *
   * @returns SHA256 HEX encoded cipher key {@link Buffer}.
   */
  private getKey(key: string) {
    const sha = createHash('sha256');
    sha.update(Buffer.from(key, 'utf8'));

    return Buffer.from(sha.digest('hex').slice(0, 32), 'utf8');
  }

  /**
   * Generate random initialization vector.
   *
   * @returns Random initialization vector.
   */
  private getIv() {
    return randomBytes(NodeCryptography.IV_LENGTH);
  }
  // endregion
}
