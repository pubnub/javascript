/**
 * Node.js {@link PubNub} File object module.
 */
/// <reference types="node" />
/// <reference types="node" />
import { Readable, PassThrough } from 'stream';
import { Buffer } from 'buffer';
import { PubNubFileInterface } from '../../core/types/file';
/**
 * PubNub File instance creation parameters.
 */
export type PubNubFileParameters<StringEncoding extends BufferEncoding = BufferEncoding> = {
    /**
     * Readable stream represents file object content.
     */
    stream?: Readable;
    /**
     * Buffer or string represents file object content.
     */
    data?: Buffer | ArrayBuffer | string;
    /**
     * String {@link PubNubFileParameters#data|data} encoding.
     *
     * @default `utf8`
     */
    encoding?: StringEncoding;
    /**
     * File object name.
     */
    name: string;
    /**
     * File object content type.
     */
    mimeType?: string;
};
/**
 * Node.js implementation for {@link PubNub} File object.
 *
 * **Important:** Class should implement constructor and class fields from {@link PubNubFileConstructor}.
 */
export default class PubNubFile implements PubNubFileInterface {
    /**
     * Whether {@link Blob} data supported by platform or not.
     */
    static supportsBlob: boolean;
    /**
     * Whether {@link File} data supported by platform or not.
     */
    static supportsFile: boolean;
    /**
     * Whether {@link Buffer} data supported by platform or not.
     */
    static supportsBuffer: boolean;
    /**
     * Whether {@link Stream} data supported by platform or not.
     */
    static supportsStream: boolean;
    /**
     * Whether {@link String} data supported by platform or not.
     */
    static supportsString: boolean;
    /**
     * Whether {@link ArrayBuffer} supported by platform or not.
     */
    static supportsArrayBuffer: boolean;
    /**
     * Whether {@link PubNub} File object encryption supported or not.
     */
    static supportsEncryptFile: boolean;
    /**
     * Whether `File Uri` data supported by platform or not.
     */
    static supportsFileUri: boolean;
    /**
     * File object content source.
     */
    readonly data: Readable | Buffer;
    /**
     * File object content length.
     */
    contentLength?: number;
    /**
     * File object content type.
     */
    mimeType: string;
    /**
     * File object name.
     */
    name: string;
    static create(file: PubNubFileParameters): PubNubFile;
    constructor(file: PubNubFileParameters);
    /**
     * Convert {@link PubNub} File object content to {@link Buffer}.
     *
     * @returns Asynchronous results of conversion to the {@link Buffer}.
     */
    toBuffer(): Promise<Buffer>;
    /**
     * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
     *
     * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
     */
    toArrayBuffer(): Promise<ArrayBuffer>;
    /**
     * Convert {@link PubNub} File object content to {@link string}.
     *
     * @returns Asynchronous results of conversion to the {@link string}.
     */
    toString(encoding?: BufferEncoding): Promise<string>;
    /**
     * Convert {@link PubNub} File object content to {@link Readable} stream.
     *
     * @returns Asynchronous results of conversion to the {@link Readable} stream.
     */
    toStream(): Promise<Readable | PassThrough>;
    /**
     * Convert {@link PubNub} File object content to {@link File}.
     *
     * @throws Error because {@link File} not available in Node.js environment.
     */
    toFile(): Promise<void>;
    /**
     * Convert {@link PubNub} File object content to file `Uri`.
     *
     * @throws Error because file `Uri` not available in Node.js environment.
     */
    toFileUri(): Promise<Record<string, unknown>>;
    /**
     * Convert {@link PubNub} File object content to {@link Blob}.
     *
     * @throws Error because {@link Blob} not available in Node.js environment.
     */
    toBlob(): Promise<void>;
}
