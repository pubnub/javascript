"use strict";
/**
 * Crypto module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractCryptoModule = void 0;
class AbstractCryptoModule {
    // --------------------------------------------------------
    // --------------- Convenience functions ------------------
    // --------------------------------------------------------
    // region Convenience functions
    /**
     * Construct crypto module with legacy cryptor for encryption and both legacy and AES-CBC
     * cryptors for decryption.
     *
     * @param config Cryptors configuration options.
     *
     * @returns Crypto module which encrypts data using legacy cryptor.
     *
     * @throws Error if `config.cipherKey` not set.
     */
    static legacyCryptoModule(config) {
        throw new Error('Should be implemented by concrete crypto module implementation.');
    }
    /**
     * Construct crypto module with AES-CBC cryptor for encryption and both AES-CBC and legacy
     * cryptors for decryption.
     *
     * @param config Cryptors configuration options.
     *
     * @returns Crypto module which encrypts data using AES-CBC cryptor.
     *
     * @throws Error if `config.cipherKey` not set.
     */
    static aesCbcCryptoModule(config) {
        throw new Error('Should be implemented by concrete crypto module implementation.');
    }
    // endregion
    constructor(configuration) {
        var _a;
        this.defaultCryptor = configuration.default;
        this.cryptors = (_a = configuration.cryptors) !== null && _a !== void 0 ? _a : [];
    }
    // endregion
    // --------------------------------------------------------
    // ----------------------- Helpers ------------------------
    // --------------------------------------------------------
    // region Helpers
    /**
     * Retrieve list of module's cryptors.
     */
    getAllCryptors() {
        return [this.defaultCryptor, ...this.cryptors];
    }
}
exports.AbstractCryptoModule = AbstractCryptoModule;
/**
 * `String` to {@link ArrayBuffer} response decoder.
 */
AbstractCryptoModule.encoder = new TextEncoder();
/**
 *  {@link ArrayBuffer} to {@link string} decoder.
 */
AbstractCryptoModule.decoder = new TextDecoder();
