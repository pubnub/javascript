"use strict";
/**
 * Legacy Node.js cryptography module.
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
var crypto_1 = require("crypto");
var stream_1 = require("stream");
var buffer_1 = require("buffer");
/**
 * Legacy cryptography implementation for Node.js-based {@link PubNub} client.
 */
var NodeCryptography = /** @class */ (function () {
    function NodeCryptography() {
    }
    // --------------------------------------------------------
    // --------------------- Encryption -----------------------
    // --------------------------------------------------------
    // region Encryption
    NodeCryptography.prototype.encrypt = function (key, input) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey;
            return __generator(this, function (_a) {
                bKey = this.getKey(key);
                if (input instanceof buffer_1.Buffer)
                    return [2 /*return*/, this.encryptBuffer(bKey, input)];
                if (input instanceof stream_1.Readable)
                    return [2 /*return*/, this.encryptStream(bKey, input)];
                if (typeof input === 'string')
                    return [2 /*return*/, this.encryptString(bKey, input)];
                throw new Error('Encryption error: unsupported input format');
            });
        });
    };
    /**
     * Encrypt provided source {@link Buffer} using specific encryption {@link key}.
     *
     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link Buffer}.
     * @param buffer - Source {@link Buffer} for encryption.
     *
     * @returns Encrypted data as {@link Buffer} object.
     */
    NodeCryptography.prototype.encryptBuffer = function (key, buffer) {
        var bIv = this.getIv();
        var aes = (0, crypto_1.createCipheriv)(this.algo, key, bIv);
        return buffer_1.Buffer.concat([bIv, aes.update(buffer), aes.final()]);
    };
    /**
     * Encrypt provided source {@link Readable} stream using specific encryption {@link key}.
     *
     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link Readable} stream.
     * @param stream - Source {@link Readable} stream for encryption.
     *
     * @returns Encrypted data as {@link Transform} object.
     */
    NodeCryptography.prototype.encryptStream = function (key, stream) {
        return __awaiter(this, void 0, void 0, function () {
            var bIv, aes, initiated;
            return __generator(this, function (_a) {
                bIv = this.getIv();
                aes = (0, crypto_1.createCipheriv)(this.algo, key, bIv).setAutoPadding(true);
                initiated = false;
                return [2 /*return*/, stream.pipe(aes).pipe(new stream_1.Transform({
                        transform: function (chunk, _, cb) {
                            if (!initiated) {
                                initiated = true;
                                this.push(buffer_1.Buffer.concat([bIv, chunk]));
                            }
                            else
                                this.push(chunk);
                            cb();
                        },
                    }))];
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
    NodeCryptography.prototype.encryptString = function (key, text) {
        var bIv = this.getIv();
        var bPlaintext = buffer_1.Buffer.from(text);
        var aes = (0, crypto_1.createCipheriv)(this.algo, key, bIv);
        return buffer_1.Buffer.concat([bIv, aes.update(bPlaintext), aes.final()]).toString('utf8');
    };
    NodeCryptography.prototype.encryptFile = function (key, file, File) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey, _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        bKey = this.getKey(key);
                        /**
                         * Buffer type check also covers `string` which converted to the `Buffer` during file object creation.
                         */
                        if (file.data instanceof buffer_1.Buffer) {
                            if (file.data.byteLength <= 0)
                                throw new Error('Encryption error: empty content.');
                            return [2 /*return*/, File.create({
                                    name: file.name,
                                    mimeType: file.mimeType,
                                    data: this.encryptBuffer(bKey, file.data),
                                })];
                        }
                        if (!(file.data instanceof stream_1.Readable)) return [3 /*break*/, 2];
                        if (file.contentLength === 0)
                            throw new Error('Encryption error: empty content.');
                        _b = (_a = File).create;
                        _c = {
                            name: file.name,
                            mimeType: file.mimeType
                        };
                        return [4 /*yield*/, this.encryptStream(bKey, file.data)];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_c.stream = _d.sent(),
                                _c)])];
                    case 2: throw new Error('Cannot encrypt this file. In Node.js file encryption supports only string, Buffer or Stream.');
                }
            });
        });
    };
    // endregion
    // --------------------------------------------------------
    // --------------------- Decryption -----------------------
    // --------------------------------------------------------
    // region Decryption
    NodeCryptography.prototype.decrypt = function (key, input) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey;
            return __generator(this, function (_a) {
                bKey = this.getKey(key);
                if (input instanceof buffer_1.Buffer)
                    return [2 /*return*/, this.decryptBuffer(bKey, input)];
                if (input instanceof stream_1.Readable)
                    return [2 /*return*/, this.decryptStream(bKey, input)];
                if (typeof input === 'string')
                    return [2 /*return*/, this.decryptString(bKey, input)];
                throw new Error('Decryption error: unsupported input format');
            });
        });
    };
    /**
     * Decrypt provided encrypted {@link Buffer} using specific decryption {@link key}.
     *
     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link Buffer}.
     * @param buffer - Encrypted {@link Buffer} for decryption.
     *
     * @returns Decrypted data as {@link Buffer} object.
     */
    NodeCryptography.prototype.decryptBuffer = function (key, buffer) {
        var bIv = buffer.slice(0, NodeCryptography.IV_LENGTH);
        var bCiphertext = buffer.slice(NodeCryptography.IV_LENGTH);
        if (bCiphertext.byteLength <= 0)
            throw new Error('Decryption error: empty content');
        var aes = (0, crypto_1.createDecipheriv)(this.algo, key, bIv);
        return buffer_1.Buffer.concat([aes.update(bCiphertext), aes.final()]);
    };
    /**
     * Decrypt provided encrypted {@link Readable} stream using specific decryption {@link key}.
     *
     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link Readable} stream.
     * @param stream - Encrypted {@link Readable} stream for decryption.
     *
     * @returns Decrypted data as {@link Readable} object.
     */
    NodeCryptography.prototype.decryptStream = function (key, stream) {
        var _this = this;
        var aes = null;
        var output = new stream_1.PassThrough();
        var bIv = buffer_1.Buffer.alloc(0);
        var getIv = function () {
            var data = stream.read();
            while (data !== null) {
                if (data) {
                    var bChunk = buffer_1.Buffer.from(data);
                    var sliceLen = NodeCryptography.IV_LENGTH - bIv.byteLength;
                    if (bChunk.byteLength < sliceLen)
                        bIv = buffer_1.Buffer.concat([bIv, bChunk]);
                    else {
                        bIv = buffer_1.Buffer.concat([bIv, bChunk.slice(0, sliceLen)]);
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
            if (aes)
                aes.end();
            output.end();
        });
        return output;
    };
    /**
     * Decrypt provided encrypted {@link string} using specific decryption {@link key}.
     *
     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link string}.
     * @param text - Encrypted {@link string} for decryption.
     *
     * @returns Decrypted data as byte {@link string}.
     */
    NodeCryptography.prototype.decryptString = function (key, text) {
        var ciphertext = buffer_1.Buffer.from(text);
        var bIv = ciphertext.slice(0, NodeCryptography.IV_LENGTH);
        var bCiphertext = ciphertext.slice(NodeCryptography.IV_LENGTH);
        var aes = (0, crypto_1.createDecipheriv)(this.algo, key, bIv);
        return buffer_1.Buffer.concat([aes.update(bCiphertext), aes.final()]).toString('utf8');
    };
    NodeCryptography.prototype.decryptFile = function (key, file, File) {
        return __awaiter(this, void 0, void 0, function () {
            var bKey;
            return __generator(this, function (_a) {
                bKey = this.getKey(key);
                /**
                 * Buffer type check also covers `string` which converted to the `Buffer` during file object creation.
                 */
                if (file.data instanceof buffer_1.Buffer) {
                    return [2 /*return*/, File.create({
                            name: file.name,
                            mimeType: file.mimeType,
                            data: this.decryptBuffer(bKey, file.data),
                        })];
                }
                if (file.data instanceof stream_1.Readable) {
                    return [2 /*return*/, File.create({
                            name: file.name,
                            mimeType: file.mimeType,
                            stream: this.decryptStream(bKey, file.data),
                        })];
                }
                throw new Error('Cannot decrypt this file. In Node.js file decryption supports only string, Buffer or Stream.');
            });
        });
    };
    Object.defineProperty(NodeCryptography.prototype, "algo", {
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Cryptography algorithm.
         *
         * @returns Cryptography module algorithm.
         */
        get: function () {
            return 'aes-256-cbc';
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Convert cipher key to the {@link Buffer}.
     *
     * @param key - String cipher key.
     *
     * @returns SHA256 HEX encoded cipher key {@link Buffer}.
     */
    NodeCryptography.prototype.getKey = function (key) {
        var sha = (0, crypto_1.createHash)('sha256');
        sha.update(buffer_1.Buffer.from(key, 'utf8'));
        return buffer_1.Buffer.from(sha.digest('hex').slice(0, 32), 'utf8');
    };
    /**
     * Generate random initialization vector.
     *
     * @returns Random initialization vector.
     */
    NodeCryptography.prototype.getIv = function () {
        return (0, crypto_1.randomBytes)(NodeCryptography.IV_LENGTH);
    };
    /**
     * Random initialization vector size.
     */
    NodeCryptography.IV_LENGTH = 16;
    return NodeCryptography;
}());
exports.default = NodeCryptography;
