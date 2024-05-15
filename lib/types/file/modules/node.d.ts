/// <reference types="node" />
/// <reference types="node" />
import { Readable, PassThrough } from 'stream';
import { Buffer } from 'buffer';
import { PubNubFileInterface } from '../../core/types/file';
export type PubNubFileParameters<StringEncoding extends BufferEncoding = BufferEncoding> = {
    stream?: Readable;
    data?: Buffer | ArrayBuffer | string;
    encoding?: StringEncoding;
    name: string;
    mimeType?: string;
};
export default class PubNubFile implements PubNubFileInterface {
    static supportsBlob: boolean;
    static supportsFile: boolean;
    static supportsBuffer: boolean;
    static supportsStream: boolean;
    static supportsString: boolean;
    static supportsArrayBuffer: boolean;
    static supportsEncryptFile: boolean;
    static supportsFileUri: boolean;
    readonly data: Readable | Buffer;
    contentLength?: number;
    mimeType: string;
    name: string;
    static create(file: PubNubFileParameters): PubNubFile;
    constructor(file: PubNubFileParameters);
    toBuffer(): Promise<Buffer>;
    toArrayBuffer(): Promise<ArrayBuffer>;
    toString(encoding?: BufferEncoding): Promise<string>;
    toStream(): Promise<Readable | PassThrough>;
    toFile(): Promise<void>;
    toFileUri(): Promise<Record<string, unknown>>;
    toBlob(): Promise<void>;
}
