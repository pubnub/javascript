export type PubNubBasicFileParameters = {
    data: string | ArrayBuffer;
    name: string;
    mimeType?: string;
};
export interface PubNubFileInterface {
    name: string;
    mimeType?: string;
    contentLength?: number;
    toArrayBuffer(): Promise<ArrayBuffer>;
    toFileUri(): Promise<Record<string, unknown>>;
}
export interface PubNubFileConstructor<File extends PubNubFileInterface, ConstructorParameters> {
    supportsBlob: boolean;
    supportsFile: boolean;
    supportsBuffer: boolean;
    supportsStream: boolean;
    supportsString: boolean;
    supportsArrayBuffer: boolean;
    supportsEncryptFile: boolean;
    supportsFileUri: boolean;
    create(file: ConstructorParameters): File;
    new (file: ConstructorParameters): File;
}
