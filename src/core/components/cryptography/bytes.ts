/**
 * Byte helpers shared by cryptors and crypto primitives.
 *
 * @internal
 */

/**
 * Lazily created UTF-8 decoder.
 *
 * **Note:** Not created at module load and doesn't use `fatal` option because some polyfills (for example
 * `fast-text-encoding` used on React Native) throw when it is requested. Input is validated by
 * {@link isWellFormedUtf8} instead, so the decoder only ever receives well-formed data.
 */
let decoder: TextDecoder | undefined;

/**
 * Whether {@link decoder} strips a leading BOM despite `ignoreBOM` option (detected once, on first use).
 */
let decoderStripsBOM = false;

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
 * Check whether bytes are well-formed UTF-8.
 *
 * Implements Unicode "Well-Formed UTF-8 Byte Sequences" (Table 3-7): rejects stray continuation bytes, overlong
 * forms (`C0`, `C1`, `E0 80-9F`, `F0 80-8F`), surrogates (`ED A0-BF`), code points above U+10FFFF (`F4 90-BF`,
 * `F5-FF`) and truncated sequences. Same rules as CryptoJS `Utf8.stringify` (`decodeURIComponent`).
 *
 * @param bytes - Bytes which should be checked.
 *
 * @returns `true` if bytes are well-formed UTF-8.
 *
 * @internal
 */
export const isWellFormedUtf8 = (bytes: Uint8Array): boolean => {
  const length = bytes.length;
  let index = 0;

  while (index < length) {
    const lead = bytes[index];

    if (lead < 0x80) {
      index += 1;
      continue;
    }

    let continuationBytes: number;
    // Allowed range of the first continuation byte (narrower for some lead bytes).
    let lower = 0x80;
    let upper = 0xbf;

    if (lead >= 0xc2 && lead <= 0xdf) continuationBytes = 1;
    else if (lead >= 0xe0 && lead <= 0xef) {
      continuationBytes = 2;
      if (lead === 0xe0) lower = 0xa0;
      else if (lead === 0xed) upper = 0x9f;
    } else if (lead >= 0xf0 && lead <= 0xf4) {
      continuationBytes = 3;
      if (lead === 0xf0) lower = 0x90;
      else if (lead === 0xf4) upper = 0x8f;
    } else return false;

    if (index + continuationBytes >= length) return false;

    const first = bytes[index + 1];
    if (first < lower || first > upper) return false;

    for (let offset = 2; offset <= continuationBytes; offset++) {
      const next = bytes[index + offset];
      if (next < 0x80 || next > 0xbf) return false;
    }

    index += continuationBytes + 1;
  }

  return true;
};

/**
 * Strictly decode UTF-8 bytes.
 *
 * Behaves like CryptoJS `Utf8.stringify` used by previous SDK versions: malformed sequences are rejected instead of
 * being replaced, and a leading BOM is preserved (regular decoders silently strip it). Result doesn't depend on the
 * platform `TextDecoder` implementation or polyfill.
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
  if (!isWellFormedUtf8(bytes)) throw new Error('Malformed UTF-8 data');

  if (!decoder) {
    decoder = new TextDecoder('utf-8', { ignoreBOM: true });
    decoderStripsBOM = decoder.decode(new Uint8Array([0xef, 0xbb, 0xbf])).length === 0;
  }

  const decoded = decoder.decode(bytes);
  const hasBOM = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;

  return hasBOM && decoderStripsBOM ? `\uFEFF${decoded}` : decoded;
};
