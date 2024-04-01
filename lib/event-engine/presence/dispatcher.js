var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { asyncHandler, Dispatcher } from '../core';
import PNOperations from '../../core/constants/operations';
import { PubnubError } from '../../errors/pubnub-error';
import * as effects from './effects';
import * as events from './events';
export class PresenceEventEngineDispatcher extends Dispatcher {
    constructor(engine, dependencies) {
        super(dependencies);
        this.on(effects.heartbeat.type, asyncHandler((payload_1, _1, _a) => __awaiter(this, [payload_1, _1, _a], void 0, function* (payload, _, { heartbeat, presenceState, config }) {
            try {
                const result = yield heartbeat(Object.assign(Object.assign({ channels: payload.channels, channelGroups: payload.groups }, (config.maintainPresenceState && { state: presenceState })), { heartbeat: config.presenceTimeout }));
                engine.transition(events.heartbeatSuccess(200));
            }
            catch (e) {
                if (e instanceof PubnubError) {
                    return engine.transition(events.heartbeatFailure(e));
                }
            }
        })));
        this.on(effects.leave.type, asyncHandler((payload_2, _2, _b) => __awaiter(this, [payload_2, _2, _b], void 0, function* (payload, _, { leave, config }) {
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
        this.on(effects.wait.type, asyncHandler((_3, abortSignal_1, _c) => __awaiter(this, [_3, abortSignal_1, _c], void 0, function* (_, abortSignal, { heartbeatDelay }) {
            abortSignal.throwIfAborted();
            yield heartbeatDelay();
            abortSignal.throwIfAborted();
            return engine.transition(events.timesUp());
        })));
        this.on(effects.delayedHeartbeat.type, asyncHandler((payload_3, abortSignal_2, _d) => __awaiter(this, [payload_3, abortSignal_2, _d], void 0, function* (payload, abortSignal, { heartbeat, retryDelay, presenceState, config }) {
            if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
                abortSignal.throwIfAborted();
                yield retryDelay(config.retryConfiguration.getDelay(payload.attempts, payload.reason));
                abortSignal.throwIfAborted();
                try {
                    const result = yield heartbeat(Object.assign(Object.assign({ channels: payload.channels, channelGroups: payload.groups }, (config.maintainPresenceState && { state: presenceState })), { heartbeat: config.presenceTimeout }));
                    return engine.transition(events.heartbeatSuccess(200));
                }
                catch (e) {
                    if (e instanceof Error && e.message === 'Aborted') {
                        return;
                    }
                    if (e instanceof PubnubError) {
                        return engine.transition(events.heartbeatFailure(e));
                    }
                }
            }
            else {
                return engine.transition(events.heartbeatGiveup());
            }
        })));
        this.on(effects.emitStatus.type, asyncHandler((payload_4, _4, _e) => __awaiter(this, [payload_4, _4, _e], void 0, function* (payload, _, { emitStatus, config }) {
            var _f;
            if (config.announceFailedHeartbeats && ((_f = payload === null || payload === void 0 ? void 0 : payload.status) === null || _f === void 0 ? void 0 : _f.error) === true) {
                emitStatus(payload.status);
            }
            else if (config.announceSuccessfulHeartbeats && payload.statusCode === 200) {
                emitStatus(Object.assign(Object.assign({}, payload), { operation: PNOperations.PNHeartbeatOperation, error: false }));
            }
        })));
    }
}
