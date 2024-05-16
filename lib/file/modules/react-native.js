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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubFile = void 0;
// endregion
class PubNubFile {
    // endregion
    static create(file) {
        return new PubNubFile(file);
    }
    constructor(file) {
        let fileData;
        let contentLength;
        let fileMimeType;
        let fileName;
        if (file instanceof File) {
            fileData = file;
            fileName = file.name;
            fileMimeType = file.type;
            contentLength = file.size;
        }
        else if ('data' in file) {
            const contents = file.data;
            fileMimeType = file.mimeType;
            fileName = file.name;
            fileData = new File([contents], fileName, { type: fileMimeType });
            contentLength = fileData.size;
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
        if (contentLength)
            this.contentLength = contentLength;
        this.mimeType = fileMimeType;
        this.data = fileData;
        this.name = fileName;
    }
    /**
     * Convert {@link PubNub} File object content to {@link Buffer}.
     *
     * @throws Error because {@link Buffer} not available in React Native environment.
     */
    toBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('This feature is only supported in Node.js environments.');
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
     *
     * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    toArrayBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data && this.data instanceof File) {
                const data = this.data;
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.addEventListener('load', () => {
                        if (reader.result instanceof ArrayBuffer)
                            return resolve(reader.result);
                    });
                    reader.addEventListener('error', () => reject(reader.error));
                    reader.readAsArrayBuffer(data);
                });
            }
            else if (this.data && 'uri' in this.data) {
                throw new Error('This file contains a file URI and does not contain the file contents.');
            }
            else if (this.data) {
                let result;
                try {
                    result = yield this.data.arrayBuffer();
                }
                catch (error) {
                    throw new Error(`Unable to support toArrayBuffer in ReactNative environment: ${error}`);
                }
                return result;
            }
            throw new Error('Unable convert provided file content type to ArrayBuffer');
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link string}.
     *
     * @returns Asynchronous results of conversion to the {@link string}.
     */
    toString() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data && 'uri' in this.data)
                return JSON.stringify(this.data);
            else if (this.data && this.data instanceof File) {
                const data = this.data;
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.addEventListener('load', () => {
                        if (typeof reader.result === 'string')
                            return resolve(reader.result);
                    });
                    reader.addEventListener('error', () => reject(reader.error));
                    reader.readAsBinaryString(data);
                });
            }
            return this.data.text();
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link Readable} stream.
     *
     * @throws Error because {@link Readable} stream not available in React Native environment.
     */
    toStream() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('This feature is only supported in Node.js environments.');
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link File}.
     *
     * @returns Asynchronous results of conversion to the {@link File}.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    toFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data instanceof File)
                return this.data;
            else if ('uri' in this.data)
                throw new Error('This file contains a file URI and does not contain the file contents.');
            else
                return this.data.blob();
        });
    }
    /**
     * Convert {@link PubNub} File object content to file `Uri`.
     *
     * @returns Asynchronous results of conversion to file `Uri`.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    toFileUri() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data && 'uri' in this.data)
                return this.data;
            throw new Error('This file does not contain a file URI');
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link Blob}.
     *
     * @returns Asynchronous results of conversion to the {@link Blob}.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    toBlob() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data instanceof File)
                return this.data;
            else if (this.data && 'uri' in this.data)
                throw new Error('This file contains a file URI and does not contain the file contents.');
            else
                return this.data.blob();
        });
    }
}
exports.PubNubFile = PubNubFile;
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
exports.default = PubNubFile;
