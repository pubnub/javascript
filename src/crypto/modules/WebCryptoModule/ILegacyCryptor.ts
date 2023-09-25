import { EncryptedDataType } from './ICryptor';
import PubNubFile from '../../../file/modules/web';

export type PubnubFile = typeof PubNubFile;

export interface ILegacyCryptor<T extends PubnubFile> {
  get identifier(): string;

  encrypt(data: ArrayBufferLike): Promise<EncryptedDataType>;
  decrypt(data: EncryptedDataType): Promise<BufferSource>;

  encryptFile(file: T, File: T): Promise<T>;
  decryptFile(file: T, File: T): Promise<T>;
}
