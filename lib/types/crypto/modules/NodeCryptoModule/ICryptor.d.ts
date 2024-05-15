/// <reference types="node" />
/// <reference types="node" />
export type EncryptedDataType = {
    data: Buffer | string;
    metadata: Buffer | null;
};
export type EncryptedStream = {
    stream: NodeJS.ReadableStream;
    metadataLength: number;
    metadata?: Buffer | undefined;
};
export interface ICryptor {
    get identifier(): string;
    encrypt(data: BufferSource | string): EncryptedDataType;
    encryptStream(stream: NodeJS.ReadableStream): Promise<EncryptedStream>;
    decrypt(data: EncryptedDataType): ArrayBuffer;
    decryptStream(stream: EncryptedStream): Promise<NodeJS.ReadableStream>;
}
