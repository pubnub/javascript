/**
 * Node.js {@link PubNub} File object module.
 */

import { Readable, PassThrough } from 'stream';
import { Buffer } from 'buffer';
import { basename } from 'path';
import fs from 'fs';

import { PubNubFileInterface } from '../../core/types/file';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------

// region Types
/**
 * PubNub File instance creation parameters.
 */
export type PubNubFileParameters<StringEncoding extends BufferEncoding = BufferEncoding> = {
  /**
   * Readable stream represents file object content.
   */
  stream?: Readable;

  /**
   * Buffer or string represents file object content.
   */
  data?: Buffer | ArrayBuffer | string;

  /**
   * String {@link PubNubFileParameters#data|data} encoding.
   *
   * @default `utf8`
   */
  encoding?: StringEncoding;

  /**
   * File object name.
   */
  name: string;

  /**
   * File object content type.
   */
  mimeType?: string;
};
// endregion

/**
 * Node.js implementation for {@link PubNub} File object.
 *
 * **Important:** Class should implement constructor and class fields from {@link PubNubFileConstructor}.
 */
export default class PubNubFile implements PubNubFileInterface {
  // region Class properties
  /**
   * Whether {@link Blob} data supported by platform or not.
   */
  static supportsBlob = false;

  /**
   * Whether {@link File} data supported by platform or not.
   */
  static supportsFile = false;

  /**
   * Whether {@link Buffer} data supported by platform or not.
   */
  static supportsBuffer = true;

  /**
   * Whether {@link Stream} data supported by platform or not.
   */
  static supportsStream = true;

  /**
   * Whether {@link String} data supported by platform or not.
   */
  static supportsString = true;

  /**
   * Whether {@link ArrayBuffer} supported by platform or not.
   */
  static supportsArrayBuffer = true;

  /**
   * Whether {@link PubNub} File object encryption supported or not.
   */
  static supportsEncryptFile = true;

  /**
   * Whether `File Uri` data supported by platform or not.
   */
  static supportsFileUri = false;
  // endregion

  // region Instance properties
  /**
   * File object content source.
   */
  readonly data: Readable | Buffer;

  /**
   * File object content length.
   */
  contentLength?: number;

  /**
   * File object content type.
   */
  mimeType: string;

  /**
   * File object name.
   */
  name: string;
  // endregion

  static create(file: PubNubFileParameters) {
    return new PubNubFile(file);
  }

  constructor(file: PubNubFileParameters) {
    const { stream, data, encoding, name, mimeType } = file;
    let fileData: Readable | Buffer | undefined;
    let contentLength: number | undefined;
    let fileMimeType: string | undefined;
    let fileName: string | undefined;

    if (stream && stream instanceof Readable) {
      fileData = stream;

      if (stream instanceof fs.ReadStream) {
        const streamFilePath = stream.path instanceof Buffer ? new TextDecoder().decode(stream.path) : stream.path;
        fileName = basename(streamFilePath);
        contentLength = fs.statSync(streamFilePath).size;
      }
    } else if (data instanceof Buffer) {
      contentLength = data.length;
      // Copy content of the source Buffer.
      fileData = Buffer.alloc(contentLength!);
      data.copy(fileData);
    } else if (data instanceof ArrayBuffer) {
      contentLength = data.byteLength;
      fileData = Buffer.from(data);
    } else if (typeof data === 'string') {
      fileData = Buffer.from(data, encoding ?? 'utf8');
      contentLength = fileData.length;
    }

    if (contentLength) this.contentLength = contentLength;
    if (mimeType) fileMimeType = mimeType;
    else fileMimeType = 'application/octet-stream';
    if (name) fileName = basename(name);

    if (fileData === undefined) throw new Error("Couldn't construct a file out of supplied options.");
    if (fileName === undefined) throw new Error("Couldn't guess filename out of the options. Please provide one.");

    this.mimeType = fileMimeType;
    this.data = fileData;
    this.name = fileName;
  }

  /**
   * Convert {@link PubNub} File object content to {@link Buffer}.
   *
   * @returns Asynchronous results of conversion to the {@link Buffer}.
   */
  async toBuffer(): Promise<Buffer> {
    if (this.data instanceof Buffer) return this.data;

    const stream = this.data;
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];

      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      // Handle any errors during streaming
      stream.on('error', (error) => reject(error));
    });
  }

  /**
   * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
   *
   * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
   */
  async toArrayBuffer(): Promise<ArrayBuffer> {
    return this.toBuffer().then((buffer) => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length));
  }

  /**
   * Convert {@link PubNub} File object content to {@link string}.
   *
   * @returns Asynchronous results of conversion to the {@link string}.
   */
  async toString(encoding: BufferEncoding = 'utf8'): Promise<string> {
    return this.toBuffer().then((buffer) => buffer.toString(encoding));
  }

  /**
   * Convert {@link PubNub} File object content to {@link Readable} stream.
   *
   * @returns Asynchronous results of conversion to the {@link Readable} stream.
   */
  async toStream() {
    if (this.data instanceof Readable) {
      const stream = new PassThrough();
      this.data.pipe(stream);

      return stream;
    }

    return this.toBuffer().then(
      (buffer) =>
        new Readable({
          read() {
            this.push(buffer);
            this.push(null);
          },
        }),
    );
  }

  /**
   * Convert {@link PubNub} File object content to {@link File}.
   *
   * @throws Error because {@link File} not available in Node.js environment.
   */
  async toFile() {
    throw new Error('This feature is only supported in browser environments.');
  }

  /**
   * Convert {@link PubNub} File object content to file `Uri`.
   *
   * @throws Error because file `Uri` not available in Node.js environment.
   */
  async toFileUri(): Promise<Record<string, unknown>> {
    throw new Error('This feature is only supported in React Native environments.');
  }

  /**
   * Convert {@link PubNub} File object content to {@link Blob}.
   *
   * @throws Error because {@link Blob} not available in Node.js environment.
   */
  async toBlob() {
    throw new Error('This feature is only supported in browser environments.');
  }
}
