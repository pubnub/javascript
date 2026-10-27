"use strict";
/**
 * Byte helpers shared by cryptors and crypto primitives.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeUtf8Strict = exports.toArrayBuffer = exports.bytesToHex = void 0;
/**
 * Lazily created UTF-8 decoder.
 *
 * **Note:** Not created at module load and doesn't use `fatal` option because some polyfills (for example
 * `fast-text-encoding` used on React Native) throw when it is requested.
 */
let decoder;
/**
 * Lazily created UTF-8 encoder.
 */
let encoder;
/**
 * Convert bytes to lowercase HEX string.
 *
 * @param bytes - Source bytes.
 *
 * @returns HEX encoded bytes.
 *
 * @internal
 */
const bytesToHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
exports.bytesToHex = bytesToHex;
/**
 * Copy bytes into standalone {@link ArrayBuffer}.
 *
 * @param bytes - Source bytes (may be a view into a larger buffer).
 *
 * @returns {@link ArrayBuffer} which contains only source bytes.
 *
 * @internal
 */
const toArrayBuffer = (bytes) => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
exports.toArrayBuffer = toArrayBuffer;
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
const decodeUtf8Strict = (bytes) => {
    decoder !== null && decoder !== void 0 ? decoder : (decoder = new TextDecoder());
    encoder !== null && encoder !== void 0 ? encoder : (encoder = new TextEncoder());
    const decoded = decoder.decode(bytes);
    const encoded = encoder.encode(decoded);
    const matches = encoded.byteLength === bytes.byteLength && encoded.every((byte, index) => byte === bytes[index]);
    if (!matches)
        throw new Error('Malformed UTF-8 data');
    return decoded;
};
exports.decodeUtf8Strict = decodeUtf8Strict;
