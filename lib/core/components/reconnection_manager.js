"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var default_1 = /** @class */ (function () {
    function default_1(_a) {
        var timeEndpoint = _a.timeEndpoint;
        this._timeEndpoint = timeEndpoint;
    }
    default_1.prototype.onReconnection = function (reconnectionCallback) {
        this._reconnectionCallback = reconnectionCallback;
    };
    default_1.prototype.startPolling = function () {
        this._timeTimer = setInterval(this._performTimeLoop.bind(this), 3000);
    };
    default_1.prototype.stopPolling = function () {
        clearInterval(this._timeTimer);
    };
    default_1.prototype._performTimeLoop = function () {
        var _this = this;
        this._timeEndpoint(function (status) {
            if (!status.error) {
                clearInterval(_this._timeTimer);
                _this._reconnectionCallback();
            }
        });
    };
    return default_1;
}());
exports.default = default_1;
