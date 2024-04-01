import { Subject } from './subject';
export class AbortError extends Error {
    constructor() {
        super('The operation was aborted.');
        this.name = 'AbortError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class AbortSignal extends Subject {
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
