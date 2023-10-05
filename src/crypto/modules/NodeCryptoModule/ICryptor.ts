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
  decrypt(data: EncryptedDataType): ArrayBuffer;

  encryptStream(stream: NodeJS.ReadableStream): Promise<EncryptedStream>;
  decryptStream(encryptedStream: EncryptedStream): Promise<NodeJS.ReadableStream>;
}
