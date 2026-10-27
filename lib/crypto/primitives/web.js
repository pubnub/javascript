"use strict";
/**
 * Browser cryptographic primitives backed by `crypto.subtle`.
 *
 * @internal
 */
/* global crypto */
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
const bytes_1 = require("../../core/components/cryptography/bytes");
const pubnub_error_1 = require("../../errors/pubnub-error");
/**
 * Browser cryptographic primitives.
 *
 * @internal
 */
class WebCryptoPrimitives {
    constructor() {
        /**
         * Imported keys cache (keyed by the hex representation of the raw key).
         */
        this.keys = new Map();
    }
    sha256(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Uint8Array(yield this.subtle.digest('SHA-256', data));
        });
    }
    aesCbcEncrypt(key, iv, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const cryptoKey = yield this.importKey(key);
            return new Uint8Array(yield this.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, data));
        });
    }
    aesCbcDecrypt(key, iv, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const cryptoKey = yield this.importKey(key);
            return new Uint8Array(yield this.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, data));
        });
    }
    randomBytes(length) {
        return crypto.getRandomValues(new Uint8Array(length));
    }
    /**
     * Retrieve `SubtleCrypto` interface.
     *
     * @returns `SubtleCrypto` interface.
     *
     * @throws PubNubError if `crypto.subtle` isn't available (non-secure context).
     */
    get subtle() {
        if (typeof crypto === 'undefined' || !crypto.subtle)
            throw new pubnub_error_1.PubNubError('Crypto error: crypto.subtle is unavailable. Encryption requires a secure context (HTTPS or localhost).');
        return crypto.subtle;
    }
    /**
     * Import raw AES-CBC key (cached, least recently imported keys evicted first).
     *
     * @param key - Raw key bytes.
     *
     * @returns Imported `CryptoKey`.
     */
    importKey(key) {
        const id = (0, bytes_1.bytesToHex)(key);
        let cryptoKey = this.keys.get(id);
        if (!cryptoKey) {
            if (this.keys.size >= WebCryptoPrimitives.MAX_CACHED_KEYS)
                this.keys.delete(this.keys.keys().next().value);
            cryptoKey = this.subtle.importKey('raw', key, 'AES-CBC', false, ['encrypt', 'decrypt']);
            cryptoKey.catch(() => this.keys.delete(id));
            this.keys.set(id, cryptoKey);
        }
        return cryptoKey;
    }
}
/**
 * Maximum number of imported keys kept in cache.
 */
WebCryptoPrimitives.MAX_CACHED_KEYS = 8;
exports.default = WebCryptoPrimitives;
