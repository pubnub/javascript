import { Readable, PassThrough } from 'stream';
import { PubNubError } from '../../../core/components/endpoint';
import LegacyCryptor from './legacyCryptor';
import AesCbcCryptor from './aesCbcCryptor';
import { ICryptor } from './ICryptor';
import { ILegacyCryptor, PubnubFile } from './ILegacyCryptor';

type CryptorType = ICryptor | ILegacyCryptor<PubnubFile>;

type CryptoModuleConfiguration = {
  default: CryptorType;
  cryptors?: Array<CryptorType>;
};

export default class CryptoModule {
  static LEGACY_IDENTIFIER = '';

  defaultCryptor: CryptorType;
  cryptors: Array<CryptorType>;

  constructor(cryptoModuleConfiguration: CryptoModuleConfiguration) {
    this.defaultCryptor = cryptoModuleConfiguration.default;
    this.cryptors = cryptoModuleConfiguration.cryptors ?? [];
  }

  //@ts-ignore: type detection issue with old Config type assignment
  static legacyCryptoModule({ config }) {
    return new this({
      default: new LegacyCryptor({ config }),
      cryptors: [new AesCbcCryptor(config.cipherKey)],
    });
  }

  static aesCbcCryptoModule(config: { cipherKey: { cipherKey: string } }) {
    return new this({
      default: new AesCbcCryptor(config.cipherKey),
      cryptors: [new LegacyCryptor({ config })],
    });
  }

  static withDefaultCryptor(defaultCryptor: CryptorType) {
    return new this({ default: defaultCryptor });
  }

  getAllCryptors() {
    return [this.defaultCryptor, ...this.cryptors];
  }

  getLegacyCryptor() {
    return this.getAllCryptors().find((c) => c.identifier === '');
  }

  async encrypt(data: Buffer) {
    let encrypted = await this.defaultCryptor.encrypt(data);
    if (!encrypted.metadata) return encrypted.data;

    let header = CryptorHeader.from(this.defaultCryptor.identifier, encrypted.metadata);

    let headerData = new Uint8Array(header!.length);
    let pos = 0;
    headerData.set(header!.data, pos);
    pos += header!.length;
    if (encrypted.metadata) {
      pos -= encrypted.metadata.length;
      headerData.set(encrypted.metadata, pos);
    }
    return Buffer.concat([headerData, encrypted.data]);
  }

  async decrypt(data: Buffer) {
    let encryptedData = null;
    encryptedData = Buffer.from(data);

    let header = CryptorHeader.tryParse(encryptedData);
    let cryptor = this.getCryptor(header);
    let metadata =
      header.length > 0
        ? encryptedData.slice(header.length - (header as CryptorHeaderV1).metadataLength, header.length)
        : null;
    return cryptor!.decrypt({
      data: encryptedData.slice(header.length),
      metadata: metadata,
    });
  }

  async encryptFile(file: PubnubFile, File: PubnubFile) {
    /**
     * Files handled differently in case of Legacy cryptor.
     * (as long as we support legacy need to check on intsance type)
     */
    if (this.defaultCryptor instanceof LegacyCryptor) return this.defaultCryptor.encryptFile(file, File);
    //@ts-ignore: can not infer that PubNubFile has data field
    if (file.data instanceof Buffer) {
      return File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        //@ts-ignore: can not infer that PubNubFile has data field
        data: await this.encrypt(file.data!),
      });
    }
    //@ts-ignore: can not infer that PubNubFile has data field
    if (file.data instanceof Readable) {
      //@ts-ignore: default cryptor will be there. As long as legacy cryptor supported.
      let encryptedStream = this.defaultCryptor.encryptStream(file.data);
      let header = CryptorHeader.from(this.defaultCryptor.identifier, encryptedStream.metadata);

      let payload = new Uint8Array(header!.length);
      let pos = 0;
      payload.set(header!.data, pos);
      pos += header!.length;
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

  async decryptFile(file: any, File: PubnubFile) {
    if (file?.data instanceof Buffer) {
      let header = CryptorHeader.tryParse(file.data);
      let cryptor = this.getCryptor(header);
      /**
       * If It's legacyone then redirect it.
       * (as long as we support legacy need to check on instance type)
       */
      //@ts-ignore: cryptor will be there or unreachable due to exception
      if (cryptor?.identifier === CryptoModule.LEGACY_IDENTIFIER) return cryptor.decryptFile(file, File);
      return File.create({
        name: file.name,
        data: await this.decrypt(file?.data),
      });
    }

    if (file.data instanceof Readable) {
      let stream = file.data;
      return new Promise((resolve) => {
        stream.on('readable', () => resolve(this.onStreamReadable(stream, file, File)));
      });
    }
  }

  async onStreamReadable(stream: NodeJS.ReadableStream, file: PubnubFile, File: PubnubFile) {
    stream.removeAllListeners('readable');

    let magicBytes = stream.read(4);
    if (!CryptorHeader.isSentinel(magicBytes as Buffer)) {
      stream.unshift(magicBytes);
      return this.decryptLegacyFileStream(stream, file, File);
    }
    let versionByte = stream.read(1);
    CryptorHeader.validateVersion(versionByte[0] as number);
    let identifier = stream.read(4);
    let cryptor = this.getCryptorFromId(CryptorHeader.tryGetIdentifier(identifier as Buffer));
    let headerSize = CryptorHeader.tryGetMetadataSizeFromStream(stream);

    return File.create({
      name: file.name,
      mimeType: 'application/octet-stream',
      stream: await (cryptor as ICryptor).decryptStream({ stream: stream, metadataLength: headerSize as number }),
    });
  }

  async decryptLegacyFileStream(stream: NodeJS.ReadableStream, file: PubnubFile, File: PubnubFile) {
    const cryptor = this.getLegacyCryptor();
    if (cryptor) {
      //@ts-ignore: cryptor will be there or unreachable due to exception
      return cryptor.decryptFile(
        File.create({
          name: file.name,
          stream: stream,
        }),
        File,
      );
    } else {
      throw new PubNubError('unknown cryptor');
    }
  }

  getCryptor(header: CryptorHeader) {
    if (header === '') {
      const cryptor = this.getAllCryptors().find((c) => c.identifier === '');
      if (cryptor) return cryptor;
      throw new Error('unknown cryptor');
    } else if (header instanceof CryptorHeaderV1) {
      return this.getCryptorFromId(header.identifier);
    }
  }

  getCryptorFromId(id: string) {
    const cryptor = this.getAllCryptors().find((c) => id === c.identifier);
    if (cryptor) {
      return cryptor;
    }
    throw Error('unknown cryptor');
  }
}

