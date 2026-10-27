/**
 * Byte helpers shared by cryptors and crypto primitives.
 *
 * @internal
 */

/**
 * Lazily created UTF-8 decoder.
 *
 * **Note:** Not created at module load and doesn't use `fatal` option because some polyfills (for example
 * `fast-text-encoding` used on React Native) throw when it is requested.
 */
let decoder: TextDecoder | undefined;

/**
 * Lazily created UTF-8 encoder.
 */
let encoder: TextEncoder | undefined;

/**
 * Convert bytes to lowercase HEX string.
 *
 * @param bytes - Source bytes.
 *
 * @returns HEX encoded bytes.
 *
 * @internal
 */
export const bytesToHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

/**
 * Copy bytes into standalone {@link ArrayBuffer}.
 *
 * @param bytes - Source bytes (may be a view into a larger buffer).
 *
 * @returns {@link ArrayBuffer} which contains only source bytes.
 *
 * @internal
 */
export const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

/**
 * Strictly decode UTF-8 bytes.
 *
 * Behaves like CryptoJS `Utf8.stringify` used by previous SDK versions: malformed sequences (and a leading
 * BOM, which a regular decoder silently strips) are rejected instead of being replaced.
 *
 * @param bytes - UTF-8 encoded bytes.
 *
 * @returns Decoded string.
 *
 * @throws Error if bytes aren't a valid UTF-8 sequence.
 *
 * @internal
 */
export const decodeUtf8Strict = (bytes: Uint8Array): string => {
  decoder ??= new TextDecoder();
  encoder ??= new TextEncoder();

  const decoded = decoder.decode(bytes);
  const encoded = encoder.encode(decoded);
  const matches = encoded.byteLength === bytes.byteLength && encoded.every((byte, index) => byte === bytes[index]);
  if (!matches) throw new Error('Malformed UTF-8 data');

  return decoded;
};
