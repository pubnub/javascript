import { AbstractCryptoModule, CryptorConfiguration } from '../../../core/interfaces/crypto-module';
import PubNubFile, { PubNubFileParameters } from '../../../file/modules/node';
import { PubNubFileConstructor } from '../../../core/types/file';
import { ICryptor } from './ICryptor';
import { ILegacyCryptor } from './ILegacyCryptor';
import AesCbcCryptor from './aesCbcCryptor';
import LegacyCryptor from './legacyCryptor';
export { LegacyCryptor, AesCbcCryptor };
type CryptorType = ICryptor | ILegacyCryptor;
export declare class CryptoModule extends AbstractCryptoModule<CryptorType> {
    static LEGACY_IDENTIFIER: string;
    static legacyCryptoModule(config: CryptorConfiguration): CryptoModule;
    static aesCbcCryptoModule(config: CryptorConfiguration): CryptoModule;
    static withDefaultCryptor(defaultCryptor: CryptorType): CryptoModule;
    encrypt(data: ArrayBuffer | string): string | ArrayBuffer;
    encryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile | undefined>;
    decrypt(data: ArrayBuffer | string): ArrayBuffer | import("../../../core/types/api").Payload | null;
    decryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile | undefined>;
    private getLegacyCryptor;
    private getCryptorFromId;
    private getCryptor;
    private getHeaderData;
    private concatArrayBuffer;
    private onStreamReadable;
    private decryptLegacyFileStream;
}
