"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
var hashCode = function (payload) {
    var hash = 0;
    if (payload.length === 0)
        return hash;
    for (var i = 0; i < payload.length; i += 1) {
        var character = payload.charCodeAt(i);
        hash = (hash << 5) - hash + character; // eslint-disable-line
        hash = hash & hash; // eslint-disable-line
    }
    return hash;
};
var default_1 = /** @class */ (function () {
    function default_1(_a) {
        var config = _a.config;
        this.hashHistory = [];
        this._config = config;
    }
    default_1.prototype.getKey = function (message) {
        var hashedPayload = hashCode(JSON.stringify(message.payload)).toString();
        var timetoken = message.publishMetaData.publishTimetoken;
        return "".concat(timetoken, "-").concat(hashedPayload);
    };
    default_1.prototype.isDuplicate = function (message) {
        return this.hashHistory.includes(this.getKey(message));
    };
    default_1.prototype.addEntry = function (message) {
        if (this.hashHistory.length >= this._config.maximumCacheSize) {
            this.hashHistory.shift();
        }
        this.hashHistory.push(this.getKey(message));
    };
    default_1.prototype.clearHistory = function () {
        this.hashHistory = [];
    };
    return default_1;
}());
exports.default = default_1;
