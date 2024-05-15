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
    /**
     * Retrieve registered legacy cryptor.
     *
     * @returns Previously registered {@link ILegacyCryptor|legacy} cryptor.
     *
     * @throws Error if legacy cryptor not registered.
     */
    private getLegacyCryptor;
    /**
     * Retrieve registered cryptor by its identifier.
     *
     * @param id - Unique cryptor identifier.
     *
     * @returns Registered cryptor with specified identifier.
     *
     * @throws Error if cryptor with specified {@link id} can't be found.
     */
    private getCryptorFromId;
    /**
     * Retrieve cryptor by its identifier.
     *
     * @param header - Header with cryptor-defined data or raw cryptor identifier.
     *
     * @returns Cryptor which correspond to provided {@link header}.
     */
    private getCryptor;
    /**
     * Create cryptor header data.
     *
     * @param encrypted - Encryption data object as source for header data.
     *
     * @returns Binary representation of the cryptor header data.
     */
    private getHeaderData;
    /**
     * Merge two {@link ArrayBuffer} instances.
     *
     * @param ab1 - First {@link ArrayBuffer}.
     * @param ab2 - Second {@link ArrayBuffer}.
     *
     * @returns Merged data as {@link ArrayBuffer}.
     */
    private concatArrayBuffer;
    /**
     * {@link Readable} stream event handler.
     *
     * @param stream - Stream which can be used to read data for decryption.
     * @param file - File object which has been created with {@link stream}.
     * @param File - Class constructor for {@link PubNub} File object.
     *
     * @returns Decrypted data as {@link PubNub} File object.
     *
     * @throws Error if file is empty or contains unsupported data type.
     */
    private onStreamReadable;
    /**
     * Decrypt {@link Readable} stream using legacy cryptor.
     *
     * @param stream - Stream which can be used to read data for decryption.
     * @param file - File object which has been created with {@link stream}.
     * @param File - Class constructor for {@link PubNub} File object.
     *
     * @returns Decrypted data as {@link PubNub} File object.
     *
     * @throws Error if file is empty or contains unsupported data type.
     */
    private decryptLegacyFileStream;
}
