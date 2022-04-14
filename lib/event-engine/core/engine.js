"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
var subject_1 = require("../../core/components/subject");
var state_1 = require("./state");
var Engine = /** @class */ (function (_super) {
    __extends(Engine, _super);
    function Engine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Engine.prototype.describe = function (label) {
        return new state_1.State(label);
    };
    Engine.prototype.start = function (initialState, initialContext) {
        this.currentState = initialState;
        this.currentContext = initialContext;
        this.notify({
            type: 'engineStarted',
            state: initialState,
            context: initialContext,
        });
        return;
    };
    Engine.prototype.transition = function (event) {
        var e_1, _a, e_2, _b, e_3, _c;
        if (!this.currentState) {
            throw new Error('Start the engine first');
        }
        this.notify({
            type: 'eventReceived',
            event: event,
        });
        var transition = this.currentState.transition(this.currentContext, event);
        if (transition) {
            var _d = __read(transition, 3), newState = _d[0], newContext = _d[1], effects = _d[2];
            try {
                for (var _e = __values(this.currentState.exitEffects), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var effect = _f.value;
                    this.notify({
                        type: 'invocationDispatched',
                        invocation: effect(this.currentContext),
                    });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var oldState = this.currentState;
            this.currentState = newState;
            var oldContext = this.currentContext;
            this.currentContext = newContext;
            this.notify({
                type: 'transitionDone',
                fromState: oldState,
                fromContext: oldContext,
                toState: newState,
                toContext: newContext,
                event: event,
            });
            try {
                for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                    var effect = effects_1_1.value;
                    this.notify({
                        type: 'invocationDispatched',
                        invocation: effect,
                    });
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (effects_1_1 && !effects_1_1.done && (_b = effects_1.return)) _b.call(effects_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            try {
                for (var _g = __values(this.currentState.enterEffects), _h = _g.next(); !_h.done; _h = _g.next()) {
                    var effect = _h.value;
                    this.notify({
                        type: 'invocationDispatched',
                        invocation: effect(this.currentContext),
                    });
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_h && !_h.done && (_c = _g.return)) _c.call(_g);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    };
    return Engine;
}(subject_1.Subject));
exports.Engine = Engine;
