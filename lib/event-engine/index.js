"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
        this.dependencies = dependencies;
        this.dispatcher = new dispatcher_1.EventEngineDispatcher(this.engine, dependencies);
        this._unsubscribeEngine = this.engine.subscribe(function (change) {
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
        var _this = this;
        var channels = _a.channels, channelGroups = _a.channelGroups, timetoken = _a.timetoken, withPresence = _a.withPresence;
        this.channels = __spreadArray(__spreadArray([], __read(this.channels), false), __read((channels !== null && channels !== void 0 ? channels : [])), false);
        this.groups = __spreadArray(__spreadArray([], __read(this.groups), false), __read((channelGroups !== null && channelGroups !== void 0 ? channelGroups : [])), false);
        if (withPresence) {
            this.channels.map(function (c) { return _this.channels.push("".concat(c, "-pnpres")); });
            this.groups.map(function (g) { return _this.groups.push("".concat(g, "-pnpres")); });
        }
        if (timetoken) {
            this.engine.transition(events.restore(this.channels, this.groups, timetoken));
        }
        else {
            this.engine.transition(events.subscriptionChange(this.channels, this.groups));
        }
        if (this.dependencies.join) {
            this.dependencies.join({
                channels: this.channels.filter(function (c) { return !c.endsWith('-pnpres'); }),
                groups: this.groups.filter(function (g) { return !g.endsWith('-pnpres'); }),
            });
        }
    };
    EventEngine.prototype.unsubscribe = function (_a) {
        var _this = this;
        var channels = _a.channels, groups = _a.groups;
        var channlesWithPres = channels === null || channels === void 0 ? void 0 : channels.slice(0);
        channels === null || channels === void 0 ? void 0 : channels.map(function (c) { return channlesWithPres.push("".concat(c, "-pnpres")); });
        this.channels = this.channels.filter(function (channel) { return !(channlesWithPres === null || channlesWithPres === void 0 ? void 0 : channlesWithPres.includes(channel)); });
        var groupsWithPres = groups === null || groups === void 0 ? void 0 : groups.slice(0);
        groups === null || groups === void 0 ? void 0 : groups.map(function (g) { return groupsWithPres.push("".concat(g, "-pnpres")); });
        this.groups = this.groups.filter(function (group) { return !(groupsWithPres === null || groupsWithPres === void 0 ? void 0 : groupsWithPres.includes(group)); });
        if (this.dependencies.presenceState) {
            channels === null || channels === void 0 ? void 0 : channels.forEach(function (c) { return delete _this.dependencies.presenceState[c]; });
            groups === null || groups === void 0 ? void 0 : groups.forEach(function (g) { return delete _this.dependencies.presenceState[g]; });
        }
        this.engine.transition(events.subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
        if (this.dependencies.leave) {
            this.dependencies.leave({
                channels: channels,
                groups: groups,
            });
        }
    };
    EventEngine.prototype.unsubscribeAll = function () {
        this.channels = [];
        this.groups = [];
        if (this.dependencies.presenceState) {
            this.dependencies.presenceState = {};
        }
        this.engine.transition(events.subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
        if (this.dependencies.leaveAll) {
            this.dependencies.leaveAll();
        }
    };
    EventEngine.prototype.reconnect = function (_a) {
        var timetoken = _a.timetoken, region = _a.region;
        this.engine.transition(events.reconnect(timetoken, region));
    };
    EventEngine.prototype.disconnect = function () {
        this.engine.transition(events.disconnect());
        if (this.dependencies.leaveAll) {
            this.dependencies.leaveAll();
        }
    };
    EventEngine.prototype.dispose = function () {
        this.disconnect();
        this._unsubscribeEngine();
        this.dispatcher.dispose();
    };
    return EventEngine;
}());
exports.EventEngine = EventEngine;