// CryptorHeader Utility
class CryptorHeader {
  static SENTINEL = 'PNED';
  static LEGACY_IDENTIFIER = '';
  static IDENTIFIER_LENGTH = 4;
  static MAX_VERSION = 1;

  static from(id: string, metadata: Buffer) {
    if (id === CryptorHeader.LEGACY_IDENTIFIER) return;
    return new CryptorHeaderV1(id, metadata.length);
  }

  static isSentinel(bytes: Buffer) {
    if (bytes && bytes.byteLength >= 4) {
      if (bytes.toString('utf8') == CryptorHeader.SENTINEL) return true;
    }
  }

  static validateVersion(data: number) {
    if (data && data > CryptorHeader.MAX_VERSION) throw new PubNubError('decryption error');
    return data;
  }

  static tryGetIdentifier(data: Buffer) {
    if (data.byteLength < 4) {
      throw new PubNubError('unknown cryptor');
    } else {
      return data.toString('utf8');
    }
  }

  static tryGetMetadataSizeFromStream(stream: NodeJS.ReadableStream) {
    let sizeBuf = stream.read(1);
    if (sizeBuf && (sizeBuf[0] as number) < 255) {
      return sizeBuf[0] as number;
    }
    if ((sizeBuf[0] as number) === 255) {
      let nextBuf = stream.read(2);
      if (nextBuf.length >= 2) {
        return new Uint16Array([nextBuf[0] as number, nextBuf[1] as number]).reduce((acc, val) => (acc << 8) + val, 0);
      }
    }
  }
  static tryParse(encryptedData: Buffer) {
    let sentinel: any = '';
    let version = null;
    if (encryptedData.length >= 4) {
      sentinel = encryptedData.slice(0, 4);
      if (sentinel.toString('utf8') !== CryptorHeader.SENTINEL) return '';
    }

    if (encryptedData.length >= 5) {
      version = encryptedData[4];
    } else {
      throw new PubNubError('decryption error');
    }
    if (version > CryptorHeader.MAX_VERSION) throw new PubNubError('unknown cryptor');

    let identifier: Buffer;
    let pos = 5 + CryptorHeader.IDENTIFIER_LENGTH;
    if (encryptedData.length >= pos) {
      identifier = encryptedData.slice(5, pos);
    } else {
      throw new PubNubError('decryption error');
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
    return new CryptorHeaderV1(identifier.toString('utf8'), headerSize!);
  }
}

// v1 CryptorHeader
class CryptorHeaderV1 {
  static IDENTIFIER_LENGTH = 4;

  static SENTINEL = 'PNED';
  static VERSION = 1;

  _identifier;
  _metadataLength;

  constructor(id: string, metadataLength: number) {
    this._identifier = id;
    this._metadataLength = metadataLength;
  }

  get identifier() {
    return this._identifier;
  }

  set identifier(value) {
    this._identifier = value;
  }

  get metadataLength() {
    return this._metadataLength;
  }

  set metadataLength(value) {
    this._metadataLength = value;
  }

  get version() {
    return CryptorHeaderV1.VERSION;
  }

  get length() {
    return (
      CryptorHeaderV1.SENTINEL.length +
      1 +
      CryptorHeaderV1.IDENTIFIER_LENGTH +
      (this.metadataLength < 255 ? 1 : 3) +
      this.metadataLength
    );
  }

  get data() {
    let pos = 0;
    const header = new Uint8Array(this.length);
    header.set(Buffer.from(CryptorHeaderV1.SENTINEL));
    pos += CryptorHeaderV1.SENTINEL.length;
    header[pos] = this.version;
    pos++;
    if (this.identifier) header.set(Buffer.from(this.identifier), pos);
    pos += CryptorHeaderV1.IDENTIFIER_LENGTH;
    let metadata_size = this.metadataLength;
    if (metadata_size < 255) {
      header[pos] = metadata_size;
    } else {
      header.set([255, metadata_size >> 8, metadata_size & 0xff], pos);
    }
    return header;
  }
}