"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var default_1 = /** @class */ (function () {
    function default_1() {
        this.storage = {};
    }
    default_1.prototype.get = function (key) {
        return this.storage[key];
    };
    default_1.prototype.set = function (key, value) {
        this.storage[key] = value;
    };
    return default_1;
}());
exports.default = default_1;
