/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { PassThrough } from 'stream';
import { ICryptor, EncryptedDataType, EncryptedStream } from './ICryptor';
export default class AesCbcCryptor implements ICryptor {
    static BLOCK_SIZE: number;
    static encoder: TextEncoder;
    cipherKey: string;
    constructor({ cipherKey }: {
        cipherKey: string;
    });
    encrypt(data: ArrayBuffer | string): EncryptedDataType;
    encryptStream(stream: NodeJS.ReadableStream): Promise<{
        stream: PassThrough;
        metadata: Buffer;
        metadataLength: number;
    }>;
    decrypt(input: EncryptedDataType): ArrayBuffer;
    decryptStream(stream: EncryptedStream): Promise<PassThrough>;
    get identifier(): string;
    private get algo();
    private getIv;
    private getKey;
}
