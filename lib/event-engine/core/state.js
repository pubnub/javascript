"use strict";
/**
 * Event Engine Core state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
/**
 * Event engine current state object.
 *
 * State contains current context and list of invocations which should be performed by the Event Engine.
 *
 * @internal
 */
class State {
    transition(context, event) {
        var _a;
        if (this.transitionMap.has(event.type)) {
            return (_a = this.transitionMap.get(event.type)) === null || _a === void 0 ? void 0 : _a(context, event);
        }
        return undefined;
    }
    constructor(label) {
        this.label = label;
        this.transitionMap = new Map();
        this.enterEffects = [];
        this.exitEffects = [];
    }
    on(eventType, transition) {
        this.transitionMap.set(eventType, transition);
        return this;
    }
    with(context, effects) {
        return [this, context, effects !== null && effects !== void 0 ? effects : []];
    }
    onEnter(effect) {
        this.enterEffects.push(effect);
        return this;
    }
    onExit(effect) {
        this.exitEffects.push(effect);
        return this;
    }
}
exports.State = State;
