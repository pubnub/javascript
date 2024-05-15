import PubNubFile, { PubNubFileParameters } from '../../../file/modules/node';
import { PubNubFileConstructor } from '../../../core/types/file';
import { Payload } from '../../../core/types/api';
import { EncryptedDataType } from './ICryptor';
export interface ILegacyCryptor {
    get identifier(): string;
    encrypt(data: string): EncryptedDataType;
    encryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile | undefined>;
    decrypt(data: EncryptedDataType): Payload | null;
    decryptFile(file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile | undefined>;
}
