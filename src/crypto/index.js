/** @flow */

import type { IFile, FileClass } from '../file';

export interface ICryptography<T> {
  +algo: string;

  encrypt(key: string, plaintext: T): Promise<T>;
  decrypt(key: string, ciphertext: T): Promise<T>;

  encryptFile(key: string, file: IFile, File: FileClass): Promise<IFile>;
  decryptFile(key: string, file: IFile, File: FileClass): Promise<IFile>;
}
