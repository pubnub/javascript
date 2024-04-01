var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PubnubError } from '../errors/pubnub-error';
import { asyncHandler, Dispatcher } from './core';
import * as effects from './effects';
import * as events from './events';
export class EventEngineDispatcher extends Dispatcher {
    constructor(engine, dependencies) {
        super(dependencies);
        this.on(effects.handshake.type, asyncHandler((payload_1, abortSignal_1, _a) => __awaiter(this, [payload_1, abortSignal_1, _a], void 0, function* (payload, abortSignal, { handshake, presenceState, config }) {
            abortSignal.throwIfAborted();
            try {
                const result = yield handshake(Object.assign({ abortSignal: abortSignal, channels: payload.channels, channelGroups: payload.groups, filterExpression: config.filterExpression }, (config.maintainPresenceState && { state: presenceState })));
                return engine.transition(events.handshakeSuccess(result));
            }
            catch (e) {
                if (e instanceof Error && e.message === 'Aborted') {
                    return;
                }
                if (e instanceof PubnubError) {
                    return engine.transition(events.handshakeFailure(e));
                }
            }
        })));
        this.on(effects.receiveMessages.type, asyncHandler((payload_2, abortSignal_2, _b) => __awaiter(this, [payload_2, abortSignal_2, _b], void 0, function* (payload, abortSignal, { receiveMessages, config }) {
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
                if (error instanceof Error && error.message === 'Aborted') {
                    return;
                }
                if (error instanceof PubnubError && !abortSignal.aborted) {
                    return engine.transition(events.receiveFailure(error));
                }
            }
        })));
        this.on(effects.emitMessages.type, asyncHandler((payload_3, _1, _c) => __awaiter(this, [payload_3, _1, _c], void 0, function* (payload, _, { emitMessages }) {
            if (payload.length > 0) {
                emitMessages(payload);
            }
        })));
        this.on(effects.emitStatus.type, asyncHandler((payload_4, _2, _d) => __awaiter(this, [payload_4, _2, _d], void 0, function* (payload, _, { emitStatus }) {
            emitStatus(payload);
        })));
        this.on(effects.receiveReconnect.type, asyncHandler((payload_5, abortSignal_3, _e) => __awaiter(this, [payload_5, abortSignal_3, _e], void 0, function* (payload, abortSignal, { receiveMessages, delay, config }) {
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
                    if (error instanceof Error && error.message === 'Aborted') {
                        return;
                    }
                    if (error instanceof PubnubError) {
                        return engine.transition(events.receiveReconnectFailure(error));
                    }
                }
            }
            else {
                return engine.transition(events.receiveReconnectGiveup(new PubnubError(config.retryConfiguration
                    ? config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)
                    : 'Unable to complete subscribe messages receive.')));
            }
        })));
        this.on(effects.handshakeReconnect.type, asyncHandler((payload_6, abortSignal_4, _f) => __awaiter(this, [payload_6, abortSignal_4, _f], void 0, function* (payload, abortSignal, { handshake, delay, presenceState, config }) {
            if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
                abortSignal.throwIfAborted();
                yield delay(config.retryConfiguration.getDelay(payload.attempts, payload.reason));
                abortSignal.throwIfAborted();
                try {
                    const result = yield handshake(Object.assign({ abortSignal: abortSignal, channels: payload.channels, channelGroups: payload.groups, filterExpression: config.filterExpression }, (config.maintainPresenceState && { state: presenceState })));
                    return engine.transition(events.handshakeReconnectSuccess(result));
                }
                catch (error) {
                    if (error instanceof Error && error.message === 'Aborted') {
                        return;
                    }
                    if (error instanceof PubnubError) {
                        return engine.transition(events.handshakeReconnectFailure(error));
                    }
                }
            }
            else {
                return engine.transition(events.handshakeReconnectGiveup(new PubnubError(config.retryConfiguration
                    ? config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)
                    : 'Unable to complete subscribe handshake')));
            }
        })));
    }
}
