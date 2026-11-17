"use strict";
/**
 * Crypto module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractCryptoModule = void 0;
const pubnub_error_1 = require("../../errors/pubnub-error");
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
     *
     * @deprecated Use {@link aesCbcCryptoModule} for new applications.
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
        var _a, _b;
        // AES-GCM cryptor is decrypt-only and can be registered only as an additional cryptor.
        if (((_a = configuration.default) === null || _a === void 0 ? void 0 : _a.identifier) === 'ACGM')
            throw new pubnub_error_1.PubNubError("Crypto module error: AES-GCM cryptor (ACGM) can't be used as default cryptor.");
        this.defaultCryptor = configuration.default;
        this.cryptors = (_b = configuration.cryptors) !== null && _b !== void 0 ? _b : [];
    }
    /**
     * Assign registered loggers' manager.
     *
     * @param _logger - Registered loggers' manager.
     *
     * @internal
     */
    set logger(_logger) {
        throw new Error('Method not implemented.');
    }
    // endregion
    // --------------------------------------------------------
    // ----------------------- Helpers ------------------------
    // --------------------------------------------------------
    // region Helpers
    /**
     * Retrieve list of module's cryptors.
     *
     * @internal
     */
    getAllCryptors() {
        return [this.defaultCryptor, ...this.cryptors];
    }
    // endregion
    /**
     * Serialize crypto module information to string.
     *
     * @returns Serialized crypto module information.
     */
    toString() {
        return `AbstractCryptoModule { default: ${this.defaultCryptor.toString()}, cryptors: [${this.cryptors.map((c) => c.toString()).join(', ')}]}`;
    }
}
exports.AbstractCryptoModule = AbstractCryptoModule;
/**
 * `String` to {@link ArrayBuffer} response decoder.
 *
 * @internal
 */
AbstractCryptoModule.encoder = new TextEncoder();
/**
 *  {@link ArrayBuffer} to {@link string} decoder.
 *
 * @internal
 */
AbstractCryptoModule.decoder = new TextDecoder();
