/* global File, FileReader */
/**
 * React Native {@link PubNub} File object module.
 */

import { PubNubFileInterface } from '../../core/types/file';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------

// region Types
/**
 * File path-based file.
 */
type FileUri = { uri: string; name: string; mimeType?: string };

/**
 * Asynchronously fetched file content.
 */
type ReadableFile = { arrayBuffer: () => Promise<ArrayBuffer>; blob: () => Promise<Blob>; text: () => Promise<string> };

/**
 * PubNub File instance creation parameters.
 */
export type PubNubFileParameters =
  | File
  | FileUri
  | ReadableFile
  | { data: string | Blob | ArrayBuffer | ArrayBufferView; name: string; mimeType?: string };
// endregion

export class PubNubFile implements PubNubFileInterface {
  // region Class properties
  /**
   * Whether {@link Blob} data supported by platform or not.
   */
  static supportsBlob = typeof Blob !== 'undefined';

  /**
   * Whether {@link File} data supported by platform or not.
   */
  static supportsFile = typeof File !== 'undefined';

  /**
   * Whether {@link Buffer} data supported by platform or not.
   */
  static supportsBuffer = false;

  /**
   * Whether {@link Stream} data supported by platform or not.
   */
  static supportsStream = false;

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
  static supportsEncryptFile = false;

  /**
   * Whether `File Uri` data supported by platform or not.
   */
  static supportsFileUri = true;
  // endregion

  // region Instance properties
  /**
   * File object content source.
   */
  readonly data: File | FileUri | ReadableFile;

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
    let fileData: PubNubFile['data'] | undefined;
    let contentLength: number | undefined;
    let fileMimeType: string | undefined;
    let fileName: string | undefined;

    if (file instanceof File) {
      fileData = file;

      fileName = file.name;
      fileMimeType = file.type;
      contentLength = file.size;
    } else if ('data' in file) {
      const contents = file.data;

      fileMimeType = file.mimeType;
      fileName = file.name;
      fileData = new File([contents], fileName, { type: fileMimeType });
      contentLength = fileData.size;
    } else if ('uri' in file) {
      fileMimeType = file.mimeType;
      fileName = file.name;
      fileData = {
        uri: file.uri,
        name: file.name,
        type: file.mimeType!,
      };
    } else throw new Error("Couldn't construct a file out of supplied options. URI or file data required.");

    if (fileData === undefined) throw new Error("Couldn't construct a file out of supplied options.");
    if (fileName === undefined) throw new Error("Couldn't guess filename out of the options. Please provide one.");

    if (contentLength) this.contentLength = contentLength;
    this.mimeType = fileMimeType!;
    this.data = fileData;
    this.name = fileName;
  }

  /**
   * Convert {@link PubNub} File object content to {@link Buffer}.
   *
   * @throws Error because {@link Buffer} not available in React Native environment.
   */
  async toBuffer() {
    throw new Error('This feature is only supported in Node.js environments.');
  }

  /**
   * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
   *
   * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
   *
   * @throws Error if provided {@link PubNub} File object content is not supported for this
   * operation.
   */
  async toArrayBuffer(): Promise<ArrayBuffer> {
    if (this.data && this.data instanceof File) {
      const data = this.data;

      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
          if (reader.result instanceof ArrayBuffer) return resolve(reader.result);
        });
        reader.addEventListener('error', () => reject(reader.error));
        reader.readAsArrayBuffer(data);
      });
    } else if (this.data && 'uri' in this.data) {
      throw new Error('This file contains a file URI and does not contain the file contents.');
    } else if (this.data) {
      let result: ArrayBuffer | undefined;

      try {
        result = await this.data.arrayBuffer();
      } catch (error) {
        throw new Error(`Unable to support toArrayBuffer in ReactNative environment: ${error}`);
      }

      return result;
    }

    throw new Error('Unable convert provided file content type to ArrayBuffer');
  }

  /**
   * Convert {@link PubNub} File object content to {@link string}.
   *
   * @returns Asynchronous results of conversion to the {@link string}.
   */
  async toString(): Promise<string> {
    if (this.data && 'uri' in this.data) return JSON.stringify(this.data);
    else if (this.data && this.data instanceof File) {
      const data = this.data;

      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
          if (typeof reader.result === 'string') return resolve(reader.result);
        });
        reader.addEventListener('error', () => reject(reader.error));
        reader.readAsBinaryString(data);
      });
    }

    return this.data.text();
  }

  /**
   * Convert {@link PubNub} File object content to {@link Readable} stream.
   *
   * @throws Error because {@link Readable} stream not available in React Native environment.
   */
  async toStream() {
    throw new Error('This feature is only supported in Node.js environments.');
  }

  /**
   * Convert {@link PubNub} File object content to {@link File}.
   *
   * @returns Asynchronous results of conversion to the {@link File}.
   *
   * @throws Error if provided {@link PubNub} File object content is not supported for this
   * operation.
   */
  async toFile() {
    if (this.data instanceof File) return this.data;
    else if ('uri' in this.data)
      throw new Error('This file contains a file URI and does not contain the file contents.');
    else return this.data.blob();
  }

  /**
   * Convert {@link PubNub} File object content to file `Uri`.
   *
   * @returns Asynchronous results of conversion to file `Uri`.
   *
   * @throws Error if provided {@link PubNub} File object content is not supported for this
   * operation.
   */
  async toFileUri() {
    if (this.data && 'uri' in this.data) return this.data;

    throw new Error('This file does not contain a file URI');
  }

  /**
   * Convert {@link PubNub} File object content to {@link Blob}.
   *
   * @returns Asynchronous results of conversion to the {@link Blob}.
   *
   * @throws Error if provided {@link PubNub} File object content is not supported for this
   * operation.
   */
  async toBlob() {
    if (this.data instanceof File) return this.data;
    else if (this.data && 'uri' in this.data)
      throw new Error('This file contains a file URI and does not contain the file contents.');
    else return this.data.blob();
  }
}

export default PubNubFile;
