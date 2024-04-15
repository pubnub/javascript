var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { Readable, PassThrough, Transform } from 'stream';
import { Buffer } from 'buffer';
class NodeCryptography {
    encrypt(key, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const bKey = this.getKey(key);
            if (input instanceof Buffer)
                return this.encryptBuffer(bKey, input);
            if (input instanceof Readable)
                return this.encryptStream(bKey, input);
            if (typeof input === 'string')
                return this.encryptString(bKey, input);
            throw new Error('Encryption error: unsupported input format');
        });
    }
    encryptBuffer(key, buffer) {
        const bIv = this.getIv();
        const aes = createCipheriv(this.algo, key, bIv);
        return Buffer.concat([bIv, aes.update(buffer), aes.final()]);
    }
    encryptStream(key, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            const bIv = this.getIv();
            const aes = createCipheriv(this.algo, key, bIv).setAutoPadding(true);
            let initiated = false;
            return stream.pipe(aes).pipe(new Transform({
                transform(chunk, _, cb) {
                    if (!initiated) {
                        initiated = true;
                        this.push(Buffer.concat([bIv, chunk]));
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
        const bPlaintext = Buffer.from(text);
        const aes = createCipheriv(this.algo, key, bIv);
        return Buffer.concat([bIv, aes.update(bPlaintext), aes.final()]).toString('utf8');
    }
    encryptFile(key, file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            const bKey = this.getKey(key);
            if (file.data instanceof Buffer) {
                if (file.data.byteLength <= 0)
                    throw new Error('Encryption error: empty content.');
                return File.create({
                    name: file.name,
                    mimeType: file.mimeType,
                    data: this.encryptBuffer(bKey, file.data),
                });
            }
            if (file.data instanceof Readable) {
                if (file.contentLength === 0)
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
                const decryptedBuffer = this.decryptBuffer(bKey, Buffer.from(input));
                return decryptedBuffer.buffer.slice(decryptedBuffer.byteOffset, decryptedBuffer.byteOffset + decryptedBuffer.length);
            }
            if (input instanceof Buffer)
                return this.decryptBuffer(bKey, input);
            if (input instanceof Readable)
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
        const aes = createDecipheriv(this.algo, key, bIv);
        return Buffer.concat([aes.update(bCiphertext), aes.final()]);
    }
    decryptStream(key, stream) {
        let aes = null;
        const output = new PassThrough();
        let bIv = Buffer.alloc(0);
        const getIv = () => {
            let data = stream.read();
            while (data !== null) {
                if (data) {
                    const bChunk = Buffer.from(data);
                    const sliceLen = NodeCryptography.IV_LENGTH - bIv.byteLength;
                    if (bChunk.byteLength < sliceLen)
                        bIv = Buffer.concat([bIv, bChunk]);
                    else {
                        bIv = Buffer.concat([bIv, bChunk.slice(0, sliceLen)]);
                        aes = createDecipheriv(this.algo, key, bIv);
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
        const ciphertext = Buffer.from(text);
        const bIv = ciphertext.slice(0, NodeCryptography.IV_LENGTH);
        const bCiphertext = ciphertext.slice(NodeCryptography.IV_LENGTH);
        const aes = createDecipheriv(this.algo, key, bIv);
        return Buffer.concat([aes.update(bCiphertext), aes.final()]).toString('utf8');
    }
    decryptFile(key, file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            const bKey = this.getKey(key);
            if (file.data instanceof Buffer) {
                return File.create({
                    name: file.name,
                    mimeType: file.mimeType,
                    data: this.decryptBuffer(bKey, file.data),
                });
            }
            if (file.data instanceof Readable) {
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
        const sha = createHash('sha256');
        sha.update(Buffer.from(key, 'utf8'));
        return Buffer.from(sha.digest('hex').slice(0, 32), 'utf8');
    }
    getIv() {
        return randomBytes(NodeCryptography.IV_LENGTH);
    }
}
NodeCryptography.IV_LENGTH = 16;
export default NodeCryptography;
