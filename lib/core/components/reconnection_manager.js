"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconnectionManager = void 0;
class ReconnectionManager {
    constructor(time) {
        this.time = time;
    }
    onReconnect(callback) {
        this.callback = callback;
    }
    startPolling() {
        this.timeTimer = setInterval(() => this.callTime(), 3000);
    }
    stopPolling() {
        if (this.timeTimer)
            clearInterval(this.timeTimer);
        this.timeTimer = null;
    }
    callTime() {
        this.time((status) => {
            if (!status.error) {
                this.stopPolling();
                if (this.callback)
                    this.callback();
            }
        });
    }
}
exports.ReconnectionManager = ReconnectionManager;
