/* global File, FileReader */
/**
 * Browser {@link PubNub} File object module.
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
// endregion
/**
 * Web implementation for {@link PubNub} File object.
 *
 * **Important:** Class should implement constructor and class fields from {@link PubNubFileConstructor}.
 */
export class PubNubFile {
    // endregion
    static create(file) {
        return new PubNubFile(file);
    }
    constructor(file) {
        let fileMimeType;
        let fileName;
        let fileData;
        if (file instanceof File) {
            fileData = file;
            fileName = file.name;
            fileMimeType = file.type;
        }
        else if ('data' in file) {
            const contents = file.data;
            fileMimeType = file.mimeType;
            fileName = file.name;
            fileData = new File([contents], fileName, { type: fileMimeType });
        }
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
     * @throws Error because {@link Buffer} not available in browser environment.
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
     */
    toArrayBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    if (reader.result instanceof ArrayBuffer)
                        return resolve(reader.result);
                });
                reader.addEventListener('error', () => reject(reader.error));
                reader.readAsArrayBuffer(this.data);
            });
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link string}.
     *
     * @returns Asynchronous results of conversion to the {@link string}.
     */
    toString() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    if (typeof reader.result === 'string') {
                        return resolve(reader.result);
                    }
                });
                reader.addEventListener('error', () => {
                    reject(reader.error);
                });
                reader.readAsBinaryString(this.data);
            });
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link Readable} stream.
     *
     * @throws Error because {@link Readable} stream not available in browser environment.
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
     */
    toFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.data;
        });
    }
    /**
     * Convert {@link PubNub} File object content to file `Uri`.
     *
     * @throws Error because file `Uri` not available in browser environment.
     */
    toFileUri() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('This feature is only supported in React Native environments.');
        });
    }
    /**
     * Convert {@link PubNub} File object content to {@link Blob}.
     *
     * @returns Asynchronous results of conversion to the {@link Blob}.
     */
    toBlob() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.data;
        });
    }
}
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
PubNubFile.supportsEncryptFile = true;
/**
 * Whether `File Uri` data supported by platform or not.
 */
PubNubFile.supportsFileUri = false;
