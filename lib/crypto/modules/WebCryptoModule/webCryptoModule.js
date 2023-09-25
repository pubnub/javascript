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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var endpoint_1 = require("../../../core/components/endpoint");
var legacyCryptor_1 = __importDefault(require("./legacyCryptor"));
var aesCbcCryptor_1 = __importDefault(require("./aesCbcCryptor"));
var CryptoModule = /** @class */ (function () {
    function CryptoModule(cryptoModuleConfiguration) {
        var _a;
        this.defaultCryptor = cryptoModuleConfiguration.default;
        this.cryptors = (_a = cryptoModuleConfiguration.cryptors) !== null && _a !== void 0 ? _a : [];
    }
    //@ts-ignore: type detection issue with old Config type assignment
    CryptoModule.legacyCryptoModule = function (_a) {
        var config = _a.config;
        return new this({
            default: new legacyCryptor_1.default({ config: config }),
            cryptors: [new aesCbcCryptor_1.default(config.cipherKey)],
        });
    };
    CryptoModule.aesCbcCryptoModule = function (config) {
        return new this({
            default: new aesCbcCryptor_1.default(config.cipherKey),
            cryptors: [new legacyCryptor_1.default({ config: config })],
        });
    };
    CryptoModule.withDefaultCryptor = function (defaultCryptor) {
        return new this({ default: defaultCryptor });
    };
    CryptoModule.prototype.getAllCryptors = function () {
        return __spreadArray([this.defaultCryptor], __read(this.cryptors), false);
    };
    CryptoModule.prototype.encrypt = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var encrypted, header, headerData, pos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.defaultCryptor.encrypt(data)];
                    case 1:
                        encrypted = _a.sent();
                        if (!encrypted.metadata)
                            return [2 /*return*/, encrypted.data];
                        header = CryptorHeader.from(this.defaultCryptor.identifier, encrypted.metadata);
                        headerData = new Uint8Array(header.length);
                        pos = 0;
                        headerData.set(header.data, pos);
                        pos += header.length;
                        if (encrypted.metadata) {
                            pos -= encrypted.metadata.byteLength;
                            headerData.set(new Uint8Array(encrypted.metadata), pos);
                        }
                        return [2 /*return*/, this.concatArrayBuffer(headerData.buffer, encrypted.data)];
                }
            });
        });
    };
    CryptoModule.prototype.decrypt = function (encryptedData) {
        return __awaiter(this, void 0, void 0, function () {
            var header, cryptor, metadata;
            return __generator(this, function (_a) {
                header = CryptorHeader.tryParse(encryptedData);
                cryptor = this.getCryptor(header);
                metadata = header.length > 0
                    ? encryptedData.slice(header.length - header.metadataLength, header.length)
                    : null;
                //@ts-ignore: cryptor will be there or unreachable due to exception
                return [2 /*return*/, cryptor.decrypt({
                        data: encryptedData.slice(header.length),
                        metadata: metadata,
                    })];
            });
        });
    };
    CryptoModule.prototype.encryptFile = function (file, File) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        /**
                         * Files handled differently in case of Legacy cryptor.
                         * (as long as we support legacy need to check on default cryptor)
                         */
                        //@ts-ignore: default cryptor will be there. As long as legacy cryptor supported.
                        if (this.defaultCryptor.identifier === '')
                            return [2 /*return*/, this.defaultCryptor.encryptFile(file, File)];
                        if (!(file.data instanceof Buffer)) return [3 /*break*/, 2];
                        _b = (_a = File).create;
                        _c = {
                            name: file.name,
                            mimeType: 'application/octet-stream'
                        };
                        return [4 /*yield*/, this.encrypt(file.data)];
                    case 1: return [2 /*return*/, _b.apply(_a, [(
                            //@ts-ignore: can not infer that PubNubFile has data field
                            _c.data = _d.sent(),
                                _c)])];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    CryptoModule.prototype.decryptFile = function (file, File) {
        return __awaiter(this, void 0, void 0, function () {
            var header, cryptor, _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(file.data instanceof Buffer)) return [3 /*break*/, 2];
                        header = CryptorHeader.tryParse(file.data);
                        cryptor = this.getCryptor(header);
                        /**
                         * If It's legacyone then redirect it.
                         * (as long as we support legacy need to check on instance type)
                         */
                        //@ts-ignore: cryptor will be there or unreachable due to exception
                        if (cryptor.identifier === CryptoModule.LEGACY_IDENTIFIER)
                            return [2 /*return*/, cryptor.decryptFile(file, File)];
                        _b = (_a = File).create;
                        _c = {
                            name: file.name
                        };
                        return [4 /*yield*/, this.decrypt(file.data)];
                    case 1: return [2 /*return*/, _b.apply(_a, [(
                            //@ts-ignore: can not infer that PubNubFile has data field
                            _c.data = _d.sent(),
                                _c)])];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    CryptoModule.prototype.getCryptor = function (header) {
        if (header === '') {
            var cryptor = this.getAllCryptors().find(function (c) { return c.identifier === ''; });
            if (cryptor)
                return cryptor;
            throw new Error('unknown cryptor');
        }
        else if (header instanceof CryptorHeaderV1) {
            return this.getCryptorFromId(header.identifier);
        }
    };
    CryptoModule.prototype.getCryptorFromId = function (id) {
        var cryptor = this.getAllCryptors().find(function (c) { return id === c.identifier; });
        if (cryptor) {
            return cryptor;
        }
        throw Error('unknown cryptor');
    };
    CryptoModule.prototype.concatArrayBuffer = function (ab1, ab2) {
        var tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
        tmp.set(new Uint8Array(ab1), 0);
        tmp.set(new Uint8Array(ab2), ab1.byteLength);
        return tmp.buffer;
    };
    CryptoModule.LEGACY_IDENTIFIER = '';
    return CryptoModule;
}());
exports.default = CryptoModule;
// CryptorHeader Utility
var CryptorHeader = /** @class */ (function () {
    function CryptorHeader() {
    }
    CryptorHeader.from = function (id, metadata) {
        if (id === CryptorHeader.LEGACY_IDENTIFIER)
            return;
        return new CryptorHeaderV1(id, metadata.byteLength);
    };
    CryptorHeader.tryParse = function (encryptedData) {
        var sentinel = '';
        var version = null;
        if (encryptedData.byteLength >= 4) {
            sentinel = encryptedData.slice(0, 4);
            if (sentinel.toString('utf8') !== CryptorHeader.SENTINEL)
                return '';
        }
        if (encryptedData.byteLength >= 5) {
            version = encryptedData[4];
        }
        else {
            throw new endpoint_1.PubNubError('decryption error');
        }
        if (version > CryptorHeader.MAX_VERSION)
            throw new endpoint_1.PubNubError('unknown cryptor');
        var identifier = '';
        var pos = 5 + CryptorHeader.IDENTIFIER_LENGTH;
        if (encryptedData.byteLength >= pos) {
            identifier = encryptedData.slice(5, pos);
        }
        else {
            throw new endpoint_1.PubNubError('decryption error');
        }
        var headerSize = null;
        if (encryptedData.byteLength > pos + 1) {
            headerSize = encryptedData[pos];
        }
        pos += 1;
        if (headerSize === 255 && encryptedData.byteLength >= pos + 2) {
            headerSize = new Uint16Array(encryptedData.slice(pos, pos + 3)).reduce(function (acc, val) { return (acc << 8) + val; }, 0);
            pos += 2;
        }
        return new CryptorHeaderV1(identifier.toString('utf8'), headerSize);
    };
    CryptorHeader.SENTINEL = 'PNED';
    CryptorHeader.LEGACY_IDENTIFIER = '';
    CryptorHeader.IDENTIFIER_LENGTH = 4;
    CryptorHeader.MAX_VERSION = 1;
    return CryptorHeader;
}());
// v1 CryptorHeader
var CryptorHeaderV1 = /** @class */ (function () {
    function CryptorHeaderV1(id, metadataLength) {
        this._identifier = id;
        this._metadataLength = metadataLength;
    }
    Object.defineProperty(CryptorHeaderV1.prototype, "identifier", {
        get: function () {
            return this._identifier;
        },
        set: function (value) {
            this._identifier = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CryptorHeaderV1.prototype, "metadataLength", {
        get: function () {
            return this._metadataLength;
        },
        set: function (value) {
            this._metadataLength = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CryptorHeaderV1.prototype, "version", {
        get: function () {
            return CryptorHeaderV1.VERSION;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CryptorHeaderV1.prototype, "length", {
        get: function () {
            return (CryptorHeaderV1.SENTINEL.length +
                1 +
                CryptorHeaderV1.IDENTIFIER_LENGTH +
                (this.metadataLength < 255 ? 1 : 3) +
                this.metadataLength);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CryptorHeaderV1.prototype, "data", {
        get: function () {
            var pos = 0;
            var header = new Uint8Array(this.length);
            var encoder = new TextEncoder();
            header.set(encoder.encode(CryptorHeaderV1.SENTINEL));
            pos += CryptorHeaderV1.SENTINEL.length;
            header[pos] = this.version;
            pos++;
            if (this.identifier)
                header.set(encoder.encode(this.identifier), pos);
            pos += CryptorHeaderV1.IDENTIFIER_LENGTH;
            var metadata_size = this.metadataLength;
            if (metadata_size < 255) {
                header[pos] = metadata_size;
            }
            else {
                header.set([255, metadata_size >> 8, metadata_size & 0xff], pos);
            }
            return header;
        },
        enumerable: false,
        configurable: true
    });
    CryptorHeaderV1.IDENTIFIER_LENGTH = 4;
    CryptorHeaderV1.SENTINEL = 'PNED';
    CryptorHeaderV1.VERSION = 1;
    return CryptorHeaderV1;
}());