"use strict";
/* global File, FileReader */
/**
 * React Native {@link PubNub} File object module.
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
exports.PubNubFile = void 0;
// endregion
var PubNubFile = /** @class */ (function () {
    function PubNubFile(file) {
        var fileMimeType;
        var fileName;
        var fileData;
        if (file instanceof File) {
            fileData = file;
            fileName = file.name;
            fileMimeType = file.type;
        }
        else if ('data' in file) {
            var contents = file.data;
            fileMimeType = file.mimeType;
            fileName = file.name;
            fileData = new File([contents], fileName, { type: fileMimeType });
        }
        else if ('uri' in file) {
            fileMimeType = file.mimeType;
            fileName = file.name;
            fileData = {
                uri: file.uri,
                name: file.name,
                type: file.mimeType,
            };
        }
        else
            throw new Error("Couldn't construct a file out of supplied options. URI or file data required.");
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
     * @throws Error because {@link Buffer} not available in React Native environment.
     */
    PubNubFile.prototype.toBuffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('This feature is only supported in Node.js environments.');
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
     *
     * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    PubNubFile.prototype.toArrayBuffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data_1, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.data && this.data instanceof File)) return [3 /*break*/, 1];
                        data_1 = this.data;
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var reader = new FileReader();
                                reader.addEventListener('load', function () {
                                    if (reader.result instanceof ArrayBuffer)
                                        return resolve(reader.result);
                                });
                                reader.addEventListener('error', function () { return reject(reader.error); });
                                reader.readAsArrayBuffer(data_1);
                            })];
                    case 1:
                        if (!(this.data && 'uri' in this.data)) return [3 /*break*/, 2];
                        throw new Error('This file contains a file URI and does not contain the file contents.');
                    case 2:
                        if (!this.data) return [3 /*break*/, 7];
                        result = void 0;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.data.arrayBuffer()];
                    case 4:
                        result = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        throw new Error("Unable to support toArrayBuffer in ReactNative environment: ".concat(error_1));
                    case 6: return [2 /*return*/, result];
                    case 7: throw new Error('Unable convert provided file content type to ArrayBuffer');
                }
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to {@link string}.
     *
     * @returns Asynchronous results of conversion to the {@link string}.
     */
    PubNubFile.prototype.toString = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data_2;
            return __generator(this, function (_a) {
                if (this.data && 'uri' in this.data)
                    return [2 /*return*/, JSON.stringify(this.data)];
                else if (this.data && this.data instanceof File) {
                    data_2 = this.data;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var reader = new FileReader();
                            reader.addEventListener('load', function () {
                                if (typeof reader.result === 'string')
                                    return resolve(reader.result);
                            });
                            reader.addEventListener('error', function () { return reject(reader.error); });
                            reader.readAsBinaryString(data_2);
                        })];
                }
                return [2 /*return*/, this.data.text()];
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to {@link Readable} stream.
     *
     * @throws Error because {@link Readable} stream not available in React Native environment.
     */
    PubNubFile.prototype.toStream = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('This feature is only supported in Node.js environments.');
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to {@link File}.
     *
     * @returns Asynchronous results of conversion to the {@link File}.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    PubNubFile.prototype.toFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.data instanceof File)
                    return [2 /*return*/, this.data];
                else if ('uri' in this.data)
                    throw new Error('This file contains a file URI and does not contain the file contents.');
                else
                    return [2 /*return*/, this.data.blob()];
                return [2 /*return*/];
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to file `Uri`.
     *
     * @returns Asynchronous results of conversion to file `Uri`.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    PubNubFile.prototype.toFileUri = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.data && 'uri' in this.data)
                    return [2 /*return*/, this.data];
                throw new Error('This file does not contain a file URI');
            });
        });
    };
    /**
     * Convert {@link PubNub} File object content to {@link Blob}.
     *
     * @returns Asynchronous results of conversion to the {@link Blob}.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    PubNubFile.prototype.toBlob = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.data instanceof File)
                    return [2 /*return*/, this.data];
                else if (this.data && 'uri' in this.data)
                    throw new Error('This file contains a file URI and does not contain the file contents.');
                else
                    return [2 /*return*/, this.data.blob()];
                return [2 /*return*/];
            });
        });
    };
    // region Class properties
    /**
     * Whether {@link Blob} data supported by platform or not.
     */
    PubNubFile.supportsBlob = typeof Blob !== 'undefined';
    /**
     * Whether {@link File} data supported by platform or not.
     */
    PubNubFile.supportsFile = typeof File !== 'undefined';
    /**
     * Whether {@link Buffer} data supported by platform or not.
     */
    PubNubFile.supportsBuffer = false;
    /**
     * Whether {@link Stream} data supported by platform or not.
     */
    PubNubFile.supportsStream = false;
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
    PubNubFile.supportsEncryptFile = false;
    /**
     * Whether `File Uri` data supported by platform or not.
     */
    PubNubFile.supportsFileUri = true;
    return PubNubFile;
}());
exports.PubNubFile = PubNubFile;
exports.default = PubNubFile;
