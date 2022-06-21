const BASE64_CHARMAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

/**
 * Decode a Base64 encoded string.
 *
 * @param paddedInput Base64 string with padding
 * @returns ArrayBuffer with decoded data
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
