/**
 * React Native {@link PubNub} File object module.
 */
import { PubNubFileInterface } from '../../core/types/file';
/**
 * File path-based file.
 */
type FileUri = {
    uri: string;
    name: string;
    mimeType?: string;
};
/**
 * Asynchronously fetched file content.
 */
type ReadableFile = {
    arrayBuffer: () => Promise<ArrayBuffer>;
    blob: () => Promise<Blob>;
    text: () => Promise<string>;
};
/**
 * PubNub File instance creation parameters.
 */
export type PubNubFileParameters = File | FileUri | ReadableFile | {
    data: string | Blob | ArrayBuffer | ArrayBufferView;
    name: string;
    mimeType?: string;
};
export declare class PubNubFile implements PubNubFileInterface {
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
    readonly data: File | FileUri | ReadableFile;
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
     * @throws Error because {@link Buffer} not available in React Native environment.
     */
    toBuffer(): Promise<void>;
    /**
     * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
     *
     * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    toArrayBuffer(): Promise<ArrayBuffer>;
    /**
     * Convert {@link PubNub} File object content to {@link string}.
     *
     * @returns Asynchronous results of conversion to the {@link string}.
     */
    toString(): Promise<string>;
    /**
     * Convert {@link PubNub} File object content to {@link Readable} stream.
     *
     * @throws Error because {@link Readable} stream not available in React Native environment.
     */
    toStream(): Promise<void>;
    /**
     * Convert {@link PubNub} File object content to {@link File}.
     *
     * @returns Asynchronous results of conversion to the {@link File}.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    toFile(): Promise<Blob>;
    /**
     * Convert {@link PubNub} File object content to file `Uri`.
     *
     * @returns Asynchronous results of conversion to file `Uri`.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    toFileUri(): Promise<FileUri>;
    /**
     * Convert {@link PubNub} File object content to {@link Blob}.
     *
     * @returns Asynchronous results of conversion to the {@link Blob}.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    toBlob(): Promise<Blob>;
}
export default PubNubFile;
