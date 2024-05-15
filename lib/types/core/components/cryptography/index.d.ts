import { CryptorConfiguration } from '../../interfaces/crypto-module';
import { Payload } from '../../types/api';
type CryptoConfiguration = {
    encryptKey?: boolean;
    keyEncoding?: 'hex' | 'utf8' | 'base64' | 'binary';
    keyLength?: 128 | 256;
    mode?: 'ecb' | 'cbc';
};
export default class {
    private readonly configuration;
    private iv;
    private allowedKeyEncodings;
    private allowedKeyLengths;
    private allowedModes;
    private readonly defaultOptions;
    constructor(configuration: CryptorConfiguration);
    HMACSHA256(data: string): string;
    SHA256(data: string): string;
    encrypt(data: string | Payload, customCipherKey?: string, options?: CryptoConfiguration): string;
    decrypt(data: string, customCipherKey?: string, options?: CryptoConfiguration): Payload | null;
    private pnEncrypt;
    private pnDecrypt;
    private parseOptions;
    private decodeKey;
    private getPaddedKey;
    private getMode;
    private getIV;
    private getRandomIV;
}
export {};
