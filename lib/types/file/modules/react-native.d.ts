import { PubNubFileInterface } from '../../core/types/file';
type FileUri = {
    uri: string;
    name: string;
    mimeType?: string;
};
type ReadableFile = {
    arrayBuffer: () => Promise<ArrayBuffer>;
    blob: () => Promise<Blob>;
    text: () => Promise<string>;
};
export type PubNubFileParameters = File | FileUri | ReadableFile | {
    data: string | Blob | ArrayBuffer | ArrayBufferView;
    name: string;
    mimeType?: string;
};
export declare class PubNubFile implements PubNubFileInterface {
    static supportsBlob: boolean;
    static supportsFile: boolean;
    static supportsBuffer: boolean;
    static supportsStream: boolean;
    static supportsString: boolean;
    static supportsArrayBuffer: boolean;
    static supportsEncryptFile: boolean;
    static supportsFileUri: boolean;
    readonly data: File | FileUri | ReadableFile;
    contentLength?: number;
    mimeType: string;
    name: string;
    static create(file: PubNubFileParameters): PubNubFile;
    constructor(file: PubNubFileParameters);
    toBuffer(): Promise<void>;
    toArrayBuffer(): Promise<ArrayBuffer>;
    toString(): Promise<string>;
    toStream(): Promise<void>;
    toFile(): Promise<Blob>;
    toFileUri(): Promise<FileUri>;
    toBlob(): Promise<Blob>;
}
export default PubNubFile;
