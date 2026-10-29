"use strict";
/**
 * React Native cryptographic primitives backed by `@noble/ciphers` and `@noble/hashes`.
 *
 * Hermes doesn't provide `crypto.subtle`, so pure JS audited implementations are used. This module is imported
 * only by the React Native entry point, so `@noble/*` never becomes part of Web or Node.js builds. Modules are
 * loaded lazily on first encryption / decryption, so apps which don't use encryption don't evaluate them.
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
const pubnub_error_1 = require("../../errors/pubnub-error");
/**
 * Loaded `@noble/*` modules.
 */
let noble;
/**
 * Lazily load `@noble/*` packages.
 *
 * @returns Loaded modules.
 *
 * @throws PubNubError if packages can't be loaded (for example, excluded from the app bundle).
 */
const loadNoble = () => {
    if (noble)
        return noble;
    try {
        /* eslint-disable @typescript-eslint/no-require-imports */
        noble = { aes: require('@noble/ciphers/aes.js'), sha2: require('@noble/hashes/sha2.js') };
        /* eslint-enable @typescript-eslint/no-require-imports */
    }
    catch (_error) {
        throw new pubnub_error_1.PubNubError("React Native encryption requires '@noble/ciphers' and '@noble/hashes'. " +
            'Install them: npm install @noble/ciphers @noble/hashes');
    }
    return noble;
};
/**
 * React Native cryptographic primitives.
 *
 * @internal
 */
class NobleCryptoPrimitives {
    sha256(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return loadNoble().sha2.sha256(data);
        });
    }
    aesCbcEncrypt(key, iv, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return loadNoble().aes.cbc(key, iv).encrypt(data);
        });
    }
    aesCbcDecrypt(key, iv, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return loadNoble().aes.cbc(key, iv).decrypt(data);
        });
    }
    randomBytes(length) {
        const cryptoApi = globalThis.crypto;
        if (!cryptoApi || typeof cryptoApi.getRandomValues !== 'function')
            throw new pubnub_error_1.PubNubError("Crypto error: secure random number generator unavailable. Install 'react-native-get-random-values' " +
                'and import it at the top of your app entry file.');
        return cryptoApi.getRandomValues(new Uint8Array(length));
    }
}
exports.default = NobleCryptoPrimitives;
