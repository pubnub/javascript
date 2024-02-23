/* global File, FileReader */

import { FileInterface, FileObject } from '../../core/interfaces/file';

const PubNubFile = class PubNubFile implements FileInterface {
  mimeType;
  name;
  data;

  supportsFile() {
    return typeof File !== 'undefined';
  }

  supportsBlob() {
    return typeof Blob !== 'undefined';
  }

  supportsArrayBuffer() {
    return typeof ArrayBuffer !== 'undefined';
  }

  supportsBuffer() {
    return false;
  }

  supportsStream() {
    return false;
  }

  supportsString() {
    return true;
  }

  supportsEncryptFile() {
    return true;
  }

  supportsFileUri() {
    return false;
  }

  constructor(config: FileObject) {
    let data, name, mimeType;
    if (config instanceof File) {
      data = config;

      name = data.name;
      mimeType = data.type;
    } else if (config.data) {
      const contents = config.data;

      data = new File(contents, config.name, { type: config.mimeType });

      name = config.name;

      if (config.mimeType) {
        mimeType = config.mimeType;
      }
    }

    if (data === undefined) {
      throw new Error("Couldn't construct a file out of supplied options.");
    }

    if (name === undefined) {
      throw new Error("Couldn't guess filename out of the options. Please provide one.");
    }

    this.data = data;
    this.name = name;
    this.mimeType = mimeType;
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

  async toBlob<File>() {
    return this.data as File;
  }

  async toArrayBuffer<ArrayBuffer>() {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result as ArrayBuffer);
        }
      };

      reader.onerror = () => reject(reader.error);

      reader.readAsArrayBuffer(this.data);
    });
  }

  async toString() {
    return new Promise<string>((resolve, reject) => {
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

  async toFile<File>() {
    return this.data as File;
  }
};

export default PubNubFile;
