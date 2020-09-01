/** @flow */

import { IFile, FileClass } from '../';

type PubNubFileReactNativeConstructor =
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
  |}
| {|
    uri: string,
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
  static supportsFileUri = true;

  static create(config: PubNubFileReactNativeConstructor) {
    return new this(config);
  }

  data: any;

  name: string;
  mimeType: string;

  constructor(config: PubNubFileReactNativeConstructor) {
    if (config instanceof File) {
      this.data = config;

      this.name = this.data.name;
      this.mimeType = this.data.type;
    } else if (config.uri) {
      // uri upload for react native
      this.data = {
        uri: config.uri,
        name: config.name,
        type: config.mimeType
      };

      this.name = config.name;

      if (config.mimeType) {
        this.mimeType = config.mimeType;
      }
    } else if (config.data) {
      let contents = config.data;

      try {
        this.data = new File([contents], config.name, { type: config.mimeType });
      } catch (e) {
        // fallback to store the ArrayBuffer Directly when File does not support it.
        this.data = contents;
      }

      this.name = config.name;

      if (config.mimeType) {
        this.mimeType = config.mimeType;
      }
    } else {
      throw new Error("Couldn't construct a file out of supplied options. URI or file data required.");
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

  async toBlob() {
    if (this.data && this.data.uri) {
      throw new Error('This is a file URI and does not contain the file contents.');
    } else {
      return this.data;
    }
  }

  async toArrayBuffer() {
    if (this.data && this.data.uri) {
      throw new Error('This is a file URI and does not contain the file contents.');
    } else if (this.data instanceof ArrayBuffer) {
      return this.data;
    } else if (this.data instanceof File) {
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
    } else {
      throw new Error('Unable to construct an ArrayBuffer from the contents.');
    }
  }

  async toString() {
    if (this.data && this.data.uri) {
      return JSON.stringify(this.data);
    } else if (this.data instanceof File) {
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
    } else if (this.data instanceof ArrayBuffer) {
      let binary = '';
      let bytes = new Uint8Array(this.data);
      let length = bytes.byteLength;
      for (let i = 0; i < length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      return binary;
    } else {
      return this.data && this.data.toString();
    }
  }

  async toFile() {
    if (this.data.uri) {
      throw new Error('This is a file URI and does not contain the file contents.');
    } else {
      return this.data;
    }
  }

  async toFileUri() {
    if (this.data && this.data.uri) {
      return this.data;
    } else {
      throw new Error('This is not a file URI');
    }
  }
};

export default PubNubFile;
