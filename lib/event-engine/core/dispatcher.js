"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dispatcher = void 0;
class Dispatcher {
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.instances = new Map();
        this.handlers = new Map();
    }
    on(type, handlerCreator) {
        this.handlers.set(type, handlerCreator);
    }
    dispatch(invocation) {
        if (invocation.type === 'CANCEL') {
            if (this.instances.has(invocation.payload)) {
                const instance = this.instances.get(invocation.payload);
                instance === null || instance === void 0 ? void 0 : instance.cancel();
                this.instances.delete(invocation.payload);
            }
            return;
        }
        const handlerCreator = this.handlers.get(invocation.type);
        if (!handlerCreator) {
            throw new Error(`Unhandled invocation '${invocation.type}'`);
        }
        const instance = handlerCreator(invocation.payload, this.dependencies);
        if (invocation.managed) {
            this.instances.set(invocation.type, instance);
        }
        instance.start();
    }
    dispose() {
        for (const [key, instance] of this.instances.entries()) {
            instance.cancel();
            this.instances.delete(key);
        }
    }
}
exports.Dispatcher = Dispatcher;
