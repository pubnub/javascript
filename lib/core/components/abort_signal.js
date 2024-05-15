"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbortSignal = exports.AbortError = void 0;
const subject_1 = require("./subject");
class AbortError extends Error {
    constructor() {
        super('The operation was aborted.');
        this.name = 'AbortError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AbortError = AbortError;
/**
 * Event Engine stored effect processing cancellation signal.
 *
 * @internal
 */
class AbortSignal extends subject_1.Subject {
    constructor() {
        super(...arguments);
        this._aborted = false;
    }
    get aborted() {
        return this._aborted;
    }
    throwIfAborted() {
        if (this._aborted) {
            throw new AbortError();
        }
    }
    abort() {
        this._aborted = true;
        this.notify(new AbortError());
    }
}
exports.AbortSignal = AbortSignal;
