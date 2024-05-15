/**
 * Legacy Node.js cryptography module.
 */
/// <reference types="node" />
/// <reference types="node" />
import { Readable, PassThrough, Transform } from 'stream';
import { Buffer } from 'buffer';
import PubNubFile, { PubNubFileParameters } from '../../file/modules/node';
import { Cryptography } from '../../core/interfaces/cryptography';
import { PubNubFileConstructor } from '../../core/types/file';
/**
 * Legacy cryptography implementation for Node.js-based {@link PubNub} client.
 */
export default class NodeCryptography implements Cryptography<string | ArrayBuffer | Buffer | Readable> {
    /**
     * Random initialization vector size.
     */
    static IV_LENGTH: number;
    encrypt(key: string, input: string | ArrayBuffer | Buffer | Readable): Promise<string | ArrayBuffer | Buffer | Transform>;
    /**
     * Encrypt provided source {@link Buffer} using specific encryption {@link key}.
     *
     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link Buffer}.
     * @param buffer - Source {@link Buffer} for encryption.
     *
     * @returns Encrypted data as {@link Buffer} object.
     */
    private encryptBuffer;
    /**
     * Encrypt provided source {@link Readable} stream using specific encryption {@link key}.
     *
     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link Readable} stream.
     * @param stream - Source {@link Readable} stream for encryption.
     *
     * @returns Encrypted data as {@link Transform} object.
     */
    private encryptStream;
    /**
     * Encrypt provided source {@link string} using specific encryption {@link key}.
     *
     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link string}.
     * @param text - Source {@link string} for encryption.
     *
     * @returns Encrypted data as byte {@link string}.
     */
    private encryptString;
    encryptFile(key: string, file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile>;
    decrypt(key: string, input: string | ArrayBuffer | Buffer | Readable): Promise<string | ArrayBuffer | PassThrough>;
    /**
     * Decrypt provided encrypted {@link Buffer} using specific decryption {@link key}.
     *
     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link Buffer}.
     * @param buffer - Encrypted {@link Buffer} for decryption.
     *
     * @returns Decrypted data as {@link Buffer} object.
     */
    private decryptBuffer;
    /**
     * Decrypt provided encrypted {@link Readable} stream using specific decryption {@link key}.
     *
     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link Readable} stream.
     * @param stream - Encrypted {@link Readable} stream for decryption.
     *
     * @returns Decrypted data as {@link Readable} object.
     */
    private decryptStream;
    /**
     * Decrypt provided encrypted {@link string} using specific decryption {@link key}.
     *
     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link string}.
     * @param text - Encrypted {@link string} for decryption.
     *
     * @returns Decrypted data as byte {@link string}.
     */
    private decryptString;
    decryptFile(key: string, file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile>;
    /**
     * Cryptography algorithm.
     *
     * @returns Cryptography module algorithm.
     */
    private get algo();
    /**
     * Convert cipher key to the {@link Buffer}.
     *
     * @param key - String cipher key.
     *
     * @returns SHA256 HEX encoded cipher key {@link Buffer}.
     */
    private getKey;
    /**
     * Generate random initialization vector.
     *
     * @returns Random initialization vector.
     */
    private getIv;
}
