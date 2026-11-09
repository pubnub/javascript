"use strict";
/**
 * Legacy cryptography module.
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
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const bytes_1 = require("./bytes");
const base64_codec_1 = require("../base64_codec");
/**
 * Legacy cryptography module for data encryption / decryption.
 *
 * Wire format (compatible with all PubNub SDKs):
 * - key: first 32 characters of HEX encoded SHA-256 digest of the cipher key, used as UTF-8 bytes (AES-256),
 * - cipher: AES-CBC with PKCS#7 padding,
 * - random IV: `base64(iv + ciphertext)`, static IV (`0123456789012345`): `base64(ciphertext)`.
 *
 * @internal
 */
class LegacyCrypto {
    constructor(configuration, primitives) {
        this.configuration = configuration;
        this.primitives = primitives;
        this.logger = configuration.logger;
    }
    /**
     * Update registered loggers' manager.
     *
     * @param [logger] - Logger, which crypto should use.
     */
    set logger(logger) {
        this._logger = logger;
        if (this.logger) {
            this.logger.debug('Crypto', () => ({
                messageType: 'object',
                message: this.configuration,
                details: 'Create with configuration:',
                ignoredKeys(key, obj) {
                    return typeof obj[key] === 'function' || key === 'logger' || (0, utils_1.isSensitiveLogKey)(key);
                },
            }));
        }
    }
    /**
     * Get loggers' manager.
     *
     * @returns Loggers' manager (if set).
     */
    get logger() {
        return this._logger;
    }
    /**
     * Encrypt provided data.
     *
     * @param data - Source data which should be encrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     *
     * @returns Encrypted `data`.
     */
    encrypt(data, customCipherKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.configuration.customEncrypt) {
                if (this.logger)
                    this.logger.warn('Crypto', "'customEncrypt' is deprecated. Consult docs for better alternative.");
                return this.configuration.customEncrypt(data);
            }
            return this.pnEncrypt(typeof data === 'string' ? data : JSON.stringify(data), customCipherKey);
        });
    }
    /**
     * Decrypt provided data.
     *
     * @param data - Encrypted data which should be decrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     *
     * @returns Decrypted `data`.
     */
    decrypt(data, customCipherKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.configuration.customDecrypt) {
                if (this.logger)
                    this.logger.warn('Crypto', "'customDecrypt' is deprecated. Consult docs for better alternative.");
                return this.configuration.customDecrypt(data);
            }
            return this.pnDecrypt(data, customCipherKey);
        });
    }
    /**
     * Encrypt provided data.
     *
     * @param data - Source data which should be encrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     *
     * @returns Encrypted `data` as string.
     */
    pnEncrypt(data, customCipherKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
            if (!decidedCipherKey)
                return data;
            if (this.logger) {
                this.logger.debug('Crypto', () => ({
                    messageType: 'object',
                    message: { data },
                    details: 'Encrypt with parameters:',
                    ignoredKeys: utils_1.isSensitiveLogKey,
                }));
            }
            const key = yield this.getKey(decidedCipherKey);
            const plaintext = LegacyCrypto.encoder.encode(data);
            if (this.configuration.useRandomIVs) {
                const iv = this.primitives.randomBytes(LegacyCrypto.IV_LENGTH);
                const ciphertext = yield this.primitives.aesCbcEncrypt(key, iv, plaintext);
                return (0, base64_codec_1.encode)(this.concat(iv, ciphertext));
            }
            const ciphertext = yield this.primitives.aesCbcEncrypt(key, LegacyCrypto.staticIV, plaintext);
            return (0, base64_codec_1.encode)((0, bytes_1.toArrayBuffer)(ciphertext)) || data;
        });
    }
    /**
     * Decrypt provided data.
     *
     * @param data - Encrypted data which should be decrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     *
     * @returns Decrypted `data` or `null` if it can't be decrypted.
     */
    pnDecrypt(data, customCipherKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
            if (!decidedCipherKey)
                return data;
            if (this.logger) {
                this.logger.debug('Crypto', () => ({
                    messageType: 'object',
                    message: { data },
                    details: 'Decrypt with parameters:',
                    ignoredKeys: utils_1.isSensitiveLogKey,
                }));
            }
            try {
                const key = yield this.getKey(decidedCipherKey);
                const encrypted = new Uint8Array((0, base64_codec_1.decode)(data));
                let iv = LegacyCrypto.staticIV;
                let ciphertext = encrypted;
                if (this.configuration.useRandomIVs) {
                    iv = encrypted.slice(0, LegacyCrypto.IV_LENGTH);
                    ciphertext = encrypted.slice(LegacyCrypto.IV_LENGTH);
                }
                const plaintext = yield this.primitives.aesCbcDecrypt(key, iv, ciphertext);
                return JSON.parse((0, bytes_1.decodeUtf8Strict)(plaintext));
            }
            catch (e) {
                if (this.logger)
                    this.logger.error('Crypto', () => ({ messageType: 'error', message: e }));
                return null;
            }
        });
    }
    /**
     * Derive AES-256 key from the cipher key (cached for configured cipher key).
     *
     * @param cipherKey - User-provided cipher key.
     *
     * @returns First 32 characters of HEX encoded SHA-256 digest as UTF-8 bytes.
     */
    getKey(cipherKey) {
        if (cipherKey !== this.configuration.cipherKey)
            return this.deriveKey(cipherKey);
        if (!this.configuredKey) {
            this.configuredKey = this.deriveKey(cipherKey);
            this.configuredKey.catch(() => (this.configuredKey = undefined));
        }
        return this.configuredKey;
    }
    /**
     * Derive AES-256 key from the cipher key.
     *
     * @param cipherKey - User-provided cipher key.
     *
     * @returns First 32 characters of HEX encoded SHA-256 digest as UTF-8 bytes.
     */
    deriveKey(cipherKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const digest = yield this.primitives.sha256(LegacyCrypto.encoder.encode(cipherKey));
            return LegacyCrypto.encoder.encode((0, bytes_1.bytesToHex)(digest).slice(0, 32));
        });
    }
    /**
     * Join two byte arrays into {@link ArrayBuffer}.
     */
    concat(a, b) {
        const result = new Uint8Array(a.byteLength + b.byteLength);
        result.set(a, 0);
        result.set(b, a.byteLength);
        return result.buffer;
    }
}
/**
 * `string` to {@link Uint8Array} encoder.
 */
LegacyCrypto.encoder = new TextEncoder();
/**
 * Static crypto initialization vector (used when random IVs are disabled).
 */
LegacyCrypto.staticIV = new TextEncoder().encode('0123456789012345');
/**
 * Initialization vector length.
 */
LegacyCrypto.IV_LENGTH = 16;
exports.default = LegacyCrypto;
