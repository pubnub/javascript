"use strict";
/**
 * Initial subscription handshake (disconnected) state.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakingState = void 0;
const effects_1 = require("../effects");
const events_1 = require("../events");
const categories_1 = __importDefault(require("../../core/constants/categories"));
const handshake_stopped_1 = require("./handshake_stopped");
const handshake_failed_1 = require("./handshake_failed");
const unsubscribed_1 = require("./unsubscribed");
const receiving_1 = require("./receiving");
const state_1 = require("../core/state");
const pubnub_api_error_1 = require("../../errors/pubnub-api-error");
const operations_1 = __importDefault(require("../../core/constants/operations"));
const utils_1 = require("../../core/utils");
/**
 * Initial subscription handshake (disconnected) state.
 *
 * State in which Subscription Event Engine tries to receive the subscription cursor for the next sequential
 * subscribe REST API calls.
 *
 * @internal
 */
exports.HandshakingState = new state_1.State('HANDSHAKING');
exports.HandshakingState.onEnter((context) => (0, effects_1.handshake)(context.channels, context.groups));
exports.HandshakingState.onExit(() => effects_1.handshake.cancel);
exports.HandshakingState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined);
    return exports.HandshakingState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
});
exports.HandshakingState.on(events_1.handshakeSuccess.type, (context, { payload }) => {
    var _a, _b, _c, _d, _e;
    return receiving_1.ReceivingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: {
            timetoken: !!((_a = context.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) ? (_b = context.cursor) === null || _b === void 0 ? void 0 : _b.timetoken : payload.timetoken,
            region: payload.region,
        },
        referenceTimetoken: (0, utils_1.referenceSubscribeTimetoken)(payload.timetoken, (_c = context.cursor) === null || _c === void 0 ? void 0 : _c.timetoken),
    }, [
        (0, effects_1.emitStatus)({
            category: categories_1.default.PNConnectedCategory,
            affectedChannels: context.channels.slice(0),
            affectedChannelGroups: context.groups.slice(0),
            currentTimetoken: !!((_d = context.cursor) === null || _d === void 0 ? void 0 : _d.timetoken) ? (_e = context.cursor) === null || _e === void 0 ? void 0 : _e.timetoken : payload.timetoken,
        }),
    ]);
});
exports.HandshakingState.on(events_1.handshakeFailure.type, (context, event) => {
    var _a;
    return handshake_failed_1.HandshakeFailedState.with(Object.assign(Object.assign({}, context), { reason: event.payload }), [
        (0, effects_1.emitStatus)({ category: categories_1.default.PNConnectionErrorCategory, error: (_a = event.payload.status) === null || _a === void 0 ? void 0 : _a.category }),
    ]);
});
exports.HandshakingState.on(events_1.disconnect.type, (context, event) => {
    var _a;
    if (!event.payload.isOffline)
        return handshake_stopped_1.HandshakeStoppedState.with(Object.assign({}, context));
    else {
        const errorReason = pubnub_api_error_1.PubNubAPIError.create(new Error('Network connection error')).toPubNubError(operations_1.default.PNSubscribeOperation);
        return handshake_failed_1.HandshakeFailedState.with(Object.assign(Object.assign({}, context), { reason: errorReason }), [
            (0, effects_1.emitStatus)({
                category: categories_1.default.PNConnectionErrorCategory,
                error: (_a = errorReason.status) === null || _a === void 0 ? void 0 : _a.category,
            }),
        ]);
    }
});
exports.HandshakingState.on(events_1.restore.type, (context, { payload }) => {
    var _a;
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined);
    return exports.HandshakingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || ((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0 },
    });
});
exports.HandshakingState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with());
