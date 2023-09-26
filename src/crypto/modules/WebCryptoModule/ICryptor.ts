export type EncryptedDataType = {
  data: ArrayBuffer;
  metadata: ArrayBuffer | null;
};

export interface ICryptor {
  get identifier(): string;
  encrypt(data: ArrayBuffer): Promise<EncryptedDataType>;
  decrypt(data: EncryptedDataType): Promise<ArrayBuffer>;
}
