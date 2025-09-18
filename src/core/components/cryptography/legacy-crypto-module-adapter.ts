/**
 * ICryptoModule adapter that delegates to the legacy Crypto implementation.
 *
 * This bridges the RN path to the endpoints that expect an ICryptoModule when
 * only a cipherKey is provided.
 */

import type { ICryptoModule } from '../../interfaces/crypto-module';
import type { PubNubFileConstructor, PubNubFileInterface } from '../../types/file';
import type { Payload } from '../../types/api';
import type { LoggerManager } from '../logger-manager';
import LegacyCrypto from './index';
import { Buffer } from 'buffer';

export default class LegacyCryptoModuleAdapter implements ICryptoModule {
  constructor(private readonly legacy: LegacyCrypto) {}

  set logger(logger: LoggerManager) {
    this.legacy.logger = logger;
  }

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  encrypt(data: ArrayBuffer | string): ArrayBuffer | string {
    const plaintext = typeof data === 'string' ? data : Buffer.from(new Uint8Array(data)).toString('utf8');
    return this.legacy.encrypt(plaintext) as string;
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
  decrypt(data: ArrayBuffer | string): ArrayBuffer | Payload | null {
    let ciphertextB64: string;
    if (typeof data === 'string') ciphertextB64 = data;
    else ciphertextB64 = Buffer.from(new Uint8Array(data)).toString('base64');

    const decrypted = this.legacy.decrypt(ciphertextB64);
    return decrypted as Payload | null;
  }

  async decryptFile(
    _file: PubNubFileInterface,
    _File: PubNubFileConstructor<PubNubFileInterface, unknown>,
  ): Promise<PubNubFileInterface | undefined> {
    // Not used on RN when cipherKey is set: file endpoints take the cipherKey + cryptography path.
    return undefined;
  }
}
