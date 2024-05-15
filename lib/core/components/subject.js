"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subject = void 0;
/**
 * @internal
 */
class Subject {
    constructor(sync = false) {
        this.sync = sync;
        this.listeners = new Set();
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    notify(event) {
        const wrapper = () => {
            this.listeners.forEach((listener) => {
                listener(event);
            });
        };
        if (this.sync) {
            wrapper();
        }
        else {
            setTimeout(wrapper, 0);
        }
    }
}
exports.Subject = Subject;
