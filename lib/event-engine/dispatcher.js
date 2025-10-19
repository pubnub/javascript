"use strict";
/**
 * Subscribe Event Engine effects dispatcher.
 *
 * @internal
 */
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const categories_1 = __importDefault(require("../core/constants/categories"));
const core_1 = require("./core");
const pubnub_error_1 = require("../errors/pubnub-error");
const effects = __importStar(require("./effects"));
const events = __importStar(require("./events"));
/**
 * Subscribe Event Engine dispatcher.
 *
 * Dispatcher responsible for subscription events handling and corresponding effects execution.
 *
 * @internal
 */
class EventEngineDispatcher extends core_1.Dispatcher {
    constructor(engine, dependencies) {
        super(dependencies, dependencies.config.logger());
        this.on(effects.handshake.type, (0, core_1.asyncHandler)((payload_1, abortSignal_1, _a) => __awaiter(this, [payload_1, abortSignal_1, _a], void 0, function* (payload, abortSignal, { handshake, presenceState, config }) {
            abortSignal.throwIfAborted();
            try {
                const result = yield handshake(Object.assign(Object.assign({ abortSignal: abortSignal, channels: payload.channels, channelGroups: payload.groups, filterExpression: config.filterExpression }, (config.maintainPresenceState && { state: presenceState })), { onDemand: payload.onDemand }));
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
        this.on(effects.receiveMessages.type, (0, core_1.asyncHandler)((payload_1, abortSignal_1, _a) => __awaiter(this, [payload_1, abortSignal_1, _a], void 0, function* (payload, abortSignal, { receiveMessages, config }) {
            abortSignal.throwIfAborted();
            try {
                const result = yield receiveMessages({
                    abortSignal: abortSignal,
                    channels: payload.channels,
                    channelGroups: payload.groups,
                    timetoken: payload.cursor.timetoken,
                    region: payload.cursor.region,
                    filterExpression: config.filterExpression,
                    onDemand: payload.onDemand,
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
        this.on(effects.emitMessages.type, (0, core_1.asyncHandler)((_a, _1, _b) => __awaiter(this, [_a, _1, _b], void 0, function* ({ cursor, events }, _, { emitMessages }) {
            if (events.length > 0)
                emitMessages(cursor, events);
        })));
        this.on(effects.emitStatus.type, (0, core_1.asyncHandler)((payload_1, _1, _a) => __awaiter(this, [payload_1, _1, _a], void 0, function* (payload, _, { emitStatus }) { return emitStatus(payload); })));
    }
}
exports.EventEngineDispatcher = EventEngineDispatcher;
