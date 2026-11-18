/**
 * React Native cryptographic primitives backed by `@noble/ciphers` and `@noble/hashes`.
 *
 * Hermes doesn't provide `crypto.subtle`, so pure JS audited implementations are used. This module is imported
 * only by the React Native entry point, so `@noble/*` never becomes part of Web or Node.js builds. Modules are
 * loaded lazily on first encryption / decryption, so apps which don't use encryption don't evaluate them.
 *
 * @internal
 */

import { CryptoPrimitives } from '../../core/interfaces/crypto-primitives';
import { PubNubError } from '../../errors/pubnub-error';

/**
 * Subset of `@noble/ciphers/aes.js` API used by the SDK.
 */
type NobleAes = {
  cbc: (
    key: Uint8Array,
    iv: Uint8Array,
  ) => {
    encrypt(data: Uint8Array): Uint8Array;
    decrypt(data: Uint8Array): Uint8Array;
  };
};

/**
 * Subset of `@noble/hashes/sha2.js` API used by the SDK.
 */
type NobleSha2 = { sha256: (data: Uint8Array) => Uint8Array };

/**
 * Loaded `@noble/*` modules.
 */
let noble: { aes: NobleAes; sha2: NobleSha2 } | undefined;

/**
 * Lazily load `@noble/*` packages.
 *
 * @returns Loaded modules.
 *
 * @throws PubNubError if packages can't be loaded (for example, excluded from the app bundle).
 */
const loadNoble = () => {
  if (noble) return noble;

  try {
    /* eslint-disable @typescript-eslint/no-require-imports */
    noble = { aes: require('@noble/ciphers/aes.js') as NobleAes, sha2: require('@noble/hashes/sha2.js') as NobleSha2 };
    /* eslint-enable @typescript-eslint/no-require-imports */
  } catch (_error) {
    throw new PubNubError(
      "React Native encryption requires '@noble/ciphers' and '@noble/hashes'. " +
        'Install them: npm install @noble/ciphers @noble/hashes',
    );
  }

  return noble;
};

/**
 * React Native cryptographic primitives.
 *
 * @internal
 */
export default class NobleCryptoPrimitives implements CryptoPrimitives {
  async sha256(data: Uint8Array): Promise<Uint8Array> {
    return loadNoble().sha2.sha256(data);
  }

  async aesCbcEncrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    return loadNoble().aes.cbc(key, iv).encrypt(data);
  }

  async aesCbcDecrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    return loadNoble().aes.cbc(key, iv).decrypt(data);
  }

  randomBytes(length: number): Uint8Array {
    const cryptoApi = (globalThis as { crypto?: { getRandomValues?: <T extends Uint8Array>(array: T) => T } }).crypto;

    if (!cryptoApi || typeof cryptoApi.getRandomValues !== 'function')
      throw new PubNubError(
        "Crypto error: secure random number generator unavailable. Install 'react-native-get-random-values' " +
          'and import it at the top of your app entry file.',
      );

    return cryptoApi.getRandomValues(new Uint8Array(length));
  }
}
