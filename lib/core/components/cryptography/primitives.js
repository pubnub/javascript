"use strict";
/**
 * Platform-agnostic cryptography primitives contract and byte helpers.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toArrayBuffer = exports.concatBytes = exports.hexToBytes = exports.bytesToHex = exports.decodeUtf8 = exports.encodeUtf8 = void 0;
/**
 * Encode string to UTF-8 bytes.
 *
 * @param string - Source string.
 *
 * @returns UTF-8 bytes.
 *
 * @internal
 */
const encodeUtf8 = (string) => new TextEncoder().encode(string);
exports.encodeUtf8 = encodeUtf8;
/**
 * Decode UTF-8 bytes to string.
 *
 * **Note:** Non-fatal decoder used because React Native `TextDecoder` polyfill doesn't support `fatal` option.
 *
 * @param bytes - UTF-8 bytes.
 *
 * @returns Decoded string.
 *
 * @internal
 */
const decodeUtf8 = (bytes) => new TextDecoder().decode(bytes);
exports.decodeUtf8 = decodeUtf8;
/**
 * Convert bytes to lowercase hex string.
 *
 * @param bytes - Source bytes.
 *
 * @returns Hex string.
 *
 * @internal
 */
const bytesToHex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
exports.bytesToHex = bytesToHex;
/**
 * Convert hex string to bytes.
 *
 * @param hex - Hex string.
 *
 * @returns Decoded bytes.
 *
 * @internal
 */
const hexToBytes = (hex) => { var _a; return Uint8Array.from((_a = hex.match(/.{1,2}/g)) !== null && _a !== void 0 ? _a : [], (byte) => parseInt(byte, 16)); };
exports.hexToBytes = hexToBytes;
/**
 * Concatenate two bytes arrays.
 *
 * @param a - First bytes array.
 * @param b - Second bytes array.
 *
 * @returns Concatenated bytes.
 *
 * @internal
 */
const concatBytes = (a, b) => {
    const result = new Uint8Array(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
};
exports.concatBytes = concatBytes;
/**
 * Copy bytes into standalone `ArrayBuffer`.
 *
 * **Important:** Primitives may return views into larger buffers (noble subarrays, Node.js `Buffer` pool), so the
 * underlying `.buffer` must never be used directly.
 *
 * @param bytes - Source bytes (possibly a view).
 *
 * @returns `ArrayBuffer` with exactly `bytes` content.
 *
 * @internal
 */
const toArrayBuffer = (bytes) => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
exports.toArrayBuffer = toArrayBuffer;
