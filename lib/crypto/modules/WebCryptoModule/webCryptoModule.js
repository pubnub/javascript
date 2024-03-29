"use strict";
/**
 * Browser crypto module.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebCryptoModule = exports.AesCbcCryptor = exports.LegacyCryptor = void 0;
var crypto_module_1 = require("../../../core/interfaces/crypto-module");
var web_1 = require("../../../file/modules/web");
var base64_codec_1 = require("../../../core/components/base64_codec");
var PubNubError_1 = require("../../../models/PubNubError");
var aesCbcCryptor_1 = __importDefault(require("./aesCbcCryptor"));
exports.AesCbcCryptor = aesCbcCryptor_1.default;
var legacyCryptor_1 = __importDefault(require("./legacyCryptor"));
exports.LegacyCryptor = legacyCryptor_1.default;
/**
 * CryptoModule for browser platform.
 */
var WebCryptoModule = /** @class */ (function (_super) {
    __extends(WebCryptoModule, _super);
    function WebCryptoModule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // --------------------------------------------------------
    // --------------- Convenience functions ------------------
    // -------------------------------------------------------
    // region Convenience functions
    WebCryptoModule.legacyCryptoModule = function (config) {
        var _a;
        if (!config.cipherKey)
            throw new PubNubError_1.PubNubError('Crypto module error: cipher key not set.');
        return new WebCryptoModule({
            default: new legacyCryptor_1.default(__assign(__assign({}, config), { useRandomIVs: (_a = config.useRandomIVs) !== null && _a !== void 0 ? _a : true })),
            cryptors: [new aesCbcCryptor_1.default({ cipherKey: config.cipherKey })],
        });
    };
    WebCryptoModule.aesCbcCryptoModule = function (config) {
        var _a;
        if (!config.cipherKey)
            throw new PubNubError_1.PubNubError('Crypto module error: cipher key not set.');
        return new WebCryptoModule({
            default: new aesCbcCryptor_1.default({ cipherKey: config.cipherKey }),
            cryptors: [
                new legacyCryptor_1.default(__assign(__assign({}, config), { useRandomIVs: (_a = config.useRandomIVs) !== null && _a !== void 0 ? _a : true })),
            ],
        });
    };
    /**
     * Construct crypto module with `cryptor` as default for data encryption and decryption.
     *
     * @param defaultCryptor - Default cryptor for data encryption and decryption.
     *
     * @returns Crypto module with pre-configured default cryptor.
     */
    WebCryptoModule.withDefaultCryptor = function (defaultCryptor) {
        return new this({ default: defaultCryptor });
    };
    // endregion
    // --------------------------------------------------------
    // --------------------- Encryption -----------------------
    // --------------------------------------------------------
    // region Encryption
    WebCryptoModule.prototype.encrypt = function (data) {
        // Encrypt data.
        var encrypted = data instanceof ArrayBuffer && this.defaultCryptor.identifier === WebCryptoModule.LEGACY_IDENTIFIER
            ? this.defaultCryptor.encrypt(WebCryptoModule.decoder.decode(data))
            : this.defaultCryptor.encrypt(data);
        if (!encrypted.metadata)
            return encrypted.data;
        var headerData = this.getHeaderData(encrypted);
        return this.concatArrayBuffer(headerData, encrypted.data);
    };
    WebCryptoModule.prototype.encryptFile = function (file, File) {
        return __awaiter(this, void 0, void 0, function () {
            var fileData, encrypted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /**
                         * Files handled differently in case of Legacy cryptor.
                         * (as long as we support legacy need to check on instance type)
                         */
                        if (this.defaultCryptor.identifier === CryptorHeader.LEGACY_IDENTIFIER)
                            return [2 /*return*/, this.defaultCryptor.encryptFile(file, File)];
                        return [4 /*yield*/, this.getFileData(file)];
                    case 1:
                        fileData = _a.sent();
                        return [4 /*yield*/, this.defaultCryptor.encryptFileData(fileData)];
                    case 2:
                        encrypted = _a.sent();
                        return [2 /*return*/, File.create({
                                name: file.name,
                                mimeType: 'application/octet-stream',
                                data: this.concatArrayBuffer(this.getHeaderData(encrypted), encrypted.data),
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
    WebCryptoModule.prototype.decrypt = function (data) {
        var encryptedData = typeof data === 'string' ? (0, base64_codec_1.decode)(data) : data;
        var header = CryptorHeader.tryParse(encryptedData);
        var cryptor = this.getCryptor(header);
        var metadata = header.length > 0
            ? encryptedData.slice(header.length - header.metadataLength, header.length)
            : null;
        if (encryptedData.slice(header.length).byteLength <= 0)
            throw new Error('Decryption error: empty content');
        return cryptor.decrypt({
            data: encryptedData.slice(header.length),
            metadata: metadata,
        });
    };
    WebCryptoModule.prototype.decryptFile = function (file, File) {
        return __awaiter(this, void 0, void 0, function () {
            var data, header, cryptor, fileData, metadata, _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, file.data.arrayBuffer()];
                    case 1:
                        data = _d.sent();
                        header = CryptorHeader.tryParse(data);
                        cryptor = this.getCryptor(header);
                        /**
                         * Files handled differently in case of Legacy cryptor.
                         * (as long as we support legacy need to check on instance type)
                         */
                        if ((cryptor === null || cryptor === void 0 ? void 0 : cryptor.identifier) === CryptorHeader.LEGACY_IDENTIFIER)
                            return [2 /*return*/, cryptor.decryptFile(file, File)];
                        return [4 /*yield*/, this.getFileData(data)];
                    case 2:
                        fileData = _d.sent();
                        metadata = fileData.slice(header.length - header.metadataLength, header.length);
                        _b = (_a = File).create;
                        _c = {
                            name: file.name
                        };
                        return [4 /*yield*/, this.defaultCryptor.decryptFileData({
                                data: data.slice(header.length),
                                metadata: metadata,
                            })];
                    case 3: return [2 /*return*/, _b.apply(_a, [(_c.data = _d.sent(),
                                _c)])];
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
     * Retrieve registered cryptor by its identifier.
     *
     * @param id - Unique cryptor identifier.
     *
     * @returns Registered cryptor with specified identifier.
     *
     * @throws Error if cryptor with specified {@link id} can't be found.
     */
    WebCryptoModule.prototype.getCryptorFromId = function (id) {
        var cryptor = this.getAllCryptors().find(function (cryptor) { return id === cryptor.identifier; });
        if (cryptor)
            return cryptor;
        throw Error('Unknown cryptor error');
    };
    /**
     * Retrieve cryptor by its identifier.
     *
     * @param header - Header with cryptor-defined data or raw cryptor identifier.
     *
     * @returns Cryptor which correspond to provided {@link header}.
     */
    WebCryptoModule.prototype.getCryptor = function (header) {
        if (typeof header === 'string') {
            var cryptor = this.getAllCryptors().find(function (cryptor) { return cryptor.identifier === header; });
            if (cryptor)
                return cryptor;
            throw new Error('Unknown cryptor error');
        }
        else if (header instanceof CryptorHeaderV1) {
            return this.getCryptorFromId(header.identifier);
        }
    };
    /**
     * Create cryptor header data.
     *
     * @param encrypted - Encryption data object as source for header data.
     *
     * @returns Binary representation of the cryptor header data.
     */
    WebCryptoModule.prototype.getHeaderData = function (encrypted) {
        if (!encrypted.metadata)
            return;
        var header = CryptorHeader.from(this.defaultCryptor.identifier, encrypted.metadata);
        var headerData = new Uint8Array(header.length);
        var pos = 0;
        headerData.set(header.data, pos);
        pos += header.length - encrypted.metadata.byteLength;
        headerData.set(new Uint8Array(encrypted.metadata), pos);
        return headerData.buffer;
    };
    /**
     * Merge two {@link ArrayBuffer} instances.
     *
     * @param ab1 - First {@link ArrayBuffer}.
     * @param ab2 - Second {@link ArrayBuffer}.
     *
     * @returns Merged data as {@link ArrayBuffer}.
     */
    WebCryptoModule.prototype.concatArrayBuffer = function (ab1, ab2) {
        var tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
        tmp.set(new Uint8Array(ab1), 0);
        tmp.set(new Uint8Array(ab2), ab1.byteLength);
        return tmp.buffer;
    };
    /**
     * Retrieve file content.
     *
     * @param file - Content of the {@link PubNub} File object.
     *
     * @returns Normalized file {@link data} as {@link ArrayBuffer};
     */
    WebCryptoModule.prototype.getFileData = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (file instanceof ArrayBuffer)
                    return [2 /*return*/, file];
                else if (file instanceof web_1.PubNubFile)
                    return [2 /*return*/, file.toArrayBuffer()];
                throw new Error('Cannot decrypt/encrypt file. In browsers file encrypt/decrypt supported for string, ArrayBuffer or Blob');
            });
        });
    };
    /**
     * {@link LegacyCryptor|Legacy} cryptor identifier.
     */
    WebCryptoModule.LEGACY_IDENTIFIER = '';
    return WebCryptoModule;
}(crypto_module_1.AbstractCryptoModule));
exports.WebCryptoModule = WebCryptoModule;
/**
 * CryptorHeader Utility
 */
var CryptorHeader = /** @class */ (function () {
    function CryptorHeader() {
    }
    CryptorHeader.from = function (id, metadata) {
        if (id === CryptorHeader.LEGACY_IDENTIFIER)
            return;
        return new CryptorHeaderV1(id, metadata.byteLength);
    };
    CryptorHeader.tryParse = function (data) {
        var encryptedData = new Uint8Array(data);
        var sentinel;
        var version = null;
        if (encryptedData.byteLength >= 4) {
            sentinel = encryptedData.slice(0, 4);
            if (this.decoder.decode(sentinel) !== CryptorHeader.SENTINEL)
                return WebCryptoModule.LEGACY_IDENTIFIER;
        }
        if (encryptedData.byteLength >= 5)
            version = encryptedData[4];
        else
            throw new Error('Decryption error: invalid header version');
        if (version > CryptorHeader.MAX_VERSION)
            throw new Error('Decryption error: Unknown cryptor error');
        var identifier;
        var pos = 5 + CryptorHeader.IDENTIFIER_LENGTH;
        if (encryptedData.byteLength >= pos)
            identifier = encryptedData.slice(5, pos);
        else
            throw new Error('Decryption error: invalid crypto identifier');
        var metadataLength = null;
        if (encryptedData.byteLength >= pos + 1)
            metadataLength = encryptedData[pos];
        else
            throw new Error('Decryption error: invalid metadata length');
        pos += 1;
        if (metadataLength === 255 && encryptedData.byteLength >= pos + 2) {
            metadataLength = new Uint16Array(encryptedData.slice(pos, pos + 2)).reduce(function (acc, val) { return (acc << 8) + val; }, 0);
        }
        return new CryptorHeaderV1(this.decoder.decode(identifier), metadataLength);
    };
    CryptorHeader.SENTINEL = 'PNED';
    CryptorHeader.LEGACY_IDENTIFIER = '';
    CryptorHeader.IDENTIFIER_LENGTH = 4;
    CryptorHeader.VERSION = 1;
    CryptorHeader.MAX_VERSION = 1;
    CryptorHeader.decoder = new TextDecoder();
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
            return CryptorHeader.VERSION;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CryptorHeaderV1.prototype, "length", {
        get: function () {
            return (CryptorHeader.SENTINEL.length +
                1 +
                CryptorHeader.IDENTIFIER_LENGTH +
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
            header.set(encoder.encode(CryptorHeader.SENTINEL));
            pos += CryptorHeader.SENTINEL.length;
            header[pos] = this.version;
            pos++;
            if (this.identifier)
                header.set(encoder.encode(this.identifier), pos);
            var metadataLength = this.metadataLength;
            pos += CryptorHeader.IDENTIFIER_LENGTH;
            if (metadataLength < 255)
                header[pos] = metadataLength;
            else
                header.set([255, metadataLength >> 8, metadataLength & 0xff], pos);
            return header;
        },
        enumerable: false,
        configurable: true
    });
    CryptorHeaderV1.IDENTIFIER_LENGTH = 4;
    CryptorHeaderV1.SENTINEL = 'PNED';
    return CryptorHeaderV1;
}());
