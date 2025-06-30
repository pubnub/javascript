"use strict";
/**
 * Messages de-duplication manager module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DedupingManager = void 0;
/**
 * Real-time events deduplication manager.
 *
 * @internal
 */
class DedupingManager {
    /**
     * Create and configure real-time events de-duplication manager.
     *
     * @param config - PubNub client configuration object.
     */
    constructor(config) {
        this.config = config;
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
    getKey(message) {
        var _a;
        return `${message.timetoken}-${this.hashCode(JSON.stringify((_a = message.message) !== null && _a !== void 0 ? _a : '')).toString()}`;
    }
    /**
     * Check whether there is similar message already received or not.
     *
     * @param message - Received real-time event payload which should be checked for duplicates.
     * @returns `true` in case if similar payload already has been received before.
     */
    isDuplicate(message) {
        return this.hashHistory.includes(this.getKey(message));
    }
    /**
     * Store received message to be used later for duplicate detection.
     *
     * @param message - Received real-time event payload.
     */
    addEntry(message) {
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
    hashCode(payload) {
        let hash = 0;
        if (payload.length === 0)
            return hash;
        for (let i = 0; i < payload.length; i += 1) {
            const character = payload.charCodeAt(i);
            hash = (hash << 5) - hash + character; // eslint-disable-line
            hash = hash & hash; // eslint-disable-line
        }
        return hash;
    }
}
exports.DedupingManager = DedupingManager;
