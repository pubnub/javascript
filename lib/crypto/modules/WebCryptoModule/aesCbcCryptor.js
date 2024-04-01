/**
 * AES-CBC cryptor module.
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
import cryptoJS from '../../../core/components/cryptography/hmac-sha256';
import { decode } from '../../../core/components/base64_codec';
/**
 * AES-CBC cryptor.
 *
 * AES-CBC cryptor with enhanced cipher strength.
 */
class AesCbcCryptor {
    constructor({ cipherKey }) {
        this.cipherKey = cipherKey;
        this.CryptoJS = cryptoJS;
        this.encryptedKey = this.CryptoJS.SHA256(cipherKey);
    }
    // --------------------------------------------------------
    // --------------------- Encryption -----------------------
    // --------------------------------------------------------
    // region Encryption
    encrypt(data) {
        const stringData = typeof data === 'string' ? data : AesCbcCryptor.decoder.decode(data);
        if (stringData.length === 0)
            throw new Error('encryption error. empty content');
        const abIv = this.getIv();
        return {
            metadata: abIv,
            data: decode(this.CryptoJS.AES.encrypt(data, this.encryptedKey, {
                iv: this.bufferToWordArray(abIv),
                mode: this.CryptoJS.mode.CBC,
            }).ciphertext.toString(this.CryptoJS.enc.Base64)),
        };
    }
    encryptFileData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.getKey();
            const iv = this.getIv();
            return {
                data: yield crypto.subtle.encrypt({ name: this.algo, iv: iv }, key, data),
                metadata: iv,
            };
        });
    }
    // endregion
    // --------------------------------------------------------
    // --------------------- Decryption -----------------------
    // --------------------------------------------------------
    // region Decryption
    decrypt(encryptedData) {
        const iv = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.metadata));
        const data = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.data));
        return AesCbcCryptor.encoder.encode(this.CryptoJS.AES.decrypt({ ciphertext: data }, this.encryptedKey, {
            iv,
            mode: this.CryptoJS.mode.CBC,
        }).toString(this.CryptoJS.enc.Utf8)).buffer;
    }
    decryptFileData(encryptedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.getKey();
            return crypto.subtle.decrypt({ name: this.algo, iv: encryptedData.metadata }, key, encryptedData.data);
        });
    }
    // endregion
    // --------------------------------------------------------
    // ----------------------- Helpers ------------------------
    // --------------------------------------------------------
    // region Helpers
    get identifier() {
        return 'ACRH';
    }
    /**
     * Cryptor algorithm.
     *
     * @returns Cryptor module algorithm.
     */
    get algo() {
        return 'AES-CBC';
    }
    /**
     * Generate random initialization vector.
     *
     * @returns Random initialization vector.
     */
    getIv() {
        return crypto.getRandomValues(new Uint8Array(AesCbcCryptor.BLOCK_SIZE));
    }
    /**
     * Convert cipher key to the {@link Buffer}.
     *
     * @returns SHA256 encoded cipher key {@link Buffer}.
     */
    getKey() {
        return __awaiter(this, void 0, void 0, function* () {
            const bKey = AesCbcCryptor.encoder.encode(this.cipherKey);
            const abHash = yield crypto.subtle.digest('SHA-256', bKey.buffer);
            return crypto.subtle.importKey('raw', abHash, this.algo, true, ['encrypt', 'decrypt']);
        });
    }
    /**
     * Convert bytes array to words array.
     *
     * @param b - Bytes array (buffer) which should be converted.
     *
     * @returns Word sized array.
     */
    bufferToWordArray(b) {
        const wa = [];
        let i;
        for (i = 0; i < b.length; i += 1) {
            wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
        }
        return this.CryptoJS.lib.WordArray.create(wa, b.length);
    }
}
/**
 * Cryptor block size.
 */
AesCbcCryptor.BLOCK_SIZE = 16;
/**
 * {@link string|String} to {@link ArrayBuffer} response decoder.
 */
AesCbcCryptor.encoder = new TextEncoder();
/**
 *  {@link ArrayBuffer} to {@link string} decoder.
 */
AesCbcCryptor.decoder = new TextDecoder();
export default AesCbcCryptor;
