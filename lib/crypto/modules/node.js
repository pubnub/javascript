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
Object.defineProperty(exports, "__esModule", { value: true });
/**       */
var stream_1 = require("stream");
var crypto_1 = require("crypto");
var NodeCryptography = /** @class */ (function () {
    function NodeCryptography() {
    }
    Object.defineProperty(NodeCryptography.prototype, "algo", {
        get: function () {
            return 'aes-256-cbc';
        },
        enumerable: false,
        configurable: true
    });
    NodeCryptography.prototype.encrypt = function (key, input) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey;
            return __generator(this, function (_a) {
                bKey = this.getKey(key);
                if (input instanceof Buffer) {
                    return [2 /*return*/, this.encryptBuffer(bKey, input)];
                }
                if (input instanceof stream_1.Readable) {
                    return [2 /*return*/, this.encryptStream(bKey, input)];
                }
                if (typeof input === 'string') {
                    return [2 /*return*/, this.encryptString(bKey, input)];
                }
                throw new Error('Unsupported input format');
            });
        });
    };
    NodeCryptography.prototype.decrypt = function (key, input) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey;
            return __generator(this, function (_a) {
                bKey = this.getKey(key);
                if (input instanceof Buffer) {
                    return [2 /*return*/, this.decryptBuffer(bKey, input)];
                }
                if (input instanceof stream_1.Readable) {
                    return [2 /*return*/, this.decryptStream(bKey, input)];
                }
                if (typeof input === 'string') {
                    return [2 /*return*/, this.decryptString(bKey, input)];
                }
                throw new Error('Unsupported input format');
            });
        });
    };
    NodeCryptography.prototype.encryptFile = function (key, file, File) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey, _a, _b, _c, _d;
            var _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        bKey = this.getKey(key);
                        if (!(file.data instanceof Buffer)) return [3 /*break*/, 2];
                        _b = (_a = File).create;
                        _e = {
                            name: file.name,
                            mimeType: 'application/octet-stream'
                        };
                        return [4 /*yield*/, this.encryptBuffer(bKey, file.data)];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_e.data = _g.sent(),
                                _e)])];
                    case 2:
                        if (!(file.data instanceof stream_1.Readable)) return [3 /*break*/, 4];
                        _d = (_c = File).create;
                        _f = {
                            name: file.name,
                            mimeType: 'application/octet-stream'
                        };
                        return [4 /*yield*/, this.encryptStream(bKey, file.data)];
                    case 3: return [2 /*return*/, _d.apply(_c, [(_f.stream = _g.sent(),
                                _f)])];
                    case 4: throw new Error('Cannot encrypt this file. In Node.js file encryption supports only string, Buffer or Stream.');
                }
            });
        });
    };
    NodeCryptography.prototype.decryptFile = function (key, file, File) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey, _a, _b, _c, _d;
            var _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        bKey = this.getKey(key);
                        if (!(file.data instanceof Buffer)) return [3 /*break*/, 2];
                        _b = (_a = File).create;
                        _e = {
                            name: file.name
                        };
                        return [4 /*yield*/, this.decryptBuffer(bKey, file.data)];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_e.data = _g.sent(),
                                _e)])];
                    case 2:
                        if (!(file.data instanceof stream_1.Readable)) return [3 /*break*/, 4];
                        _d = (_c = File).create;
                        _f = {
                            name: file.name
                        };
                        return [4 /*yield*/, this.decryptStream(bKey, file.data)];
                    case 3: return [2 /*return*/, _d.apply(_c, [(_f.stream = _g.sent(),
                                _f)])];
                    case 4: throw new Error('Cannot decrypt this file. In Node.js file decryption supports only string, Buffer or Stream.');
                }
            });
        });
    };
    NodeCryptography.prototype.getKey = function (key) {
        var sha = (0, crypto_1.createHash)('sha256');
        sha.update(Buffer.from(key, 'utf8'));
        return Buffer.from(sha.digest('hex').slice(0, 32), 'utf8');
    };
    NodeCryptography.prototype.getIv = function () {
        return (0, crypto_1.randomBytes)(NodeCryptography.IV_LENGTH);
    };
    NodeCryptography.prototype.encryptString = function (key, plaintext) {
        var bIv = this.getIv();
        var bPlaintext = Buffer.from(plaintext);
        var aes = (0, crypto_1.createCipheriv)(this.algo, key, bIv);
        return Buffer.concat([bIv, aes.update(bPlaintext), aes.final()]).toString('utf8');
    };
    NodeCryptography.prototype.decryptString = function (key, sCiphertext) {
        var ciphertext = Buffer.from(sCiphertext);
        var bIv = ciphertext.slice(0, NodeCryptography.IV_LENGTH);
        var bCiphertext = ciphertext.slice(NodeCryptography.IV_LENGTH);
        var aes = (0, crypto_1.createDecipheriv)(this.algo, key, bIv);
        return Buffer.concat([aes.update(bCiphertext), aes.final()]).toString('utf8');
    };
    NodeCryptography.prototype.encryptBuffer = function (key, plaintext) {
        var bIv = this.getIv();
        var aes = (0, crypto_1.createCipheriv)(this.algo, key, bIv);
        return Buffer.concat([bIv, aes.update(plaintext), aes.final()]);
    };
    NodeCryptography.prototype.decryptBuffer = function (key, ciphertext) {
        var bIv = ciphertext.slice(0, NodeCryptography.IV_LENGTH);
        var bCiphertext = ciphertext.slice(NodeCryptography.IV_LENGTH);
        var aes = (0, crypto_1.createDecipheriv)(this.algo, key, bIv);
        return Buffer.concat([aes.update(bCiphertext), aes.final()]);
    };
    NodeCryptography.prototype.encryptStream = function (key, stream) {
        var output = new stream_1.PassThrough();
        var bIv = this.getIv();
        var aes = (0, crypto_1.createCipheriv)(this.algo, key, bIv);
        output.write(bIv);
        stream.pipe(aes).pipe(output);
        return output;
    };
    NodeCryptography.prototype.decryptStream = function (key, stream) {
        var _this = this;
        var output = new stream_1.PassThrough();
        var bIv = Buffer.alloc(0);
        var aes = null;
        var getIv = function () {
            var data = stream.read();
            while (data !== null) {
                if (data) {
                    var bChunk = Buffer.from(data);
                    var sliceLen = NodeCryptography.IV_LENGTH - bIv.byteLength;
                    if (bChunk.byteLength < sliceLen) {
                        bIv = Buffer.concat([bIv, bChunk]);
                    }
                    else {
                        bIv = Buffer.concat([bIv, bChunk.slice(0, sliceLen)]);
                        aes = (0, crypto_1.createDecipheriv)(_this.algo, key, bIv);
                        aes.pipe(output);
                        aes.write(bChunk.slice(sliceLen));
                    }
                }
                data = stream.read();
            }
        };
        stream.on('readable', getIv);
        stream.on('end', function () {
            if (aes) {
                aes.end();
            }
            output.end();
        });
        return output;
    };
    NodeCryptography.IV_LENGTH = 16;
    return NodeCryptography;
}());
exports.default = NodeCryptography;
