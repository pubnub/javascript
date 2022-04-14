"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subject = void 0;
var Subject = /** @class */ (function () {
    function Subject(sync) {
        if (sync === void 0) { sync = false; }
        this.sync = sync;
        this.listeners = new Set();
    }
    Subject.prototype.subscribe = function (listener) {
        var _this = this;
        this.listeners.add(listener);
        return function () {
            _this.listeners.delete(listener);
        };
    };
    Subject.prototype.notify = function (event) {
        var _this = this;
        var wrapper = function () {
            _this.listeners.forEach(function (listener) {
                listener(event);
            });
        };
        if (this.sync) {
            wrapper();
        }
        else {
            setTimeout(wrapper, 0);
        }
    };
    return Subject;
}());
exports.Subject = Subject;
