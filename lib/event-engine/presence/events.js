"use strict";
/**
 * Presence Event Engine events module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.timesUp = exports.heartbeatFailure = exports.heartbeatSuccess = exports.leftAll = exports.left = exports.joined = exports.disconnect = exports.reconnect = void 0;
const core_1 = require("../core");
/**
 * Reconnect event.
 *
 * Event is sent each time when user restores real-time updates processing and notifies other present subscribers
 * about joining back.
 *
 * @internal
 */
exports.reconnect = (0, core_1.createEvent)('RECONNECT', () => ({}));
/**
 * Disconnect event.
 *
 * Event is sent when user wants to temporarily stop real-time updates processing and notifies other present
 * subscribers about leaving.
 *
 * @internal
 */
exports.disconnect = (0, core_1.createEvent)('DISCONNECT', (isOffline = false) => ({ isOffline }));
/**
 * Channel / group join event.
 *
 * Event is sent when user adds new channels / groups to the active channels / groups list and notifies other present
 * subscribers about joining.
 *
 * @internal
 */
exports.joined = (0, core_1.createEvent)('JOINED', (channels, groups) => ({
    channels,
    groups,
}));
/**
 * Channel / group leave event.
 *
 * Event is sent when user removes channels / groups from the active channels / groups list and notifies other present
 * subscribers about leaving.
 *
 * @internal
 */
exports.left = (0, core_1.createEvent)('LEFT', (channels, groups) => ({
    channels,
    groups,
}));
/**
 * Leave all event.
 *
 * Event is sent when user doesn't want to receive any real-time updates anymore and notifies other
 * subscribers on previously active channels / groups about leaving.
 *
 * @internal
 */
exports.leftAll = (0, core_1.createEvent)('LEFT_ALL', (isOffline = false) => ({ isOffline }));
/**
 * Presence heartbeat success event.
 *
 * Event is sent by corresponding effect handler if REST API call was successful.
 *
 * @internal
 */
exports.heartbeatSuccess = (0, core_1.createEvent)('HEARTBEAT_SUCCESS', (statusCode) => ({ statusCode }));
/**
 * Presence heartbeat did fail event.
 *
 * Event is sent by corresponding effect handler if REST API call failed.
 *
 * @internal
 */
exports.heartbeatFailure = (0, core_1.createEvent)('HEARTBEAT_FAILURE', (error) => error);
/**
 * Delayed presence heartbeat event.
 *
 * Event is sent by corresponding effect handler when delay timer between heartbeat calls fired.
 *
 * @internal
 */
exports.timesUp = (0, core_1.createEvent)('TIMES_UP', () => ({}));
