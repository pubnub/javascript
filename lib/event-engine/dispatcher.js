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
exports.EventEngineDispatcher = void 0;
const pubnub_error_1 = require("../errors/pubnub-error");
const core_1 = require("./core");
const effects = __importStar(require("./effects"));
const events = __importStar(require("./events"));
const categories_1 = __importDefault(require("../core/constants/categories"));
class EventEngineDispatcher extends core_1.Dispatcher {
    constructor(engine, dependencies) {
        super(dependencies);
        this.on(effects.handshake.type, (0, core_1.asyncHandler)((payload_1, abortSignal_1, _a) => __awaiter(this, [payload_1, abortSignal_1, _a], void 0, function* (payload, abortSignal, { handshake, presenceState, config }) {
            abortSignal.throwIfAborted();
            try {
                const result = yield handshake(Object.assign({ abortSignal: abortSignal, channels: payload.channels, channelGroups: payload.groups, filterExpression: config.filterExpression }, (config.maintainPresenceState && { state: presenceState })));
                return engine.transition(events.handshakeSuccess(result));
            }
            catch (e) {
                if (e instanceof pubnub_error_1.PubNubError) {
                    if (e.status && e.status.category == categories_1.default.PNCancelledCategory)
                        return;
                    return engine.transition(events.handshakeFailure(e));
                }
            }
        })));
        this.on(effects.receiveMessages.type, (0, core_1.asyncHandler)((payload_2, abortSignal_2, _b) => __awaiter(this, [payload_2, abortSignal_2, _b], void 0, function* (payload, abortSignal, { receiveMessages, config }) {
            abortSignal.throwIfAborted();
            try {
                const result = yield receiveMessages({
                    abortSignal: abortSignal,
                    channels: payload.channels,
                    channelGroups: payload.groups,
                    timetoken: payload.cursor.timetoken,
                    region: payload.cursor.region,
                    filterExpression: config.filterExpression,
                });
                engine.transition(events.receiveSuccess(result.cursor, result.messages));
            }
            catch (error) {
                if (error instanceof pubnub_error_1.PubNubError) {
                    if (error.status && error.status.category == categories_1.default.PNCancelledCategory)
                        return;
                    if (!abortSignal.aborted)
                        return engine.transition(events.receiveFailure(error));
                }
            }
        })));
        this.on(effects.emitMessages.type, (0, core_1.asyncHandler)((payload_3, _1, _c) => __awaiter(this, [payload_3, _1, _c], void 0, function* (payload, _, { emitMessages }) {
            if (payload.length > 0) {
                emitMessages(payload);
            }
        })));
        this.on(effects.emitStatus.type, (0, core_1.asyncHandler)((payload_4, _2, _d) => __awaiter(this, [payload_4, _2, _d], void 0, function* (payload, _, { emitStatus }) {
            emitStatus(payload);
        })));
        this.on(effects.receiveReconnect.type, (0, core_1.asyncHandler)((payload_5, abortSignal_3, _e) => __awaiter(this, [payload_5, abortSignal_3, _e], void 0, function* (payload, abortSignal, { receiveMessages, delay, config }) {
            if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
                abortSignal.throwIfAborted();
                yield delay(config.retryConfiguration.getDelay(payload.attempts, payload.reason));
                abortSignal.throwIfAborted();
                try {
                    const result = yield receiveMessages({
                        abortSignal: abortSignal,
                        channels: payload.channels,
                        channelGroups: payload.groups,
                        timetoken: payload.cursor.timetoken,
                        region: payload.cursor.region,
                        filterExpression: config.filterExpression,
                    });
                    return engine.transition(events.receiveReconnectSuccess(result.cursor, result.messages));
                }
                catch (error) {
                    if (error instanceof pubnub_error_1.PubNubError) {
                        if (error.status && error.status.category == categories_1.default.PNCancelledCategory)
                            return;
                        return engine.transition(events.receiveReconnectFailure(error));
                    }
                }
            }
            else {
                return engine.transition(events.receiveReconnectGiveup(new pubnub_error_1.PubNubError(config.retryConfiguration
                    ? config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)
                    : 'Unable to complete subscribe messages receive.')));
            }
        })));
        this.on(effects.handshakeReconnect.type, (0, core_1.asyncHandler)((payload_6, abortSignal_4, _f) => __awaiter(this, [payload_6, abortSignal_4, _f], void 0, function* (payload, abortSignal, { handshake, delay, presenceState, config }) {
            if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
                abortSignal.throwIfAborted();
                yield delay(config.retryConfiguration.getDelay(payload.attempts, payload.reason));
                abortSignal.throwIfAborted();
                try {
                    const result = yield handshake(Object.assign({ abortSignal: abortSignal, channels: payload.channels, channelGroups: payload.groups, filterExpression: config.filterExpression }, (config.maintainPresenceState && { state: presenceState })));
                    return engine.transition(events.handshakeReconnectSuccess(result));
                }
                catch (error) {
                    if (error instanceof pubnub_error_1.PubNubError) {
                        if (error.status && error.status.category == categories_1.default.PNCancelledCategory)
                            return;
                        return engine.transition(events.handshakeReconnectFailure(error));
                    }
                }
            }
            else {
                return engine.transition(events.handshakeReconnectGiveup(new pubnub_error_1.PubNubError(config.retryConfiguration
                    ? config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)
                    : 'Unable to complete subscribe handshake')));
            }
        })));
    }
}
exports.EventEngineDispatcher = EventEngineDispatcher;
