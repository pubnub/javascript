"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoModule = exports.AesCbcCryptor = exports.LegacyCryptor = void 0;
const stream_1 = require("stream");
const buffer_1 = require("buffer");
const crypto_module_1 = require("../../../core/interfaces/crypto-module");
const base64_codec_1 = require("../../../core/components/base64_codec");
const pubnub_error_1 = require("../../../errors/pubnub-error");
const aesCbcCryptor_1 = __importDefault(require("./aesCbcCryptor"));
exports.AesCbcCryptor = aesCbcCryptor_1.default;
const legacyCryptor_1 = __importDefault(require("./legacyCryptor"));
exports.LegacyCryptor = legacyCryptor_1.default;
class CryptoModule extends crypto_module_1.AbstractCryptoModule {
    static legacyCryptoModule(config) {
        var _a;
        if (!config.cipherKey)
            throw new pubnub_error_1.PubNubError('Crypto module error: cipher key not set.');
        return new this({
            default: new legacyCryptor_1.default(Object.assign(Object.assign({}, config), { useRandomIVs: (_a = config.useRandomIVs) !== null && _a !== void 0 ? _a : true })),
            cryptors: [new aesCbcCryptor_1.default({ cipherKey: config.cipherKey })],
        });
    }
    static aesCbcCryptoModule(config) {
        var _a;
        if (!config.cipherKey)
            throw new pubnub_error_1.PubNubError('Crypto module error: cipher key not set.');
        return new this({
            default: new aesCbcCryptor_1.default({ cipherKey: config.cipherKey }),
            cryptors: [
                new legacyCryptor_1.default(Object.assign(Object.assign({}, config), { useRandomIVs: (_a = config.useRandomIVs) !== null && _a !== void 0 ? _a : true })),
            ],
        });
    }
    static withDefaultCryptor(defaultCryptor) {
        return new this({ default: defaultCryptor });
    }
    encrypt(data) {
        const encrypted = data instanceof ArrayBuffer && this.defaultCryptor.identifier === CryptoModule.LEGACY_IDENTIFIER
            ? this.defaultCryptor.encrypt(CryptoModule.decoder.decode(data))
            : this.defaultCryptor.encrypt(data);
        if (!encrypted.metadata)
            return encrypted.data;
        const headerData = this.getHeaderData(encrypted);
        const encryptedData = typeof encrypted.data === 'string'
            ? CryptoModule.encoder.encode(encrypted.data).buffer
            : encrypted.data.buffer.slice(encrypted.data.byteOffset, encrypted.data.byteOffset + encrypted.data.length);
        return this.concatArrayBuffer(headerData, encryptedData);
    }
    encryptFile(file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.defaultCryptor.identifier === CryptorHeader.LEGACY_IDENTIFIER)
                return this.defaultCryptor.encryptFile(file, File);
            if (file.data instanceof buffer_1.Buffer) {
                const encryptedData = this.encrypt(file.data);
                return File.create({
                    name: file.name,
                    mimeType: 'application/octet-stream',
                    data: buffer_1.Buffer.from(typeof encryptedData === 'string' ? CryptoModule.encoder.encode(encryptedData) : encryptedData),
                });
            }
            if (file.data instanceof stream_1.Readable) {
                if (!file.contentLength || file.contentLength === 0)
                    throw new Error('Encryption error: empty content');
                const encryptedStream = yield this.defaultCryptor.encryptStream(file.data);
                const header = CryptorHeader.from(this.defaultCryptor.identifier, encryptedStream.metadata);
                const payload = new Uint8Array(header.length);
                let pos = 0;
                payload.set(header.data, pos);
                pos += header.length;
                if (encryptedStream.metadata) {
                    const metadata = new Uint8Array(encryptedStream.metadata);
                    pos -= encryptedStream.metadata.byteLength;
                    payload.set(metadata, pos);
                }
                const output = new stream_1.PassThrough();
                output.write(payload);
                encryptedStream.stream.pipe(output);
                return File.create({
                    name: file.name,
                    mimeType: 'application/octet-stream',
                    stream: output,
                });
            }
        });
    }
    decrypt(data) {
        const encryptedData = buffer_1.Buffer.from(typeof data === 'string' ? (0, base64_codec_1.decode)(data) : data);
        const header = CryptorHeader.tryParse(encryptedData.buffer.slice(encryptedData.byteOffset, encryptedData.byteOffset + encryptedData.length));
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
            if (file.data && file.data instanceof buffer_1.Buffer) {
                const header = CryptorHeader.tryParse(file.data.buffer.slice(file.data.byteOffset, file.data.byteOffset + file.data.length));
                const cryptor = this.getCryptor(header);
                if ((cryptor === null || cryptor === void 0 ? void 0 : cryptor.identifier) === CryptoModule.LEGACY_IDENTIFIER)
                    return cryptor.decryptFile(file, File);
                return File.create({
                    name: file.name,
                    data: buffer_1.Buffer.from(this.decrypt(file.data)),
                });
            }
            if (file.data && file.data instanceof stream_1.Readable) {
                const stream = file.data;
                return new Promise((resolve) => {
                    stream.on('readable', () => resolve(this.onStreamReadable(stream, file, File)));
                });
            }
        });
    }
    getLegacyCryptor() {
        return this.getCryptorFromId(CryptoModule.LEGACY_IDENTIFIER);
    }
    getCryptorFromId(id) {
        const cryptor = this.getAllCryptors().find((cryptor) => id === cryptor.identifier);
        if (cryptor)
            return cryptor;
        throw new Error('Unknown cryptor error');
    }
    getCryptor(header) {
        if (typeof header === 'string') {
            const cryptor = this.getAllCryptors().find((c) => c.identifier === header);
            if (cryptor)
                return cryptor;
            throw new Error('Unknown cryptor error');
        }
        else if (header instanceof CryptorHeaderV1) {
            return this.getCryptorFromId(header.identifier);
        }
    }
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
    concatArrayBuffer(ab1, ab2) {
        const tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
        tmp.set(new Uint8Array(ab1), 0);
        tmp.set(new Uint8Array(ab2), ab1.byteLength);
        return tmp.buffer;
    }
    onStreamReadable(stream, file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            stream.removeAllListeners('readable');
            const magicBytes = stream.read(4);
            if (!CryptorHeader.isSentinel(magicBytes)) {
                if (magicBytes === null)
                    throw new Error('Decryption error: empty content');
                stream.unshift(magicBytes);
                return this.decryptLegacyFileStream(stream, file, File);
            }
            const versionByte = stream.read(1);
            CryptorHeader.validateVersion(versionByte[0]);
            const identifier = stream.read(4);
            const cryptor = this.getCryptorFromId(CryptorHeader.tryGetIdentifier(identifier));
            const headerSize = CryptorHeader.tryGetMetadataSizeFromStream(stream);
            if (!file.contentLength || file.contentLength <= CryptorHeader.MIN_HEADER_LENGTH + headerSize)
                throw new Error('Decryption error: empty content');
            return File.create({
                name: file.name,
                mimeType: 'application/octet-stream',
                stream: (yield cryptor.decryptStream({
                    stream: stream,
                    metadataLength: headerSize,
                })),
            });
        });
    }
    decryptLegacyFileStream(stream, file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!file.contentLength || file.contentLength <= 16)
                throw new Error('Decryption error: empty content');
            const cryptor = this.getLegacyCryptor();
            if (cryptor) {
                return cryptor.decryptFile(File.create({
                    name: file.name,
                    stream: stream,
                }), File);
            }
            else
                throw new Error('unknown cryptor error');
        });
    }
}
exports.CryptoModule = CryptoModule;
CryptoModule.LEGACY_IDENTIFIER = '';
class CryptorHeader {
    static from(id, metadata) {
        if (id === CryptorHeader.LEGACY_IDENTIFIER)
            return;
        return new CryptorHeaderV1(id, metadata.byteLength);
    }
    static isSentinel(bytes) {
        return bytes && bytes.byteLength >= 4 && CryptorHeader.decoder.decode(bytes) == CryptorHeader.SENTINEL;
    }
    static validateVersion(data) {
        if (data && data > CryptorHeader.MAX_VERSION)
            throw new Error('Decryption error: invalid header version');
        return data;
    }
    static tryGetIdentifier(data) {
        if (data.byteLength < 4)
            throw new Error('Decryption error: unknown cryptor error');
        else
            return CryptorHeader.decoder.decode(data);
    }
    static tryGetMetadataSizeFromStream(stream) {
        const sizeBuf = stream.read(1);
        if (sizeBuf && sizeBuf[0] < 255)
            return sizeBuf[0];
        if (sizeBuf[0] === 255) {
            const nextBuf = stream.read(2);
            if (nextBuf.length >= 2) {
                return new Uint16Array([nextBuf[0], nextBuf[1]]).reduce((acc, val) => (acc << 8) + val, 0);
            }
        }
        throw new Error('Decryption error: invalid metadata size');
    }
    static tryParse(encryptedData) {
        const encryptedDataView = new DataView(encryptedData);
        let sentinel;
        let version = null;
        if (encryptedData.byteLength >= 4) {
            sentinel = encryptedData.slice(0, 4);
            if (!this.isSentinel(sentinel))
                return CryptoModule.LEGACY_IDENTIFIER;
        }
        if (encryptedData.byteLength >= 5)
            version = encryptedDataView.getInt8(4);
        else
            throw new Error('Decryption error: invalid header version');
        if (version > CryptorHeader.MAX_VERSION)
            throw new Error('unknown cryptor error');
        let identifier;
        let pos = 5 + CryptorHeader.IDENTIFIER_LENGTH;
        if (encryptedData.byteLength >= pos)
            identifier = encryptedData.slice(5, pos);
        else
            throw new Error('Decryption error: invalid crypto identifier');
        let metadataLength = null;
        if (encryptedData.byteLength >= pos + 1)
            metadataLength = encryptedDataView.getInt8(pos);
        else
            throw new Error('Decryption error: invalid metadata length');
        pos += 1;
        if (metadataLength === 255 && encryptedData.byteLength >= pos + 2) {
            metadataLength = new Uint16Array(encryptedData.slice(pos, pos + 2)).reduce((acc, val) => (acc << 8) + val, 0);
        }
        return new CryptorHeaderV1(CryptorHeader.decoder.decode(identifier), metadataLength);
    }
}
CryptorHeader.decoder = new TextDecoder();
CryptorHeader.SENTINEL = 'PNED';
CryptorHeader.LEGACY_IDENTIFIER = '';
CryptorHeader.IDENTIFIER_LENGTH = 4;
CryptorHeader.VERSION = 1;
CryptorHeader.MAX_VERSION = 1;
CryptorHeader.MIN_HEADER_LENGTH = 10;
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
        header.set(buffer_1.Buffer.from(CryptorHeader.SENTINEL));
        pos += CryptorHeader.SENTINEL.length;
        header[pos] = this.version;
        pos++;
        if (this.identifier)
            header.set(buffer_1.Buffer.from(this.identifier), pos);
        const metadataLength = this.metadataLength;
        pos += CryptorHeader.IDENTIFIER_LENGTH;
        if (metadataLength < 255)
            header[pos] = metadataLength;
        else
            header.set([255, metadataLength >> 8, metadataLength & 0xff], pos);
        return header;
    }
}
