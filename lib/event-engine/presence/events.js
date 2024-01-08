"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timesUp = exports.heartbeatGiveup = exports.heartbeatFailure = exports.heartbeatSuccess = exports.leftAll = exports.left = exports.joined = exports.disconnect = exports.reconnect = void 0;
var core_1 = require("../core");
exports.reconnect = (0, core_1.createEvent)('RECONNECT', function () { return ({}); });
exports.disconnect = (0, core_1.createEvent)('DISCONNECT', function () { return ({}); });
exports.joined = (0, core_1.createEvent)('JOINED', function (channels, groups) { return ({
    channels: channels,
    groups: groups,
}); });
exports.left = (0, core_1.createEvent)('LEFT', function (channels, groups) { return ({
    channels: channels,
    groups: groups,
}); });
exports.leftAll = (0, core_1.createEvent)('LEFT_ALL', function () { return ({}); });
exports.heartbeatSuccess = (0, core_1.createEvent)('HEARTBEAT_SUCCESS', function () { return ({}); });
exports.heartbeatFailure = (0, core_1.createEvent)('HEARTBEAT_FAILURE', function (error) { return error; });
exports.heartbeatGiveup = (0, core_1.createEvent)('HEARTBEAT_GIVEUP', function () { return ({}); });
exports.timesUp = (0, core_1.createEvent)('TIMES_UP', function () { return ({}); });
