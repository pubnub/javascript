/**
 * Cbor decoder module.
 */

/**
 * CBOR data decoder.
 *
 * @internal
 */
export default class Cbor {
  constructor(
    private readonly decode: (arrayBuffer: ArrayBuffer) => Record<string, unknown>,
    private readonly base64ToBinary: (paddedInput: string) => ArrayBuffer,
  ) {}

  /**
   * Decode CBOR base64-encoded object.
   *
   * @param tokenString - Base64-encoded token.
   *
   * @returns Token object decoded from CBOR.
   */
  decodeToken(tokenString: string): Record<string, unknown> | undefined {
    let padding = '';

    if (tokenString.length % 4 === 3) padding = '=';
    else if (tokenString.length % 4 === 2) padding = '==';

    const cleaned = tokenString.replace(/-/gi, '+').replace(/_/gi, '/') + padding;
    const result = this.decode(this.base64ToBinary(cleaned));

    return typeof result === 'object' ? result : undefined;
  }
}
