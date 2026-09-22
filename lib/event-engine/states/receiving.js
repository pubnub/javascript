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
const instances_1 = require("./instances");
Object.defineProperty(exports, "ReceivingState", { enumerable: true, get: function () { return instances_1.ReceivingState; } });
/**
 * Receiving real-time updates (connected) state.
 *
 * State in which Subscription Event Engine processes any real-time updates.
 *
 * @internal
 */
instances_1.ReceivingState.onEnter((context) => { var _a; return (0, effects_1.receiveMessages)(context.channels, context.groups, context.cursor, (_a = context.onDemand) !== null && _a !== void 0 ? _a : false); });
instances_1.ReceivingState.onExit(() => effects_1.receiveMessages.cancel);
instances_1.ReceivingState.on(events_1.receiveSuccess.type, (context, { payload }) => instances_1.ReceivingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: payload.cursor,
    referenceTimetoken: (0, utils_1.referenceSubscribeTimetoken)(payload.cursor.timetoken),
}, [(0, effects_1.emitMessages)(context.cursor, payload.events)]));
instances_1.ReceivingState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    var _a;
    if (payload.channels.length === 0 && payload.groups.length === 0) {
        let errorCategory;
        if (payload.isOffline)
            errorCategory = (_a = pubnub_api_error_1.PubNubAPIError.create(new Error('Network connection error')).toPubNubError(operations_1.default.PNSubscribeOperation).status) === null || _a === void 0 ? void 0 : _a.category;
        return instances_1.UnsubscribedState.with(undefined, [
            (0, effects_1.emitStatus)(Object.assign({ category: !payload.isOffline
                    ? categories_1.default.PNDisconnectedCategory
                    : categories_1.default.PNDisconnectedUnexpectedlyCategory, operation: operations_1.default.PNUnsubscribeOperation }, (errorCategory ? { error: errorCategory } : {}))),
        ]);
    }
    return instances_1.ReceivingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: context.cursor,
        referenceTimetoken: context.referenceTimetoken,
        onDemand: true,
    }, [
        (0, effects_1.emitStatus)({
            category: categories_1.default.PNSubscriptionChangedCategory,
            affectedChannels: payload.channels.slice(0),
            affectedChannelGroups: payload.groups.slice(0),
            currentTimetoken: context.cursor.timetoken,
        }),
    ]);
});
instances_1.ReceivingState.on(events_1.restore.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return instances_1.UnsubscribedState.with(undefined, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]);
    return instances_1.ReceivingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor.region },
        referenceTimetoken: (0, utils_1.referenceSubscribeTimetoken)(context.cursor.timetoken, `${payload.cursor.timetoken}`, context.referenceTimetoken),
        onDemand: true,
    }, [
        (0, effects_1.emitStatus)({
            category: categories_1.default.PNSubscriptionChangedCategory,
            affectedChannels: payload.channels.slice(0),
            affectedChannelGroups: payload.groups.slice(0),
            currentTimetoken: payload.cursor.timetoken,
        }),
    ]);
});
instances_1.ReceivingState.on(events_1.receiveFailure.type, (context, { payload }) => {
    var _a;
    return instances_1.ReceiveFailedState.with(Object.assign(Object.assign({}, context), { reason: payload }), [
        (0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedUnexpectedlyCategory, error: (_a = payload.status) === null || _a === void 0 ? void 0 : _a.category }),
    ]);
});
instances_1.ReceivingState.on(events_1.disconnect.type, (context, event) => {
    var _a;
    if (!event.payload.isOffline) {
        return instances_1.ReceiveStoppedState.with(Object.assign({}, context), [
            (0, effects_1.emitStatus)({
                category: categories_1.default.PNDisconnectedCategory,
                operation: operations_1.default.PNSubscribeOperation,
            }),
        ]);
    }
    else {
        const errorReason = pubnub_api_error_1.PubNubAPIError.create(new Error('Network connection error')).toPubNubError(operations_1.default.PNSubscribeOperation);
        return instances_1.ReceiveFailedState.with(Object.assign(Object.assign({}, context), { reason: errorReason }), [
            (0, effects_1.emitStatus)({
                category: categories_1.default.PNDisconnectedUnexpectedlyCategory,
                operation: operations_1.default.PNSubscribeOperation,
                error: (_a = errorReason.status) === null || _a === void 0 ? void 0 : _a.category,
            }),
        ]);
    }
});
instances_1.ReceivingState.on(events_1.unsubscribeAll.type, (_) => instances_1.UnsubscribedState.with(undefined, [
    (0, effects_1.emitStatus)({
        category: categories_1.default.PNDisconnectedCategory,
        operation: operations_1.default.PNUnsubscribeOperation,
    }),
]));
