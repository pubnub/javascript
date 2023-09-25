export type EncryptedDataType = {
  data: ArrayBufferLike;
  metadata: ArrayBufferLike | null;
};

export interface ICryptor {
  get identifier(): string;
  encrypt(data: BufferSource): Promise<EncryptedDataType>;
  decrypt(data: EncryptedDataType): Promise<ArrayBufferLike>;
}
