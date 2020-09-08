/** @flow */

import { IFile, FileClass } from '../';

type PubNubFileWebConstructor =
  | File
  | {|
      data: string,
      name: string,
      mimeType: string,
    |}
  | {|
      data: ArrayBuffer,
      name: string,
      mimeType: string,
    |};

const PubNubFile: FileClass = class PubNubFile implements IFile {
  static supportsFile = typeof File !== 'undefined';
  static supportsBlob = typeof Blob !== 'undefined';
  static supportsArrayBuffer = typeof ArrayBuffer !== 'undefined';
  static supportsBuffer = false;
  static supportsStream = false;
  static supportsString = true;
  static supportsEncryptFile = true;
  static supportsFileUri = false;

  static create(config: PubNubFileWebConstructor) {
    return new this(config);
  }

  data: any;
  name: string;
  mimeType: string;

  constructor(config: PubNubFileWebConstructor) {
    if (config instanceof File) {
      this.data = config;

      this.name = this.data.name;
      this.mimeType = this.data.type;
    } else if (config.data) {
      let contents = config.data;

      this.data = new File([contents], config.name, { type: config.mimeType });

      this.name = config.name;

      if (config.mimeType) {
        this.mimeType = config.mimeType;
      }
    }

    if (this.data === undefined) {
      throw new Error("Couldn't construct a file out of supplied options.");
    }

    if (this.name === undefined) {
      throw new Error("Couldn't guess filename out of the options. Please provide one.");
    }
  }

  async toBuffer() {
    throw new Error('This feature is only supported in Node.js environments.');
  }

  async toStream() {
    throw new Error('This feature is only supported in Node.js environments.');
  }

  async toFileUri() {
    throw new Error('This feature is only supported in react native environments.');
  }

  async toBlob() {
    return this.data;
  }

  async toArrayBuffer() {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        if (reader.result instanceof ArrayBuffer) {
          return resolve(reader.result);
        }
      });

      reader.addEventListener('error', () => {
        reject(reader.error);
      });

      reader.readAsArrayBuffer(this.data);
    });
  }

  async toString() {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          return resolve(reader.result);
        }
      });

      reader.addEventListener('error', () => {
        reject(reader.error);
      });

      reader.readAsBinaryString(this.data);
    });
  }

  async toFile() {
    return this.data;
  }
};

export default PubNubFile;
