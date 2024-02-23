import LegacyCryptor from './legacyCryptor';
import AesCbcCryptor from './aesCbcCryptor';
import { EncryptedDataType, ICryptor } from './ICryptor';
import { ILegacyCryptor, PubNubFileType } from './ILegacyCryptor';
import { decode } from '../../../core/components/base64_codec';
import { CryptoModule, CryptorConfiguration } from '../../../core/interfaces/crypto-module';

export { LegacyCryptor, AesCbcCryptor };

type CryptorType = ICryptor | ILegacyCryptor<PubNubFileType>;

export class WebCryptoModule extends CryptoModule<CryptorType> {
  static LEGACY_IDENTIFIER = '';
  static encoder = new TextEncoder();
  static decoder = new TextDecoder();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore: type detection issue with old Config type assignment
  static legacyCryptoModule(config: CryptorConfiguration) {
    return new WebCryptoModule({
      default: new LegacyCryptor({
        cipherKey: config.cipherKey,
        useRandomIVs: config.useRandomIVs ?? true,
      }),
      cryptors: [new AesCbcCryptor({ cipherKey: config.cipherKey })],
    });
  }

  static aesCbcCryptoModule(config: CryptorConfiguration) {
    return new WebCryptoModule({
      default: new AesCbcCryptor({ cipherKey: config.cipherKey }),
      cryptors: [
        new LegacyCryptor({
          cipherKey: config.cipherKey,
          useRandomIVs: config.useRandomIVs ?? true,
        }),
      ],
    });
  }

  static withDefaultCryptor(defaultCryptor: CryptorType) {
    return new this({ default: defaultCryptor });
  }

  private getAllCryptors() {
    return [this.defaultCryptor, ...this.cryptors];
  }

  encrypt(data: ArrayBuffer | string) {
    const encrypted = (this.defaultCryptor as ICryptor).encrypt(data);
    if (!encrypted.metadata) return encrypted.data;
    const headerData = this.getHeaderData(encrypted);
    return this.concatArrayBuffer(headerData!, encrypted.data);
  }

  decrypt(data: ArrayBuffer | string) {
    const encryptedData = typeof data === 'string' ? decode(data) : data;
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
    if (this.defaultCryptor.identifier === CryptorHeader.LEGACY_IDENTIFIER)
      return (this.defaultCryptor as ILegacyCryptor<PubNubFileType>).encryptFile(file, File);
    const fileData = await this.getFileData(file.data);
    const encrypted = await (this.defaultCryptor as ICryptor).encryptFileData(fileData);
    return File.create({
      name: file.name,
      mimeType: 'application/octet-stream',
      data: this.concatArrayBuffer(this.getHeaderData(encrypted)!, encrypted.data),
    });
  }

  async decryptFile(file: PubNubFileType, File: PubNubFileType) {
    const data = await file.data.arrayBuffer();
    const header = CryptorHeader.tryParse(data);
    const cryptor = this.getCryptor(header);
    if (cryptor?.identifier === CryptoModule.LEGACY_IDENTIFIER) {
      return (cryptor as ILegacyCryptor<PubNubFileType>).decryptFile(file, File);
    }
    const fileData = await this.getFileData(data);
    const metadata = fileData.slice(header.length - (header as CryptorHeaderV1).metadataLength, header.length);
    return File.create({
      name: file.name,
      data: await (this.defaultCryptor as ICryptor).decryptFileData({
        data: data.slice(header.length),
        metadata: metadata,
      }),
    });
  }

  private getCryptor(header: string | CryptorHeaderV1) {
    if (header === '') {
      const cryptor = this.getAllCryptors().find((c) => c.identifier === '');
      if (cryptor) return cryptor;
      throw new Error('unknown cryptor error');
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

  private getHeaderData(encrypted: EncryptedDataType) {
    if (!encrypted.metadata) return;
    const header = CryptorHeader.from(this.defaultCryptor.identifier, encrypted.metadata);
    const headerData = new Uint8Array(header!.length);
    let pos = 0;
    headerData.set(header!.data, pos);
    pos += header!.length - encrypted.metadata.byteLength;
    headerData.set(new Uint8Array(encrypted.metadata), pos);
    return headerData.buffer;
  }

  private async getFileData(input: any) {
    if (input instanceof Blob) {
      const fileData = await input.arrayBuffer();
      return fileData;
    }
    if (input instanceof ArrayBuffer) {
      return input;
    }
    if (typeof input === 'string') {
      return CryptoModule.encoder.encode(input);
    }
    throw new Error(
      'Cannot decrypt/encrypt file. In browsers file encrypt/decrypt supported for string, ArrayBuffer or Blob',
    );
  }
}

// CryptorHeader Utility
class CryptorHeader {
  static SENTINEL = 'PNED';
  static LEGACY_IDENTIFIER = '';
  static IDENTIFIER_LENGTH = 4;
  static VERSION = 1;
  static MAX_VERSION = 1;
  static decoder = new TextDecoder();

  static from(id: string, metadata: ArrayBuffer) {
    if (id === CryptorHeader.LEGACY_IDENTIFIER) return;
    return new CryptorHeaderV1(id, metadata.byteLength);
  }

  static tryParse(data: ArrayBuffer) {
    const encryptedData = new Uint8Array(data);
    let sentinel: any = '';
    let version = null;
    if (encryptedData.byteLength >= 4) {
      sentinel = encryptedData.slice(0, 4);
      if (this.decoder.decode(sentinel) !== CryptorHeader.SENTINEL) return '';
    }
    if (encryptedData.byteLength >= 5) {
      version = (encryptedData as Uint8Array)[4] as number;
    } else {
      throw new Error('decryption error. invalid header version');
    }
    if (version > CryptorHeader.MAX_VERSION) throw new Error('unknown cryptor error');

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
    return new CryptorHeaderV1(this.decoder.decode(identifier), metadataLength);
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
