"use strict";
/**
 * Node.js {@link PubNub} File object module.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var buffer_1 = require("buffer");
var path_1 = require("path");
var fs_1 = __importDefault(require("fs"));
// endregion
/**
 * Node.js implementation for {@link PubNub} File object.
 *
 * **Important:** Class should implement constructor and class fields from {@link PubNubFileConstructor}.
 */
var PubNubFile = /** @class */ (function () {
    function PubNubFile(file) {
        var stream = file.stream, data = file.data, encoding = file.encoding, name = file.name, mimeType = file.mimeType;
        var fileData;
        var contentLength;
        var fileMimeType;
        var fileName;
        if (stream && stream instanceof stream_1.Readable) {
            fileData = stream;
            if (stream instanceof fs_1.default.ReadStream) {
                var streamFilePath = stream.path instanceof buffer_1.Buffer ? new TextDecoder().decode(stream.path) : stream.path;
                fileName = (0, path_1.basename)(streamFilePath);
                contentLength = fs_1.default.statSync(streamFilePath).size;
            }
        }
        else if (data instanceof buffer_1.Buffer) {
            contentLength = data.length;
            // Copy content of the source Buffer.
            fileData = buffer_1.Buffer.alloc(contentLength);
            data.copy(fileData);
        }
        else if (data instanceof ArrayBuffer) {
            contentLength = data.byteLength;
            fileData = buffer_1.Buffer.from(data);
        }
        else if (typeof data === 'string') {
            fileData = buffer_1.Buffer.from(data, encoding !== null && encoding !== void 0 ? encoding : 'utf8');
            contentLength = fileData.length;
        }
        if (contentLength)
            this.contentLength = contentLength;
        if (mimeType)
            fileMimeType = mimeType;
        else
            fileMimeType = 'application/octet-stream';
        if (name)
            fileName = (0, path_1.basename)(name);
        if (fileData === undefined)
            throw new Error("Couldn't construct a file out of supplied options.");
        if (fileName === undefined)
            throw new Error("Couldn't guess filename out of the options. Please provide one.");
        this.mimeType = fileMimeType;
        this.data = fileData;
        this.name = fileName;
    }
    // endregion
    PubNubFile.create = function (file) {
        return new PubNubFile(file);
    };
    /**
     * Convert {@link PubNub} File object content to {@link Buffer}.
     *
     * @returns Asynchronous results of conversion to the {@link Buffer}.
     */
    PubNubFile.prototype.toBuffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stream;
            return __generator(this, function (_a) {
                if (this.data instanceof buffer_1.Buffer)
                    return [2 /*return*/, this.data];
                stream = this.data;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var chunks = [];
                        stream.on('data', function (chunk) {
                            chunks.push(chunk);
                        });
                        stream.on('end', function () {
                            resolve(buffer_1.Buffer.concat(chunks));
                        });
                        // Handle any errors during streaming
                        stream.on('error', function (error) { return reject(error); });
                    })];
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
     *
     * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
     */
    PubNubFile.prototype.toArrayBuffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.toBuffer().then(function (buffer) { return buffer.buffer; })];
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to {@link string}.
     *
     * @returns Asynchronous results of conversion to the {@link string}.
     */
    PubNubFile.prototype.toString = function () {
        return __awaiter(this, arguments, void 0, function (encoding) {
            if (encoding === void 0) { encoding = 'utf8'; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.toBuffer().then(function (buffer) { return buffer.toString(encoding); })];
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to {@link Readable} stream.
     *
     * @returns Asynchronous results of conversion to the {@link Readable} stream.
     */
    PubNubFile.prototype.toStream = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stream;
            return __generator(this, function (_a) {
                if (this.data instanceof stream_1.Readable) {
                    stream = new stream_1.PassThrough();
                    this.data.pipe(stream);
                    return [2 /*return*/, stream];
                }
                return [2 /*return*/, this.toBuffer().then(function (buffer) {
                        return new stream_1.Readable({
                            read: function () {
                                this.push(buffer);
                                this.push(null);
                            },
                        });
                    })];
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to {@link File}.
     *
     * @throws Error because {@link File} not available in Node.js environment.
     */
    PubNubFile.prototype.toFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('This feature is only supported in browser environments.');
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to file `Uri`.
     *
     * @throws Error because file `Uri` not available in Node.js environment.
     */
    PubNubFile.prototype.toFileUri = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('This feature is only supported in React Native environments.');
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to {@link Blob}.
     *
     * @throws Error because {@link Blob} not available in Node.js environment.
     */
    PubNubFile.prototype.toBlob = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('This feature is only supported in browser environments.');
            });
        });
    };
    // region Class properties
    /**
     * Whether {@link Blob} data supported by platform or not.
     */
    PubNubFile.supportsBlob = false;
    /**
     * Whether {@link File} data supported by platform or not.
     */
    PubNubFile.supportsFile = false;
    /**
     * Whether {@link Buffer} data supported by platform or not.
     */
    PubNubFile.supportsBuffer = true;
    /**
     * Whether {@link Stream} data supported by platform or not.
     */
    PubNubFile.supportsStream = true;
    /**
     * Whether {@link String} data supported by platform or not.
     */
    PubNubFile.supportsString = true;
    /**
     * Whether {@link ArrayBuffer} supported by platform or not.
     */
    PubNubFile.supportsArrayBuffer = true;
    /**
     * Whether {@link PubNub} File object encryption supported or not.
     */
    PubNubFile.supportsEncryptFile = true;
    /**
     * Whether `File Uri` data supported by platform or not.
     */
    PubNubFile.supportsFileUri = false;
    return PubNubFile;
}());
exports.default = PubNubFile;
