"use strict";
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
function concatArrayBuffer(ab1, ab2) {
    var tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
    tmp.set(new Uint8Array(ab1), 0);
    tmp.set(new Uint8Array(ab2), ab1.byteLength);
    return tmp.buffer;
}
/**
 * Legacy cryptography implementation for browser-based {@link PubNub} client.
 */
var WebCryptography = /** @class */ (function () {
    function WebCryptography() {
    }
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
    WebCryptography.prototype.encrypt = function (key, input) {
        return __awaiter(this, void 0, void 0, function () {
            var cKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(input instanceof ArrayBuffer) && typeof input !== 'string')
                            throw new Error('Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer');
                        return [4 /*yield*/, this.getKey(key)];
                    case 1:
                        cKey = _a.sent();
                        return [2 /*return*/, input instanceof ArrayBuffer ? this.encryptArrayBuffer(cKey, input) : this.encryptString(cKey, input)];
                }
            });
        });
    };
    /**
     * Encrypt provided source {@link Buffer} using specific encryption {@link ArrayBuffer}.
     *
     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link ArrayBuffer}.
     * @param buffer - Source {@link ArrayBuffer} for encryption.
     *
     * @returns Encrypted data as {@link ArrayBuffer} object.
     */
    WebCryptography.prototype.encryptArrayBuffer = function (key, buffer) {
        return __awaiter(this, void 0, void 0, function () {
            var abIv, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        abIv = crypto.getRandomValues(new Uint8Array(16));
                        _a = concatArrayBuffer;
                        _b = [abIv.buffer];
                        return [4 /*yield*/, crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, buffer)];
                    case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent()]))];
                }
            });
        });
    };
    /**
     * Encrypt provided source {@link string} using specific encryption {@link key}.
     *
     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link string}.
     * @param text - Source {@link string} for encryption.
     *
     * @returns Encrypted data as byte {@link string}.
     */
    WebCryptography.prototype.encryptString = function (key, text) {
        return __awaiter(this, void 0, void 0, function () {
            var abIv, abPlaintext, abPayload, ciphertext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        abIv = crypto.getRandomValues(new Uint8Array(16));
                        abPlaintext = WebCryptography.encoder.encode(text).buffer;
                        return [4 /*yield*/, crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, abPlaintext)];
                    case 1:
                        abPayload = _a.sent();
                        ciphertext = concatArrayBuffer(abIv.buffer, abPayload);
                        return [2 /*return*/, WebCryptography.decoder.decode(ciphertext)];
                }
            });
        });
    };
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
    WebCryptography.prototype.encryptFile = function (key, file, File) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey, abPlaindata, abCipherdata;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if ((_a = file.contentLength) !== null && _a !== void 0 ? _a : 0 <= 0)
                            throw new Error('encryption error. empty content');
                        return [4 /*yield*/, this.getKey(key)];
                    case 1:
                        bKey = _c.sent();
                        return [4 /*yield*/, file.toArrayBuffer()];
                    case 2:
                        abPlaindata = _c.sent();
                        return [4 /*yield*/, this.encryptArrayBuffer(bKey, abPlaindata)];
                    case 3:
                        abCipherdata = _c.sent();
                        return [2 /*return*/, File.create({
                                name: file.name,
                                mimeType: (_b = file.mimeType) !== null && _b !== void 0 ? _b : 'application/octet-stream',
                                data: abCipherdata,
                            })];
                }
            });
        });
    };
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
    WebCryptography.prototype.decrypt = function (key, input) {
        return __awaiter(this, void 0, void 0, function () {
            var cKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(input instanceof ArrayBuffer) && typeof input !== 'string')
                            throw new Error('Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer');
                        return [4 /*yield*/, this.getKey(key)];
                    case 1:
                        cKey = _a.sent();
                        return [2 /*return*/, input instanceof ArrayBuffer ? this.decryptArrayBuffer(cKey, input) : this.decryptString(cKey, input)];
                }
            });
        });
    };
    /**
     * Decrypt provided encrypted {@link ArrayBuffer} using specific decryption {@link key}.
     *
     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link ArrayBuffer}.
     * @param buffer - Encrypted {@link ArrayBuffer} for decryption.
     *
     * @returns Decrypted data as {@link ArrayBuffer} object.
     */
    WebCryptography.prototype.decryptArrayBuffer = function (key, buffer) {
        return __awaiter(this, void 0, void 0, function () {
            var abIv;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        abIv = buffer.slice(0, 16);
                        if (buffer.slice(WebCryptography.IV_LENGTH).byteLength <= 0)
                            throw new Error('decryption error: empty content');
                        return [4 /*yield*/, crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, buffer.slice(WebCryptography.IV_LENGTH))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Decrypt provided encrypted {@link string} using specific decryption {@link key}.
     *
     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link string}.
     * @param text - Encrypted {@link string} for decryption.
     *
     * @returns Decrypted data as byte {@link string}.
     */
    WebCryptography.prototype.decryptString = function (key, text) {
        return __awaiter(this, void 0, void 0, function () {
            var abCiphertext, abIv, abPayload, abPlaintext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        abCiphertext = WebCryptography.encoder.encode(text).buffer;
                        abIv = abCiphertext.slice(0, 16);
                        abPayload = abCiphertext.slice(16);
                        return [4 /*yield*/, crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, abPayload)];
                    case 1:
                        abPlaintext = _a.sent();
                        return [2 /*return*/, WebCryptography.decoder.decode(abPlaintext)];
                }
            });
        });
    };
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
    WebCryptography.prototype.decryptFile = function (key, file, File) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey, abCipherdata, abPlaindata;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getKey(key)];
                    case 1:
                        bKey = _a.sent();
                        return [4 /*yield*/, file.toArrayBuffer()];
                    case 2:
                        abCipherdata = _a.sent();
                        return [4 /*yield*/, this.decryptArrayBuffer(bKey, abCipherdata)];
                    case 3:
                        abPlaindata = _a.sent();
                        return [2 /*return*/, File.create({
                                name: file.name,
                                mimeType: file.mimeType,
                                data: abPlaindata,
                            })];
                }
            });
        });
    };
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
    WebCryptography.prototype.getKey = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var digest, hashHex, abKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, crypto.subtle.digest('SHA-256', WebCryptography.encoder.encode(key))];
                    case 1:
                        digest = _a.sent();
                        hashHex = Array.from(new Uint8Array(digest))
                            .map(function (b) { return b.toString(16).padStart(2, '0'); })
                            .join('');
                        abKey = WebCryptography.encoder.encode(hashHex.slice(0, 32)).buffer;
                        return [2 /*return*/, crypto.subtle.importKey('raw', abKey, 'AES-CBC', true, ['encrypt', 'decrypt'])];
                }
            });
        });
    };
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
    return WebCryptography;
}());
exports.default = WebCryptography;
