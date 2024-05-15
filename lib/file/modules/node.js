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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const buffer_1 = require("buffer");
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
// endregion
/**
 * Node.js implementation for {@link PubNub} File object.
 *
 * **Important:** Class should implement constructor and class fields from {@link PubNubFileConstructor}.
 */
class PubNubFile {
    // endregion
    static create(file) {
        return new PubNubFile(file);
    }
    constructor(file) {
        const { stream, data, encoding, name, mimeType } = file;
        let fileData;
        let contentLength;
        let fileMimeType;
        let fileName;
        if (stream && stream instanceof stream_1.Readable) {
            fileData = stream;
            if (stream instanceof fs_1.default.ReadStream) {
                const streamFilePath = stream.path instanceof buffer_1.Buffer ? new TextDecoder().decode(stream.path) : stream.path;
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
    /**
     * Convert {@link PubNub} File object content to {@link Buffer}.
     *
     * @returns Asynchronous results of conversion to the {@link Buffer}.
     */
    toBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data instanceof buffer_1.Buffer)
                return this.data;
            const stream = this.data;
            return new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                stream.on('end', () => {
                    resolve(buffer_1.Buffer.concat(chunks));
                });
                // Handle any errors during streaming
                stream.on('error', (error) => reject(error));
            });
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
     *
     * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
     */
    toArrayBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.toBuffer().then((buffer) => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length));
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link string}.
     *
     * @returns Asynchronous results of conversion to the {@link string}.
     */
    toString() {
        return __awaiter(this, arguments, void 0, function* (encoding = 'utf8') {
            return this.toBuffer().then((buffer) => buffer.toString(encoding));
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link Readable} stream.
     *
     * @returns Asynchronous results of conversion to the {@link Readable} stream.
     */
    toStream() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data instanceof stream_1.Readable) {
                const stream = new stream_1.PassThrough();
                this.data.pipe(stream);
                return stream;
            }
            return this.toBuffer().then((buffer) => new stream_1.Readable({
                read() {
                    this.push(buffer);
                    this.push(null);
                },
            }));
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link File}.
     *
     * @throws Error because {@link File} not available in Node.js environment.
     */
    toFile() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('This feature is only supported in browser environments.');
        });
    }
    /**
     * Convert {@link PubNub} File object content to file `Uri`.
     *
     * @throws Error because file `Uri` not available in Node.js environment.
     */
    toFileUri() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('This feature is only supported in React Native environments.');
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link Blob}.
     *
     * @throws Error because {@link Blob} not available in Node.js environment.
     */
    toBlob() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('This feature is only supported in browser environments.');
        });
    }
}
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
exports.default = PubNubFile;
