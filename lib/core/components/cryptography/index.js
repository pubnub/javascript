"use strict";
/**
 * Legacy cryptography module (`@noble`-backed: Web, React Native).
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
const noble_primitives_1 = require("./noble-primitives");
const legacy_crypto_1 = require("./legacy-crypto");
/**
 * Legacy cryptography module for data encryption / decryption.
 *
 * @internal
 */
class Crypto extends legacy_crypto_1.LegacyCrypto {
    constructor(configuration) {
        super(configuration, noble_primitives_1.noblePrimitives);
    }
}
exports.default = Crypto;
