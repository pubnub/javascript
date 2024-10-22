/**
 * Subscription cursor.
 *
 * Cursor used by {@link PubNub} client as reference point in time after which new real-time events should be
 * received and processed.
 */
export type Cursor = {
  /**
   * PubNub high-precision timestamp.
   */
  readonly timetoken: string;
  /**
   * Data center region for which `timetoken` has been generated.
   *
   * **Note:** This is an _optional_ value and can be set to `0` if not needed.
   */
  readonly region?: number;
};
