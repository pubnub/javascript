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
import { PassThrough } from 'stream';
class AesCbcCryptor {
    constructor({ cipherKey }) {
        this.cipherKey = cipherKey;
    }
    encrypt(data) {
        const iv = this.getIv();
        const key = this.getKey();
        const plainData = typeof data === 'string' ? AesCbcCryptor.encoder.encode(data) : data;
        const bPlain = Buffer.from(plainData);
        if (bPlain.byteLength === 0)
            throw new Error('Encryption error: empty content');
        const aes = createCipheriv(this.algo, key, iv);
        return {
            metadata: iv,
            data: Buffer.concat([aes.update(bPlain), aes.final()]),
        };
    }
    encryptStream(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!stream.readable)
                throw new Error('Encryption error: empty stream');
            const output = new PassThrough();
            const bIv = this.getIv();
            const aes = createCipheriv(this.algo, this.getKey(), bIv);
            stream.pipe(aes).pipe(output);
            return {
                stream: output,
                metadata: bIv,
                metadataLength: AesCbcCryptor.BLOCK_SIZE,
            };
        });
    }
    decrypt(input) {
        const data = typeof input.data === 'string' ? new TextEncoder().encode(input.data) : input.data;
        if (data.byteLength <= 0)
            throw new Error('Decryption error: empty content');
        const aes = createDecipheriv(this.algo, this.getKey(), input.metadata);
        const decryptedDataBuffer = Buffer.concat([aes.update(data), aes.final()]);
        return decryptedDataBuffer.buffer.slice(decryptedDataBuffer.byteOffset, decryptedDataBuffer.byteOffset + decryptedDataBuffer.length);
    }
    decryptStream(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            const decryptedStream = new PassThrough();
            let bIv = Buffer.alloc(0);
            let aes = null;
            const onReadable = () => {
                let data = stream.stream.read();
                while (data !== null) {
                    if (data) {
                        const bChunk = Buffer.from(data);
                        const sliceLen = stream.metadataLength - bIv.byteLength;
                        if (bChunk.byteLength < sliceLen) {
                            bIv = Buffer.concat([bIv, bChunk]);
                        }
                        else {
                            bIv = Buffer.concat([bIv, bChunk.slice(0, sliceLen)]);
                            aes = createDecipheriv(this.algo, this.getKey(), bIv);
                            aes.pipe(decryptedStream);
                            aes.write(bChunk.slice(sliceLen));
                        }
                    }
                    data = stream.stream.read();
                }
            };
            stream.stream.on('readable', onReadable);
            stream.stream.on('end', () => {
                if (aes)
                    aes.end();
                decryptedStream.end();
            });
            return decryptedStream;
        });
    }
    get identifier() {
        return 'ACRH';
    }
    get algo() {
        return 'aes-256-cbc';
    }
    getIv() {
        return randomBytes(AesCbcCryptor.BLOCK_SIZE);
    }
    getKey() {
        const sha = createHash('sha256');
        sha.update(Buffer.from(this.cipherKey, 'utf8'));
        return Buffer.from(sha.digest());
    }
}
AesCbcCryptor.BLOCK_SIZE = 16;
AesCbcCryptor.encoder = new TextEncoder();
export default AesCbcCryptor;
