"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeAll = exports.reconnect = exports.disconnect = exports.receiveReconnectGiveup = exports.receiveReconnectFailure = exports.receiveReconnectSuccess = exports.receiveFailure = exports.receiveSuccess = exports.handshakeReconnectGiveup = exports.handshakeReconnectFailure = exports.handshakeReconnectSuccess = exports.handshakeFailure = exports.handshakeSuccess = exports.restore = exports.subscriptionChange = void 0;
var core_1 = require("./core");
exports.subscriptionChange = (0, core_1.createEvent)('SUBSCRIPTION_CHANGED', function (channels, groups) { return ({
    channels: channels,
    groups: groups,
}); });
exports.restore = (0, core_1.createEvent)('SUBSCRIPTION_RESTORED', function (channels, groups, timetoken, region) { return ({
    channels: channels,
    groups: groups,
    cursor: {
        timetoken: timetoken,
        region: region !== null && region !== void 0 ? region : 0,
    },
}); });
exports.handshakeSuccess = (0, core_1.createEvent)('HANDSHAKE_SUCCESS', function (cursor) { return cursor; });
exports.handshakeFailure = (0, core_1.createEvent)('HANDSHAKE_FAILURE', function (error) { return error; });
exports.handshakeReconnectSuccess = (0, core_1.createEvent)('HANDSHAKE_RECONNECT_SUCCESS', function (cursor) { return ({
    cursor: cursor,
}); });
exports.handshakeReconnectFailure = (0, core_1.createEvent)('HANDSHAKE_RECONNECT_FAILURE', function (error) { return error; });
exports.handshakeReconnectGiveup = (0, core_1.createEvent)('HANDSHAKE_RECONNECT_GIVEUP', function (error) { return error; });
exports.receiveSuccess = (0, core_1.createEvent)('RECEIVE_SUCCESS', function (cursor, events) { return ({
    cursor: cursor,
    events: events,
}); });
exports.receiveFailure = (0, core_1.createEvent)('RECEIVE_FAILURE', function (error) { return error; });
exports.receiveReconnectSuccess = (0, core_1.createEvent)('RECEIVE_RECONNECT_SUCCESS', function (cursor, events) { return ({
    cursor: cursor,
    events: events,
}); });
exports.receiveReconnectFailure = (0, core_1.createEvent)('RECEIVE_RECONNECT_FAILURE', function (error) { return error; });
exports.receiveReconnectGiveup = (0, core_1.createEvent)('RECEIVING_RECONNECT_GIVEUP', function (error) { return error; });
exports.disconnect = (0, core_1.createEvent)('DISCONNECT', function () { return ({}); });
exports.reconnect = (0, core_1.createEvent)('RECONNECT', function (timetoken, region) { return ({
    cursor: {
        timetoken: timetoken !== null && timetoken !== void 0 ? timetoken : '',
        region: region !== null && region !== void 0 ? region : 0,
    },
}); });
exports.unsubscribeAll = (0, core_1.createEvent)('UNSUBSCRIBE_ALL', function () { return ({}); });
