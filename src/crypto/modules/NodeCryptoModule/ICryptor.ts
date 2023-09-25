export type EncryptedDataType = {
  data: Buffer;
  metadata: Buffer | null;
};

export type EncryptedStream = {
  stream: NodeJS.ReadableStream;
  metadataLength: number;
  metadata?: Buffer | undefined;
};

export interface ICryptor {
  get identifier(): string;
  encrypt(data: BufferSource): Promise<EncryptedDataType>;
  decrypt(data: EncryptedDataType): Promise<Buffer>;

  encryptStream(stream: NodeJS.ReadableStream): Promise<EncryptedStream>;
  decryptStream(encryptedStream: EncryptedStream): Promise<NodeJS.ReadableStream>;
}
