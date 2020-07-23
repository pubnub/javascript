/** @flow */

import { IFile, FileClass } from '../core/components/file';

type PubNubFileWebConstructor =
  | File
  | {|
      data: string,
      name: string,
      mimeType: string,
    |}
  | {|
      name: string,
      mimeType: string,
      response?: {
        text: string,
        name: string,
        type: string,
      },
    |};

const PubNubFile: FileClass = class PubNubFile implements IFile {
  static supportsFile = typeof File !== 'undefined';
  static supportsBuffer = false;
  static supportsStream = false;
  static supportsString = true;

  static create(config: PubNubFileWebConstructor) {
    return new this(config);
  }

  input: any;
  inputType: 'file';

  name: string;
  mimeType: string;

  constructor(config: PubNubFileWebConstructor) {
    if (config instanceof File) {
      this.input = config;
      this.inputType = 'file';

      this.name = this.input.name;
      this.mimeType = this.input.type;
    } else if (config.response) {
      this.input = new File([config.response.text], config.response.name ?? config.name ?? '', {
        type: config.response.type,
      });

      this.inputType = 'file';
      this.name = this.input.name;
      this.mimeType = this.input.type;
    } else if (config.data) {
      this.input = new File([config.data], config.name, { type: config.mimeType });
      this.inputType = 'file';

      this.name = config.name;
      this.mimeType = config.mimeType;
    }

    if (this.input === undefined) {
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

      reader.readAsText(this.input);
    });
  }

  async toFile() {
    return this.input;
  }
};

export default PubNubFile;
