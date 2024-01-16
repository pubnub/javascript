"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dispatcher = void 0;
var Dispatcher = /** @class */ (function () {
    function Dispatcher(dependencies) {
        this.dependencies = dependencies;
        this.instances = new Map();
        this.handlers = new Map();
    }
    Dispatcher.prototype.on = function (type, handlerCreator) {
        this.handlers.set(type, handlerCreator);
    };
    Dispatcher.prototype.dispatch = function (invocation) {
        if (invocation.type === 'CANCEL') {
            if (this.instances.has(invocation.payload)) {
                var instance_1 = this.instances.get(invocation.payload);
                instance_1 === null || instance_1 === void 0 ? void 0 : instance_1.cancel();
                this.instances.delete(invocation.payload);
            }
            return;
        }
        var handlerCreator = this.handlers.get(invocation.type);
        if (!handlerCreator) {
            throw new Error("Unhandled invocation '".concat(invocation.type, "'"));
        }
        var instance = handlerCreator(invocation.payload, this.dependencies);
        if (invocation.managed) {
            this.instances.set(invocation.type, instance);
        }
        instance.start();
    };
    Dispatcher.prototype.dispose = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.instances.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], instance = _d[1];
                instance.cancel();
                this.instances.delete(key);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return Dispatcher;
}());
exports.Dispatcher = Dispatcher;
