import { PassThrough } from 'stream';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { ICryptor, EncryptedDataType, EncryptedStream } from './ICryptor';

export default class AesCbcCryptor implements ICryptor {
  static BLOCK_SIZE: number = 16;

  cipherKey: string;
  constructor(configuration: { cipherKey: string }) {
    this.cipherKey = configuration.cipherKey;
  }

  get algo() {
    return 'aes-256-cbc';
  }

  get identifier() {
    return 'ACRH';
  }

  getIv() {
    return randomBytes(AesCbcCryptor.BLOCK_SIZE);
  }

  getKey() {
    const sha = createHash('sha256');
    sha.update(Buffer.from(this.cipherKey, 'utf8'));
    return Buffer.from(sha.digest());
  }

  async encrypt(data: Buffer) {
    const iv = this.getIv();
    const key = this.getKey();

    const bPlain = Buffer.from(data);
    const aes = createCipheriv(this.algo, key, iv);

    return {
      metadata: iv,
      data: Buffer.concat([aes.update(bPlain), aes.final()]),
    };
  }

  async decrypt(encryptedData: EncryptedDataType) {
    const aes = createDecipheriv(this.algo, this.getKey(), encryptedData.metadata);
    return Buffer.concat([aes.update(encryptedData.data), aes.final()]);
  }

  async encryptStream(stream: NodeJS.ReadableStream) {
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

  async decryptStream(encryptedStream: EncryptedStream) {
    const decryptedStream = new PassThrough();
    let bIv = Buffer.alloc(0);
    let aes: any = null;
    const onReadable = () => {
      let data = encryptedStream.stream.read();
      while (data !== null) {
        if (data) {
          const bChunk = Buffer.from(data);
          const sliceLen = encryptedStream.metadataLength - bIv.byteLength;
          if (bChunk.byteLength < sliceLen) {
            bIv = Buffer.concat([bIv, bChunk]);
          } else {
            bIv = Buffer.concat([bIv, bChunk.slice(0, sliceLen)]);
            aes = createDecipheriv(this.algo, this.getKey(), bIv);
            aes.pipe(decryptedStream);
            aes.write(bChunk.slice(sliceLen));
          }
        }
        data = encryptedStream.stream.read();
      }
    };
    encryptedStream.stream.on('readable', onReadable);
    encryptedStream.stream.on('end', () => {
      if (aes) {
        aes.end();
      }
      decryptedStream.end();
    });
    return decryptedStream;
  }
}
