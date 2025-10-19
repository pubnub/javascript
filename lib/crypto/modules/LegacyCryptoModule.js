"use strict";
/**
 * ICryptoModule adapter that delegates to the legacy Crypto implementation.
 *
 * This adapter bridges React Native's cipherKey configuration to the modern
 * ICryptoModule interface, ensuring backward compatibility with v10 apps
 * while supporting the new crypto module architecture.
 *
 * @internal This is an internal adapter and should not be used directly.
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
class LegacyCryptoModule {
    /**
     * @param legacy - Configured legacy crypto instance
     * @throws {Error} When legacy crypto instance is not provided
     */
    constructor(legacy) {
        this.legacy = legacy;
        if (!legacy) {
            throw new Error('Legacy crypto instance is required');
        }
    }
    /**
     * Set the logger manager for the legacy crypto instance.
     *
     * @param logger - The logger manager instance to use for logging
     */
    set logger(logger) {
        this.legacy.logger = logger;
    }
    // --------------------------------------------------------
    // --------------------- Encryption -----------------------
    // --------------------------------------------------------
    /**
     * Encrypt data using the legacy cryptography implementation.
     *
     * @param data - The data to encrypt (string or ArrayBuffer)
     * @returns The encrypted data as a string
     * @throws {Error} When data is null/undefined or encryption fails
     */
    encrypt(data) {
        if (data === null || data === undefined) {
            throw new Error('Encryption data cannot be null or undefined');
        }
        try {
            const plaintext = typeof data === 'string' ? data : buffer_1.Buffer.from(new Uint8Array(data)).toString('utf8');
            const encrypted = this.legacy.encrypt(plaintext);
            if (typeof encrypted !== 'string') {
                throw new Error('Legacy encryption failed: expected string result');
            }
            return encrypted;
        }
        catch (error) {
            throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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
    /**
     * Decrypt data using the legacy cryptography implementation.
     *
     * @param data - The encrypted data to decrypt (string or ArrayBuffer)
     * @returns The decrypted payload, or null if decryption fails
     * @throws {Error} When data is null/undefined/empty or decryption fails
     */
    decrypt(data) {
        if (data === null || data === undefined) {
            throw new Error('Decryption data cannot be null or undefined');
        }
        try {
            let ciphertextB64;
            if (typeof data === 'string') {
                if (data.trim() === '') {
                    throw new Error('Decryption data cannot be empty string');
                }
                ciphertextB64 = data;
            }
            else {
                if (data.byteLength === 0) {
                    throw new Error('Decryption data cannot be empty ArrayBuffer');
                }
                ciphertextB64 = buffer_1.Buffer.from(new Uint8Array(data)).toString('base64');
            }
            const decrypted = this.legacy.decrypt(ciphertextB64);
            // The legacy decrypt method returns Payload | null, so no unsafe casting needed
            return decrypted;
        }
        catch (error) {
            throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    decryptFile(_file, _File) {
        return __awaiter(this, void 0, void 0, function* () {
            // Not used on RN when cipherKey is set: file endpoints take the cipherKey + cryptography path.
            return undefined;
        });
    }
}
exports.default = LegacyCryptoModule;
