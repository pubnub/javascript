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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceEventEngine = void 0;
const core_1 = require("../core");
const events = __importStar(require("./events"));
const dispatcher_1 = require("./dispatcher");
const heartbeat_inactive_1 = require("./states/heartbeat_inactive");
class PresenceEventEngine {
    get _engine() {
        return this.engine;
    }
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.engine = new core_1.Engine();
        this.channels = [];
        this.groups = [];
        this.dispatcher = new dispatcher_1.PresenceEventEngineDispatcher(this.engine, dependencies);
        this._unsubscribeEngine = this.engine.subscribe((change) => {
            if (change.type === 'invocationDispatched') {
                this.dispatcher.dispatch(change.invocation);
            }
        });
        this.engine.start(heartbeat_inactive_1.HeartbeatInactiveState, undefined);
    }
    join({ channels, groups }) {
        this.channels = [...this.channels, ...(channels !== null && channels !== void 0 ? channels : [])];
        this.groups = [...this.groups, ...(groups !== null && groups !== void 0 ? groups : [])];
        this.engine.transition(events.joined(this.channels.slice(0), this.groups.slice(0)));
    }
    leave({ channels, groups }) {
        if (this.dependencies.presenceState) {
            channels === null || channels === void 0 ? void 0 : channels.forEach((c) => delete this.dependencies.presenceState[c]);
            groups === null || groups === void 0 ? void 0 : groups.forEach((g) => delete this.dependencies.presenceState[g]);
        }
        this.engine.transition(events.left(channels !== null && channels !== void 0 ? channels : [], groups !== null && groups !== void 0 ? groups : []));
    }
    leaveAll() {
        this.engine.transition(events.leftAll());
    }
    dispose() {
        this._unsubscribeEngine();
        this.dispatcher.dispose();
    }
}
exports.PresenceEventEngine = PresenceEventEngine;
