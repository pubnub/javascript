"use strict";
/**
 * Subscription reconnection-manager.
 *
 * **Note:** Reconnection manger rely on legacy time-based availability check.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconnectionManager = void 0;
var ReconnectionManager = /** @class */ (function () {
    function ReconnectionManager(time) {
        this.time = time;
    }
    /**
     * Configure reconnection handler.
     *
     * @param callback - Successful availability check notify callback.
     */
    ReconnectionManager.prototype.onReconnect = function (callback) {
        this.callback = callback;
    };
    /**
     * Start periodic "availability" check.
     */
    ReconnectionManager.prototype.startPolling = function () {
        var _this = this;
        this.timeTimer = setInterval(function () { return _this.callTime(); }, 3000);
    };
    /**
     * Stop periodic "availability" check.
     */
    ReconnectionManager.prototype.stopPolling = function () {
        if (this.timeTimer)
            clearInterval(this.timeTimer);
        this.timeTimer = null;
    };
    ReconnectionManager.prototype.callTime = function () {
        var _this = this;
        this.time(function (status) {
            if (!status.error) {
                _this.stopPolling();
                if (_this.callback)
                    _this.callback();
            }
        });
    };
    return ReconnectionManager;
}());
exports.ReconnectionManager = ReconnectionManager;
