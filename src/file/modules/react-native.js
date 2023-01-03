/* global File, FileReader */

import { IFile, FileClass } from '..';

const PubNubFile = class PubNubFile {
  static supportsFile = typeof File !== 'undefined';

  static supportsBlob = typeof Blob !== 'undefined';

  static supportsArrayBuffer = typeof ArrayBuffer !== 'undefined';

  static supportsBuffer = false;

  static supportsStream = false;

  static supportsString = true;

  static supportsEncryptFile = false;

  static supportsFileUri = true;

  static create(config) {
    return new this(config);
  }

  data;

  name;

  mimeType;

  constructor(config) {
    if (config instanceof File) {
      this.data = config;

      this.name = this.data.name;
      this.mimeType = this.data.type;
    } else if (config.uri) {
      // uri upload for react native
      this.data = {
        uri: config.uri,
        name: config.name,
        type: config.mimeType,
      };

      this.name = config.name;

      if (config.mimeType) {
        this.mimeType = config.mimeType;
      }
    } else if (config.data) {
      this.data = config.data;
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
      throw new Error('This file contains a file URI and does not contain the file contents.');
    } else if (this.data instanceof File) {
      return this.data;
    } else {
      // data must be a fetch response
      return this.data.blob();
    }
  }

  async toArrayBuffer() {
    if (this.data && this.data.uri) {
      throw new Error('This file contains a file URI and does not contain the file contents.');
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
      // data must be a fetch response
      let result;

      try {
        result = await this.data.arrayBuffer();
      } catch (e) {
        throw new Error(`Unable to support toArrayBuffer in ReactNative environment: ${e}`);
      }

      return result;
    }
  }

  async toString() {
    if (this.data && this.data.uri) {
      return JSON.stringify(this.data);
    }
    if (this.data instanceof File) {
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
    // data must be a fetch response
    return this.data.text();
  }

  async toFile() {
    if (this.data.uri) {
      throw new Error('This file contains a file URI and does not contain the file contents.');
    } else if (this.data instanceof File) {
      return this.data;
    } else {
      // data must be a fetch response
      return this.data.blob();
    }
  }

  async toFileUri() {
    if (this.data && this.data.uri) {
      return this.data;
    }
    throw new Error('This file does not contain a file URI');
  }
};

export default PubNubFile;
