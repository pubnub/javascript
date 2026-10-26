"use strict";
/**
 * Legacy cryptography module (`node:crypto`-backed: Node.js).
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
const node_primitives_1 = require("./node-primitives");
const legacy_crypto_1 = require("./legacy-crypto");
/**
 * Legacy cryptography module for data encryption / decryption and request signature.
 *
 * @internal
 */
class Crypto extends legacy_crypto_1.LegacyCrypto {
    constructor(configuration) {
        super(configuration, node_primitives_1.nodePrimitives);
    }
}
exports.default = Crypto;
