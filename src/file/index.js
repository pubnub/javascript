/** @flow */

import type { Readable } from 'stream';

export interface IFile {
  data: any;

  name: string;
  mimeType: string;

  toStream(): Promise<Readable>;
  toArrayBuffer(): Promise<ArrayBuffer>;
  toBuffer(): Promise<Buffer>;
  toString(encoding: buffer$NonBufferEncoding): Promise<string>;
  toFile(): Promise<File>;
  toBlob(): Promise<Blob>;
  toFileUri(): Promise<{ uri: String, name: string, type: string }>;
}

export interface FileClass {
  supportsBlob: boolean;
  supportsFile: boolean;
  supportsBuffer: boolean;
  supportsStream: boolean;
  supportsString: boolean;
  supportsArrayBuffer: boolean;
  supportsEncryptFile: boolean;
  supportsFileUri: boolean;

  create(input: any): IFile;
}
