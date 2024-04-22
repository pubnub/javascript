/* global File, FileReader */
/**
 * Browser {@link PubNub} File object module.
 */

import { PubNubFileInterface } from '../../core/types/file';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------

// region Types
/**
 * PubNub File instance creation parameters.
 */
export type PubNubFileParameters =
  | File
  | { data: string | Blob | ArrayBuffer | ArrayBufferView; name: string; mimeType?: string };
// endregion

/**
 * Web implementation for {@link PubNub} File object.
 *
 * **Important:** Class should implement constructor and class fields from {@link PubNubFileConstructor}.
 */
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
  readonly data: File;

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
    let contentLength: number | undefined;
    let fileMimeType: string | undefined;
    let fileName: string | undefined;
    let fileData: File | undefined;

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
    }

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
   * @throws Error because {@link Buffer} not available in browser environment.
   */
  async toBuffer() {
    throw new Error('This feature is only supported in Node.js environments.');
  }

  /**
   * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
   *
   * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
   */
  async toArrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        if (reader.result instanceof ArrayBuffer) return resolve(reader.result);
      });
      reader.addEventListener('error', () => reject(reader.error));
      reader.readAsArrayBuffer(this.data);
    });
  }

  /**
   * Convert {@link PubNub} File object content to {@link string}.
   *
   * @returns Asynchronous results of conversion to the {@link string}.
   */
  async toString(): Promise<string> {
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

  /**
   * Convert {@link PubNub} File object content to {@link Readable} stream.
   *
   * @throws Error because {@link Readable} stream not available in browser environment.
   */
  async toStream() {
    throw new Error('This feature is only supported in Node.js environments.');
  }

  /**
   * Convert {@link PubNub} File object content to {@link File}.
   *
   * @returns Asynchronous results of conversion to the {@link File}.
   */
  async toFile() {
    return this.data;
  }

  /**
   * Convert {@link PubNub} File object content to file `Uri`.
   *
   * @throws Error because file `Uri` not available in browser environment.
   */
  async toFileUri(): Promise<Record<string, unknown>> {
    throw new Error('This feature is only supported in React Native environments.');
  }

  /**
   * Convert {@link PubNub} File object content to {@link Blob}.
   *
   * @returns Asynchronous results of conversion to the {@link Blob}.
   */
  async toBlob() {
    return this.data;
  }
}
