"use strict";
/**
 * Cryptography primitives backed by `@noble` (Web, React Native).
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.noblePrimitives = void 0;
const aes_js_1 = require("@noble/ciphers/aes.js");
const utils_js_1 = require("@noble/ciphers/utils.js");
const sha2_js_1 = require("@noble/hashes/sha2.js");
const primitives_1 = require("./primitives");
/**
 * Prepare AES-CBC cipher instance.
 *
 * **Note:** AES-ECB isn't reachable through public API and intentionally not bundled.
 *
 * @param mode - AES block cipher mode.
 * @param key - AES key.
 * @param iv - Initialization vector.
 *
 * @returns AES-CBC cipher.
 *
 * @internal
 */
const aesCipher = (mode, key, iv, decrypt = false) => {
    if (mode === 'ecb')
        throw new Error('AES-ECB is not supported');
    // Padding removed leniently by `unpadLegacy` on decryption (CryptoJS-compatible).
    return (0, aes_js_1.cbc)(key, iv, decrypt ? { disablePadding: true } : undefined);
};
/**
 * `@noble`-based cryptography primitives.
 *
 * **Note:** Request signature (HMAC-SHA256) is Node.js-only and intentionally not bundled.
 *
 * @internal
 */
exports.noblePrimitives = {
    sha256: (data) => (0, sha2_js_1.sha256)(data),
    hmacSha256: () => {
        throw new Error('HMAC-SHA256 is not supported on this platform');
    },
    aesEncrypt: (mode, key, iv, data) => aesCipher(mode, key, iv).encrypt(data),
    aesDecrypt: (mode, key, iv, data) => (0, primitives_1.unpadLegacy)(aesCipher(mode, key, iv, true).decrypt(data)),
    randomBytes: (length) => (0, utils_js_1.randomBytes)(length),
};
