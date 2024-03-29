"use strict";
/**
 * Crypto module.
 */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractCryptoModule = void 0;
var AbstractCryptoModule = /** @class */ (function () {
    // endregion
    function AbstractCryptoModule(configuration) {
        var _a;
        this.defaultCryptor = configuration.default;
        this.cryptors = (_a = configuration.cryptors) !== null && _a !== void 0 ? _a : [];
    }
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
    AbstractCryptoModule.legacyCryptoModule = function (config) {
        throw new Error('Should be implemented by concrete crypto module implementation.');
    };
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
    AbstractCryptoModule.aesCbcCryptoModule = function (config) {
        throw new Error('Should be implemented by concrete crypto module implementation.');
    };
    // endregion
    // --------------------------------------------------------
    // ----------------------- Helpers ------------------------
    // --------------------------------------------------------
    // region Helpers
    /**
     * Retrieve list of module's cryptors.
     */
    AbstractCryptoModule.prototype.getAllCryptors = function () {
        return __spreadArray([this.defaultCryptor], __read(this.cryptors), false);
    };
    /**
     * `String` to {@link ArrayBuffer} response decoder.
     */
    AbstractCryptoModule.encoder = new TextEncoder();
    /**
     *  {@link ArrayBuffer} to {@link string} decoder.
     */
    AbstractCryptoModule.decoder = new TextDecoder();
    return AbstractCryptoModule;
}());
exports.AbstractCryptoModule = AbstractCryptoModule;
