import { EncryptedDataType } from './ICryptor';

export type PubNubFileType = {
  stream: NodeJS.ReadStream;
  data: NodeJS.ReadStream | Buffer;
  name: string;
  mimeType: string;
  contentLength: number;

  create(config: any): PubNubFileType;

  toBuffer(): Buffer;
  toArrayBuffer(): ArrayBuffer;
  toString(): string;
  toStream(): NodeJS.ReadStream;
};

export interface ILegacyCryptor<T extends PubNubFileType> {
  get identifier(): string;

  encrypt(data: string | ArrayBuffer): EncryptedDataType;
  decrypt(data: EncryptedDataType): BufferSource | string;

  encryptFile(file: T, File: T): Promise<T>;
  decryptFile(file: T, File: T): Promise<T>;
}
