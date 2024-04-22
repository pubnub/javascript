"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractCryptoModule = void 0;
class AbstractCryptoModule {
    static legacyCryptoModule(config) {
        throw new Error('Should be implemented by concrete crypto module implementation.');
    }
    static aesCbcCryptoModule(config) {
        throw new Error('Should be implemented by concrete crypto module implementation.');
    }
    constructor(configuration) {
        var _a;
        this.defaultCryptor = configuration.default;
        this.cryptors = (_a = configuration.cryptors) !== null && _a !== void 0 ? _a : [];
    }
    getAllCryptors() {
        return [this.defaultCryptor, ...this.cryptors];
    }
}
exports.AbstractCryptoModule = AbstractCryptoModule;
AbstractCryptoModule.encoder = new TextEncoder();
AbstractCryptoModule.decoder = new TextDecoder();
