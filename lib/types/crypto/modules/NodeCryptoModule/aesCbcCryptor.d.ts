/**
 * AES-CBC cryptor module.
 */
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { PassThrough } from 'stream';
import { ICryptor, EncryptedDataType, EncryptedStream } from './ICryptor';
/**
 * AES-CBC cryptor.
 *
 * AES-CBC cryptor with enhanced cipher strength.
 */
export default class AesCbcCryptor implements ICryptor {
    /**
     * Cryptor block size.
     */
    static BLOCK_SIZE: number;
    /**
     * {@link string|String} to {@link ArrayBuffer} response decoder.
     */
    static encoder: TextEncoder;
    /**
     * Data encryption / decryption cipher key.
     */
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
    /**
     * Cryptor algorithm.
     *
     * @returns Cryptor module algorithm.
     */
    private get algo();
    /**
     * Generate random initialization vector.
     *
     * @returns Random initialization vector.
     */
    private getIv;
    /**
     * Convert cipher key to the {@link Buffer}.
     *
     * @returns SHA256 encoded cipher key {@link Buffer}.
     */
    private getKey;
}
