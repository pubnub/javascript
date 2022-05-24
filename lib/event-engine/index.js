"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEngine = void 0;
var core_1 = require("./core");
var dispatcher_1 = require("./dispatcher");
var events = __importStar(require("./events"));
var unsubscribed_1 = require("./states/unsubscribed");
var EventEngine = /** @class */ (function () {
    function EventEngine(dependencies) {
        var _this = this;
        this.engine = new core_1.Engine();
        this.channels = [];
        this.groups = [];
        this.dispatcher = new dispatcher_1.EventEngineDispatcher(this.engine, dependencies);
        this.engine.subscribe(function (change) {
            if (change.type === 'invocationDispatched') {
                _this.dispatcher.dispatch(change.invocation);
            }
        });
        this.engine.start(unsubscribed_1.UnsubscribedState, undefined);
    }
    Object.defineProperty(EventEngine.prototype, "_engine", {
        get: function () {
            return this.engine;
        },
        enumerable: false,
        configurable: true
    });
    EventEngine.prototype.subscribe = function (_a) {
        var channels = _a.channels, groups = _a.groups;
        this.channels = __spreadArray(__spreadArray([], __read(this.channels), false), __read((channels !== null && channels !== void 0 ? channels : [])), false);
        this.groups = __spreadArray(__spreadArray([], __read(this.groups), false), __read((groups !== null && groups !== void 0 ? groups : [])), false);
        this.engine.transition(events.subscriptionChange(this.channels, this.groups));
    };
    EventEngine.prototype.unsubscribe = function (_a) {
        var channels = _a.channels, groups = _a.groups;
        this.channels = this.channels.filter(function (channel) { var _a; return (_a = !(channels === null || channels === void 0 ? void 0 : channels.includes(channel))) !== null && _a !== void 0 ? _a : true; });
        this.groups = this.groups.filter(function (group) { var _a; return (_a = !(groups === null || groups === void 0 ? void 0 : groups.includes(group))) !== null && _a !== void 0 ? _a : true; });
        this.engine.transition(events.subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
    };
    EventEngine.prototype.unsubscribeAll = function () {
        this.channels = [];
        this.groups = [];
        this.engine.transition(events.subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
    };
    EventEngine.prototype.reconnect = function () {
        this.engine.transition(events.reconnect());
    };
    EventEngine.prototype.disconnect = function () {
        this.engine.transition(events.disconnect());
    };
    return EventEngine;
}());
exports.EventEngine = EventEngine;
