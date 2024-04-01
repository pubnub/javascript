/**
 * Browser crypto module.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AbstractCryptoModule } from '../../../core/interfaces/crypto-module';
import { PubNubFile } from '../../../file/modules/web';
import { decode } from '../../../core/components/base64_codec';
import { PubnubError } from '../../../errors/pubnub-error';
import AesCbcCryptor from './aesCbcCryptor';
import LegacyCryptor from './legacyCryptor';
/**
 * Re-export bundled cryptors.
 */
export { LegacyCryptor, AesCbcCryptor };
/**
 * CryptoModule for browser platform.
 */
export class WebCryptoModule extends AbstractCryptoModule {
    // --------------------------------------------------------
    // --------------- Convenience functions ------------------
    // -------------------------------------------------------
    // region Convenience functions
    static legacyCryptoModule(config) {
        var _a;
        if (!config.cipherKey)
            throw new PubnubError('Crypto module error: cipher key not set.');
        return new WebCryptoModule({
            default: new LegacyCryptor(Object.assign(Object.assign({}, config), { useRandomIVs: (_a = config.useRandomIVs) !== null && _a !== void 0 ? _a : true })),
            cryptors: [new AesCbcCryptor({ cipherKey: config.cipherKey })],
        });
    }
    static aesCbcCryptoModule(config) {
        var _a;
        if (!config.cipherKey)
            throw new PubnubError('Crypto module error: cipher key not set.');
        return new WebCryptoModule({
            default: new AesCbcCryptor({ cipherKey: config.cipherKey }),
            cryptors: [
                new LegacyCryptor(Object.assign(Object.assign({}, config), { useRandomIVs: (_a = config.useRandomIVs) !== null && _a !== void 0 ? _a : true })),
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
    static withDefaultCryptor(defaultCryptor) {
        return new this({ default: defaultCryptor });
    }
    // endregion
    // --------------------------------------------------------
    // --------------------- Encryption -----------------------
    // --------------------------------------------------------
    // region Encryption
    encrypt(data) {
        // Encrypt data.
        const encrypted = data instanceof ArrayBuffer && this.defaultCryptor.identifier === WebCryptoModule.LEGACY_IDENTIFIER
            ? this.defaultCryptor.encrypt(WebCryptoModule.decoder.decode(data))
            : this.defaultCryptor.encrypt(data);
        if (!encrypted.metadata)
            return encrypted.data;
        const headerData = this.getHeaderData(encrypted);
        return this.concatArrayBuffer(headerData, encrypted.data);
    }
    encryptFile(file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Files handled differently in case of Legacy cryptor.
             * (as long as we support legacy need to check on instance type)
             */
            if (this.defaultCryptor.identifier === CryptorHeader.LEGACY_IDENTIFIER)
                return this.defaultCryptor.encryptFile(file, File);
            const fileData = yield this.getFileData(file);
            const encrypted = yield this.defaultCryptor.encryptFileData(fileData);
            return File.create({
                name: file.name,
                mimeType: 'application/octet-stream',
                data: this.concatArrayBuffer(this.getHeaderData(encrypted), encrypted.data),
            });
        });
    }
    // endregion
    // --------------------------------------------------------
    // --------------------- Decryption -----------------------
    // --------------------------------------------------------
    // region Decryption
    decrypt(data) {
        const encryptedData = typeof data === 'string' ? decode(data) : data;
        const header = CryptorHeader.tryParse(encryptedData);
        const cryptor = this.getCryptor(header);
        const metadata = header.length > 0
            ? encryptedData.slice(header.length - header.metadataLength, header.length)
            : null;
        if (encryptedData.slice(header.length).byteLength <= 0)
            throw new Error('Decryption error: empty content');
        return cryptor.decrypt({
            data: encryptedData.slice(header.length),
            metadata: metadata,
        });
    }
    decryptFile(file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield file.data.arrayBuffer();
            const header = CryptorHeader.tryParse(data);
            const cryptor = this.getCryptor(header);
            /**
             * Files handled differently in case of Legacy cryptor.
             * (as long as we support legacy need to check on instance type)
             */
            if ((cryptor === null || cryptor === void 0 ? void 0 : cryptor.identifier) === CryptorHeader.LEGACY_IDENTIFIER)
                return cryptor.decryptFile(file, File);
            const fileData = yield this.getFileData(data);
            const metadata = fileData.slice(header.length - header.metadataLength, header.length);
            return File.create({
                name: file.name,
                data: yield this.defaultCryptor.decryptFileData({
                    data: data.slice(header.length),
                    metadata: metadata,
                }),
            });
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
    getCryptorFromId(id) {
        const cryptor = this.getAllCryptors().find((cryptor) => id === cryptor.identifier);
        if (cryptor)
            return cryptor;
        throw Error('Unknown cryptor error');
    }
    /**
     * Retrieve cryptor by its identifier.
     *
     * @param header - Header with cryptor-defined data or raw cryptor identifier.
     *
     * @returns Cryptor which correspond to provided {@link header}.
     */
    getCryptor(header) {
        if (typeof header === 'string') {
            const cryptor = this.getAllCryptors().find((cryptor) => cryptor.identifier === header);
            if (cryptor)
                return cryptor;
            throw new Error('Unknown cryptor error');
        }
        else if (header instanceof CryptorHeaderV1) {
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
    getHeaderData(encrypted) {
        if (!encrypted.metadata)
            return;
        const header = CryptorHeader.from(this.defaultCryptor.identifier, encrypted.metadata);
        const headerData = new Uint8Array(header.length);
        let pos = 0;
        headerData.set(header.data, pos);
        pos += header.length - encrypted.metadata.byteLength;
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
    concatArrayBuffer(ab1, ab2) {
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
    getFileData(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (file instanceof ArrayBuffer)
                return file;
            else if (file instanceof PubNubFile)
                return file.toArrayBuffer();
            throw new Error('Cannot decrypt/encrypt file. In browsers file encrypt/decrypt supported for string, ArrayBuffer or Blob');
        });
    }
}
/**
 * {@link LegacyCryptor|Legacy} cryptor identifier.
 */
WebCryptoModule.LEGACY_IDENTIFIER = '';
/**
 * CryptorHeader Utility
 */
class CryptorHeader {
    static from(id, metadata) {
        if (id === CryptorHeader.LEGACY_IDENTIFIER)
            return;
        return new CryptorHeaderV1(id, metadata.byteLength);
    }
    static tryParse(data) {
        const encryptedData = new Uint8Array(data);
        let sentinel;
        let version = null;
        if (encryptedData.byteLength >= 4) {
            sentinel = encryptedData.slice(0, 4);
            if (this.decoder.decode(sentinel) !== CryptorHeader.SENTINEL)
                return WebCryptoModule.LEGACY_IDENTIFIER;
        }
        if (encryptedData.byteLength >= 5)
            version = encryptedData[4];
        else
            throw new Error('Decryption error: invalid header version');
        if (version > CryptorHeader.MAX_VERSION)
            throw new Error('Decryption error: Unknown cryptor error');
        let identifier;
        let pos = 5 + CryptorHeader.IDENTIFIER_LENGTH;
        if (encryptedData.byteLength >= pos)
            identifier = encryptedData.slice(5, pos);
        else
            throw new Error('Decryption error: invalid crypto identifier');
        let metadataLength = null;
        if (encryptedData.byteLength >= pos + 1)
            metadataLength = encryptedData[pos];
        else
            throw new Error('Decryption error: invalid metadata length');
        pos += 1;
        if (metadataLength === 255 && encryptedData.byteLength >= pos + 2) {
            metadataLength = new Uint16Array(encryptedData.slice(pos, pos + 2)).reduce((acc, val) => (acc << 8) + val, 0);
        }
        return new CryptorHeaderV1(this.decoder.decode(identifier), metadataLength);
    }
}
CryptorHeader.SENTINEL = 'PNED';
CryptorHeader.LEGACY_IDENTIFIER = '';
CryptorHeader.IDENTIFIER_LENGTH = 4;
CryptorHeader.VERSION = 1;
CryptorHeader.MAX_VERSION = 1;
CryptorHeader.decoder = new TextDecoder();
// v1 CryptorHeader
class CryptorHeaderV1 {
    constructor(id, metadataLength) {
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
        return (CryptorHeader.SENTINEL.length +
            1 +
            CryptorHeader.IDENTIFIER_LENGTH +
            (this.metadataLength < 255 ? 1 : 3) +
            this.metadataLength);
    }
    get data() {
        let pos = 0;
        const header = new Uint8Array(this.length);
        const encoder = new TextEncoder();
        header.set(encoder.encode(CryptorHeader.SENTINEL));
        pos += CryptorHeader.SENTINEL.length;
        header[pos] = this.version;
        pos++;
        if (this.identifier)
            header.set(encoder.encode(this.identifier), pos);
        const metadataLength = this.metadataLength;
        pos += CryptorHeader.IDENTIFIER_LENGTH;
        if (metadataLength < 255)
            header[pos] = metadataLength;
        else
            header.set([255, metadataLength >> 8, metadataLength & 0xff], pos);
        return header;
    }
}
CryptorHeaderV1.IDENTIFIER_LENGTH = 4;
CryptorHeaderV1.SENTINEL = 'PNED';
