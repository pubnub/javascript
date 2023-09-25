import { EncryptedDataType } from './ICryptor';
import PubNubFile from '../../../file/modules/node';

export type PubnubFile = typeof PubNubFile;
export type ArrayBufferLike = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | DataView | BufferSource;

export interface ILegacyCryptor<T extends PubnubFile> {
  get identifier(): string;

  encrypt(data: ArrayBufferLike): Promise<EncryptedDataType>;
  decrypt(data: EncryptedDataType): Promise<BufferSource>;

  encryptFile(file: T, File: T): Promise<T>;
  decryptFile(file: T, File: T): Promise<T>;
}
