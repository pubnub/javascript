var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class PubNubFile {
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
    toBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('This feature is only supported in Node.js environments.');
        });
    }
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
    toStream() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('This feature is only supported in Node.js environments.');
        });
    }
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
    toFileUri() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data && 'uri' in this.data)
                return this.data;
            throw new Error('This file does not contain a file URI');
        });
    }
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
PubNubFile.supportsBlob = typeof Blob !== 'undefined';
PubNubFile.supportsFile = typeof File !== 'undefined';
PubNubFile.supportsBuffer = false;
PubNubFile.supportsStream = false;
PubNubFile.supportsString = true;
PubNubFile.supportsArrayBuffer = true;
PubNubFile.supportsEncryptFile = false;
PubNubFile.supportsFileUri = true;
export default PubNubFile;
