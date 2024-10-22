/**
 * Node.js crypto module.
 */
import { AbstractCryptoModule, CryptorConfiguration } from '../../../core/interfaces/crypto-module';
import PubNubFile, { PubNubFileParameters } from '../../../file/modules/node';
import { PubNubFileConstructor } from '../../../core/types/file';
import { ICryptor } from './ICryptor';
import { ILegacyCryptor } from './ILegacyCryptor';
import AesCbcCryptor from './aesCbcCryptor';
import LegacyCryptor from './legacyCryptor';
/**
 * Re-export bundled cryptors.
 */
export { LegacyCryptor, AesCbcCryptor };
/**
 * Crypto module cryptors interface.
 */
type CryptorType = ICryptor | ILegacyCryptor;
/**
 * CryptoModule for Node.js platform.
 */
export declare class CryptoModule extends AbstractCryptoModule<CryptorType> {
    /**
     * {@link LegacyCryptor|Legacy} cryptor identifier.
     */
    static LEGACY_IDENTIFIER: string;
    static legacyCryptoModule(config: CryptorConfiguration): CryptoModule;
    static aesCbcCryptoModule(config: CryptorConfiguration): CryptoModule;
    /**
     * Construct crypto module with `cryptor` as default for data encryption and decryption.
     *
     * @param defaultCryptor - Default cryptor for data encryption and decryption.
     *
     * @returns Crypto module with pre-configured default cryptor.
     */
    static withDefaultCryptor(defaultCryptor: CryptorType): CryptoModule;
    encrypt(data: ArrayBuffer | string): string | ArrayBuffer;
    encryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile | undefined>;
    decrypt(data: ArrayBuffer | string): ArrayBuffer | import("../../../core/types/api").Payload | null;
    decryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile | undefined>;
}
