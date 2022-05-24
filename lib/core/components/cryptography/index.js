"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hmac_sha256_1 = __importDefault(require("./hmac-sha256"));
function bufferToWordArray(b) {
    var wa = [];
    var i;
    for (i = 0; i < b.length; i += 1) {
        // eslint-disable-next-line no-bitwise
        wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
    }
    return hmac_sha256_1.default.lib.WordArray.create(wa, b.length);
}
var default_1 = /** @class */ (function () {
    function default_1(_a) {
        var config = _a.config;
        this._config = config;
        this._iv = '0123456789012345';
        this._allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
        this._allowedKeyLengths = [128, 256];
        this._allowedModes = ['ecb', 'cbc'];
        this._defaultOptions = {
            encryptKey: true,
            keyEncoding: 'utf8',
            keyLength: 256,
            mode: 'cbc',
        };
    }
    default_1.prototype.HMACSHA256 = function (data) {
        var hash = hmac_sha256_1.default.HmacSHA256(data, this._config.secretKey);
        return hash.toString(hmac_sha256_1.default.enc.Base64);
    };
    default_1.prototype.SHA256 = function (s) {
        return hmac_sha256_1.default.SHA256(s).toString(hmac_sha256_1.default.enc.Hex);
    };
    default_1.prototype._parseOptions = function (incomingOptions) {
        // Defaults
        var options = incomingOptions || {};
        if (!options.hasOwnProperty('encryptKey'))
            options.encryptKey = this._defaultOptions.encryptKey;
        if (!options.hasOwnProperty('keyEncoding'))
            options.keyEncoding = this._defaultOptions.keyEncoding;
        if (!options.hasOwnProperty('keyLength'))
            options.keyLength = this._defaultOptions.keyLength;
        if (!options.hasOwnProperty('mode'))
            options.mode = this._defaultOptions.mode;
        // Validation
        if (this._allowedKeyEncodings.indexOf(options.keyEncoding.toLowerCase()) === -1) {
            options.keyEncoding = this._defaultOptions.keyEncoding;
        }
        if (this._allowedKeyLengths.indexOf(parseInt(options.keyLength, 10)) === -1) {
            options.keyLength = this._defaultOptions.keyLength;
        }
        if (this._allowedModes.indexOf(options.mode.toLowerCase()) === -1) {
            options.mode = this._defaultOptions.mode;
        }
        return options;
    };
    default_1.prototype._decodeKey = function (key, options) {
        if (options.keyEncoding === 'base64') {
            return hmac_sha256_1.default.enc.Base64.parse(key);
        }
        if (options.keyEncoding === 'hex') {
            return hmac_sha256_1.default.enc.Hex.parse(key);
        }
        return key;
    };
    default_1.prototype._getPaddedKey = function (key, options) {
        key = this._decodeKey(key, options);
        if (options.encryptKey) {
            return hmac_sha256_1.default.enc.Utf8.parse(this.SHA256(key).slice(0, 32));
        }
        return key;
    };
    default_1.prototype._getMode = function (options) {
        if (options.mode === 'ecb') {
            return hmac_sha256_1.default.mode.ECB;
        }
        return hmac_sha256_1.default.mode.CBC;
    };
    default_1.prototype._getIV = function (options) {
        return options.mode === 'cbc' ? hmac_sha256_1.default.enc.Utf8.parse(this._iv) : null;
    };
    default_1.prototype._getRandomIV = function () {
        return hmac_sha256_1.default.lib.WordArray.random(16);
    };
    default_1.prototype.encrypt = function (data, customCipherKey, options) {
        if (this._config.customEncrypt) {
            return this._config.customEncrypt(data);
        }
        return this.pnEncrypt(data, customCipherKey, options);
    };
    default_1.prototype.decrypt = function (data, customCipherKey, options) {
        if (this._config.customDecrypt) {
            return this._config.customDecrypt(data);
        }
        return this.pnDecrypt(data, customCipherKey, options);
    };
    default_1.prototype.pnEncrypt = function (data, customCipherKey, options) {
        if (!customCipherKey && !this._config.cipherKey)
            return data;
        options = this._parseOptions(options);
        var mode = this._getMode(options);
        var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);
        if (this._config.useRandomIVs) {
            var waIv = this._getRandomIV();
            var waPayload = hmac_sha256_1.default.AES.encrypt(data, cipherKey, { iv: waIv, mode: mode }).ciphertext;
            return waIv.clone().concat(waPayload.clone()).toString(hmac_sha256_1.default.enc.Base64);
        }
        var iv = this._getIV(options);
        var encryptedHexArray = hmac_sha256_1.default.AES.encrypt(data, cipherKey, { iv: iv, mode: mode }).ciphertext;
        var base64Encrypted = encryptedHexArray.toString(hmac_sha256_1.default.enc.Base64);
        return base64Encrypted || data;
    };
    default_1.prototype.pnDecrypt = function (data, customCipherKey, options) {
        if (!customCipherKey && !this._config.cipherKey)
            return data;
        options = this._parseOptions(options);
        var mode = this._getMode(options);
        var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);
        if (this._config.useRandomIVs) {
            var ciphertext = Buffer.from(data, 'base64');
            var iv = bufferToWordArray(ciphertext.slice(0, 16));
            var payload = bufferToWordArray(ciphertext.slice(16));
            try {
                var plainJSON = hmac_sha256_1.default.AES.decrypt({ ciphertext: payload }, cipherKey, { iv: iv, mode: mode }).toString(hmac_sha256_1.default.enc.Utf8);
                var plaintext = JSON.parse(plainJSON);
                return plaintext;
            }
            catch (e) {
                return null;
            }
        }
        else {
            var iv = this._getIV(options);
            try {
                var ciphertext = hmac_sha256_1.default.enc.Base64.parse(data);
                var plainJSON = hmac_sha256_1.default.AES.decrypt({ ciphertext: ciphertext }, cipherKey, { iv: iv, mode: mode }).toString(hmac_sha256_1.default.enc.Utf8);
                var plaintext = JSON.parse(plainJSON);
                return plaintext;
            }
            catch (e) {
                return null;
            }
        }
    };
    return default_1;
}());
exports.default = default_1;
