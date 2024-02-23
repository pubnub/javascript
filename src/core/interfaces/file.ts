// Placeholder for Node.js-specific types, defaulting to `unknown` if not available
type NodeReadable = 'Readable' extends keyof typeof import('stream') ? import('stream').Readable : unknown;
type NodeBuffer = 'Buffer' extends keyof typeof import('buffer') ? import('buffer').Buffer : unknown;

// Placeholder for web-specific types, defaulting to `unknown` if not available
type MaybeTypedArray = typeof Uint8Array !== 'undefined' ? Uint8Array : unknown;
type WebArrayBuffer = typeof ArrayBuffer extends undefined ? unknown : ArrayBuffer;
type WebBlob = typeof Blob extends undefined ? unknown : Blob;
type WebFile = typeof File extends undefined ? unknown : File;

export type FileObject =
  | WebFile
  | { data: (ArrayBufferView | WebArrayBuffer | WebBlob | string)[]; name: string; mimeType?: string }
  | { stream?: NodeReadable; data?: NodeBuffer | string, encoding: string; name: string, mimeType?: string };

/**
 * Represents a class definition for creating file representation objects.
 * @typedef {Object} FileConstructor
 * @property {function} new - File representation object constructor.
 */
export type FileConstructor = {
  /**
   * Create file representation object.
   *
   * @param file - User-provided data for file object.
   * @returns Initialized file object instance.
   */
  new (file: FileObject): FileInterface;
};

/**
 * File representation interface.
 */
export interface FileInterface {
  /**
   * Whether platform natively supports `File`.
   */
  supportsFile(): boolean;

  /**
   * Whether platform natively supports `Blob`.
   */
  supportsBlob(): boolean;

  /**
   * Whether platform natively supports `ArrayBuffer`.
   */
  supportsArrayBuffer(): boolean;

  /**
   * Whether platform natively supports `Buffer`.
   */
  supportsBuffer(): boolean;

  /**
   * Whether platform natively supports `Stream`.
   */
  supportsStream(): boolean;

  /**
   * Whether platform natively supports `String`.
   */
  supportsString(): boolean;

  /**
   * Whether platform supports file encryption.
   */
  supportsEncryptFile(): boolean;

  /**
   * Whether platform natively supports file `Uri`.
   */
  supportsFileUri(): boolean;

  /**
   * Represent file object content as `buffer`.
   *
   * @throws Error if feature not supported on the target platform.
   *
   * @returns File content as `buffer`.
   */
  toBuffer<T>(): Promise<T | void>;

  /**
   * Represent file object content as `stream`.
   *
   * @throws Error if feature not supported on the target platform.
   *
   * @returns File content as `stream`.
   */
  toStream<T>(): Promise<T | void>;

  /**
   * Represent file object content as file `Uri`.
   *
   * @throws Error if feature not supported on the target platform.
   *
   * @returns File content as file `Uri`.
   */
  toFileUri<T>(): Promise<T | void>;

  /**
   * Represent file object content as `Blob`.
   *
   * @throws Error if feature not supported on the target platform.
   *
   * @returns File content as `Blob`.
   */
  toBlob<T>(): Promise<T | void>;

  /**
   * Represent file object content as `ArrayBuffer`.
   *
   * @throws Error if feature not supported on the target platform.
   *
   * @returns File content as `ArrayBuffer`.
   */
  toArrayBuffer<T>(): Promise<T | void>;

  /**
   * Represent file object content as `string`.
   *
   * @throws Error if feature not supported on the target platform.
   *
   * @returns File content as `string`.
   */
  toString(): Promise<string | void>;

  /**
   * Represent file object content as `File`.
   *
   * @throws Error if feature not supported on the target platform.
   *
   * @returns File content as `File`.
   */
  toFile<F>(): Promise<F | void>;
}
