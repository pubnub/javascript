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
var stream_1 = require("stream");
var crypto_1 = require("crypto");
var AesCbcCryptor = /** @class */ (function () {
    function AesCbcCryptor(configuration) {
        this.cipherKey = configuration.cipherKey;
    }
    Object.defineProperty(AesCbcCryptor.prototype, "algo", {
        get: function () {
            return 'aes-256-cbc';
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
        return (0, crypto_1.randomBytes)(AesCbcCryptor.BLOCK_SIZE);
    };
    AesCbcCryptor.prototype.getKey = function () {
        var sha = (0, crypto_1.createHash)('sha256');
        sha.update(Buffer.from(this.cipherKey, 'utf8'));
        return Buffer.from(sha.digest());
    };
    AesCbcCryptor.prototype.encrypt = function (data) {
        var iv = this.getIv();
        var key = this.getKey();
        var plainData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
        var bPlain = Buffer.from(plainData);
        if (bPlain.byteLength === 0)
            throw new Error('encryption error. empty content');
        var aes = (0, crypto_1.createCipheriv)(this.algo, key, iv);
        return {
            metadata: iv,
            data: Buffer.concat([aes.update(bPlain), aes.final()]),
        };
    };
    AesCbcCryptor.prototype.decrypt = function (encryptedData) {
        var data = typeof encryptedData.data === 'string' ? new TextEncoder().encode(encryptedData.data) : encryptedData.data;
        if (data.byteLength <= 0)
            throw new Error('decryption error: empty content');
        var aes = (0, crypto_1.createDecipheriv)(this.algo, this.getKey(), encryptedData.metadata);
        return Uint8Array.from(Buffer.concat([aes.update(data), aes.final()])).buffer;
    };
    AesCbcCryptor.prototype.encryptStream = function (stream) {
        return __awaiter(this, void 0, void 0, function () {
            var output, bIv, aes;
            return __generator(this, function (_a) {
                output = new stream_1.PassThrough();
                bIv = this.getIv();
                if (stream.readable === false)
                    throw new Error('encryption error. empty stream');
                aes = (0, crypto_1.createCipheriv)(this.algo, this.getKey(), bIv);
                stream.pipe(aes).pipe(output);
                return [2 /*return*/, {
                        stream: output,
                        metadata: bIv,
                        metadataLength: AesCbcCryptor.BLOCK_SIZE,
                    }];
            });
        });
    };
    AesCbcCryptor.prototype.decryptStream = function (encryptedStream) {
        return __awaiter(this, void 0, void 0, function () {
            var decryptedStream, bIv, aes, onReadable;
            var _this = this;
            return __generator(this, function (_a) {
                decryptedStream = new stream_1.PassThrough();
                bIv = Buffer.alloc(0);
                aes = null;
                onReadable = function () {
                    var data = encryptedStream.stream.read();
                    while (data !== null) {
                        if (data) {
                            var bChunk = Buffer.from(data);
                            var sliceLen = encryptedStream.metadataLength - bIv.byteLength;
                            if (bChunk.byteLength < sliceLen) {
                                bIv = Buffer.concat([bIv, bChunk]);
                            }
                            else {
                                bIv = Buffer.concat([bIv, bChunk.slice(0, sliceLen)]);
                                aes = (0, crypto_1.createDecipheriv)(_this.algo, _this.getKey(), bIv);
                                aes.pipe(decryptedStream);
                                aes.write(bChunk.slice(sliceLen));
                            }
                        }
                        data = encryptedStream.stream.read();
                    }
                };
                encryptedStream.stream.on('readable', onReadable);
                encryptedStream.stream.on('end', function () {
                    if (aes) {
                        aes.end();
                    }
                    decryptedStream.end();
                });
                return [2 /*return*/, decryptedStream];
            });
        });
    };
    AesCbcCryptor.BLOCK_SIZE = 16;
    return AesCbcCryptor;
}());
exports.default = AesCbcCryptor;
