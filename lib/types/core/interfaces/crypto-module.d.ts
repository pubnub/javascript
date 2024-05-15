import { PubNubFileConstructor, PubNubFileInterface } from '../types/file';
import { Payload } from '../types/api';
export type CryptoModuleConfiguration<C> = {
    default: C;
    cryptors?: C[];
};
export type CryptorConfiguration = {
    cipherKey?: string;
    secretKey?: string;
    useRandomIVs?: boolean;
    customEncrypt?: (data: string | Payload) => string;
    customDecrypt?: (data: string) => string;
};
export interface CryptoModule {
    encrypt(data: ArrayBuffer | string): ArrayBuffer | string;
    encryptFile(file: PubNubFileInterface, File: PubNubFileConstructor<PubNubFileInterface, any>): Promise<PubNubFileInterface | undefined>;
    decrypt(data: ArrayBuffer | string): ArrayBuffer | Payload | null;
    decryptFile(file: PubNubFileInterface, File: PubNubFileConstructor<PubNubFileInterface, any>): Promise<PubNubFileInterface | undefined>;
}
export declare abstract class AbstractCryptoModule<C> implements CryptoModule {
    protected static encoder: TextEncoder;
    protected static decoder: TextDecoder;
    defaultCryptor: C;
    cryptors: C[];
    static legacyCryptoModule(config: CryptorConfiguration): CryptoModule;
    static aesCbcCryptoModule(config: CryptorConfiguration): CryptoModule;
    constructor(configuration: CryptoModuleConfiguration<C>);
    abstract encrypt(data: ArrayBuffer | string): ArrayBuffer | string;
    abstract encryptFile(file: PubNubFileInterface, File: PubNubFileConstructor<PubNubFileInterface, any>): Promise<PubNubFileInterface | undefined>;
    abstract decrypt(data: ArrayBuffer | string): ArrayBuffer | Payload | null;
    abstract decryptFile(file: PubNubFileInterface, File: PubNubFileConstructor<PubNubFileInterface, any>): Promise<PubNubFileInterface | undefined>;
    protected getAllCryptors(): C[];
}
