/**
 * Messages de-duplication manager module.
 *
 * @internal
 */

import { Payload } from '../types/api';
import { PrivateClientConfiguration } from '../interfaces/configuration';

/**
 * Base real-time event payload type required by the manager.
 */
type CachedMessagePayload = { message?: Payload | undefined; timetoken: string };

/**
 * Real-time events deduplication manager.
 *
 * @internal
 */
export class DedupingManager {
  /**
   * Maximum number of caches generated for previously received real-time events.
   */
  private readonly maximumCacheSize: number;

  /**
   * Processed and cached real-time events' hashes.
   */
  private hashHistory: string[];

  /**
   * Create and configure real-time events de-duplication manager.
   *
   * @param config - PubNub client configuration object.
   */
  constructor(private readonly config: PrivateClientConfiguration) {
    config.logger().debug('DedupingManager', () => ({
      messageType: 'object',
      message: { maximumCacheSize: config.maximumCacheSize },
      details: 'Create with configuration:',
    }));

    this.maximumCacheSize = config.maximumCacheSize;
    this.hashHistory = [];
  }

  /**
   * Compute unique real-time event payload key.
   *
   * @param message - Received real-time event payload for which unique key should be computed.
   * @returns Unique real-time event payload key in messages cache.
   */
  getKey(message: CachedMessagePayload): string {
    return `${message.timetoken}-${this.hashCode(JSON.stringify(message.message ?? '')).toString()}`;
  }

  /**
   * Check whether there is similar message already received or not.
   *
   * @param message - Received real-time event payload which should be checked for duplicates.
   * @returns `true` in case if similar payload already has been received before.
   */
  isDuplicate(message: CachedMessagePayload): boolean {
    return this.hashHistory.includes(this.getKey(message));
  }

  /**
   * Store received message to be used later for duplicate detection.
   *
   * @param message - Received real-time event payload.
   */
  addEntry(message: CachedMessagePayload) {
    if (this.hashHistory.length >= this.maximumCacheSize) {
      this.hashHistory.shift();
    }

    this.hashHistory.push(this.getKey(message));
  }

  /**
   * Clean up cached messages.
   */
  clearHistory() {
    this.hashHistory = [];
  }

  /**
   * Compute message hash sum.
   *
   * @param payload - Received payload for which hash sum should be computed.
   * @returns {number} - Resulting hash sum.
   */
  hashCode(payload: string): number {
    let hash = 0;
    if (payload.length === 0) return hash;
    for (let i = 0; i < payload.length; i += 1) {
      const character = payload.charCodeAt(i);
      hash = (hash << 5) - hash + character; // eslint-disable-line
      hash = hash & hash; // eslint-disable-line
    }
    return hash;
  }
}
