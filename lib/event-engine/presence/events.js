"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timesUp = exports.heartbeatGiveup = exports.heartbeatFailure = exports.heartbeatSuccess = exports.leftAll = exports.left = exports.joined = exports.disconnect = exports.reconnect = void 0;
const core_1 = require("../core");
exports.reconnect = (0, core_1.createEvent)('RECONNECT', () => ({}));
exports.disconnect = (0, core_1.createEvent)('DISCONNECT', () => ({}));
exports.joined = (0, core_1.createEvent)('JOINED', (channels, groups) => ({
    channels,
    groups,
}));
exports.left = (0, core_1.createEvent)('LEFT', (channels, groups) => ({
    channels,
    groups,
}));
exports.leftAll = (0, core_1.createEvent)('LEFT_ALL', () => ({}));
exports.heartbeatSuccess = (0, core_1.createEvent)('HEARTBEAT_SUCCESS', (statusCode) => ({ statusCode }));
exports.heartbeatFailure = (0, core_1.createEvent)('HEARTBEAT_FAILURE', (error) => error);
exports.heartbeatGiveup = (0, core_1.createEvent)('HEARTBEAT_GIVEUP', () => ({}));
exports.timesUp = (0, core_1.createEvent)('TIMES_UP', () => ({}));
