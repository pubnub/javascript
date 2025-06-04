"use strict";
/**
 * Receiving real-time updates (connected) state module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceivingState = void 0;
const effects_1 = require("../effects");
const events_1 = require("../events");
const categories_1 = __importDefault(require("../../core/constants/categories"));
const pubnub_api_error_1 = require("../../errors/pubnub-api-error");
const operations_1 = __importDefault(require("../../core/constants/operations"));
const utils_1 = require("../../core/utils");
const receive_stopped_1 = require("./receive_stopped");
const receive_failed_1 = require("./receive_failed");
const unsubscribed_1 = require("./unsubscribed");
const state_1 = require("../core/state");
/**
 * Receiving real-time updates (connected) state.
 *
 * State in which Subscription Event Engine processes any real-time updates.
 *
 * @internal
 */
exports.ReceivingState = new state_1.State('RECEIVING');
exports.ReceivingState.onEnter((context) => (0, effects_1.receiveMessages)(context.channels, context.groups, context.cursor));
exports.ReceivingState.onExit(() => effects_1.receiveMessages.cancel);
exports.ReceivingState.on(events_1.receiveSuccess.type, (context, { payload }) => exports.ReceivingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: payload.cursor,
    referenceTimetoken: (0, utils_1.referenceSubscribeTimetoken)(payload.cursor.timetoken),
}, [(0, effects_1.emitMessages)(context.cursor, payload.events)]));
exports.ReceivingState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    var _a;
    if (payload.channels.length === 0 && payload.groups.length === 0) {
        let errorCategory;
        if (payload.isOffline)
            errorCategory = (_a = pubnub_api_error_1.PubNubAPIError.create(new Error('Network connection error')).toPubNubError(operations_1.default.PNSubscribeOperation).status) === null || _a === void 0 ? void 0 : _a.category;
        return unsubscribed_1.UnsubscribedState.with(undefined, [
            (0, effects_1.emitStatus)(Object.assign({ category: !payload.isOffline
                    ? categories_1.default.PNDisconnectedCategory
                    : categories_1.default.PNDisconnectedUnexpectedlyCategory }, (errorCategory ? { error: errorCategory } : {}))),
        ]);
    }
    return exports.ReceivingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: context.cursor,
        referenceTimetoken: context.referenceTimetoken,
    }, [
        (0, effects_1.emitStatus)({
            category: categories_1.default.PNSubscriptionChangedCategory,
            affectedChannels: payload.channels.slice(0),
            affectedChannelGroups: payload.groups.slice(0),
            currentTimetoken: context.cursor.timetoken,
        }),
    ]);
});
exports.ReceivingState.on(events_1.restore.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]);
    return exports.ReceivingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor.region },
        referenceTimetoken: (0, utils_1.referenceSubscribeTimetoken)(context.cursor.timetoken, `${payload.cursor.timetoken}`, context.referenceTimetoken),
    }, [
        (0, effects_1.emitStatus)({
            category: categories_1.default.PNSubscriptionChangedCategory,
            affectedChannels: payload.channels.slice(0),
            affectedChannelGroups: payload.groups.slice(0),
            currentTimetoken: payload.cursor.timetoken,
        }),
    ]);
});
exports.ReceivingState.on(events_1.receiveFailure.type, (context, { payload }) => {
    var _a;
    return receive_failed_1.ReceiveFailedState.with(Object.assign(Object.assign({}, context), { reason: payload }), [
        (0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedUnexpectedlyCategory, error: (_a = payload.status) === null || _a === void 0 ? void 0 : _a.category }),
    ]);
});
exports.ReceivingState.on(events_1.disconnect.type, (context, event) => {
    var _a;
    if (!event.payload.isOffline) {
        return receive_stopped_1.ReceiveStoppedState.with(Object.assign({}, context), [
            (0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory }),
        ]);
    }
    else {
        const errorReason = pubnub_api_error_1.PubNubAPIError.create(new Error('Network connection error')).toPubNubError(operations_1.default.PNSubscribeOperation);
        return receive_failed_1.ReceiveFailedState.with(Object.assign(Object.assign({}, context), { reason: errorReason }), [
            (0, effects_1.emitStatus)({
                category: categories_1.default.PNDisconnectedUnexpectedlyCategory,
                error: (_a = errorReason.status) === null || _a === void 0 ? void 0 : _a.category,
            }),
        ]);
    }
});
exports.ReceivingState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with(undefined, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]));
