/**
 * Legacy cryptography module (`@noble`-backed: Web, React Native).
 *
 * @internal
 */

import { CryptorConfiguration } from '../../interfaces/crypto-module';
import { noblePrimitives } from './noble-primitives';
import { LegacyCrypto } from './legacy-crypto';

/**
 * Legacy cryptography module for data encryption / decryption.
 *
 * @internal
 */
export default class Crypto extends LegacyCrypto {
  constructor(configuration: CryptorConfiguration) {
    super(configuration, noblePrimitives);
  }
}
