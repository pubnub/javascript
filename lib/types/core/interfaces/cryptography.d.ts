import { PubNubFileConstructor, PubNubFileInterface } from '../types/file';
export interface Cryptography<Types> {
    encrypt(key: string, input: Types): Promise<Types>;
    decrypt(key: string, input: Types): Promise<Types>;
    encryptFile(key: string, file: PubNubFileInterface, File: PubNubFileConstructor<PubNubFileInterface, any>): Promise<PubNubFileInterface | undefined>;
    decryptFile(key: string, file: PubNubFileInterface, File: PubNubFileConstructor<PubNubFileInterface, any>): Promise<PubNubFileInterface | undefined>;
}
