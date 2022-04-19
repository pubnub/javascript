"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconnectingRetry = exports.reconnectingGiveup = exports.reconnectingFailure = exports.reconnectingSuccess = exports.receivingFailure = exports.receivingSuccess = exports.handshakingReconnectingRetry = exports.handshakingReconnectingGiveup = exports.handshakingReconnectingFailure = exports.handshakingReconnectingSuccess = exports.handshakingFailure = exports.handshakingSuccess = exports.restore = exports.reconnect = exports.disconnect = exports.subscriptionChange = void 0;
var core_1 = require("./core");
exports.subscriptionChange = (0, core_1.createEvent)('SUBSCRIPTION_CHANGE', function (channels, groups) { return ({
    channels: channels,
    groups: groups,
}); });
exports.disconnect = (0, core_1.createEvent)('DISCONNECT', function () { return ({}); });
exports.reconnect = (0, core_1.createEvent)('RECONNECT', function () { return ({}); });
exports.restore = (0, core_1.createEvent)('RESTORE', function (channels, groups, timetoken, region) { return ({
    channels: channels,
    groups: groups,
    timetoken: timetoken,
    region: region,
}); });
exports.handshakingSuccess = (0, core_1.createEvent)('HANDSHAKING_SUCCESS', function (cursor) { return cursor; });
exports.handshakingFailure = (0, core_1.createEvent)('HANDSHAKING_FAILURE', function (error) { return error; });
exports.handshakingReconnectingSuccess = (0, core_1.createEvent)('HANDSHAKING_RECONNECTING_SUCCESS', function (cursor) { return ({
    cursor: cursor,
}); });
exports.handshakingReconnectingFailure = (0, core_1.createEvent)('HANDSHAKING_RECONNECTING_FAILURE', function (error) { return error; });
exports.handshakingReconnectingGiveup = (0, core_1.createEvent)('HANDSHAKING_RECONNECTING_GIVEUP', function () { return ({}); });
exports.handshakingReconnectingRetry = (0, core_1.createEvent)('HANDSHAKING_RECONNECTING_RETRY', function () { return ({}); });
exports.receivingSuccess = (0, core_1.createEvent)('RECEIVING_SUCCESS', function (cursor, events) { return ({
    cursor: cursor,
    events: events,
}); });
exports.receivingFailure = (0, core_1.createEvent)('RECEIVING_FAILURE', function (error) { return error; });
exports.reconnectingSuccess = (0, core_1.createEvent)('RECONNECTING_SUCCESS', function (cursor, events) { return ({
    cursor: cursor,
    events: events,
}); });
exports.reconnectingFailure = (0, core_1.createEvent)('RECONNECTING_FAILURE', function (error) { return error; });
exports.reconnectingGiveup = (0, core_1.createEvent)('RECONNECTING_GIVEUP', function () { return ({}); });
exports.reconnectingRetry = (0, core_1.createEvent)('RECONNECTING_RETRY', function () { return ({}); });
