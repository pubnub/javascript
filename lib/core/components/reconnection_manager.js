/**
 * Subscription reconnection-manager.
 *
 * **Note:** Reconnection manger rely on legacy time-based availability check.
 */
export class ReconnectionManager {
    constructor(time) {
        this.time = time;
    }
    /**
     * Configure reconnection handler.
     *
     * @param callback - Successful availability check notify callback.
     */
    onReconnect(callback) {
        this.callback = callback;
    }
    /**
     * Start periodic "availability" check.
     */
    startPolling() {
        this.timeTimer = setInterval(() => this.callTime(), 3000);
    }
    /**
     * Stop periodic "availability" check.
     */
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
