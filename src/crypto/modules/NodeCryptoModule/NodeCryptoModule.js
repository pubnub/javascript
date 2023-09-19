import { Readable, PassThrough, Transform } from 'stream';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import LegacyCryptor from './legacyCryptor';
import AesCbcCryptor from './aesCbcCryptor';

export default class CryptoModule {
  defaultCryptor;
  cryptors = [];

  constructor({ cryptoModuleConfiguration }) {
    this.defaultCryptor = cryptoModuleConfiguration.default;
    this.cryptors = [...this.defaultCryptor, ...cryptoModuleConfiguration.cryptors];
  }

  static legacyCryptoModule({ config }) {
    return new this({
      default: new LegacyCryptor({ config }),
      cryptors: [new AesCbcCryptor(config.cipherKey)],
    });
  }

  static aesCbcCryptoModule({ config }) {
    return new this({
      default: new AesCbcCryptor(config.cipherKey),
      cryptors: [new LegacyCryptor({ config })],
    });
  }

  async encrypt(data, encoding) {
    let encrypted = this.default.encrypt(data);

    let header = CryptoHeader.from(this.default.identifier, encrypted.metadata);

    let payload = new Uint8Array(header.length);
    let pos = 0;
    payload.set(header.data, pos);
    pos += header.length;
    if (encrypted.metadata) {
      pos -= encrypted.metadata.length;
      payload.set(encrypted.metadata, pos);
    }
    if (encoding) {
      return Buffer.concat([payload, encrypted.data]).toString(encoding);
    } else {
      return Buffer.concat([payload, encrypted.data]);
    }
  }

  async decrypt(data, encoding) {
    let encryptedData = null;
    if (encoding) {
      encryptedData = Buffer.from(data, encoding);
    } else {
      encryptedData = Buffer.from(data);
    }
    let header = CryptoHeader.tryParse(encryptedData);
    let cryptor = this._getCryptor(header);

    if (cryptor instanceof LegacyCryptor) return cryptor.decrypt(data);

    return cryptor.decrypt({
      data: encryptedData.slice(header.length),
      metadata: encryptedData.slice(header.length - header.size, header.length),
    });
  }

  async encryptFile(file, File) {
    if (this.defaultCryptor instanceof LegacyCryptor) return this.defaultCryptor.encryptFile(file, File);
    if (file.data instanceof Buffer) {
      return File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        data: await this.encrypt(file.data),
      });
    }
    if (file.data instanceof Readable) {
      let encryptedStream = this.defaultCryptor.encryptStream(file.data);
      let header = CryptoHeader.from(this.default.identifier, encryptedStream.metadata);

      let payload = new Uint8Array(header.length);
      let pos = 0;
      payload.set(header.data, pos);
      pos += header.length;
      if (encryptedStream.metadata) {
        pos -= encryptedStream.metadata.length;
        payload.set(encryptedStream.metadata, pos);
      }
      const output = new PassThrough();
      output.write(payload);
      encryptedStream.data.pipe(output);
      return File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        stream: output,
      });
    }
  }

  async decryptFile(file, File) {
    if (file.data instanceof Buffer) {
      return File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        data: await this.encrypt(file.data),
      });
    }

    if (file.data instanceof Readable) {
      let stream = file.data;
      return new Promise((resolve, _) => {
        stream.on('readable', () => resolve(this._decryptStream(stream, file, File)));
      });
    }
  }

  async _decryptStream(stream, file, File) {
    let magicBytes = stream.read(4);
    if (magicBytes !== null) {
      if (!CryptoHeader.isSentinel(magicBytes)) {
        return this._legacyFileDecrypt(magicBytes, stream);
      }
      let versionByte = stream.read(1);
      CryptoHeader.validateVersion(versionByte[0]);
      let identifier = stream.read(4);
      let cryptor = this._getCryptorFromId(CryptoHeader.tryGetIdentifier(identifier));
      let headerSize = CryptoHeader.tryGetMetadataSizeFromStream(stream);
      return File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        data: await cryptor.decryptStream({ stream: stream, metadataLength: headerSize }),
      });
    }
  }

  async _legacyFileDecrypt(bytes, stream) {
    const sourceStream = new PassThrough();
    sourceStream.write(bytes);
    stream.pipe(sourceStream);
    stream.pause();
    sourceStream.pause();
    return this.default.decryptFile(
      File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        data: sourceStream,
      }),
    );
  }

  _getCryptor(header) {
    if (header === null) {
      return this.legacyCryptor;
    } else if (header instanceof CryptoHeaderV1) {
      return this._getCryptorFromId(header.identifier);
    }
  }

  _getCryptorFromId(id) {
    const cryptor = this.cryptors.find((c) => id === c.identifier);
    if (cryptor) {
      return cryptor;
    }
    throw Error('No registered cryptor can decrypt the data.');
  }
}

