"use strict";
/**
 * Legacy cryptography module.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var base64_codec_1 = require("../base64_codec");
var hmac_sha256_1 = __importDefault(require("./hmac-sha256"));
/**
 * Convert bytes array to words array.
 *
 * @param b - Bytes array (buffer) which should be converted.
 *
 * @returns Word sized array.
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
function bufferToWordArray(b) {
    var wa = [];
    var i;
    for (i = 0; i < b.length; i += 1) {
        wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
    }
    // @ts-expect-error Bundled library without types.
    return hmac_sha256_1.default.lib.WordArray.create(wa, b.length);
}
var default_1 = /** @class */ (function () {
    function default_1(configuration) {
        this.configuration = configuration;
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
        this.defaultOptions = {
            encryptKey: true,
            keyEncoding: 'utf8',
            keyLength: 256,
            mode: 'cbc',
        };
    }
    /**
     * Generate HMAC-SHA256 hash from input data.
     *
     * @param data - Data from which hash should be generated.
     *
     * @returns HMAC-SHA256 hash from provided `data`.
     */
    default_1.prototype.HMACSHA256 = function (data) {
        // @ts-expect-error Bundled library without types.
        var hash = hmac_sha256_1.default.HmacSHA256(data, this.configuration.secretKey);
        // @ts-expect-error Bundled library without types.
        return hash.toString(hmac_sha256_1.default.enc.Base64);
    };
    /**
     * Generate SHA256 hash from input data.
     *
     * @param data - Data from which hash should be generated.
     *
     * @returns SHA256 hash from provided `data`.
     */
    default_1.prototype.SHA256 = function (data) {
        // @ts-expect-error Bundled library without types.
        return hmac_sha256_1.default.SHA256(data).toString(hmac_sha256_1.default.enc.Hex);
    };
    /**
     * Encrypt provided data.
     *
     * @param data - Source data which should be encrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Encrypted `data`.
     */
    default_1.prototype.encrypt = function (data, customCipherKey, options) {
        if (this.configuration.customEncrypt)
            return this.configuration.customEncrypt(data);
        return this.pnEncrypt(data, customCipherKey, options);
    };
    /**
     * Decrypt provided data.
     *
     * @param data - Encrypted data which should be decrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Decrypted `data`.
     */
    default_1.prototype.decrypt = function (data, customCipherKey, options) {
        if (this.configuration.customDecrypt)
            return this.configuration.customDecrypt(data);
        return this.pnDecrypt(data, customCipherKey, options);
    };
    /**
     * Encrypt provided data.
     *
     * @param data - Source data which should be encrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Encrypted `data` as string.
     */
    default_1.prototype.pnEncrypt = function (data, customCipherKey, options) {
        var decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
        if (!decidedCipherKey)
            return data;
        options = this.parseOptions(options);
        var mode = this.getMode(options);
        var cipherKey = this.getPaddedKey(decidedCipherKey, options);
        if (this.configuration.useRandomIVs) {
            var waIv = this.getRandomIV();
            // @ts-expect-error Bundled library without types.
            var waPayload = hmac_sha256_1.default.AES.encrypt(data, cipherKey, { iv: waIv, mode: mode }).ciphertext;
            // @ts-expect-error Bundled library without types.
            return waIv.clone().concat(waPayload.clone()).toString(hmac_sha256_1.default.enc.Base64);
        }
        var iv = this.getIV(options);
        // @ts-expect-error Bundled library without types.
        var encryptedHexArray = hmac_sha256_1.default.AES.encrypt(data, cipherKey, { iv: iv, mode: mode }).ciphertext;
        // @ts-expect-error Bundled library without types.
        var base64Encrypted = encryptedHexArray.toString(hmac_sha256_1.default.enc.Base64);
        return base64Encrypted || data;
    };
    /**
     * Decrypt provided data.
     *
     * @param data - Encrypted data which should be decrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Decrypted `data`.
     */
    default_1.prototype.pnDecrypt = function (data, customCipherKey, options) {
        var decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
        if (!decidedCipherKey)
            return data;
        options = this.parseOptions(options);
        var mode = this.getMode(options);
        var cipherKey = this.getPaddedKey(decidedCipherKey, options);
        if (this.configuration.useRandomIVs) {
            var ciphertext = new Uint8ClampedArray((0, base64_codec_1.decode)(data));
            var iv = bufferToWordArray(ciphertext.slice(0, 16));
            var payload = bufferToWordArray(ciphertext.slice(16));
            try {
                // @ts-expect-error Bundled library without types.
                var plainJSON = hmac_sha256_1.default.AES.decrypt({ ciphertext: payload }, cipherKey, { iv: iv, mode: mode }).toString(
                // @ts-expect-error Bundled library without types.
                hmac_sha256_1.default.enc.Utf8);
                return JSON.parse(plainJSON);
            }
            catch (e) {
                return null;
            }
        }
        else {
            var iv = this.getIV(options);
            try {
                // @ts-expect-error Bundled library without types.
                var ciphertext = hmac_sha256_1.default.enc.Base64.parse(data);
                // @ts-expect-error Bundled library without types.
                var plainJSON = hmac_sha256_1.default.AES.decrypt({ ciphertext: ciphertext }, cipherKey, { iv: iv, mode: mode }).toString(hmac_sha256_1.default.enc.Utf8);
                return JSON.parse(plainJSON);
            }
            catch (e) {
                return null;
            }
        }
    };
    /**
     * Pre-process provided custom crypto configuration.
     *
     * @param incomingOptions - Configuration which should be pre-processed before use.
     *
     * @returns Normalized crypto configuration options.
     */
    default_1.prototype.parseOptions = function (incomingOptions) {
        var _a, _b, _c, _d;
        if (!incomingOptions)
            return this.defaultOptions;
        // Defaults
        var options = {
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
    };
    /**
     * Decode provided cipher key.
     *
     * @param key - Key in `encoding` provided by `options`.
     * @param options - Crypto configuration options with cipher key details.
     *
     * @returns Array buffer with decoded key.
     */
    default_1.prototype.decodeKey = function (key, options) {
        // @ts-expect-error Bundled library without types.
        if (options.keyEncoding === 'base64')
            return hmac_sha256_1.default.enc.Base64.parse(key);
        // @ts-expect-error Bundled library without types.
        if (options.keyEncoding === 'hex')
            return hmac_sha256_1.default.enc.Hex.parse(key);
        return key;
    };
    /**
     * Add padding to the cipher key.
     *
     * @param key - Key which should be padded.
     * @param options - Crypto configuration options with cipher key details.
     *
     * @returns Properly padded cipher key.
     */
    default_1.prototype.getPaddedKey = function (key, options) {
        key = this.decodeKey(key, options);
        // @ts-expect-error Bundled library without types.
        if (options.encryptKey)
            return hmac_sha256_1.default.enc.Utf8.parse(this.SHA256(key).slice(0, 32));
        return key;
    };
    /**
     * Cipher mode.
     *
     * @param options - Crypto configuration with information about cipher mode.
     *
     * @returns Crypto cipher mode.
     */
    default_1.prototype.getMode = function (options) {
        // @ts-expect-error Bundled library without types.
        if (options.mode === 'ecb')
            return hmac_sha256_1.default.mode.ECB;
        // @ts-expect-error Bundled library without types.
        return hmac_sha256_1.default.mode.CBC;
    };
    /**
     * Cipher initialization vector.
     *
     * @param options - Crypto configuration with information about cipher mode.
     *
     * @returns Initialization vector.
     */
    default_1.prototype.getIV = function (options) {
        // @ts-expect-error Bundled library without types.
        return options.mode === 'cbc' ? hmac_sha256_1.default.enc.Utf8.parse(this.iv) : null;
    };
    /**
     * Random initialization vector.
     *
     * @returns Generated random initialization vector.
     */
    default_1.prototype.getRandomIV = function () {
        // @ts-expect-error Bundled library without types.
        return hmac_sha256_1.default.lib.WordArray.random(16);
    };
    return default_1;
}());
exports.default = default_1;
