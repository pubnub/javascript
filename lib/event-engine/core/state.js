"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
var State = /** @class */ (function () {
    function State(label) {
        this.label = label;
        this.transitionMap = new Map();
        this.enterEffects = [];
        this.exitEffects = [];
    }
    State.prototype.transition = function (context, event) {
        var _a;
        if (this.transitionMap.has(event.type)) {
            return (_a = this.transitionMap.get(event.type)) === null || _a === void 0 ? void 0 : _a(context, event);
        }
        return undefined;
    };
    State.prototype.on = function (eventType, transition) {
        this.transitionMap.set(eventType, transition);
        return this;
    };
    State.prototype.with = function (context, effects) {
        return [this, context, effects !== null && effects !== void 0 ? effects : []];
    };
    State.prototype.onEnter = function (effect) {
        this.enterEffects.push(effect);
        return this;
    };
    State.prototype.onExit = function (effect) {
        this.exitEffects.push(effect);
        return this;
    };
    return State;
}());
exports.State = State;
