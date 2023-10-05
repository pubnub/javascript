import { PubNubError } from '../../../core/components/endpoint';
import LegacyCryptor from './legacyCryptor';
import AesCbcCryptor from './aesCbcCryptor';
import { ICryptor } from './ICryptor';
import { ILegacyCryptor, PubNubFileType } from './ILegacyCryptor';

export { LegacyCryptor, AesCbcCryptor };

type CryptorType = ICryptor | ILegacyCryptor<PubNubFileType>;

type CryptoModuleConfiguration = {
  default: CryptorType;
  cryptors?: Array<CryptorType>;
};

export class CryptoModule {
  static LEGACY_IDENTIFIER = '';
  defaultCryptor: CryptorType;
  cryptors: Array<CryptorType>;

  constructor(cryptoModuleConfiguration: CryptoModuleConfiguration) {
    this.defaultCryptor = cryptoModuleConfiguration.default;
    this.cryptors = cryptoModuleConfiguration.cryptors ?? [];
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore: type detection issue with old Config type assignment
  static legacyCryptoModule({ config }) {
    return new this({
      default: new LegacyCryptor({ config }),
      cryptors: [new AesCbcCryptor(config.cipherKey)],
    });
  }

  static aesCbcCryptoModule(config: any) {
    return new this({
      default: new AesCbcCryptor(config.cipherKey),
      cryptors: [new LegacyCryptor({ config })],
    });
  }

  static withDefaultCryptor(defaultCryptor: CryptorType) {
    return new this({ default: defaultCryptor });
  }

  private getAllCryptors() {
    return [this.defaultCryptor, ...this.cryptors];
  }

  async encrypt(data: ArrayBuffer | string) {
    const encrypted = await this.defaultCryptor.encrypt(data);
    if (!encrypted.metadata) return encrypted.data;

    const header = CryptorHeader.from(this.defaultCryptor.identifier, encrypted.metadata);

    const headerData = new Uint8Array(header!.length);
    let pos = 0;
    headerData.set(header!.data, pos);
    pos += header!.length - encrypted.metadata.byteLength;
    headerData.set(new Uint8Array(encrypted.metadata), pos);
    return this.concatArrayBuffer(headerData.buffer, encrypted.data);
  }

  async decrypt(data: ArrayBuffer | string) {
    const encryptedData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const header = CryptorHeader.tryParse(encryptedData);
    const cryptor = this.getCryptor(header);
    const metadata =
      header.length > 0
        ? encryptedData.slice(header.length - (header as CryptorHeaderV1).metadataLength, header.length)
        : null;
    if (encryptedData.slice(header.length).byteLength <= 0) throw new Error('decryption error. empty content');
    return cryptor!.decrypt({
      data: encryptedData.slice(header.length),
      metadata: metadata,
    });
  }

  async encryptFile(file: PubNubFileType, File: PubNubFileType) {
    /**
     * Files handled differently in case of Legacy cryptor.
     * (as long as we support legacy need to check on default cryptor)
     */
    if (this.defaultCryptor.identifier === CryptorHeader.LEGACY_IDENTIFIER)
      return (this.defaultCryptor as ILegacyCryptor<PubNubFileType>).encryptFile(file, File);
    if (file.data instanceof ArrayBuffer) {
      return File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        data: await this.encrypt(file.data),
      });
    }
  }

  async decryptFile(file: PubNubFileType, File: PubNubFileType) {
    if (file.data instanceof ArrayBuffer) {
      const header = CryptorHeader.tryParse(file.data);
      const cryptor = this.getCryptor(header);
      /**
       * If It's legacyone then redirect it.
       * (as long as we support legacy need to check on instance type)
       */
      if (cryptor?.identifier === CryptoModule.LEGACY_IDENTIFIER)
        return (cryptor as ILegacyCryptor<PubNubFileType>).decryptFile(file, File);
      return File.create({
        name: file.name,
        data: await this.decrypt(file.data),
      });
    }
  }

  private getCryptor(header: string | CryptorHeaderV1) {
    if (header === '') {
      const cryptor = this.getAllCryptors().find((c) => c.identifier === '');
      if (cryptor) return cryptor;
      throw new Error('unknown cryptor');
    } else if (header instanceof CryptorHeaderV1) {
      return this.getCryptorFromId(header.identifier);
    }
  }

  private getCryptorFromId(id: string) {
    const cryptor = this.getAllCryptors().find((c) => id === c.identifier);
    if (cryptor) {
      return cryptor;
    }
    throw Error('unknown cryptor error');
  }

  private concatArrayBuffer(ab1: ArrayBuffer, ab2: ArrayBuffer) {
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
  static VERSION = 1;
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
      throw new Error('decryption error. invalid header version');
    }
    if (version > CryptorHeader.MAX_VERSION) throw new PubNubError('unknown cryptor error');

    let identifier: any = '';
    let pos = 5 + CryptorHeader.IDENTIFIER_LENGTH;
    if (encryptedData.byteLength >= pos) {
      identifier = encryptedData.slice(5, pos);
    } else {
      throw new Error('decryption error. invalid crypto identifier');
    }
    let metadataLength = null;
    if (encryptedData.byteLength >= pos + 1) {
      metadataLength = (encryptedData as Uint8Array)[pos];
    } else {
      throw new Error('decryption error. invalid metadata length');
    }
    pos += 1;
    if (metadataLength === 255 && encryptedData.byteLength >= pos + 2) {
      metadataLength = new Uint16Array(encryptedData.slice(pos, pos + 2)).reduce((acc, val) => (acc << 8) + val, 0);
      pos += 2;
    }
    return new CryptorHeaderV1(identifier.toString('utf8'), metadataLength);
  }
}

// v1 CryptorHeader
class CryptorHeaderV1 {
  static IDENTIFIER_LENGTH = 4;

  static SENTINEL = 'PNED';

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
    return CryptorHeader.VERSION;
  }

  get length() {
    return (
      CryptorHeader.SENTINEL.length +
      1 +
      CryptorHeader.IDENTIFIER_LENGTH +
      (this.metadataLength < 255 ? 1 : 3) +
      this.metadataLength
    );
  }

  get data() {
    let pos = 0;
    const header = new Uint8Array(this.length);
    const encoder = new TextEncoder();
    header.set(encoder.encode(CryptorHeader.SENTINEL));
    pos += CryptorHeader.SENTINEL.length;
    header[pos] = this.version;
    pos++;
    if (this.identifier) header.set(encoder.encode(this.identifier), pos);
    pos += CryptorHeader.IDENTIFIER_LENGTH;
    const metadataLength = this.metadataLength;
    if (metadataLength < 255) {
      header[pos] = metadataLength;
    } else {
      header.set([255, metadataLength >> 8, metadataLength & 0xff], pos);
    }
    return header;
  }
}
