import { EncryptedDataType } from './ICryptor';

export type PubNubFileType = {
  stream: NodeJS.ReadStream;
  data: NodeJS.ReadStream | Buffer;
  name: string;
  mimeType: string;

  create(config: any): PubNubFileType;

  toBuffer(): Buffer;
  toArrayBuffer(): ArrayBuffer;
  toString(): string;
};

export interface ILegacyCryptor<T extends PubNubFileType> {
  get identifier(): string;

  encrypt(data: ArrayBuffer): Promise<EncryptedDataType>;
  decrypt(data: EncryptedDataType): Promise<BufferSource>;

  encryptFile(file: T, File: T): Promise<T>;
  decryptFile(file: T, File: T): Promise<T>;
}
