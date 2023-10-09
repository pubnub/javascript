export type EncryptedDataType = {
  data: ArrayBuffer;
  metadata: ArrayBuffer | null;
};

export interface ICryptor {
  get identifier(): string;
  encrypt(data: ArrayBuffer | string): EncryptedDataType;
  decrypt(data: EncryptedDataType): ArrayBuffer;

  encryptFileData(data: ArrayBuffer): Promise<EncryptedDataType>;
  decryptFileData(data: EncryptedDataType): Promise<ArrayBuffer>;
}
