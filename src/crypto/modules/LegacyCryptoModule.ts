/**
 * ICryptoModule adapter that delegates to the legacy Crypto implementation.
 *
 * This adapter bridges React Native's cipherKey configuration to the modern
 * ICryptoModule interface, ensuring backward compatibility with v10 apps
 * while supporting the new crypto module architecture.
 *
 * @internal This is an internal adapter and should not be used directly.
 */

import type { ICryptoModule } from '../../core/interfaces/crypto-module';
import type { PubNubFileConstructor, PubNubFileInterface } from '../../core/types/file';
import type { Payload } from '../../core/types/api';
import type { LoggerManager } from '../../core/components/logger-manager';
import LegacyCrypto from '../../core/components/cryptography/index';
import { Buffer } from 'buffer';

export default class LegacyCryptoModule implements ICryptoModule {
  /**
   * @param legacy - Configured legacy crypto instance
   * @throws {Error} When legacy crypto instance is not provided
   */
  constructor(private readonly legacy: LegacyCrypto) {
    if (!legacy) {
      throw new Error('Legacy crypto instance is required');
    }
  }

  /**
   * Set the logger manager for the legacy crypto instance.
   *
   * @param logger - The logger manager instance to use for logging
   */
  set logger(logger: LoggerManager) {
    this.legacy.logger = logger;
  }

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  /**
   * Encrypt data using the legacy cryptography implementation.
   *
   * @param data - The data to encrypt (string or ArrayBuffer)
   * @returns The encrypted data as a string
   * @throws {Error} When data is null/undefined or encryption fails
   */
  encrypt(data: ArrayBuffer | string): ArrayBuffer | string {
    if (data === null || data === undefined) {
      throw new Error('Encryption data cannot be null or undefined');
    }

    try {
      const plaintext = typeof data === 'string' ? data : Buffer.from(new Uint8Array(data)).toString('utf8');
      const encrypted = this.legacy.encrypt(plaintext);

      if (typeof encrypted !== 'string') {
        throw new Error('Legacy encryption failed: expected string result');
      }

      return encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async encryptFile(
    _file: PubNubFileInterface,
    _File: PubNubFileConstructor<PubNubFileInterface, unknown>,
  ): Promise<PubNubFileInterface | undefined> {
    // Not used on RN when cipherKey is set: file endpoints take the cipherKey + cryptography path.
    return undefined;
  }

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  /**
   * Decrypt data using the legacy cryptography implementation.
   *
   * @param data - The encrypted data to decrypt (string or ArrayBuffer)
   * @returns The decrypted payload, or null if decryption fails
   * @throws {Error} When data is null/undefined/empty or decryption fails
   */
  decrypt(data: ArrayBuffer | string): ArrayBuffer | Payload | null {
    if (data === null || data === undefined) {
      throw new Error('Decryption data cannot be null or undefined');
    }

    try {
      let ciphertextB64: string;
      if (typeof data === 'string') {
        if (data.trim() === '') {
          throw new Error('Decryption data cannot be empty string');
        }
        ciphertextB64 = data;
      } else {
        if (data.byteLength === 0) {
          throw new Error('Decryption data cannot be empty ArrayBuffer');
        }
        ciphertextB64 = Buffer.from(new Uint8Array(data)).toString('base64');
      }

      const decrypted = this.legacy.decrypt(ciphertextB64);

      // The legacy decrypt method returns Payload | null, so no unsafe casting needed
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async decryptFile(
    _file: PubNubFileInterface,
    _File: PubNubFileConstructor<PubNubFileInterface, unknown>,
  ): Promise<PubNubFileInterface | undefined> {
    // Not used on RN when cipherKey is set: file endpoints take the cipherKey + cryptography path.
    return undefined;
  }
}
