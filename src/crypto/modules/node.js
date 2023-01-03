/**       */
import { Readable, PassThrough } from 'stream';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

export default class NodeCryptography {
  static IV_LENGTH = 16;

  get algo() {
    return 'aes-256-cbc';
  }

  async encrypt(key, input) {
    const bKey = this.getKey(key);
    if (input instanceof Buffer) {
      return this.encryptBuffer(bKey, input);
    }
    if (input instanceof Readable) {
      return this.encryptStream(bKey, input);
    }
    if (typeof input === 'string') {
      return this.encryptString(bKey, input);
    }
    throw new Error('Unsupported input format');
  }

  async decrypt(key, input) {
    const bKey = this.getKey(key);
    if (input instanceof Buffer) {
      return this.decryptBuffer(bKey, input);
    }
    if (input instanceof Readable) {
      return this.decryptStream(bKey, input);
    }
    if (typeof input === 'string') {
      return this.decryptString(bKey, input);
    }
    throw new Error('Unsupported input format');
  }

  async encryptFile(key, file, File) {
    const bKey = this.getKey(key);

    if (file.data instanceof Buffer) {
      return File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        data: await this.encryptBuffer(bKey, file.data),
      });
    }
    if (file.data instanceof Readable) {
      return File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        stream: await this.encryptStream(bKey, file.data),
      });
    }
    throw new Error('Cannot encrypt this file. In Node.js file encryption supports only string, Buffer or Stream.');
  }

  async decryptFile(key, file, File) {
    const bKey = this.getKey(key);

    if (file.data instanceof Buffer) {
      return File.create({
        name: file.name,
        data: await this.decryptBuffer(bKey, file.data),
      });
    }
    if (file.data instanceof Readable) {
      return File.create({
        name: file.name,
        stream: await this.decryptStream(bKey, file.data),
      });
    }
    throw new Error('Cannot decrypt this file. In Node.js file decryption supports only string, Buffer or Stream.');
  }

  getKey(key) {
    const sha = createHash('sha256');

    sha.update(Buffer.from(key, 'utf8'));

    return Buffer.from(sha.digest('hex').slice(0, 32), 'utf8');
  }

  getIv() {
    return randomBytes(NodeCryptography.IV_LENGTH);
  }

  encryptString(key, plaintext) {
    const bIv = this.getIv();

    const bPlaintext = Buffer.from(plaintext);

    const aes = createCipheriv(this.algo, key, bIv);

    return Buffer.concat([bIv, aes.update(bPlaintext), aes.final()]).toString('utf8');
  }

  decryptString(key, sCiphertext) {
    const ciphertext = Buffer.from(sCiphertext);
    const bIv = ciphertext.slice(0, NodeCryptography.IV_LENGTH);
    const bCiphertext = ciphertext.slice(NodeCryptography.IV_LENGTH);

    const aes = createDecipheriv(this.algo, key, bIv);

    return Buffer.concat([aes.update(bCiphertext), aes.final()]).toString('utf8');
  }

  encryptBuffer(key, plaintext) {
    const bIv = this.getIv();

    const aes = createCipheriv(this.algo, key, bIv);

    return Buffer.concat([bIv, aes.update(plaintext), aes.final()]);
  }

  decryptBuffer(key, ciphertext) {
    const bIv = ciphertext.slice(0, NodeCryptography.IV_LENGTH);
    const bCiphertext = ciphertext.slice(NodeCryptography.IV_LENGTH);

    const aes = createDecipheriv(this.algo, key, bIv);

    return Buffer.concat([aes.update(bCiphertext), aes.final()]);
  }

  encryptStream(key, stream) {
    const output = new PassThrough();
    const bIv = this.getIv();

    const aes = createCipheriv(this.algo, key, bIv);

    output.write(bIv);
    stream.pipe(aes).pipe(output);

    return output;
  }

  decryptStream(key, stream) {
    const output = new PassThrough();

    let bIv = Buffer.alloc(0);
    let aes = null;

    const getIv = () => {
      let data = stream.read();

      while (data !== null) {
        if (data) {
          const bChunk = Buffer.from(data);
          const sliceLen = NodeCryptography.IV_LENGTH - bIv.byteLength;

          if (bChunk.byteLength < sliceLen) {
            bIv = Buffer.concat([bIv, bChunk]);
          } else {
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
      if (aes) {
        aes.end();
      }

      output.end();
    });

    return output;
  }
}
