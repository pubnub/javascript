/**
 * Subscription reconnection-manager.
 *
 * **Note:** Reconnection manger rely on legacy time-based availability check.
 */

import { PubNubCore } from '../pubnub-common';

/**
 * Network "discovery" manager.
 *
 * Manager perform periodic `time` API calls to identify network availability.
 *
 * @internal
 */
export class ReconnectionManager {
  /**
   * Successful availability check callback.
   *
   * @private
   */
  private callback?: () => void;

  /**
   * Time REST API call timer.
   */
  private timeTimer?: number | null;

  constructor(private readonly time: typeof PubNubCore.prototype.time) {}

  /**
   * Configure reconnection handler.
   *
   * @param callback - Successful availability check notify callback.
   */
  public onReconnect(callback: () => void) {
    this.callback = callback;
  }

  /**
   * Start periodic "availability" check.
   */
  public startPolling() {
    this.timeTimer = setInterval(() => this.callTime(), 3000) as unknown as number;
  }

  /**
   * Stop periodic "availability" check.
   */
  public stopPolling() {
    if (this.timeTimer) clearInterval(this.timeTimer);
    this.timeTimer = null;
  }

  private callTime() {
    this.time((status) => {
      if (!status.error) {
        this.stopPolling();
        if (this.callback) this.callback();
      }
    });
  }
}
