export type CryptoModuleConfiguration<C> = {
  default: C;
  cryptors?: C[];
};

export type CryptorConfiguration = {
  /**
   * Data encryption / decryption key.
   */
  cipherKey: string;

  /**
   * Whether random initialization vector should be used or not.
   */
  useRandomIVs?: boolean;
};

export abstract class CryptoModule<C> {
  defaultCryptor: C;
  cryptors: C[];

  protected constructor(configuration: CryptoModuleConfiguration<C>) {
    this.defaultCryptor = configuration.default;
    this.cryptors = configuration.cryptors ?? [];
  }

  /**
   * Construct crypto module with legacy cryptor for encryption and both legacy and AES-CBC
   * cryptors for decryption.
   *
   * @param config Cryptors configuration options.
   * @returns {CryptoModule} Crypto module which encrypts data using legacy cryptor.
   */
  static legacyCryptoModule(config: CryptorConfiguration): CryptoModule<C> {
    throw new Error('Should be implemented by concrete crypto module implementation.');
  }

  /**
   * Construct crypto module with AES-CBC cryptor for encryption and both AES-CBC and legacy
   * cryptors for decryption.
   *
   * @param config Cryptors configuration options.
   * @returns {CryptoModule} Crypto module which encrypts data using AES-CBC cryptor.
   */
  static aesCbcCryptoModule(config: CryptorConfiguration): CryptoModule<C> {
    throw new Error('Should be implemented by concrete crypto module implementation.');
  }

  static withDefaultCryptor(cryptor: C): CryptoModule<C> {
    throw new Error('Should be implemented by concrete crypto module implementation.');
  }

  abstract encrypt(data: ArrayBuffer | string);

  /**
   * Retrieve list of module's cryptors.
   * @protected
   */
  protected getAllCryptors() {
    return [this.defaultCryptor, ...this.cryptors];
  }
}
