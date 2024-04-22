"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base64_codec_1 = require("../base64_codec");
const hmac_sha256_1 = __importDefault(require("./hmac-sha256"));
function bufferToWordArray(b) {
    const wa = [];
    let i;
    for (i = 0; i < b.length; i += 1) {
        wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
    }
    return hmac_sha256_1.default.lib.WordArray.create(wa, b.length);
}
class default_1 {
    constructor(configuration) {
        this.configuration = configuration;
        this.iv = '0123456789012345';
        this.allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
        this.allowedKeyLengths = [128, 256];
        this.allowedModes = ['ecb', 'cbc'];
        this.defaultOptions = {
            encryptKey: true,
            keyEncoding: 'utf8',
            keyLength: 256,
            mode: 'cbc',
        };
    }
    HMACSHA256(data) {
        const hash = hmac_sha256_1.default.HmacSHA256(data, this.configuration.secretKey);
        return hash.toString(hmac_sha256_1.default.enc.Base64);
    }
    SHA256(data) {
        return hmac_sha256_1.default.SHA256(data).toString(hmac_sha256_1.default.enc.Hex);
    }
    encrypt(data, customCipherKey, options) {
        if (this.configuration.customEncrypt)
            return this.configuration.customEncrypt(data);
        return this.pnEncrypt(data, customCipherKey, options);
    }
    decrypt(data, customCipherKey, options) {
        if (this.configuration.customDecrypt)
            return this.configuration.customDecrypt(data);
        return this.pnDecrypt(data, customCipherKey, options);
    }
    pnEncrypt(data, customCipherKey, options) {
        const decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
        if (!decidedCipherKey)
            return data;
        options = this.parseOptions(options);
        const mode = this.getMode(options);
        const cipherKey = this.getPaddedKey(decidedCipherKey, options);
        if (this.configuration.useRandomIVs) {
            const waIv = this.getRandomIV();
            const waPayload = hmac_sha256_1.default.AES.encrypt(data, cipherKey, { iv: waIv, mode }).ciphertext;
            return waIv.clone().concat(waPayload.clone()).toString(hmac_sha256_1.default.enc.Base64);
        }
        const iv = this.getIV(options);
        const encryptedHexArray = hmac_sha256_1.default.AES.encrypt(data, cipherKey, { iv, mode }).ciphertext;
        const base64Encrypted = encryptedHexArray.toString(hmac_sha256_1.default.enc.Base64);
        return base64Encrypted || data;
    }
    pnDecrypt(data, customCipherKey, options) {
        const decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
        if (!decidedCipherKey)
            return data;
        options = this.parseOptions(options);
        const mode = this.getMode(options);
        const cipherKey = this.getPaddedKey(decidedCipherKey, options);
        if (this.configuration.useRandomIVs) {
            const ciphertext = new Uint8ClampedArray((0, base64_codec_1.decode)(data));
            const iv = bufferToWordArray(ciphertext.slice(0, 16));
            const payload = bufferToWordArray(ciphertext.slice(16));
            try {
                const plainJSON = hmac_sha256_1.default.AES.decrypt({ ciphertext: payload }, cipherKey, { iv, mode }).toString(hmac_sha256_1.default.enc.Utf8);
                return JSON.parse(plainJSON);
            }
            catch (e) {
                return null;
            }
        }
        else {
            const iv = this.getIV(options);
            try {
                const ciphertext = hmac_sha256_1.default.enc.Base64.parse(data);
                const plainJSON = hmac_sha256_1.default.AES.decrypt({ ciphertext }, cipherKey, { iv, mode }).toString(hmac_sha256_1.default.enc.Utf8);
                return JSON.parse(plainJSON);
            }
            catch (e) {
                return null;
            }
        }
    }
    parseOptions(incomingOptions) {
        var _a, _b, _c, _d;
        if (!incomingOptions)
            return this.defaultOptions;
        const options = {
            encryptKey: (_a = incomingOptions.encryptKey) !== null && _a !== void 0 ? _a : this.defaultOptions.encryptKey,
            keyEncoding: (_b = incomingOptions.keyEncoding) !== null && _b !== void 0 ? _b : this.defaultOptions.keyEncoding,
            keyLength: (_c = incomingOptions.keyLength) !== null && _c !== void 0 ? _c : this.defaultOptions.keyLength,
            mode: (_d = incomingOptions.mode) !== null && _d !== void 0 ? _d : this.defaultOptions.mode,
        };
        if (this.allowedKeyEncodings.indexOf(options.keyEncoding.toLowerCase()) === -1)
            options.keyEncoding = this.defaultOptions.keyEncoding;
        if (this.allowedKeyLengths.indexOf(options.keyLength) === -1)
            options.keyLength = this.defaultOptions.keyLength;
        if (this.allowedModes.indexOf(options.mode.toLowerCase()) === -1)
            options.mode = this.defaultOptions.mode;
        return options;
    }
    decodeKey(key, options) {
        if (options.keyEncoding === 'base64')
            return hmac_sha256_1.default.enc.Base64.parse(key);
        if (options.keyEncoding === 'hex')
            return hmac_sha256_1.default.enc.Hex.parse(key);
        return key;
    }
    getPaddedKey(key, options) {
        key = this.decodeKey(key, options);
        if (options.encryptKey)
            return hmac_sha256_1.default.enc.Utf8.parse(this.SHA256(key).slice(0, 32));
        return key;
    }
    getMode(options) {
        if (options.mode === 'ecb')
            return hmac_sha256_1.default.mode.ECB;
        return hmac_sha256_1.default.mode.CBC;
    }
    getIV(options) {
        return options.mode === 'cbc' ? hmac_sha256_1.default.enc.Utf8.parse(this.iv) : null;
    }
    getRandomIV() {
        return hmac_sha256_1.default.lib.WordArray.random(16);
    }
}
exports.default = default_1;
