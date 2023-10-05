export type EncryptedDataType = {
  data: ArrayBuffer;
  metadata: ArrayBuffer | null;
};

export interface ICryptor {
  get identifier(): string;
  encrypt(data: ArrayBuffer | string): Promise<EncryptedDataType>;
  decrypt(data: EncryptedDataType): Promise<ArrayBuffer>;
}
