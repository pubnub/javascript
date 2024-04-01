/* global crypto */
/**
 * Legacy browser cryptography module.
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
function concatArrayBuffer(ab1, ab2) {
    const tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
    tmp.set(new Uint8Array(ab1), 0);
    tmp.set(new Uint8Array(ab2), ab1.byteLength);
    return tmp.buffer;
}
/**
 * Legacy cryptography implementation for browser-based {@link PubNub} client.
 */
class WebCryptography {
    // --------------------------------------------------------
    // --------------------- Encryption -----------------------
    // --------------------------------------------------------
    // region Encryption
    /**
     * Encrypt provided source data using specific encryption {@link key}.
     *
     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` data.
     * @param input - Source data for encryption.
     *
     * @returns Encrypted data as object or stream (depending on from source data type).
     *
     * @throws Error if unknown data type has been passed.
     */
    encrypt(key, input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(input instanceof ArrayBuffer) && typeof input !== 'string')
                throw new Error('Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer');
            const cKey = yield this.getKey(key);
            return input instanceof ArrayBuffer ? this.encryptArrayBuffer(cKey, input) : this.encryptString(cKey, input);
        });
    }
    /**
     * Encrypt provided source {@link Buffer} using specific encryption {@link ArrayBuffer}.
     *
     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link ArrayBuffer}.
     * @param buffer - Source {@link ArrayBuffer} for encryption.
     *
     * @returns Encrypted data as {@link ArrayBuffer} object.
     */
    encryptArrayBuffer(key, buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const abIv = crypto.getRandomValues(new Uint8Array(16));
            return concatArrayBuffer(abIv.buffer, yield crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, buffer));
        });
    }
    /**
     * Encrypt provided source {@link string} using specific encryption {@link key}.
     *
     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link string}.
     * @param text - Source {@link string} for encryption.
     *
     * @returns Encrypted data as byte {@link string}.
     */
    encryptString(key, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const abIv = crypto.getRandomValues(new Uint8Array(16));
            const abPlaintext = WebCryptography.encoder.encode(text).buffer;
            const abPayload = yield crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, abPlaintext);
            const ciphertext = concatArrayBuffer(abIv.buffer, abPayload);
            return WebCryptography.decoder.decode(ciphertext);
        });
    }
    /**
     * Encrypt provided {@link PubNub} File object using specific encryption {@link key}.
     *
     * @param key - Key for {@link PubNub} File object encryption. <br/>**Note:** Same key should be
     * used to `decrypt` data.
     * @param file - Source {@link PubNub} File object for encryption.
     * @param File - Class constructor for {@link PubNub} File object.
     *
     * @returns Encrypted data as {@link PubNub} File object.
     *
     * @throws Error if file is empty or contains unsupported data type.
     */
    encryptFile(key, file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if ((_a = file.contentLength) !== null && _a !== void 0 ? _a : 0 <= 0)
                throw new Error('encryption error. empty content');
            const bKey = yield this.getKey(key);
            const abPlaindata = yield file.toArrayBuffer();
            const abCipherdata = yield this.encryptArrayBuffer(bKey, abPlaindata);
            return File.create({
                name: file.name,
                mimeType: (_b = file.mimeType) !== null && _b !== void 0 ? _b : 'application/octet-stream',
                data: abCipherdata,
            });
        });
    }
    // endregion
    // --------------------------------------------------------
    // --------------------- Decryption -----------------------
    // --------------------------------------------------------
    // region Decryption
    /**
     * Decrypt provided encrypted data using specific decryption {@link key}.
     *
     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` data.
     * @param input - Encrypted data for decryption.
     *
     * @returns Decrypted data as object or stream (depending on from encrypted data type).
     *
     * @throws Error if unknown data type has been passed.
     */
    decrypt(key, input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(input instanceof ArrayBuffer) && typeof input !== 'string')
                throw new Error('Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer');
            const cKey = yield this.getKey(key);
            return input instanceof ArrayBuffer ? this.decryptArrayBuffer(cKey, input) : this.decryptString(cKey, input);
        });
    }
    /**
     * Decrypt provided encrypted {@link ArrayBuffer} using specific decryption {@link key}.
     *
     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link ArrayBuffer}.
     * @param buffer - Encrypted {@link ArrayBuffer} for decryption.
     *
     * @returns Decrypted data as {@link ArrayBuffer} object.
     */
    decryptArrayBuffer(key, buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const abIv = buffer.slice(0, 16);
            if (buffer.slice(WebCryptography.IV_LENGTH).byteLength <= 0)
                throw new Error('decryption error: empty content');
            return yield crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, buffer.slice(WebCryptography.IV_LENGTH));
        });
    }
    /**
     * Decrypt provided encrypted {@link string} using specific decryption {@link key}.
     *
     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link string}.
     * @param text - Encrypted {@link string} for decryption.
     *
     * @returns Decrypted data as byte {@link string}.
     */
    decryptString(key, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const abCiphertext = WebCryptography.encoder.encode(text).buffer;
            const abIv = abCiphertext.slice(0, 16);
            const abPayload = abCiphertext.slice(16);
            const abPlaintext = yield crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, abPayload);
            return WebCryptography.decoder.decode(abPlaintext);
        });
    }
    /**
     * Decrypt provided {@link PubNub} File object using specific decryption {@link key}.
     *
     * @param key - Key for {@link PubNub} File object decryption. <br/>**Note:** Should be the same
     * as used to `encrypt` data.
     * @param file - Encrypted {@link PubNub} File object for decryption.
     * @param File - Class constructor for {@link PubNub} File object.
     *
     * @returns Decrypted data as {@link PubNub} File object.
     *
     * @throws Error if file is empty or contains unsupported data type.
     */
    decryptFile(key, file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            const bKey = yield this.getKey(key);
            const abCipherdata = yield file.toArrayBuffer();
            const abPlaindata = yield this.decryptArrayBuffer(bKey, abCipherdata);
            return File.create({
                name: file.name,
                mimeType: file.mimeType,
                data: abPlaindata,
            });
        });
    }
    // endregion
    // --------------------------------------------------------
    // ----------------------- Helpers ------------------------
    // --------------------------------------------------------
    // region Helpers
    /**
     * Convert cipher key to the {@link Buffer}.
     *
     * @param key - String cipher key.
     *
     * @returns SHA256 HEX encoded cipher key {@link CryptoKey}.
     */
    getKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const digest = yield crypto.subtle.digest('SHA-256', WebCryptography.encoder.encode(key));
            const hashHex = Array.from(new Uint8Array(digest))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');
            const abKey = WebCryptography.encoder.encode(hashHex.slice(0, 32)).buffer;
            return crypto.subtle.importKey('raw', abKey, 'AES-CBC', true, ['encrypt', 'decrypt']);
        });
    }
}
/**
 * Random initialization vector size.
 */
WebCryptography.IV_LENGTH = 16;
/**
 * {@link string|String} to {@link ArrayBuffer} response decoder.
 */
WebCryptography.encoder = new TextEncoder();
/**
 *  {@link ArrayBuffer} to {@link string} decoder.
 */
WebCryptography.decoder = new TextDecoder();
export default WebCryptography;
