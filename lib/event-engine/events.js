"use strict";
/**
 * Subscribe Event Engine events module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeAll = exports.reconnect = exports.disconnect = exports.receiveFailure = exports.receiveSuccess = exports.handshakeFailure = exports.handshakeSuccess = exports.restore = exports.subscriptionChange = void 0;
const core_1 = require("./core");
/**
 * Subscription list change event.
 *
 * Event is sent each time when user would like to change list of active channels / groups.
 *
 * @internal
 */
exports.subscriptionChange = (0, core_1.createEvent)('SUBSCRIPTION_CHANGED', (channels, groups, isOffline) => ({
    channels,
    groups,
    isOffline,
}));
/**
 * Subscription loop restore.
 *
 * Event is sent when user would like to try catch up on missed updates by providing specific timetoken.
 *
 * @internal
 */
exports.restore = (0, core_1.createEvent)('SUBSCRIPTION_RESTORED', (channels, groups, timetoken, region) => ({
    channels,
    groups,
    cursor: {
        timetoken: timetoken,
        region: region !== null && region !== void 0 ? region : 0,
    },
}));
/**
 * Initial subscription handshake success event.
 *
 * Event is sent by corresponding effect handler if REST API call was successful.
 *
 * @internal
 */
exports.handshakeSuccess = (0, core_1.createEvent)('HANDSHAKE_SUCCESS', (cursor) => cursor);
/**
 * Initial subscription handshake did fail event.
 *
 * Event is sent by corresponding effect handler if REST API call failed.
 *
 * @internal
 */
exports.handshakeFailure = (0, core_1.createEvent)('HANDSHAKE_FAILURE', (error) => error);
/**
 * Subscription successfully received real-time updates event.
 *
 * Event is sent by corresponding effect handler if REST API call was successful.
 *
 * @internal
 */
exports.receiveSuccess = (0, core_1.createEvent)('RECEIVE_SUCCESS', (cursor, events) => ({
    cursor,
    events,
}));
/**
 * Subscription did fail to receive real-time updates event.
 *
 * Event is sent by corresponding effect handler if REST API call failed.
 *
 * @internal
 */
exports.receiveFailure = (0, core_1.createEvent)('RECEIVE_FAILURE', (error) => error);
/**
 * Client disconnect event.
 *
 * Event is sent when user wants to temporarily stop real-time updates receive.
 *
 * @internal
 */
exports.disconnect = (0, core_1.createEvent)('DISCONNECT', (isOffline) => ({ isOffline }));
/**
 * Client reconnect event.
 *
 * Event is sent when user wants to restore real-time updates receive.
 *
 * @internal
 */
exports.reconnect = (0, core_1.createEvent)('RECONNECT', (timetoken, region) => ({
    cursor: {
        timetoken: timetoken !== null && timetoken !== void 0 ? timetoken : '',
        region: region !== null && region !== void 0 ? region : 0,
    },
}));
/**
 * Completely stop real-time updates receive event.
 *
 * Event is sent when user doesn't want to receive any real-time updates anymore.
 *
 * @internal
 */
exports.unsubscribeAll = (0, core_1.createEvent)('UNSUBSCRIBE_ALL', () => ({}));
