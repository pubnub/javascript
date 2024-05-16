/**
 * Legacy cryptor module.
 */
import PubNubFile, { PubNubFileParameters } from '../../../file/modules/node';
import { CryptorConfiguration } from '../../../core/interfaces/crypto-module';
import Crypto from '../../../core/components/cryptography/index';
import { PubNubFileConstructor } from '../../../core/types/file';
import { ILegacyCryptor } from './ILegacyCryptor';
import { EncryptedDataType } from './ICryptor';
import FileCryptor from '../node';
/**
 * Legacy cryptor.
 */
export default class LegacyCryptor implements ILegacyCryptor {
    /**
     * Legacy cryptor configuration.
     */
    config: CryptorConfiguration;
    /**
     * Configured file cryptor.
     */
    fileCryptor: FileCryptor;
    /**
     * Configured legacy cryptor.
     */
    cryptor: Crypto;
    constructor(config: CryptorConfiguration);
    encrypt(data: string): EncryptedDataType;
    encryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile>;
    decrypt(encryptedData: EncryptedDataType): import("../../../core/types/api").Payload | null;
    decryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile>;
    get identifier(): string;
}
