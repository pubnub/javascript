"use strict";
/**
 * Legacy cryptography module.
 *
 * Platform-agnostic implementation which relies on platform-provided crypto primitives.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyCrypto = void 0;
const primitives_1 = require("./primitives");
const utils_1 = require("../../utils");
const base64_codec_1 = require("../base64_codec");
/**
 * Whether insecure random initialization vector fallback warning has been printed.
 *
 * @internal
 */
let insecureRandomWarningShown = false;
/**
 * Legacy cryptography module for files and signature.
 *
 * @internal
 */
class LegacyCrypto {
    constructor(configuration, primitives) {
        this.configuration = configuration;
        this.primitives = primitives;
        /**
         * Crypto initialization vector.
         */
        this.iv = '0123456789012345';
        /**
         * List os allowed cipher key encodings.
         */
        this.allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
        /**
         * Allowed cipher key lengths.
         */
        this.allowedKeyLengths = [128, 256];
        /**
         * Allowed crypto modes.
         */
        this.allowedModes = ['ecb', 'cbc'];
        this.logger = configuration.logger;
        this.defaultOptions = {
            encryptKey: true,
            keyEncoding: 'utf8',
            keyLength: 256,
            mode: 'cbc',
        };
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
     * Generate HMAC-SHA256 hash from input data.
     *
     * @param data - Data from which hash should be generated.
     *
     * @returns HMAC-SHA256 hash from provided `data`.
     */
    HMACSHA256(data) {
        var _a;
        const hash = this.primitives.hmacSha256((0, primitives_1.encodeUtf8)((_a = this.configuration.secretKey) !== null && _a !== void 0 ? _a : ''), (0, primitives_1.encodeUtf8)(data));
        return (0, base64_codec_1.encode)((0, primitives_1.toArrayBuffer)(hash));
    }
    /**
     * Generate SHA256 hash from input data.
     *
     * @param data - Data from which hash should be generated.
     *
     * @returns SHA256 hash from provided `data`.
     */
    SHA256(data) {
        return (0, primitives_1.bytesToHex)(this.primitives.sha256((0, primitives_1.encodeUtf8)(data)));
    }
    /**
     * Encrypt provided data.
     *
     * @param data - Source data which should be encrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Encrypted `data`.
     */
    encrypt(data, customCipherKey, options) {
        if (this.configuration.customEncrypt) {
            if (this.logger)
                this.logger.warn('Crypto', "'customEncrypt' is deprecated. Consult docs for better alternative.");
            return this.configuration.customEncrypt(data);
        }
        return this.pnEncrypt(data, customCipherKey, options);
    }
    /**
     * Decrypt provided data.
     *
     * @param data - Encrypted data which should be decrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Decrypted `data`.
     */
    decrypt(data, customCipherKey, options) {
        if (this.configuration.customDecrypt) {
            if (this.logger)
                this.logger.warn('Crypto', "'customDecrypt' is deprecated. Consult docs for better alternative.");
            return this.configuration.customDecrypt(data);
        }
        return this.pnDecrypt(data, customCipherKey, options);
    }
    /**
     * Encrypt provided data.
     *
     * @param data - Source data which should be encrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Encrypted `data` as string.
     */
    pnEncrypt(data, customCipherKey, options) {
        const decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
        if (!decidedCipherKey)
            return data;
        if (this.logger) {
            this.logger.debug('Crypto', () => ({
                messageType: 'object',
                message: Object.assign({ data }, (options !== null && options !== void 0 ? options : {})),
                details: 'Encrypt with parameters:',
                ignoredKeys: utils_1.isSensitiveLogKey,
            }));
        }
        if (typeof data !== 'string')
            throw new Error('Encryption error: data should be a string');
        options = this.parseOptions(options);
        const mode = this.getMode(options);
        const cipherKey = this.getPaddedKey(decidedCipherKey, options);
        const plaintext = (0, primitives_1.encodeUtf8)(data);
        if (this.configuration.useRandomIVs) {
            const iv = this.getRandomIV();
            const payload = this.primitives.aesEncrypt(mode, cipherKey, iv, plaintext);
            return (0, base64_codec_1.encode)((0, primitives_1.toArrayBuffer)((0, primitives_1.concatBytes)(iv, payload)));
        }
        const encrypted = this.primitives.aesEncrypt(mode, cipherKey, this.getIV(options), plaintext);
        const base64Encrypted = (0, base64_codec_1.encode)((0, primitives_1.toArrayBuffer)(encrypted));
        return base64Encrypted || data;
    }
    /**
     * Decrypt provided data.
     *
     * @param data - Encrypted data which should be decrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Decrypted `data`.
     */
    pnDecrypt(data, customCipherKey, options) {
        const decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
        if (!decidedCipherKey)
            return data;
        if (this.logger) {
            this.logger.debug('Crypto', () => ({
                messageType: 'object',
                message: Object.assign({ data }, (options !== null && options !== void 0 ? options : {})),
                details: 'Decrypt with parameters:',
                ignoredKeys: utils_1.isSensitiveLogKey,
            }));
        }
        options = this.parseOptions(options);
        const mode = this.getMode(options);
        const cipherKey = this.getPaddedKey(decidedCipherKey, options);
        if (this.configuration.useRandomIVs) {
            const ciphertext = new Uint8Array((0, base64_codec_1.decode)(data));
            const iv = ciphertext.slice(0, 16);
            const payload = ciphertext.slice(16);
            try {
                const plainJSON = (0, primitives_1.decodeUtf8)(this.primitives.aesDecrypt(mode, cipherKey, iv, payload));
                return JSON.parse(plainJSON);
            }
            catch (e) {
                if (this.logger)
                    this.logger.error('Crypto', () => ({ messageType: 'error', message: e }));
                return null;
            }
        }
        else {
            const iv = this.getIV(options);
            try {
                const ciphertext = new Uint8Array((0, base64_codec_1.decode)(data));
                const plainJSON = (0, primitives_1.decodeUtf8)(this.primitives.aesDecrypt(mode, cipherKey, iv, ciphertext));
                return JSON.parse(plainJSON);
            }
            catch (e) {
                if (this.logger)
                    this.logger.error('Crypto', () => ({ messageType: 'error', message: e }));
                return null;
            }
        }
    }
    /**
     * Pre-process provided custom crypto configuration.
     *
     * @param incomingOptions - Configuration which should be pre-processed before use.
     *
     * @returns Normalized crypto configuration options.
     */
    parseOptions(incomingOptions) {
        var _a, _b, _c, _d;
        if (!incomingOptions)
            return this.defaultOptions;
        // Defaults
        const options = {
            encryptKey: (_a = incomingOptions.encryptKey) !== null && _a !== void 0 ? _a : this.defaultOptions.encryptKey,
            keyEncoding: (_b = incomingOptions.keyEncoding) !== null && _b !== void 0 ? _b : this.defaultOptions.keyEncoding,
            keyLength: (_c = incomingOptions.keyLength) !== null && _c !== void 0 ? _c : this.defaultOptions.keyLength,
            mode: (_d = incomingOptions.mode) !== null && _d !== void 0 ? _d : this.defaultOptions.mode,
        };
        // Validation
        if (this.allowedKeyEncodings.indexOf(options.keyEncoding.toLowerCase()) === -1)
            options.keyEncoding = this.defaultOptions.keyEncoding;
        if (this.allowedKeyLengths.indexOf(options.keyLength) === -1)
            options.keyLength = this.defaultOptions.keyLength;
        if (this.allowedModes.indexOf(options.mode.toLowerCase()) === -1)
            options.mode = this.defaultOptions.mode;
        return options;
    }
    /**
     * Decode provided cipher key.
     *
     * @param key - Key in `encoding` provided by `options`.
     * @param options - Crypto configuration options with cipher key details.
     *
     * @returns Bytes array with decoded key.
     */
    decodeKey(key, options) {
        if (options.keyEncoding === 'base64')
            return new Uint8Array((0, base64_codec_1.decode)(key));
        if (options.keyEncoding === 'hex')
            return (0, primitives_1.hexToBytes)(key);
        return (0, primitives_1.encodeUtf8)(key);
    }
    /**
     * Add padding to the cipher key.
     *
     * @param key - Key which should be padded.
     * @param options - Crypto configuration options with cipher key details.
     *
     * @returns Properly padded cipher key.
     */
    getPaddedKey(key, options) {
        const decodedKey = this.decodeKey(key, options);
        if (options.encryptKey)
            return (0, primitives_1.encodeUtf8)((0, primitives_1.bytesToHex)(this.primitives.sha256(decodedKey)).slice(0, 32));
        return decodedKey;
    }
    /**
     * Cipher mode.
     *
     * @param options - Crypto configuration with information about cipher mode.
     *
     * @returns Crypto cipher mode.
     */
    getMode(options) {
        return options.mode === 'ecb' ? 'ecb' : 'cbc';
    }
    /**
     * Cipher initialization vector.
     *
     * @param options - Crypto configuration with information about cipher mode.
     *
     * @returns Initialization vector.
     */
    getIV(options) {
        return options.mode === 'cbc' ? (0, primitives_1.encodeUtf8)(this.iv) : null;
    }
    /**
     * Random initialization vector.
     *
     * Falls back to the insecure `Math.random()` source (previous behavior) when the platform doesn't provide
     * `crypto.getRandomValues` (for example, React Native without polyfill).
     *
     * @returns Generated random initialization vector.
     */
    getRandomIV() {
        try {
            return this.primitives.randomBytes(16);
        }
        catch (_) {
            if (!insecureRandomWarningShown && this.logger) {
                insecureRandomWarningShown = true;
                this.logger.warn('Crypto', "'crypto.getRandomValues' is unavailable; falling back to insecure Math.random() IV. " +
                    "Install 'react-native-get-random-values'.");
            }
            return Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
        }
    }
}
exports.LegacyCrypto = LegacyCrypto;
