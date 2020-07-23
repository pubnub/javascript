/** @flow */

import type { Readable } from 'stream';

export interface IFile {
  input: any;
  inputType: any;

  name: string;
  mimeType: string;

  toStream(): Promise<Readable>;
  toBuffer(): Promise<Buffer>;
  toString(encoding: buffer$NonBufferEncoding): Promise<string>;
  toFile(): Promise<File>;
}

export interface FileClass {
  supportsFile: boolean;
  supportsBuffer: boolean;
  supportsStream: boolean;
  supportsString: boolean;

  create(input: any): IFile;
}
