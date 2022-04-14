"use strict";
/* global crypto */
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
Object.defineProperty(exports, "__esModule", { value: true });
function concatArrayBuffer(ab1, ab2) {
    var tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
    tmp.set(new Uint8Array(ab1), 0);
    tmp.set(new Uint8Array(ab2), ab1.byteLength);
    return tmp.buffer;
}
var WebCryptography = /** @class */ (function () {
    function WebCryptography() {
    }
    Object.defineProperty(WebCryptography.prototype, "algo", {
        get: function () {
            return 'aes-256-cbc';
        },
        enumerable: false,
        configurable: true
    });
    WebCryptography.prototype.encrypt = function (key, input) {
        return __awaiter(this, void 0, void 0, function () {
            var cKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getKey(key)];
                    case 1:
                        cKey = _a.sent();
                        if (input instanceof ArrayBuffer) {
                            return [2 /*return*/, this.encryptArrayBuffer(cKey, input)];
                        }
                        if (typeof input === 'string') {
                            return [2 /*return*/, this.encryptString(cKey, input)];
                        }
                        throw new Error('Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer');
                }
            });
        });
    };
    WebCryptography.prototype.decrypt = function (key, input) {
        return __awaiter(this, void 0, void 0, function () {
            var cKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getKey(key)];
                    case 1:
                        cKey = _a.sent();
                        if (input instanceof ArrayBuffer) {
                            return [2 /*return*/, this.decryptArrayBuffer(cKey, input)];
                        }
                        if (typeof input === 'string') {
                            return [2 /*return*/, this.decryptString(cKey, input)];
                        }
                        throw new Error('Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer');
                }
            });
        });
    };
    WebCryptography.prototype.encryptFile = function (key, file, File) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey, abPlaindata, abCipherdata;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getKey(key)];
                    case 1:
                        bKey = _a.sent();
                        return [4 /*yield*/, file.toArrayBuffer()];
                    case 2:
                        abPlaindata = _a.sent();
                        return [4 /*yield*/, this.encryptArrayBuffer(bKey, abPlaindata)];
                    case 3:
                        abCipherdata = _a.sent();
                        return [2 /*return*/, File.create({
                                name: file.name,
                                mimeType: 'application/octet-stream',
                                data: abCipherdata,
                            })];
                }
            });
        });
    };
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
                                data: abPlaindata,
                            })];
                }
            });
        });
    };
    WebCryptography.prototype.getKey = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey, abHash, abKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bKey = Buffer.from(key);
                        return [4 /*yield*/, crypto.subtle.digest('SHA-256', bKey.buffer)];
                    case 1:
                        abHash = _a.sent();
                        abKey = Buffer.from(Buffer.from(abHash).toString('hex').slice(0, 32), 'utf8').buffer;
                        return [2 /*return*/, crypto.subtle.importKey('raw', abKey, 'AES-CBC', true, ['encrypt', 'decrypt'])];
                }
            });
        });
    };
    WebCryptography.prototype.encryptArrayBuffer = function (key, plaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var abIv, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        abIv = crypto.getRandomValues(new Uint8Array(16));
                        _a = concatArrayBuffer;
                        _b = [abIv.buffer];
                        return [4 /*yield*/, crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, plaintext)];
                    case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent()]))];
                }
            });
        });
    };
    WebCryptography.prototype.decryptArrayBuffer = function (key, ciphertext) {
        return __awaiter(this, void 0, void 0, function () {
            var abIv;
            return __generator(this, function (_a) {
                abIv = ciphertext.slice(0, 16);
                return [2 /*return*/, crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, ciphertext.slice(16))];
            });
        });
    };
    WebCryptography.prototype.encryptString = function (key, plaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var abIv, abPlaintext, abPayload, ciphertext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        abIv = crypto.getRandomValues(new Uint8Array(16));
                        abPlaintext = Buffer.from(plaintext).buffer;
                        return [4 /*yield*/, crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, abPlaintext)];
                    case 1:
                        abPayload = _a.sent();
                        ciphertext = concatArrayBuffer(abIv.buffer, abPayload);
                        return [2 /*return*/, Buffer.from(ciphertext).toString('utf8')];
                }
            });
        });
    };
    WebCryptography.prototype.decryptString = function (key, ciphertext) {
        return __awaiter(this, void 0, void 0, function () {
            var abCiphertext, abIv, abPayload, abPlaintext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        abCiphertext = Buffer.from(ciphertext);
                        abIv = abCiphertext.slice(0, 16);
                        abPayload = abCiphertext.slice(16);
                        return [4 /*yield*/, crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, abPayload)];
                    case 1:
                        abPlaintext = _a.sent();
                        return [2 /*return*/, Buffer.from(abPlaintext).toString('utf8')];
                }
            });
        });
    };
    WebCryptography.IV_LENGTH = 16;
    return WebCryptography;
}());
exports.default = WebCryptography;
