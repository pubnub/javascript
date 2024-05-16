/**
 * Legacy cryptography module.
 */
import { CryptorConfiguration } from '../../interfaces/crypto-module';
import { Payload } from '../../types/api';
/**
 * Legacy cryptor configuration options.
 */
type CryptoConfiguration = {
    encryptKey?: boolean;
    keyEncoding?: 'hex' | 'utf8' | 'base64' | 'binary';
    keyLength?: 128 | 256;
    mode?: 'ecb' | 'cbc';
};
export default class {
    private readonly configuration;
    /**
     * Crypto initialization vector.
     */
    private iv;
    /**
     * List os allowed cipher key encodings.
     */
    private allowedKeyEncodings;
    /**
     * Allowed cipher key lengths.
     */
    private allowedKeyLengths;
    /**
     * Allowed crypto modes.
     */
    private allowedModes;
    /**
     * Default cryptor configuration options.
     */
    private readonly defaultOptions;
    constructor(configuration: CryptorConfiguration);
    /**
     * Generate HMAC-SHA256 hash from input data.
     *
     * @param data - Data from which hash should be generated.
     *
     * @returns HMAC-SHA256 hash from provided `data`.
     */
    HMACSHA256(data: string): string;
    /**
     * Generate SHA256 hash from input data.
     *
     * @param data - Data from which hash should be generated.
     *
     * @returns SHA256 hash from provided `data`.
     */
    SHA256(data: string): string;
    /**
     * Encrypt provided data.
     *
     * @param data - Source data which should be encrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Encrypted `data`.
     */
    encrypt(data: string | Payload, customCipherKey?: string, options?: CryptoConfiguration): string;
    /**
     * Decrypt provided data.
     *
     * @param data - Encrypted data which should be decrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Decrypted `data`.
     */
    decrypt(data: string, customCipherKey?: string, options?: CryptoConfiguration): Payload | null;
    /**
     * Encrypt provided data.
     *
     * @param data - Source data which should be encrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Encrypted `data` as string.
     */
    private pnEncrypt;
    /**
     * Decrypt provided data.
     *
     * @param data - Encrypted data which should be decrypted.
     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
     * @param [options] - Specific crypto configuration options.
     *
     * @returns Decrypted `data`.
     */
    private pnDecrypt;
    /**
     * Pre-process provided custom crypto configuration.
     *
     * @param incomingOptions - Configuration which should be pre-processed before use.
     *
     * @returns Normalized crypto configuration options.
     */
    private parseOptions;
    /**
     * Decode provided cipher key.
     *
     * @param key - Key in `encoding` provided by `options`.
     * @param options - Crypto configuration options with cipher key details.
     *
     * @returns Array buffer with decoded key.
     */
    private decodeKey;
    /**
     * Add padding to the cipher key.
     *
     * @param key - Key which should be padded.
     * @param options - Crypto configuration options with cipher key details.
     *
     * @returns Properly padded cipher key.
     */
    private getPaddedKey;
    /**
     * Cipher mode.
     *
     * @param options - Crypto configuration with information about cipher mode.
     *
     * @returns Crypto cipher mode.
     */
    private getMode;
    /**
     * Cipher initialization vector.
     *
     * @param options - Crypto configuration with information about cipher mode.
     *
     * @returns Initialization vector.
     */
    private getIV;
    /**
     * Random initialization vector.
     *
     * @returns Generated random initialization vector.
     */
    private getRandomIV;
}
export {};
