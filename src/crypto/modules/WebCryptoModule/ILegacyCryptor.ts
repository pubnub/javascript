import { EncryptedDataType } from './ICryptor';

export type PubNubFileType = {
  data: File | Blob;
  name: string;
  mimeType: string;

  create(config: any): PubNubFileType;

  toArrayBuffer(): ArrayBuffer;
  toBlob(): Blob;
  toString(): string;
  toFile(): File;
};

export interface ILegacyCryptor<T extends PubNubFileType> {
  get identifier(): string;

  encrypt(data: ArrayBuffer | string): EncryptedDataType;
  decrypt(data: EncryptedDataType): ArrayBuffer | string;

  encryptFile(file: T, File: T): Promise<T>;
  decryptFile(file: T, File: T): Promise<T>;
}
