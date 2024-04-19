/**
 * Browser crypto module.
 */

import { AbstractCryptoModule, CryptorConfiguration } from '../../../core/interfaces/crypto-module';
import { PubNubFile, PubNubFileParameters } from '../../../file/modules/web';
import { PubNubFileConstructor } from '../../../core/types/file';
import { decode } from '../../../core/components/base64_codec';
import { PubNubError } from '../../../errors/pubnub-error';
import { EncryptedDataType, ICryptor } from './ICryptor';
import { ILegacyCryptor } from './ILegacyCryptor';
import AesCbcCryptor from './aesCbcCryptor';
import LegacyCryptor from './legacyCryptor';

/**
 * Re-export bundled cryptors.
 */
export { LegacyCryptor, AesCbcCryptor };

/**
 * Crypto module cryptors interface.
 */
type CryptorType = ICryptor | ILegacyCryptor;

/**
 * CryptoModule for browser platform.
 */
export class WebCryptoModule extends AbstractCryptoModule<CryptorType> {
  /**
   * {@link LegacyCryptor|Legacy} cryptor identifier.
   */
  static LEGACY_IDENTIFIER = '';

  // --------------------------------------------------------
  // --------------- Convenience functions ------------------
  // -------------------------------------------------------
  // region Convenience functions

  static legacyCryptoModule(config: CryptorConfiguration) {
    if (!config.cipherKey) throw new PubNubError('Crypto module error: cipher key not set.');

    return new WebCryptoModule({
      default: new LegacyCryptor({
        ...config,
        useRandomIVs: config.useRandomIVs ?? true,
      }),
      cryptors: [new AesCbcCryptor({ cipherKey: config.cipherKey })],
    });
  }

  static aesCbcCryptoModule(config: CryptorConfiguration) {
    if (!config.cipherKey) throw new PubNubError('Crypto module error: cipher key not set.');

    return new WebCryptoModule({
      default: new AesCbcCryptor({ cipherKey: config.cipherKey }),
      cryptors: [
        new LegacyCryptor({
          ...config,
          useRandomIVs: config.useRandomIVs ?? true,
        }),
      ],
    });
  }

  /**
   * Construct crypto module with `cryptor` as default for data encryption and decryption.
   *
   * @param defaultCryptor - Default cryptor for data encryption and decryption.
   *
   * @returns Crypto module with pre-configured default cryptor.
   */
  static withDefaultCryptor(defaultCryptor: CryptorType) {
    return new this({ default: defaultCryptor });
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  // region Encryption

  encrypt(data: ArrayBuffer | string) {
    // Encrypt data.
    const encrypted =
      data instanceof ArrayBuffer && this.defaultCryptor.identifier === WebCryptoModule.LEGACY_IDENTIFIER
        ? (this.defaultCryptor as ILegacyCryptor).encrypt(WebCryptoModule.decoder.decode(data))
        : (this.defaultCryptor as ICryptor).encrypt(data);

    if (!encrypted.metadata) return encrypted.data;
    else if (typeof encrypted.data === 'string')
      throw new Error('Encryption error: encrypted data should be ArrayBuffed.');

    const headerData = this.getHeaderData(encrypted);

    return this.concatArrayBuffer(headerData!, encrypted.data);
  }

  async encryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>) {
    /**
     * Files handled differently in case of Legacy cryptor.
     * (as long as we support legacy need to check on instance type)
     */
    if (this.defaultCryptor.identifier === CryptorHeader.LEGACY_IDENTIFIER)
      return (this.defaultCryptor as ILegacyCryptor).encryptFile(file, File);

    const fileData = await this.getFileData(file);
    const encrypted = await (this.defaultCryptor as ICryptor).encryptFileData(fileData);
    if (typeof encrypted.data === 'string') throw new Error('Encryption error: encrypted data should be ArrayBuffed.');

    return File.create({
      name: file.name,
      mimeType: 'application/octet-stream',
      data: this.concatArrayBuffer(this.getHeaderData(encrypted)!, encrypted.data),
    });
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  // region Decryption

  decrypt(data: ArrayBuffer | string) {
    const encryptedData = typeof data === 'string' ? decode(data) : data;
    const header = CryptorHeader.tryParse(encryptedData);
    const cryptor = this.getCryptor(header);
    const metadata =
      header.length > 0
        ? encryptedData.slice(header.length - (header as CryptorHeaderV1).metadataLength, header.length)
        : null;

    if (encryptedData.slice(header.length).byteLength <= 0) throw new Error('Decryption error: empty content');

    return cryptor!.decrypt({
      data: encryptedData.slice(header.length),
      metadata: metadata,
    });
  }

  async decryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>) {
    const data = await file.data.arrayBuffer();
    const header = CryptorHeader.tryParse(data);
    const cryptor = this.getCryptor(header);
    /**
     * Files handled differently in case of Legacy cryptor.
     * (as long as we support legacy need to check on instance type)
     */
    if (cryptor?.identifier === CryptorHeader.LEGACY_IDENTIFIER)
      return (cryptor as ILegacyCryptor).decryptFile(file, File);

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
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Retrieve registered cryptor by its identifier.
   *
   * @param id - Unique cryptor identifier.
   *
   * @returns Registered cryptor with specified identifier.
   *
   * @throws Error if cryptor with specified {@link id} can't be found.
   */
  private getCryptorFromId(id: string) {
    const cryptor = this.getAllCryptors().find((cryptor) => id === cryptor.identifier);
    if (cryptor) return cryptor;

    throw Error('Unknown cryptor error');
  }

  /**
   * Retrieve cryptor by its identifier.
   *
   * @param header - Header with cryptor-defined data or raw cryptor identifier.
   *
   * @returns Cryptor which correspond to provided {@link header}.
   */
  private getCryptor(header: CryptorHeader | string) {
    if (typeof header === 'string') {
      const cryptor = this.getAllCryptors().find((cryptor) => cryptor.identifier === header);
      if (cryptor) return cryptor;

      throw new Error('Unknown cryptor error');
    } else if (header instanceof CryptorHeaderV1) {
      return this.getCryptorFromId(header.identifier);
    }
  }

  /**
   * Create cryptor header data.
   *
   * @param encrypted - Encryption data object as source for header data.
   *
   * @returns Binary representation of the cryptor header data.
   */
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

  /**
   * Merge two {@link ArrayBuffer} instances.
   *
   * @param ab1 - First {@link ArrayBuffer}.
   * @param ab2 - Second {@link ArrayBuffer}.
   *
   * @returns Merged data as {@link ArrayBuffer}.
   */
  private concatArrayBuffer(ab1: ArrayBuffer, ab2: ArrayBuffer): ArrayBuffer {
    const tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);

    tmp.set(new Uint8Array(ab1), 0);
    tmp.set(new Uint8Array(ab2), ab1.byteLength);

    return tmp.buffer;
  }

