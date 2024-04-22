/**
 * {@link PubNub} File object interface module.
 */

/**
 * Base file constructor parameters.
 *
 * Minimum set of parameters which can be p
 */
export type PubNubBasicFileParameters = {
  data: string | ArrayBuffer;
  name: string;
  mimeType?: string;
};

/**
 * Platform-agnostic {@link PubNub} File object.
 *
 * Interface describes share of {@link PubNub} File which is required by {@link PubNub} core to
 * perform required actions.
 */
export interface PubNubFileInterface {
  /**
   * Actual file name.
   */
  name: string;

  /**
   * File mime-type.
   */
  mimeType?: string;

  /**
   * File content length.
   */
  contentLength?: number;

  /**
   * Convert {@link PubNub} file object content to {@link ArrayBuffer}.
   *
   * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
   *
   * @throws Error if provided {@link PubNub} File object content is not supported for this
   * operation.
   */
  toArrayBuffer(): Promise<ArrayBuffer>;

  /**
   * Convert {@link PubNub} File object content to file `Uri`.
   *
   * @returns Asynchronous results of conversion to file `Uri`.
   *
   * @throws Error if provided {@link PubNub} File object content is not supported for this
   * operation.
   */
  toFileUri(): Promise<Record<string, unknown>>;
}

/**
 * {@link PubNub} File object class interface.
 */
export interface PubNubFileConstructor<File extends PubNubFileInterface, ConstructorParameters> {
  /**
   * Whether {@link Blob} data supported by platform or not.
   */
  supportsBlob: boolean;

  /**
   * Whether {@link File} data supported by platform or not.
   */
  supportsFile: boolean;

  /**
   * Whether {@link Buffer} data supported by platform or not.
   */
  supportsBuffer: boolean;

  /**
   * Whether {@link Stream} data supported by platform or not.
   */
  supportsStream: boolean;

  /**
   * Whether {@link String} data supported by platform or not.
   */
  supportsString: boolean;

  /**
   * Whether {@link ArrayBuffer} supported by platform or not.
   */
  supportsArrayBuffer: boolean;

  /**
   * Whether {@link PubNub} File object encryption supported or not.
   */
  supportsEncryptFile: boolean;

  /**
   * Whether `File Uri` data supported by platform or not.
   */
  supportsFileUri: boolean;

  /**
   * {@link PubNub} File object constructor.
   *
   * @param file - File instantiation parameters (can be raw data or structured object).
   *
   * @returns Constructed platform-specific {@link PubNub} File object.
   */
  create(file: ConstructorParameters): File;

  /**
   * {@link PubNub} File object constructor.
   *
   * @param file - File instantiation parameters (can be raw data or structured object).
   *
   * @returns Constructed platform-specific {@link PubNub} File object.
   */
  new (file: ConstructorParameters): File;
}
