/**
 * PubNub access token.
 *
 * Object used to simplify manipulations with requests (aggregation) in the Shared Worker context.
 */
export class AccessToken {
  /**
   * Token comparison based on expiration date.
   *
   * The access token with the most distant expiration date (which should be used in requests) will be at the end of the
   * sorted array.
   *
   * **Note:** `compare` used with {@link Array.sort|sort} function to identify token with more distant expiration date.
   *
   * @param lhToken - Left-hand access token which will be used in {@link Array.sort|sort} comparison.
   * @param rhToken - Right-hand access token which will be used in {@link Array.sort|sort} comparison.
   * @returns Comparison result.
   */
  static compare(lhToken: AccessToken, rhToken: AccessToken): number {
    const lhTokenExpiration = lhToken.expiration ?? 0;
    const rhTokenExpiration = rhToken.expiration ?? 0;
    return lhTokenExpiration - rhTokenExpiration;
  }

  /**
   * Create access token object for PubNub client.
   *
   * @param token - Authorization key or access token for `read` access to the channels and groups.
   * @param [simplifiedToken] - Simplified access token based only on content of `resources`, `patterns`, and
   * `authorized_uuid`.
   * @param [expiration] - Access token expiration date.
   */
  constructor(
    private readonly token: string,
    private readonly simplifiedToken?: string,
    private readonly expiration?: number,
  ) {}

  /**
   * Represent the access token as identifier.
   *
   * @returns String that lets us identify other access tokens that have similar configurations.
   */
  get asIdentifier() {
    return this.simplifiedToken ?? this.token;
  }

  /**
   * Check whether two access token objects represent the same permissions or not.
   *
   * @param other - Other access token which should be used in comparison.
   * @returns `true` if received and another access token object represents the same permissions.
   */
  equalTo(other: AccessToken): boolean {
    return this.asIdentifier === other.asIdentifier;
  }

  /**
   * Stringify object to actual access token / key value.
   *
   * @returns Actual access token / key value.
   */
  toString() {
    return this.token;
  }
}
