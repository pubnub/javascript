/**
 * Legacy cryptography module (`node:crypto`-backed: Node.js).
 *
 * @internal
 */

import { CryptorConfiguration } from '../../interfaces/crypto-module';
import { nodePrimitives } from './node-primitives';
import { LegacyCrypto } from './legacy-crypto';

/**
 * Legacy cryptography module for data encryption / decryption and request signature.
 *
 * @internal
 */
export default class Crypto extends LegacyCrypto {
  constructor(configuration: CryptorConfiguration) {
    super(configuration, nodePrimitives);
  }
}
