/**
 * Browser cryptographic primitives backed by `crypto.subtle`.
 *
 * @internal
 */
/* global crypto */

import { CryptoPrimitives } from '../../core/interfaces/crypto-primitives';
import { bytesToHex } from '../../core/components/cryptography/bytes';
import { PubNubError } from '../../errors/pubnub-error';

/**
 * Browser cryptographic primitives.
 *
 * @internal
 */
export default class WebCryptoPrimitives implements CryptoPrimitives {
  /**
   * Maximum number of imported keys kept in cache.
   */
  private static readonly MAX_CACHED_KEYS = 8;

  /**
   * Imported keys cache (keyed by the algorithm and hex representation of the raw key).
   */
  private readonly keys = new Map<string, Promise<CryptoKey>>();

  async sha256(data: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(await this.subtle.digest('SHA-256', data));
  }

  async aesCbcEncrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await this.importKey(key, 'AES-CBC');
    return new Uint8Array(await this.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, data));
  }

  async aesCbcDecrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await this.importKey(key, 'AES-CBC');
    return new Uint8Array(await this.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, data));
  }

  /**
   * Decrypt and authenticate data using AES-256-GCM (128-bit tag, no additional authenticated data).
   *
   * Used only by the decrypt-only `ACGM` cryptor (Web and Node.js). Intentionally not part of
   * {@link CryptoPrimitives}: React Native supports only the legacy cryptor.
   *
   * @param key - 32 bytes long raw key.
   * @param nonce - 12 bytes long nonce.
   * @param data - Data which should be decrypted, with 16 bytes long authentication tag appended to the ciphertext.
   *
   * @returns Decrypted data (returned only after the authentication tag has been verified).
   *
   * @throws Error if data can't be authenticated (for example: wrong key or modified nonce, ciphertext or tag).
   */
  async aesGcmDecrypt(key: Uint8Array, nonce: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await this.importKey(key, 'AES-GCM');
    return new Uint8Array(await this.subtle.decrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, cryptoKey, data));
  }

  randomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * Retrieve `SubtleCrypto` interface.
   *
   * @returns `SubtleCrypto` interface.
   *
   * @throws PubNubError if `crypto.subtle` isn't available (non-secure context).
   */
  private get subtle(): SubtleCrypto {
    if (typeof crypto === 'undefined' || !crypto.subtle)
      throw new PubNubError(
        'Crypto error: crypto.subtle is unavailable. Encryption requires a secure context (HTTPS or localhost).',
      );

    return crypto.subtle;
  }

  /**
   * Import raw AES key (cached, least recently imported keys evicted first).
   *
   * @param key - Raw key bytes.
   * @param algorithm - Algorithm for which key will be used.
   *
   * @returns Imported `CryptoKey`.
   */
  private importKey(key: Uint8Array, algorithm: 'AES-CBC' | 'AES-GCM'): Promise<CryptoKey> {
    const id = `${algorithm}:${bytesToHex(key)}`;
    let cryptoKey = this.keys.get(id);

    if (!cryptoKey) {
      if (this.keys.size >= WebCryptoPrimitives.MAX_CACHED_KEYS) this.keys.delete(this.keys.keys().next().value!);

      const usages: KeyUsage[] = algorithm === 'AES-CBC' ? ['encrypt', 'decrypt'] : ['decrypt'];
      cryptoKey = this.subtle.importKey('raw', key, algorithm, false, usages);
      cryptoKey.catch(() => this.keys.delete(id));
      this.keys.set(id, cryptoKey);
    }

    return cryptoKey;
  }
}
