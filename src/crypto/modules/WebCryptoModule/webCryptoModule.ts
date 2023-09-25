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

  static aesCbcCryptoModule(config: { cipherKey: { cipherKey: any } }) {
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

  async encrypt(data: ArrayBuffer) {
    let encrypted = await this.defaultCryptor.encrypt(data);
    if (!encrypted.metadata) return encrypted.data;

    let header = CryptorHeader.from(this.defaultCryptor.identifier, encrypted.metadata);

    let headerData = new Uint8Array((header as CryptorHeaderV1).length);
    let pos = 0;
    headerData.set((header as CryptorHeaderV1).data, pos);
    pos += (header as CryptorHeaderV1).length;
    if (encrypted.metadata) {
      pos -= encrypted.metadata.byteLength;
      headerData.set(new Uint8Array(encrypted.metadata), pos);
    }
    return this.concatArrayBuffer(headerData.buffer, encrypted.data);
  }

  async decrypt(encryptedData: ArrayBuffer) {
    let header = CryptorHeader.tryParse(encryptedData);
    let cryptor = this.getCryptor(header);
    let metadata =
      header.length > 0
        ? encryptedData.slice(header.length - (header as CryptorHeaderV1).metadataLength, header.length)
        : null;
    //@ts-ignore: cryptor will be there or unreachable due to exception
    return cryptor.decrypt({
      data: encryptedData.slice(header.length),
      metadata: metadata,
    });
  }

  async encryptFile(file: PubnubFile, File: PubnubFile) {
    /**
     * Files handled differently in case of Legacy cryptor.
     * (as long as we support legacy need to check on default cryptor)
     */
    //@ts-ignore: default cryptor will be there. As long as legacy cryptor supported.
    if (this.defaultCryptor.identifier === '') return this.defaultCryptor.encryptFile(file, File);
    //@ts-ignore: can not infer that PubNubFile has data field
    if (file.data instanceof Buffer) {
      return File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        //@ts-ignore: can not infer that PubNubFile has data field
        data: await this.encrypt(file.data),
      });
    }
  }

  async decryptFile(file: PubnubFile, File: PubnubFile) {
    //@ts-ignore: can not infer that PubNubFile has data field
    if (file.data instanceof Buffer) {
      //@ts-ignore: can not infer that PubNubFile has data field
      let header = CryptorHeader.tryParse(file.data);
      let cryptor = this.getCryptor(header);
      /**
       * If It's legacyone then redirect it.
       * (as long as we support legacy need to check on instance type)
       */
      //@ts-ignore: cryptor will be there or unreachable due to exception
      if (cryptor.identifier === CryptoModule.LEGACY_IDENTIFIER) return cryptor.decryptFile(file, File);
      return File.create({
        name: file.name,
        //@ts-ignore: can not infer that PubNubFile has data field
        data: await this.decrypt(file.data),
      });
    }
  }

  getCryptor(header: string | CryptorHeaderV1) {
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

  concatArrayBuffer(ab1: ArrayBuffer, ab2: ArrayBuffer) {
    const tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);

    tmp.set(new Uint8Array(ab1), 0);
    tmp.set(new Uint8Array(ab2), ab1.byteLength);

    return tmp.buffer;
  }
}

// CryptorHeader Utility
class CryptorHeader {
  static SENTINEL = 'PNED';
  static LEGACY_IDENTIFIER = '';
  static IDENTIFIER_LENGTH = 4;
  static MAX_VERSION = 1;

  static from(id: string, metadata: ArrayBuffer) {
    if (id === CryptorHeader.LEGACY_IDENTIFIER) return;
    return new CryptorHeaderV1(id, metadata.byteLength);
  }

  static tryParse(encryptedData: ArrayBuffer) {
    let sentinel: any = '';
    let version = null;
    if (encryptedData.byteLength >= 4) {
      sentinel = encryptedData.slice(0, 4);
      if (sentinel.toString('utf8') !== CryptorHeader.SENTINEL) return '';
    }

    if (encryptedData.byteLength >= 5) {
      version = (encryptedData as Uint8Array)[4] as number;
    } else {
      throw new PubNubError('decryption error');
    }
    if (version > CryptorHeader.MAX_VERSION) throw new PubNubError('unknown cryptor');

    let identifier: any = '';
    let pos = 5 + CryptorHeader.IDENTIFIER_LENGTH;
    if (encryptedData.byteLength >= pos) {
      identifier = encryptedData.slice(5, pos);
    } else {
      throw new PubNubError('decryption error');
    }
    let headerSize = null;
    if (encryptedData.byteLength > pos + 1) {
      headerSize = (encryptedData as Uint8Array)[pos];
    }
    pos += 1;
    if (headerSize === 255 && encryptedData.byteLength >= pos + 2) {
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
    const encoder = new TextEncoder();
    header.set(encoder.encode(CryptorHeaderV1.SENTINEL));
    pos += CryptorHeaderV1.SENTINEL.length;
    header[pos] = this.version;
    pos++;
    if (this.identifier) header.set(encoder.encode(this.identifier), pos);
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