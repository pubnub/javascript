"use strict";
/**
 * Node.js cryptographic primitives backed by `node:crypto`.
 *
 * @internal
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
exports.hmacSha256 = void 0;
const crypto_1 = require("crypto");
/**
 * Compute HMAC-SHA256 (used for request signature).
 *
 * @param data - Data for which HMAC should be computed.
 * @param secretKey - HMAC secret key.
 *
 * @returns Base64 encoded HMAC-SHA256 digest.
 *
 * @internal
 */
const hmacSha256 = (data, secretKey) => (0, crypto_1.createHmac)('sha256', secretKey).update(data, 'utf8').digest('base64');
exports.hmacSha256 = hmacSha256;
/**
 * Node.js cryptographic primitives.
 *
 * @internal
 */
class NodeCryptoPrimitives {
    sha256(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Uint8Array((0, crypto_1.createHash)('sha256').update(data).digest());
        });
    }
    aesCbcEncrypt(key, iv, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const cipher = (0, crypto_1.createCipheriv)(this.algorithm(key), key, iv);
            return new Uint8Array(Buffer.concat([cipher.update(data), cipher.final()]));
        });
    }
    aesCbcDecrypt(key, iv, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const decipher = (0, crypto_1.createDecipheriv)(this.algorithm(key), key, iv);
            return new Uint8Array(Buffer.concat([decipher.update(data), decipher.final()]));
        });
    }
    /**
     * Decrypt and authenticate data using AES-256-GCM (128-bit tag, no additional authenticated data).
     *
     * Used only by the decrypt-only `ACGM` cryptor (Web and Node.js). Intentionally not part of
     * {@link CryptoPrimitives}: React Native supports only the legacy cryptor.
     *
     * @param key - 32 bytes long raw key.
     * @param nonce - 12 bytes long nonce.
     * @param data - Data which should be decrypted (without authentication tag).
     * @param tag - 16 bytes long authentication tag.
     *
     * @returns Decrypted data (returned only after the authentication tag has been verified).
     *
     * @throws Error if data can't be authenticated (for example: wrong key or modified nonce, tag or data).
     */
    aesGcmDecrypt(key, nonce, data, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, nonce, { authTagLength: 16 });
            decipher.setAuthTag(tag);
            // `update` returns not yet authenticated data: release it only after `final` verified the tag.
            const decrypted = decipher.update(data);
            try {
                return new Uint8Array(Buffer.concat([decrypted, decipher.final()]));
            }
            catch (error) {
                decrypted.fill(0);
                throw error;
            }
        });
    }
    randomBytes(length) {
        return new Uint8Array((0, crypto_1.randomBytes)(length));
    }
    /**
     * AES-CBC algorithm name for provided key size.
     *
     * @param key - Raw key bytes.
     *
     * @returns `node:crypto` cipher name.
     */
    algorithm(key) {
        return `aes-${key.byteLength * 8}-cbc`;
    }
}
exports.default = NodeCryptoPrimitives;
