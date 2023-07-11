"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconnectionDelay = void 0;
var ReconnectionDelay = /** @class */ (function () {
    function ReconnectionDelay() {
    }
    ReconnectionDelay.getDelay = function (policy, attempts, backoff) {
        var backoffValue = backoff !== null && backoff !== void 0 ? backoff : 5;
        switch (policy.toUpperCase()) {
            case 'LINEAR':
                return attempts * backoffValue + Math.random() * 1000;
            case 'EXPONENTIAL':
                return Math.trunc(Math.pow(2, attempts - 1)) * 1000 + Math.random() * 1000;
            default:
                throw new Error('invalid policy');
        }
    };
    return ReconnectionDelay;
}());
exports.ReconnectionDelay = ReconnectionDelay;
