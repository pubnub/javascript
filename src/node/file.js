/** @flow */

import { lookup } from 'mime-types';

import { Readable, PassThrough } from 'stream';
import { ReadStream } from 'fs';
import { basename } from 'path';

import { IFile, FileClass } from '../core/components/file';

type PubNubFileNodeConstructor = {|
  stream?: Readable,
  buffer?: Buffer,
  data?: string,
  encoding?: string,
  name?: string,
  mimeType?: string,
|};

type PubNubFileNodeSupportedInputTypeType = 'stream' | 'buffer' | 'string';
type PubNubFileNodeSupportedInputType = Readable | Buffer | string;

const PubNubFile: FileClass = class PubNubFile implements IFile {
  static supportsFile = false;
  static supportsBuffer = typeof Buffer !== 'undefined';
  static supportsStream = true;
  static supportsString = true;

  input: PubNubFileNodeSupportedInputType;
  inputType: PubNubFileNodeSupportedInputTypeType;

  name: string;
  mimeType: string;

  toBuffer(): Promise<Buffer> {
    if (this.input instanceof Buffer) {
      return Promise.resolve(Buffer.from(this.input));
    }

    if (this.input instanceof Readable) {
      const stream = this.input;
      return new Promise((resolve, reject) => {
        const chunks = [];

        stream.on('data', (chunk) => chunks.push(chunk));
        stream.once('error', reject);
        stream.once('end', () => {
          resolve(Buffer.concat(chunks));
        });
      });
    }

    if (typeof this.input === 'string') {
      return Promise.resolve(Buffer.from(this.input));
    }

    throw new Error("Can't cast to 'buffer'.");
  }

  async toString(encoding: buffer$NonBufferEncoding = 'utf8') {
    const buffer = await this.toBuffer();

    return buffer.toString(encoding);
  }

  async toStream() {
    if (this.inputType !== 'stream') {
      throw new Error(`Can't cast from '${this.inputType}' to 'stream'.`);
    }

    const stream = new PassThrough();

    if (this.input instanceof Readable) {
      this.input.pipe(stream);
    }

    return stream;
  }

  async toFile() {
    throw new Error('This feature is only supported in browser environments.');
  }

  static create(config: PubNubFileNodeConstructor) {
    return new this(config);
  }

  constructor({ stream, buffer, data, encoding, name, mimeType }: PubNubFileNodeConstructor) {
    if (stream instanceof Readable) {
      if (stream instanceof ReadStream) {
        // $FlowFixMe: incomplete flow node definitions
        this.name = basename(stream.path);
        // $FlowFixMe: incomplete flow node definitions
        this.mimeType = lookup(stream.path);
      }

      this.inputType = 'stream';
      this.input = stream;
    }

    if (buffer instanceof Buffer) {
      this.inputType = 'buffer';
      this.input = buffer;
    }

    if (typeof data === 'string') {
      this.inputType = 'buffer';

      // $FlowFixMe: incomplete flow node definitions
      this.input = Buffer.from(data, encoding ?? 'utf8');
    }

    if (name) {
      this.name = basename(name);
      this.mimeType = lookup(name);
    }

    if (mimeType) {
      this.mimeType = mimeType;
    }

    if (this.input === undefined) {
      throw new Error("Couldn't construct a file out of supplied options.");
    }

    if (this.name === undefined) {
      throw new Error("Couldn't guess filename out of the options. Please provide one.");
    }
  }
};

export default PubNubFile;
