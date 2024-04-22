"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeAll = exports.reconnect = exports.disconnect = exports.receiveReconnectGiveup = exports.receiveReconnectFailure = exports.receiveReconnectSuccess = exports.receiveFailure = exports.receiveSuccess = exports.handshakeReconnectGiveup = exports.handshakeReconnectFailure = exports.handshakeReconnectSuccess = exports.handshakeFailure = exports.handshakeSuccess = exports.restore = exports.subscriptionChange = void 0;
const core_1 = require("./core");
exports.subscriptionChange = (0, core_1.createEvent)('SUBSCRIPTION_CHANGED', (channels, groups) => ({
    channels,
    groups,
}));
exports.restore = (0, core_1.createEvent)('SUBSCRIPTION_RESTORED', (channels, groups, timetoken, region) => ({
    channels,
    groups,
    cursor: {
        timetoken: timetoken,
        region: region !== null && region !== void 0 ? region : 0,
    },
}));
exports.handshakeSuccess = (0, core_1.createEvent)('HANDSHAKE_SUCCESS', (cursor) => cursor);
exports.handshakeFailure = (0, core_1.createEvent)('HANDSHAKE_FAILURE', (error) => error);
exports.handshakeReconnectSuccess = (0, core_1.createEvent)('HANDSHAKE_RECONNECT_SUCCESS', (cursor) => ({
    cursor,
}));
exports.handshakeReconnectFailure = (0, core_1.createEvent)('HANDSHAKE_RECONNECT_FAILURE', (error) => error);
exports.handshakeReconnectGiveup = (0, core_1.createEvent)('HANDSHAKE_RECONNECT_GIVEUP', (error) => error);
exports.receiveSuccess = (0, core_1.createEvent)('RECEIVE_SUCCESS', (cursor, events) => ({
    cursor,
    events,
}));
exports.receiveFailure = (0, core_1.createEvent)('RECEIVE_FAILURE', (error) => error);
exports.receiveReconnectSuccess = (0, core_1.createEvent)('RECEIVE_RECONNECT_SUCCESS', (cursor, events) => ({
    cursor,
    events,
}));
exports.receiveReconnectFailure = (0, core_1.createEvent)('RECEIVE_RECONNECT_FAILURE', (error) => error);
exports.receiveReconnectGiveup = (0, core_1.createEvent)('RECEIVING_RECONNECT_GIVEUP', (error) => error);
exports.disconnect = (0, core_1.createEvent)('DISCONNECT', () => ({}));
exports.reconnect = (0, core_1.createEvent)('RECONNECT', (timetoken, region) => ({
    cursor: {
        timetoken: timetoken !== null && timetoken !== void 0 ? timetoken : '',
        region: region !== null && region !== void 0 ? region : 0,
    },
}));
exports.unsubscribeAll = (0, core_1.createEvent)('UNSUBSCRIBE_ALL', () => ({}));
