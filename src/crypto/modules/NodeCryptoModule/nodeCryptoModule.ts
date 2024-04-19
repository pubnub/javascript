/**
 * Node.js crypto module.
 */

import { Readable, PassThrough } from 'stream';
import { Buffer } from 'buffer';

import { AbstractCryptoModule, CryptorConfiguration } from '../../../core/interfaces/crypto-module';
import PubNubFile, { PubNubFileParameters } from '../../../file/modules/node';
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
 * CryptoModule for Node.js platform.
 */
export class CryptoModule extends AbstractCryptoModule<CryptorType> {
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

    return new this({
      default: new LegacyCryptor({
        ...config,
        useRandomIVs: config.useRandomIVs ?? true,
      }),
      cryptors: [new AesCbcCryptor({ cipherKey: config.cipherKey })],
    });
  }

  static aesCbcCryptoModule(config: CryptorConfiguration) {
    if (!config.cipherKey) throw new PubNubError('Crypto module error: cipher key not set.');

    return new this({
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
      data instanceof ArrayBuffer && this.defaultCryptor.identifier === CryptoModule.LEGACY_IDENTIFIER
        ? (this.defaultCryptor as ILegacyCryptor).encrypt(CryptoModule.decoder.decode(data))
        : (this.defaultCryptor as ICryptor).encrypt(data);

    if (!encrypted.metadata) return encrypted.data;

    const headerData = this.getHeaderData(encrypted)!;

    // Write encrypted data payload content.
    const encryptedData =
      typeof encrypted.data === 'string'
        ? CryptoModule.encoder.encode(encrypted.data).buffer
        : encrypted.data.buffer.slice(encrypted.data.byteOffset, encrypted.data.byteOffset + encrypted.data.length);

    return this.concatArrayBuffer(headerData, encryptedData);
  }

  async encryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>) {
    /**
     * Files handled differently in case of Legacy cryptor.
     * (as long as we support legacy need to check on instance type)
     */
    if (this.defaultCryptor.identifier === CryptorHeader.LEGACY_IDENTIFIER)
      return (this.defaultCryptor as ILegacyCryptor).encryptFile(file, File);

    if (file.data instanceof Buffer) {
      const encryptedData = this.encrypt(file.data);

      return File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        data: Buffer.from(
          typeof encryptedData === 'string' ? CryptoModule.encoder.encode(encryptedData) : encryptedData,
        ),
      });
    }

    if (file.data instanceof Readable) {
      if (!file.contentLength || file.contentLength === 0) throw new Error('Encryption error: empty content');

      const encryptedStream = await (this.defaultCryptor as ICryptor).encryptStream(file.data);
      const header = CryptorHeader.from(this.defaultCryptor.identifier, encryptedStream.metadata!);
      const payload = new Uint8Array(header!.length);
      let pos = 0;
      payload.set(header!.data, pos);
      pos += header!.length;

      if (encryptedStream.metadata) {
        const metadata = new Uint8Array(encryptedStream.metadata);
        pos -= encryptedStream.metadata.byteLength;
        payload.set(metadata, pos);
      }

      const output = new PassThrough();
      output.write(payload);
      encryptedStream.stream.pipe(output);

      return File.create({
        name: file.name,
        mimeType: 'application/octet-stream',
        stream: output,
      });
    }
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  // region Decryption

  decrypt(data: ArrayBuffer | string) {
    const encryptedData = Buffer.from(typeof data === 'string' ? decode(data) : data);
    const header = CryptorHeader.tryParse(
      encryptedData.buffer.slice(encryptedData.byteOffset, encryptedData.byteOffset + encryptedData.length),
    );
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

  async decryptFile(
    file: PubNubFile,
    File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
  ): Promise<PubNubFile | undefined> {
    if (file.data && file.data instanceof Buffer) {
      const header = CryptorHeader.tryParse(
        file.data.buffer.slice(file.data.byteOffset, file.data.byteOffset + file.data.length),
      );
      const cryptor = this.getCryptor(header);
      /**
       * If It's legacy one then redirect it.
       * (as long as we support legacy need to check on instance type)
       */
      if (cryptor?.identifier === CryptoModule.LEGACY_IDENTIFIER)
        return (cryptor as ILegacyCryptor).decryptFile(file, File);

      return File.create({
        name: file.name,
        data: Buffer.from(this.decrypt(file.data) as ArrayBuffer),
      });
    }

    if (file.data && file.data instanceof Readable) {
      const stream = file.data;
      return new Promise((resolve) => {
        stream.on('readable', () => resolve(this.onStreamReadable(stream, file, File)));
      });
    }
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Retrieve registered legacy cryptor.
   *
   * @returns Previously registered {@link ILegacyCryptor|legacy} cryptor.
   *
   * @throws Error if legacy cryptor not registered.
   */
  private getLegacyCryptor(): ILegacyCryptor | undefined {
    return this.getCryptorFromId(CryptoModule.LEGACY_IDENTIFIER) as ILegacyCryptor;
  }

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

    throw new Error('Unknown cryptor error');
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
      const cryptor = this.getAllCryptors().find((c) => c.identifier === header);
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
   * {@link Readable} stream event handler.
   *
   * @param stream - Stream which can be used to read data for decryption.
   * @param file - File object which has been created with {@link stream}.
   * @param File - Class constructor for {@link PubNub} File object.
   *
   * @returns Decrypted data as {@link PubNub} File object.
   *
   * @throws Error if file is empty or contains unsupported data type.
   */
  private async onStreamReadable(
    stream: NodeJS.ReadableStream,
    file: PubNubFile,
    File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
  ) {
    stream.removeAllListeners('readable');
    const magicBytes = stream.read(4);

    if (!CryptorHeader.isSentinel(magicBytes as Buffer)) {
      if (magicBytes === null) throw new Error('Decryption error: empty content');
      stream.unshift(magicBytes);

      return this.decryptLegacyFileStream(stream, file, File);
    }

    const versionByte = stream.read(1);
    CryptorHeader.validateVersion(versionByte[0] as number);
    const identifier = stream.read(4);
    const cryptor = this.getCryptorFromId(CryptorHeader.tryGetIdentifier(identifier as Buffer));
    const headerSize = CryptorHeader.tryGetMetadataSizeFromStream(stream);

    if (!file.contentLength || file.contentLength <= CryptorHeader.MIN_HEADER_LENGTH + headerSize)
      throw new Error('Decryption error: empty content');

    return File.create({
      name: file.name,
      mimeType: 'application/octet-stream',
      stream: (await (cryptor as ICryptor).decryptStream({
        stream: stream,
        metadataLength: headerSize as number,
      })) as Readable,
    });
  }

  /**
   * Decrypt {@link Readable} stream using legacy cryptor.
   *
   * @param stream - Stream which can be used to read data for decryption.
   * @param file - File object which has been created with {@link stream}.
   * @param File - Class constructor for {@link PubNub} File object.
   *
   * @returns Decrypted data as {@link PubNub} File object.
   *
   * @throws Error if file is empty or contains unsupported data type.
   */
  private async decryptLegacyFileStream(
    stream: NodeJS.ReadableStream,
    file: PubNubFile,
    File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
  ) {
    if (!file.contentLength || file.contentLength <= 16) throw new Error('Decryption error: empty content');

    const cryptor = this.getLegacyCryptor();

    if (cryptor) {
      return cryptor.decryptFile(
        File.create({
          name: file.name,
          stream: stream as Readable,
        }),
        File,
      );
    } else throw new Error('unknown cryptor error');
  }
  // endregion
}

/**
 * CryptorHeader Utility
 */
class CryptorHeader {
  static decoder = new TextDecoder();
  static SENTINEL = 'PNED';
  static LEGACY_IDENTIFIER = '';
  static IDENTIFIER_LENGTH = 4;
  static VERSION = 1;
  static MAX_VERSION = 1;
  static MIN_HEADER_LENGTH = 10;

  static from(id: string, metadata: ArrayBuffer) {
    if (id === CryptorHeader.LEGACY_IDENTIFIER) return;
    return new CryptorHeaderV1(id, metadata.byteLength);
  }

  static isSentinel(bytes: ArrayBuffer) {
    return bytes && bytes.byteLength >= 4 && CryptorHeader.decoder.decode(bytes) == CryptorHeader.SENTINEL;
  }

  static validateVersion(data: number) {
    if (data && data > CryptorHeader.MAX_VERSION) throw new Error('Decryption error: invalid header version');
    return data;
  }

  static tryGetIdentifier(data: ArrayBuffer) {
    if (data.byteLength < 4) throw new Error('Decryption error: unknown cryptor error');
    else return CryptorHeader.decoder.decode(data);
  }

  static tryGetMetadataSizeFromStream(stream: NodeJS.ReadableStream) {
    const sizeBuf = stream.read(1);

    if (sizeBuf && (sizeBuf[0] as number) < 255) return sizeBuf[0] as number;
    if ((sizeBuf[0] as number) === 255) {
      const nextBuf = stream.read(2);

      if (nextBuf.length >= 2) {
        return new Uint16Array([nextBuf[0] as number, nextBuf[1] as number]).reduce((acc, val) => (acc << 8) + val, 0);
      }
    }

    throw new Error('Decryption error: invalid metadata size');
  }

  static tryParse(encryptedData: ArrayBuffer) {
    const encryptedDataView = new DataView(encryptedData);
    let sentinel: ArrayBuffer;
    let version = null;
    if (encryptedData.byteLength >= 4) {
      sentinel = encryptedData.slice(0, 4);
      if (!this.isSentinel(sentinel)) return CryptoModule.LEGACY_IDENTIFIER;
    }

    if (encryptedData.byteLength >= 5) version = encryptedDataView.getInt8(4);
    else throw new Error('Decryption error: invalid header version');
    if (version > CryptorHeader.MAX_VERSION) throw new Error('unknown cryptor error');

    let identifier: ArrayBuffer;
    let pos = 5 + CryptorHeader.IDENTIFIER_LENGTH;
    if (encryptedData.byteLength >= pos) identifier = encryptedData.slice(5, pos);
    else throw new Error('Decryption error: invalid crypto identifier');

    let metadataLength = null;
    if (encryptedData.byteLength >= pos + 1) metadataLength = encryptedDataView.getInt8(pos);
    else throw new Error('Decryption error: invalid metadata length');

    pos += 1;
    if (metadataLength === 255 && encryptedData.byteLength >= pos + 2) {
      metadataLength = new Uint16Array(encryptedData.slice(pos, pos + 2)).reduce((acc, val) => (acc << 8) + val, 0);
    }

    return new CryptorHeaderV1(CryptorHeader.decoder.decode(identifier), metadataLength);
  }
}

/**
 * Cryptor header (v1).
 */
class CryptorHeaderV1 {
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
    header.set(Buffer.from(CryptorHeader.SENTINEL));
    pos += CryptorHeader.SENTINEL.length;
    header[pos] = this.version;
    pos++;

    if (this.identifier) header.set(Buffer.from(this.identifier), pos);

    const metadataLength = this.metadataLength;
    pos += CryptorHeader.IDENTIFIER_LENGTH;

    if (metadataLength < 255) header[pos] = metadataLength;
    else header.set([255, metadataLength >> 8, metadataLength & 0xff], pos);

    return header;
  }
}
