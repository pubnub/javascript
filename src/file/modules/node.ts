import { Readable, PassThrough } from 'stream';
import { basename } from 'path';
import fs from 'fs';

import { FileInterface, FileObject } from '../../core/interfaces/file';

const PubNubFile = class PubNubFile implements FileInterface {
  contentLength;
  mimeType;

  data;

  name;

  supportsFile() {
    return false;
  }

  supportsBlob() {
    return false;
  }

  static supportsArrayBuffer() {
    return false;
  }

  supportsBuffer() {
    return typeof Buffer !== 'undefined';
  }

  supportsStream() {
    return true;
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

  constructor({ stream, data, encoding, name, mimeType }, ed: FileObject) {
    if ('encoding' in ed) {
      const { stream, data, encoding, name, mimeType } = ed;
      if (stream instanceof Readable) {
      } else if (data instanceof Buffer) {
      } else if (typeof data === 'string') {
      }
    }
    if (stream instanceof Readable) {
      this.data = stream;

      if (stream instanceof fs.ReadStream) {
        // $FlowFixMe: incomplete flow node definitions
        this.name = basename(stream.path);
        this.contentLength = fs.statSync(stream.path).size;
      }
    } else if ('encoding' in data) {
      let d = data;
    } else if (data instanceof Buffer) {
      this.data = Buffer.from(data);
    } else if (typeof data === 'string') {
      // $FlowFixMe: incomplete flow node definitions
      this.data = Buffer.from(data, encoding ?? 'utf8');
    }

    if (name) {
      this.name = basename(name);
    }

    if (mimeType) {
      this.mimeType = mimeType;
    }

    if (this.data === undefined) {
      throw new Error("Couldn't construct a file out of supplied options.");
    }

    if (this.name === undefined) {
      throw new Error("Couldn't guess filename out of the options. Please provide one.");
    }
  }

  toBuffer() {
    if (this.data instanceof Buffer) {
      return Promise.resolve(Buffer.from(this.data));
    }

    if (this.data instanceof Readable) {
      const stream = this.data;
      return new Promise((resolve, reject) => {
        const chunks = [];

        stream.on('data', (chunk) => chunks.push(chunk));
        stream.once('error', reject);
        stream.once('end', () => {
          resolve(Buffer.concat(chunks));
        });
      });
    }

    if (typeof this.data === 'string') {
      return Promise.resolve(Buffer.from(this.data));
    }

    throw new Error("Can't cast to 'buffer'.");
  }

  async toArrayBuffer() {
    throw new Error('This feature is only supported in browser environments.');
  }

  async toString(encoding = 'utf8') {
    const buffer = await this.toBuffer();

    return buffer.toString(encoding);
  }

  async toStream() {
    if (!(this.data instanceof Readable)) {
      const input = this.data;

      return new Readable({
        read() {
          this.push(Buffer.from(input));
          this.push(null);
        },
      });
    }

    const stream = new PassThrough();

    if (this.data instanceof Readable) {
      this.data.pipe(stream);
    }

    return stream;
  }

  async toFile() {
    throw new Error('This feature is only supported in browser environments.');
  }

  async toFileUri() {
    throw new Error('This feature is only supported in react native environments.');
  }

  async toBlob() {
    throw new Error('This feature is only supported in browser environments.');
  }
};

export default PubNubFile;