// CryptoHeader Utility
class CryptoHeader {
  static SENTINEL = 'PNED';
  static IDENTIFIER_LENGTH = 4;
  static MAX_VERSION = 1;

  static from(id, headerSize) {
    return new CryptoHeaderV1(id, headerSize);
  }

  static isSentinel(bytes) {
    if (bytes && bytes.byteLength >= 4) {
      if (bytes.toString('utf8') == CryptoHeader.SENTINEL) return true;
    }
  }

  static validateVersion(data) {
    if (data && data > CryptoHeader.MAX_VERSION) throw Error('Decrypting data created by unknown cryptor.');
    return data;
  }

  static tryGetIdentifier(data) {
    if (data & (data.byteLength < 4)) {
      throw Error('Decrypted data header is malformed.');
    } else {
      return data.toString('utf8');
    }
  }

  static tryGetMetadataSizeFromStream(stream) {
    let sizeBuf = stream.read(1);
    if (sizeBuf && sizeBuf[0] < 255) {
      return sizeBuf[0];
    }
    if (sizeBuf === 255) {
      let nextBuf = stream(2);
      if (nextBuf & (nextBuf.byteLength >= 2)) {
        return new Uint16Array([nextBuf[0], nextBuf[1]]).reduce((acc, val) => (acc << 8) + val, 0);
      }
    }
  }
  static tryParse(encryptedData) {
    let sentinel = '';
    let version = null;
    if (encryptedData.length >= 4) {
      sentinel = encryptedData.slice(0, 4);
      if (sentinel.toString('utf8') !== CryptoHeader.SENTINEL) return null;
    }

    if (encryptedData.length >= 5) {
      version = encryptedData[4];
    } else {
      throw Error('Decrypted data header is malformed.');
    }
    if (version > CryptoHeader.MAX_VERSION) throw Error('Decrypting data created by unknown cryptor.');

    let identifier = '';
    let pos = 5 + CryptoHeader.IDENTIFIER_LENGTH;
    if (encryptedData.length >= pos) {
      identifier = encryptedData.slice(5, pos);
    } else {
      throw Error('Decrypted data header is malformed.');
    }
    let headerSize = null;
    if (encryptedData.length > pos + 1) {
      headerSize = encryptedData[pos];
    }
    pos += 1;
    if (headerSize === 255 && encryptedData.length >= pos + 2) {
      headerSize = new Uint16Array(encryptedData.slice(pos, pos + 3)).reduce((acc, val) => (acc << 8) + val, 0);
      pos += 2;
    }
    return new CryptoHeaderV1(identifier.toString('utf8'), encryptedData.slice(pos, pos + headerSize));
  }
}

// v1 cryptoHeader
class CryptoHeaderV1 {
  static IDENTIFIER_LENGTH = 4;

  static SENTINEL = 'PNED';
  static VERSION = 1;

  identifier;
  metadata;

  constructor(id, metadata) {
    this.identifier = id;
    this.metadata = metadata;
  }

  get identifier() {
    return this.identifier;
  }

  get metadata() {
    return this.metadata;
  }

  get version() {
    return CryptoHeaderV1.VERSION;
  }

  get length() {
    return (
      CryptoHeaderV1.SENTINEL.length +
      1 +
      CryptoHeaderV1.IDENTIFIER_LENGTH +
      (this.metadata.length < 255 ? 1 : 3) +
      this.metadata.length
    );
  }

  get size() {
    return this.metadata.length;
  }

  get data() {
    let pos = 0;
    const header = new Uint8Array(this.length);
    header.set(Buffer.from(CryptoHeaderV1.SENTINEL));
    pos += CryptoHeaderV1.SENTINEL.length;
    header[pos] = this.version;
    pos++;
    if (this.identifier) header.set(Buffer.from(this.identifier), pos);
    pos += CryptoHeaderV1.IDENTIFIER_LENGTH;
    let metadata_size = this.metadata.length;
    if (metadata_size < 255) {
      header[pos] = metadata_size;
    } else {
      header.set([255, metadata_size >> 8, metadata_size & 0xff], pos);
    }
    return header;
  }
}
