/// <reference types="node" />
/// <reference types="node" />
import { Readable, PassThrough, Transform } from 'stream';
import { Buffer } from 'buffer';
import PubNubFile, { PubNubFileParameters } from '../../file/modules/node';
import { Cryptography } from '../../core/interfaces/cryptography';
import { PubNubFileConstructor } from '../../core/types/file';
export default class NodeCryptography implements Cryptography<string | ArrayBuffer | Buffer | Readable> {
    static IV_LENGTH: number;
    encrypt(key: string, input: string | ArrayBuffer | Buffer | Readable): Promise<string | ArrayBuffer | Buffer | Transform>;
    private encryptBuffer;
    private encryptStream;
    private encryptString;
    encryptFile(key: string, file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile>;
    decrypt(key: string, input: string | ArrayBuffer | Buffer | Readable): Promise<string | ArrayBuffer | PassThrough>;
    private decryptBuffer;
    private decryptStream;
    private decryptString;
    decryptFile(key: string, file: PubNubFile, File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>): Promise<PubNubFile>;
    private get algo();
    private getKey;
    private getIv;
}
