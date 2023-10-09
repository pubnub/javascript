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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hmac_sha256_1 = __importDefault(require("../../../core/components/cryptography/hmac-sha256"));
var base64_codec_1 = require("../../../core/components/base64_codec");
// ts check disabled: CryptoJs does not have types specified
var AesCbcCryptor = /** @class */ (function () {
    function AesCbcCryptor(configuration) {
        this.cipherKey = configuration.cipherKey;
        this.CryptoJS = hmac_sha256_1.default;
        this.encryptedKey = this.CryptoJS.SHA256(this.cipherKey);
    }
    Object.defineProperty(AesCbcCryptor.prototype, "algo", {
        get: function () {
            return 'AES-CBC';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AesCbcCryptor.prototype, "identifier", {
        get: function () {
            return 'ACRH';
        },
        enumerable: false,
        configurable: true
    });
    AesCbcCryptor.prototype.getIv = function () {
        return crypto.getRandomValues(new Uint8Array(AesCbcCryptor.BLOCK_SIZE));
    };
    AesCbcCryptor.prototype.getKey = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bKey, abHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bKey = AesCbcCryptor.encoder.encode(this.cipherKey);
                        return [4 /*yield*/, crypto.subtle.digest('SHA-256', bKey.buffer)];
                    case 1:
                        abHash = _a.sent();
                        return [2 /*return*/, crypto.subtle.importKey('raw', abHash, this.algo, true, ['encrypt', 'decrypt'])];
                }
            });
        });
    };
    AesCbcCryptor.prototype.encrypt = function (data) {
        var stringData = typeof data === 'string' ? data : AesCbcCryptor.decoder.decode(data);
        if (stringData.length === 0)
            throw new Error('encryption error. empty content');
        var abIv = this.getIv();
        return {
            metadata: abIv,
            data: (0, base64_codec_1.decode)(this.CryptoJS.AES.encrypt(data, this.encryptedKey, {
                iv: this.bufferToWordArray(abIv),
                mode: this.CryptoJS.mode.CBC,
            }).ciphertext.toString(this.CryptoJS.enc.Base64)),
        };
    };
    AesCbcCryptor.prototype.decrypt = function (encryptedData) {
        var iv = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.metadata));
        var data = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.data));
        return AesCbcCryptor.encoder.encode(this.CryptoJS.AES.decrypt({ ciphertext: data }, this.encryptedKey, {
            iv: iv,
            mode: this.CryptoJS.mode.CBC,
        }).toString(this.CryptoJS.enc.Utf8)).buffer;
    };
    AesCbcCryptor.prototype.encryptFileData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var key, iv;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getKey()];
                    case 1:
                        key = _b.sent();
                        iv = this.getIv();
                        _a = {};
                        return [4 /*yield*/, crypto.subtle.encrypt({ name: this.algo, iv: iv }, key, data)];
                    case 2: return [2 /*return*/, (_a.data = _b.sent(),
                            _a.metadata = iv,
                            _a)];
                }
            });
        });
    };
    AesCbcCryptor.prototype.decryptFileData = function (encryptedData) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getKey()];
                    case 1:
                        key = _a.sent();
                        return [2 /*return*/, crypto.subtle.decrypt({ name: this.algo, iv: encryptedData.metadata }, key, encryptedData.data)];
                }
            });
        });
    };
    AesCbcCryptor.prototype.bufferToWordArray = function (b) {
        var wa = [];
        var i;
        for (i = 0; i < b.length; i += 1) {
            wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
        }
        return this.CryptoJS.lib.WordArray.create(wa, b.length);
    };
    AesCbcCryptor.BLOCK_SIZE = 16;
    AesCbcCryptor.encoder = new TextEncoder();
    AesCbcCryptor.decoder = new TextDecoder();
    return AesCbcCryptor;
}());
exports.default = AesCbcCryptor;
