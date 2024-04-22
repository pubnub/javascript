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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceEventEngineDispatcher = void 0;
const core_1 = require("../core");
const operations_1 = __importDefault(require("../../core/constants/operations"));
const pubnub_error_1 = require("../../errors/pubnub-error");
const effects = __importStar(require("./effects"));
const events = __importStar(require("./events"));
const categories_1 = __importDefault(require("../../core/constants/categories"));
class PresenceEventEngineDispatcher extends core_1.Dispatcher {
    constructor(engine, dependencies) {
        super(dependencies);
        this.on(effects.heartbeat.type, (0, core_1.asyncHandler)((payload_1, _1, _a) => __awaiter(this, [payload_1, _1, _a], void 0, function* (payload, _, { heartbeat, presenceState, config }) {
            try {
                const result = yield heartbeat(Object.assign(Object.assign({ channels: payload.channels, channelGroups: payload.groups }, (config.maintainPresenceState && { state: presenceState })), { heartbeat: config.presenceTimeout }));
                engine.transition(events.heartbeatSuccess(200));
            }
            catch (e) {
                if (e instanceof pubnub_error_1.PubNubError) {
                    if (e.status && e.status.category == categories_1.default.PNCancelledCategory)
                        return;
                    return engine.transition(events.heartbeatFailure(e));
                }
            }
        })));
        this.on(effects.leave.type, (0, core_1.asyncHandler)((payload_2, _2, _b) => __awaiter(this, [payload_2, _2, _b], void 0, function* (payload, _, { leave, config }) {
            if (!config.suppressLeaveEvents) {
                try {
                    leave({
                        channels: payload.channels,
                        channelGroups: payload.groups,
                    });
                }
                catch (e) { }
            }
        })));
        this.on(effects.wait.type, (0, core_1.asyncHandler)((_3, abortSignal_1, _c) => __awaiter(this, [_3, abortSignal_1, _c], void 0, function* (_, abortSignal, { heartbeatDelay }) {
            abortSignal.throwIfAborted();
            yield heartbeatDelay();
            abortSignal.throwIfAborted();
            return engine.transition(events.timesUp());
        })));
        this.on(effects.delayedHeartbeat.type, (0, core_1.asyncHandler)((payload_3, abortSignal_2, _d) => __awaiter(this, [payload_3, abortSignal_2, _d], void 0, function* (payload, abortSignal, { heartbeat, retryDelay, presenceState, config }) {
            if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
                abortSignal.throwIfAborted();
                yield retryDelay(config.retryConfiguration.getDelay(payload.attempts, payload.reason));
                abortSignal.throwIfAborted();
                try {
                    const result = yield heartbeat(Object.assign(Object.assign({ channels: payload.channels, channelGroups: payload.groups }, (config.maintainPresenceState && { state: presenceState })), { heartbeat: config.presenceTimeout }));
                    return engine.transition(events.heartbeatSuccess(200));
                }
                catch (e) {
                    if (e instanceof pubnub_error_1.PubNubError) {
                        if (e.status && e.status.category == categories_1.default.PNCancelledCategory)
                            return;
                        return engine.transition(events.heartbeatFailure(e));
                    }
                }
            }
            else {
                return engine.transition(events.heartbeatGiveup());
            }
        })));
        this.on(effects.emitStatus.type, (0, core_1.asyncHandler)((payload_4, _4, _e) => __awaiter(this, [payload_4, _4, _e], void 0, function* (payload, _, { emitStatus, config }) {
            var _f;
            if (config.announceFailedHeartbeats && ((_f = payload === null || payload === void 0 ? void 0 : payload.status) === null || _f === void 0 ? void 0 : _f.error) === true) {
                emitStatus(payload.status);
            }
            else if (config.announceSuccessfulHeartbeats && payload.statusCode === 200) {
                emitStatus(Object.assign(Object.assign({}, payload), { operation: operations_1.default.PNHeartbeatOperation, error: false }));
            }
        })));
    }
}
exports.PresenceEventEngineDispatcher = PresenceEventEngineDispatcher;
