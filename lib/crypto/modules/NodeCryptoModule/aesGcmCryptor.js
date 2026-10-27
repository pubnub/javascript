"use strict";
/**
 * AES-GCM cryptor module.
 *
 * @internal
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const bytes_1 = require("../../../core/components/cryptography/bytes");
const node_1 = __importDefault(require("../../primitives/node"));
/**
 * AES-GCM cryptor.
 *
 * Decrypt-only AES-256-GCM cryptor for payloads produced by other PubNub SDKs. Cryptor metadata stored in the
 * header is `nonce (12 bytes) || authentication tag (16 bytes)`.
 *
 * **Note:** Encryption isn't supported and cryptor can't be used as crypto module default cryptor.
 *
 * @internal
 */
class AesGcmCryptor {
    constructor({ cipherKey }) {
        this.cipherKey = cipherKey;
    }
    // --------------------------------------------------------
    // --------------------- Encryption -----------------------
    // --------------------------------------------------------
    // region Encryption
    encrypt(_data) {
        throw new Error(AesGcmCryptor.ENCRYPTION_ERROR);
    }
    encryptStream(_stream) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(AesGcmCryptor.ENCRYPTION_ERROR);
        });
    }
    // endregion
    // --------------------------------------------------------
    // --------------------- Decryption -----------------------
    // --------------------------------------------------------
    // region Decryption
    decrypt(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = typeof input.data === 'string' ? AesGcmCryptor.encoder.encode(input.data) : input.data;
            if (data.byteLength === 0)
                throw new Error('Decryption error: empty content');
            if (!input.metadata || input.metadata.byteLength !== AesGcmCryptor.METADATA_LENGTH)
                throw new Error('Decryption error: invalid metadata');
            return (0, bytes_1.toArrayBuffer)(yield this.decryptBytes(new Uint8Array(input.metadata), new Uint8Array(data)));
        });
    }
    /**
     * Decrypt provided encrypted stream object.
     *
     * **Note:** AES-GCM authenticates the whole message, so the stream is buffered in memory and decrypted data is
     * written to the output stream only after successful authentication.
     *
     * @param stream - Encrypted stream object for decryption.
     *
     * @returns Decrypted data as {@link Readable} stream.
     */
    decryptStream(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            if (stream.metadataLength !== AesGcmCryptor.METADATA_LENGTH)
                throw new Error('Decryption error: invalid metadata');
            const decryptedStream = new stream_1.PassThrough();
            const chunks = [];
            const onReadable = () => {
                let data = stream.stream.read();
                while (data !== null) {
                    if (data)
                        chunks.push(typeof data === 'string' ? Buffer.from(data) : data);
                    data = stream.stream.read();
                }
            };
            stream.stream.on('readable', onReadable);
            stream.stream.on('end', () => {
                const payload = Buffer.concat(chunks);
                if (payload.byteLength <= AesGcmCryptor.METADATA_LENGTH) {
                    decryptedStream.destroy(new Error('Decryption error: empty content'));
                    return;
                }
                this.decryptBytes(payload.subarray(0, AesGcmCryptor.METADATA_LENGTH), payload.subarray(AesGcmCryptor.METADATA_LENGTH)).then((decrypted) => decryptedStream.end(Buffer.from(decrypted)), (error) => decryptedStream.destroy(error));
            });
            // Header has been read from the `readable` event handler: drain data which already has been buffered, because
            // a fully buffered source may not emit `readable` again.
            onReadable();
            return decryptedStream;
        });
    }
    // endregion
    // --------------------------------------------------------
    // ----------------------- Helpers ------------------------
    // --------------------------------------------------------
    // region Helpers
    get identifier() {
        return AesGcmCryptor.IDENTIFIER;
    }
    /**
     * Authenticate and decrypt data.
     *
     * @param metadata - Cryptor metadata (nonce and authentication tag).
     * @param data - Encrypted data.
     *
     * @returns Decrypted data.
     *
     * @throws Error with generic message if data can't be authenticated.
     */
    decryptBytes(metadata, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield AesGcmCryptor.primitives.aesGcmDecrypt(yield this.getKey(), metadata.subarray(0, AesGcmCryptor.NONCE_LENGTH), data, metadata.subarray(AesGcmCryptor.NONCE_LENGTH));
            }
            catch (_error) {
                // Native error intentionally not exposed: wrong key and modified payload should be indistinguishable.
                throw new Error(AesGcmCryptor.DECRYPTION_ERROR);
            }
        });
    }
    /**
     * Compute raw decryption key (cached).
     *
     * @returns SHA-256 digest of the cipher key.
     */
    getKey() {
        if (!this.key) {
            this.key = AesGcmCryptor.primitives.sha256(AesGcmCryptor.encoder.encode(this.cipherKey));
            this.key.catch(() => (this.key = undefined));
        }
        return this.key;
    }
    // endregion
    /**
     * Serialize cryptor information to string.
     *
     * @returns Serialized cryptor information.
     */
    toString() {
        return 'AesGcmCryptor {}';
    }
}
/**
 * Cryptor unique identifier.
 */
AesGcmCryptor.IDENTIFIER = 'ACGM';
/**
 * Nonce length.
 */
AesGcmCryptor.NONCE_LENGTH = 12;
/**
 * Authentication tag length.
 */
AesGcmCryptor.TAG_LENGTH = 16;
/**
 * Cryptor metadata length (nonce and authentication tag).
 */
AesGcmCryptor.METADATA_LENGTH = AesGcmCryptor.NONCE_LENGTH + AesGcmCryptor.TAG_LENGTH;
/**
 * Generic decryption error message (doesn't reveal which part of the payload failed authentication).
 */
AesGcmCryptor.DECRYPTION_ERROR = 'Decryption error: unable to decrypt data';
/**
 * Unsupported encryption error message.
 */
AesGcmCryptor.ENCRYPTION_ERROR = 'Encryption error: AES-GCM cryptor (ACGM) supports decryption only.';
/**
 * {@link string|String} to {@link ArrayBuffer} response decoder.
 */
AesGcmCryptor.encoder = new TextEncoder();
/**
 * Native crypto primitives.
 */
AesGcmCryptor.primitives = new node_1.default();
exports.default = AesGcmCryptor;
