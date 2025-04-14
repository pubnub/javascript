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
const receive_stopped_1 = require("./receive_stopped");
const receive_failed_1 = require("./receive_failed");
const unsubscribed_1 = require("./unsubscribed");
const state_1 = require("../core/state");
const pubnub_api_error_1 = require("../../errors/pubnub-api-error");
const operations_1 = __importDefault(require("../../core/constants/operations"));
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
exports.ReceivingState.on(events_1.receiveSuccess.type, (context, { payload }) => {
    return exports.ReceivingState.with({ channels: context.channels, groups: context.groups, cursor: payload.cursor }, [
        (0, effects_1.emitMessages)(payload.events),
    ]);
});
exports.ReceivingState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    const subscriptionChangeStatus = {
        category: categories_1.default.PNSubscriptionChangedCategory,
        affectedChannels: payload.channels.slice(0),
        affectedChannelGroups: payload.groups.slice(0),
    };
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined, [(0, effects_1.emitStatus)(subscriptionChangeStatus)]);
    return exports.ReceivingState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor }, [
        (0, effects_1.emitStatus)(subscriptionChangeStatus),
    ]);
});
exports.ReceivingState.on(events_1.restore.type, (context, { payload }) => {
    const subscriptionChangeStatus = {
        category: categories_1.default.PNSubscriptionChangedCategory,
        affectedChannels: payload.channels.slice(0),
        affectedChannelGroups: payload.groups.slice(0),
    };
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined, [(0, effects_1.emitStatus)(subscriptionChangeStatus)]);
    return exports.ReceivingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: payload.cursor.timetoken, region: payload.cursor.region || context.cursor.region },
    }, [(0, effects_1.emitStatus)(subscriptionChangeStatus)]);
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
        return receive_stopped_1.ReceiveStoppedState.with({ channels: context.channels, groups: context.groups, cursor: context.cursor }, [
            (0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory }),
        ]);
    }
    else {
        const errorReason = pubnub_api_error_1.PubNubAPIError.create(new Error('Network connection error')).toPubNubError(operations_1.default.PNSubscribeOperation);
        return receive_failed_1.ReceiveFailedState.with({ channels: context.channels, groups: context.groups, cursor: context.cursor, reason: errorReason }, [
            (0, effects_1.emitStatus)({
                category: categories_1.default.PNDisconnectedUnexpectedlyCategory,
                error: (_a = errorReason.status) === null || _a === void 0 ? void 0 : _a.category,
            }),
        ]);
    }
});
exports.ReceivingState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with(undefined, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]));
