const BASE64_CHARMAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

/**
 * Decode a Base64 encoded string.
 *
 * @param paddedInput Base64 string with padding
 * @returns ArrayBuffer with decoded data
 *
 * @internal
 */
export function decode(paddedInput: string): ArrayBuffer {
  // Remove up to last two equal signs.
  const input = paddedInput.replace(/==?$/, '');

  const outputLength = Math.floor((input.length / 4) * 3);

  // Prepare output buffer.
  const data = new ArrayBuffer(outputLength);
  const view = new Uint8Array(data);

  let cursor = 0;

  /**
   * Returns the next integer representation of a sixtet of bytes from the input
   * @returns sixtet of bytes
   */
  function nextSixtet() {
    const char = input.charAt(cursor++);
    const index = BASE64_CHARMAP.indexOf(char);

    if (index === -1) {
      throw new Error(`Illegal character at ${cursor}: ${input.charAt(cursor - 1)}`);
    }

    return index;
  }

  for (let i = 0; i < outputLength; i += 3) {
    // Obtain four sixtets
    const sx1 = nextSixtet();
    const sx2 = nextSixtet();
    const sx3 = nextSixtet();
    const sx4 = nextSixtet();

    // Encode them as three octets
    const oc1 = ((sx1 & 0b00111111) << 2) | (sx2 >> 4);
    const oc2 = ((sx2 & 0b00001111) << 4) | (sx3 >> 2);
    const oc3 = ((sx3 & 0b00000011) << 6) | (sx4 >> 0);

    view[i] = oc1;
    // Skip padding bytes.
    if (sx3 != 64) view[i + 1] = oc2;
    if (sx4 != 64) view[i + 2] = oc3;
  }

  return data;
}

/**
 * Encode `ArrayBuffer` as a Base64 encoded string.
 *
 * @param input ArrayBuffer with source data.
 * @returns Base64 string with padding.
 *
 * @internal
 */
export function encode(input: ArrayBuffer): string {
  let base64 = '';
  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  const bytes = new Uint8Array(input);
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a, b, c, d;
  let chunk;

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63; // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '==';
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
  }

  return base64;
}