  /**
   * Retrieve file content.
   *
   * @param file - Content of the {@link PubNub} File object.
   *
   * @returns Normalized file {@link data} as {@link ArrayBuffer};
   */
  private async getFileData(file: PubNubFile | ArrayBuffer) {
    if (file instanceof ArrayBuffer) return file;
    else if (file instanceof PubNubFile) return file.toArrayBuffer();

    throw new Error(
      'Cannot decrypt/encrypt file. In browsers file encrypt/decrypt supported for string, ArrayBuffer or Blob',
    );
  }
}

/**
 * CryptorHeader Utility
 */
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
    let sentinel: Uint8Array;
    let version = null;

    if (encryptedData.byteLength >= 4) {
      sentinel = encryptedData.slice(0, 4);
      if (this.decoder.decode(sentinel) !== CryptorHeader.SENTINEL) return WebCryptoModule.LEGACY_IDENTIFIER;
    }

    if (encryptedData.byteLength >= 5) version = (encryptedData as Uint8Array)[4] as number;
    else throw new Error('Decryption error: invalid header version');

    if (version > CryptorHeader.MAX_VERSION) throw new Error('Decryption error: Unknown cryptor error');

    let identifier: Uint8Array;
    let pos = 5 + CryptorHeader.IDENTIFIER_LENGTH;
    if (encryptedData.byteLength >= pos) identifier = encryptedData.slice(5, pos);
    else throw new Error('Decryption error: invalid crypto identifier');

    let metadataLength = null;
    if (encryptedData.byteLength >= pos + 1) metadataLength = (encryptedData as Uint8Array)[pos];
    else throw new Error('Decryption error: invalid metadata length');

    pos += 1;
    if (metadataLength === 255 && encryptedData.byteLength >= pos + 2) {
      metadataLength = new Uint16Array(encryptedData.slice(pos, pos + 2)).reduce((acc, val) => (acc << 8) + val, 0);
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

    const metadataLength = this.metadataLength;
    pos += CryptorHeader.IDENTIFIER_LENGTH;

    if (metadataLength < 255) header[pos] = metadataLength;
    else header.set([255, metadataLength >> 8, metadataLength & 0xff], pos);

    return header;
  }
}
