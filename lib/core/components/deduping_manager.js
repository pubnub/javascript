"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
const hashCode = (payload) => {
    let hash = 0;
    if (payload.length === 0)
        return hash;
    for (let i = 0; i < payload.length; i += 1) {
        const character = payload.charCodeAt(i);
        hash = (hash << 5) - hash + character; // eslint-disable-line
        hash = hash & hash; // eslint-disable-line
    }
    return hash;
};
/**
 * Real-time events deduplication manager.
 *
 * @internal
 */
class default_1 {
    constructor({ config }) {
        this.hashHistory = [];
        this._config = config;
    }
    getKey(message) {
        const hashedPayload = hashCode(JSON.stringify(message.message)).toString();
        const timetoken = message.timetoken;
        return `${timetoken}-${hashedPayload}`;
    }
    isDuplicate(message) {
        return this.hashHistory.includes(this.getKey(message));
    }
    addEntry(message) {
        if (this.hashHistory.length >= this._config.maximumCacheSize) {
            this.hashHistory.shift();
        }
        this.hashHistory.push(this.getKey(message));
    }
    clearHistory() {
        this.hashHistory = [];
    }
}
exports.default = default_1;
