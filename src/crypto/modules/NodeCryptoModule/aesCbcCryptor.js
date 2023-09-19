import { Readable, PassThrough, Transform } from 'stream';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

export default class AesCbcCryptor {
  static BLOCK_SIZE = 16;

  constructor(key) {
    this.cipherKey = key;
  }

  get algo() {
    return 'aes-256-cbc';
  }

  get identifier() {
    return 'ACRH';
  }

  _getIv() {
    return randomBytes(AesCbcCryptor.BLOCK_SIZE);
  }

  _getKey() {
    const sha = createHash('sha256');
    sha.update(Buffer.from(this.cipherKey, 'utf8'));
    return Buffer.from(sha.digest(), 'utf8');
  }

  async encrypt(data) {
    const iv = this._getIv();
    const key = this._getKey();

    const bPlain = Buffer.from(data);
    const aes = createCipheriv(this.algo, key, iv);

    return {
      metadata: iv,
      data: Buffer.concat([aes.update(bPlain), aes.final()]),
    };
  }

  async decrypt(encryptedData) {
    const aes = createDecipheriv(this.algo, this._getKey(), encryptedData.metadata);
    return Buffer.concat([aes.update(encryptedData.data), aes.final()]);
  }

  async encryptStream(stream) {
    const output = new PassThrough();
    const bIv = this._getIv();
    const aes = createCipheriv(this.algo, this._getKey(), bIv);
    stream.pipe(aes).pipe(output);
    return {
      data: output,
      metadata: bIv,
      metadataLength: AesCbcCryptor.BLOCK_SIZE,
    };
  }

  async decryptStream(encryptedStream) {
    const output = new PassThrough();

    let bIv = Buffer.alloc(0);
    let aes = null;
    let data = encryptedStream.stream.read();
    while (data !== null) {
      if (data) {
        const bChunk = Buffer.from(data);
        const sliceLen = encryptedStream.metadataLength - bIv.byteLength;
        if (bChunk.byteLength < sliceLen) {
          bIv = Buffer.concat([bIv, bChunk]);
        } else {
          bIv = Buffer.concat([bIv, bChunk.slice(0, sliceLen)]);

          aes = createDecipheriv(this.algo, this._getKey(), bIv);

          aes.pipe(output);

          aes.write(bChunk.slice(sliceLen));
        }
      }
      data = encryptedStream.stream.read();
    }
    encryptedStream.stream.on('end', () => {
      if (aes) {
        aes.end();
      }
      output.end();
    });
    return output;
  }
}
