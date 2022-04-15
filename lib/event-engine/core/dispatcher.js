"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    return Dispatcher;
}());
exports.Dispatcher = Dispatcher;
