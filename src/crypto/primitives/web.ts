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
   * Imported keys cache (keyed by the hex representation of the raw key).
   */
  private readonly keys = new Map<string, Promise<CryptoKey>>();

  async sha256(data: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(await this.subtle.digest('SHA-256', data));
  }

  async aesCbcEncrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await this.importKey(key);
    return new Uint8Array(await this.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, data));
  }

  async aesCbcDecrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await this.importKey(key);
    return new Uint8Array(await this.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, data));
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
   * Import raw AES-CBC key (cached, least recently imported keys evicted first).
   *
   * @param key - Raw key bytes.
   *
   * @returns Imported `CryptoKey`.
   */
  private importKey(key: Uint8Array): Promise<CryptoKey> {
    const id = bytesToHex(key);
    let cryptoKey = this.keys.get(id);

    if (!cryptoKey) {
      if (this.keys.size >= WebCryptoPrimitives.MAX_CACHED_KEYS) this.keys.delete(this.keys.keys().next().value!);

      cryptoKey = this.subtle.importKey('raw', key, 'AES-CBC', false, ['encrypt', 'decrypt']);
      cryptoKey.catch(() => this.keys.delete(id));
      this.keys.set(id, cryptoKey);
    }

    return cryptoKey;
  }
}
