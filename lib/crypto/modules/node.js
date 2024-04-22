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
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const stream_1 = require("stream");
const buffer_1 = require("buffer");
class NodeCryptography {
    encrypt(key, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const bKey = this.getKey(key);
            if (input instanceof buffer_1.Buffer)
                return this.encryptBuffer(bKey, input);
            if (input instanceof stream_1.Readable)
                return this.encryptStream(bKey, input);
            if (typeof input === 'string')
                return this.encryptString(bKey, input);
            throw new Error('Encryption error: unsupported input format');
        });
    }
    encryptBuffer(key, buffer) {
        const bIv = this.getIv();
        const aes = (0, crypto_1.createCipheriv)(this.algo, key, bIv);
        return buffer_1.Buffer.concat([bIv, aes.update(buffer), aes.final()]);
    }
    encryptStream(key, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            const bIv = this.getIv();
            const aes = (0, crypto_1.createCipheriv)(this.algo, key, bIv).setAutoPadding(true);
            let initiated = false;
            return stream.pipe(aes).pipe(new stream_1.Transform({
                transform(chunk, _, cb) {
                    if (!initiated) {
                        initiated = true;
                        this.push(buffer_1.Buffer.concat([bIv, chunk]));
                    }
                    else
                        this.push(chunk);
                    cb();
                },
            }));
        });
    }
    encryptString(key, text) {
        const bIv = this.getIv();
        const bPlaintext = buffer_1.Buffer.from(text);
        const aes = (0, crypto_1.createCipheriv)(this.algo, key, bIv);
        return buffer_1.Buffer.concat([bIv, aes.update(bPlaintext), aes.final()]).toString('utf8');
    }
    encryptFile(key, file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            const bKey = this.getKey(key);
            if (file.data instanceof buffer_1.Buffer) {
                if (file.data.byteLength <= 0)
                    throw new Error('Encryption error: empty content.');
                return File.create({
                    name: file.name,
                    mimeType: file.mimeType,
                    data: this.encryptBuffer(bKey, file.data),
                });
            }
            if (file.data instanceof stream_1.Readable) {
                if (!file.contentLength || file.contentLength === 0)
                    throw new Error('Encryption error: empty content.');
                return File.create({
                    name: file.name,
                    mimeType: file.mimeType,
                    stream: yield this.encryptStream(bKey, file.data),
                });
            }
            throw new Error('Cannot encrypt this file. In Node.js file encryption supports only string, Buffer or Stream.');
        });
    }
    decrypt(key, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const bKey = this.getKey(key);
            if (input instanceof ArrayBuffer) {
                const decryptedBuffer = this.decryptBuffer(bKey, buffer_1.Buffer.from(input));
                return decryptedBuffer.buffer.slice(decryptedBuffer.byteOffset, decryptedBuffer.byteOffset + decryptedBuffer.length);
            }
            if (input instanceof buffer_1.Buffer)
                return this.decryptBuffer(bKey, input);
            if (input instanceof stream_1.Readable)
                return this.decryptStream(bKey, input);
            if (typeof input === 'string')
                return this.decryptString(bKey, input);
            throw new Error('Decryption error: unsupported input format');
        });
    }
    decryptBuffer(key, buffer) {
        const bIv = buffer.slice(0, NodeCryptography.IV_LENGTH);
        const bCiphertext = buffer.slice(NodeCryptography.IV_LENGTH);
        if (bCiphertext.byteLength <= 0)
            throw new Error('Decryption error: empty content');
        const aes = (0, crypto_1.createDecipheriv)(this.algo, key, bIv);
        return buffer_1.Buffer.concat([aes.update(bCiphertext), aes.final()]);
    }
    decryptStream(key, stream) {
        let aes = null;
        const output = new stream_1.PassThrough();
        let bIv = buffer_1.Buffer.alloc(0);
        const getIv = () => {
            let data = stream.read();
            while (data !== null) {
                if (data) {
                    const bChunk = buffer_1.Buffer.from(data);
                    const sliceLen = NodeCryptography.IV_LENGTH - bIv.byteLength;
                    if (bChunk.byteLength < sliceLen)
                        bIv = buffer_1.Buffer.concat([bIv, bChunk]);
                    else {
                        bIv = buffer_1.Buffer.concat([bIv, bChunk.slice(0, sliceLen)]);
                        aes = (0, crypto_1.createDecipheriv)(this.algo, key, bIv);
                        aes.pipe(output);
                        aes.write(bChunk.slice(sliceLen));
                    }
                }
                data = stream.read();
            }
        };
        stream.on('readable', getIv);
        stream.on('end', () => {
            if (aes)
                aes.end();
            output.end();
        });
        return output;
    }
    decryptString(key, text) {
        const ciphertext = buffer_1.Buffer.from(text);
        const bIv = ciphertext.slice(0, NodeCryptography.IV_LENGTH);
        const bCiphertext = ciphertext.slice(NodeCryptography.IV_LENGTH);
        const aes = (0, crypto_1.createDecipheriv)(this.algo, key, bIv);
        return buffer_1.Buffer.concat([aes.update(bCiphertext), aes.final()]).toString('utf8');
    }
    decryptFile(key, file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            const bKey = this.getKey(key);
            if (file.data instanceof buffer_1.Buffer) {
                return File.create({
                    name: file.name,
                    mimeType: file.mimeType,
                    data: this.decryptBuffer(bKey, file.data),
                });
            }
            if (file.data instanceof stream_1.Readable) {
                return File.create({
                    name: file.name,
                    mimeType: file.mimeType,
                    stream: this.decryptStream(bKey, file.data),
                });
            }
            throw new Error('Cannot decrypt this file. In Node.js file decryption supports only string, Buffer or Stream.');
        });
    }
    get algo() {
        return 'aes-256-cbc';
    }
    getKey(key) {
        const sha = (0, crypto_1.createHash)('sha256');
        sha.update(buffer_1.Buffer.from(key, 'utf8'));
        return buffer_1.Buffer.from(sha.digest('hex').slice(0, 32), 'utf8');
    }
    getIv() {
        return (0, crypto_1.randomBytes)(NodeCryptography.IV_LENGTH);
    }
}
NodeCryptography.IV_LENGTH = 16;
exports.default = NodeCryptography;
