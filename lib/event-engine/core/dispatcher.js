"use strict";
/**
 * Event Engine Core Effects dispatcher module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dispatcher = void 0;
/**
 * Event Engine effects dispatcher.
 *
 * Dispatcher responsible for invocation enqueue and dequeue for processing.
 *
 * @internal
 */
class Dispatcher {
    constructor(dependencies, logger) {
        this.dependencies = dependencies;
        this.logger = logger;
        this.instances = new Map();
        this.handlers = new Map();
    }
    on(type, handlerCreator) {
        this.handlers.set(type, handlerCreator);
    }
    dispatch(invocation) {
        this.logger.trace(this.constructor.name, `Process invocation: ${invocation.type}`);
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
            this.logger.error(this.constructor.name, `Unhandled invocation '${invocation.type}'`);
            throw new Error(`Unhandled invocation '${invocation.type}'`);
        }
        const instance = handlerCreator(invocation.payload, this.dependencies);
        this.logger.trace(this.constructor.name, () => ({
            messageType: 'object',
            details: 'Call invocation handler with parameters:',
            message: invocation.payload,
            ignoredKeys: ['abortSignal'],
        }));
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
