"use strict";
/**
 * ICryptoModule adapter that delegates to the legacy Crypto implementation.
 *
 * This bridges the RN path to the endpoints that expect an ICryptoModule when
 * only a cipherKey is provided.
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
const buffer_1 = require("buffer");
class LegacyCryptoModuleAdapter {
    constructor(legacy) {
        this.legacy = legacy;
    }
    // Allow SDK to update logger on the underlying legacy crypto.
    set logger(logger) {
        // legacy logger setter accepts LoggerManager | undefined
        this.legacy.logger = logger;
    }
    // --------------------------------------------------------
    // --------------------- Encryption -----------------------
    // --------------------------------------------------------
    encrypt(data) {
        const plaintext = typeof data === 'string' ? data : buffer_1.Buffer.from(new Uint8Array(data)).toString('utf8');
        // Legacy crypto returns a base64 string.
        return this.legacy.encrypt(plaintext);
    }
    encryptFile(_file, _File) {
        return __awaiter(this, void 0, void 0, function* () {
            // Not used on RN when cipherKey is set: file endpoints take the cipherKey + cryptography path.
            return undefined;
        });
    }
    // --------------------------------------------------------
    // --------------------- Decryption -----------------------
    // --------------------------------------------------------
    decrypt(data) {
        let ciphertextB64;
        if (typeof data === 'string')
            ciphertextB64 = data;
        else
            ciphertextB64 = buffer_1.Buffer.from(new Uint8Array(data)).toString('base64');
        const decrypted = this.legacy.decrypt(ciphertextB64);
        // Legacy decrypt returns object or string; ICryptoModule allows returning ArrayBuffer | Payload | null.
        return decrypted;
    }
    decryptFile(_file, _File) {
        return __awaiter(this, void 0, void 0, function* () {
            // Not used on RN when cipherKey is set: file endpoints take the cipherKey + cryptography path.
            return undefined;
        });
    }
}
exports.default = LegacyCryptoModuleAdapter;
