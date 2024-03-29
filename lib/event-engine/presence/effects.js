"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayedHeartbeat = exports.wait = exports.emitStatus = exports.leave = exports.heartbeat = void 0;
var core_1 = require("../core");
exports.heartbeat = (0, core_1.createEffect)('HEARTBEAT', function (channels, groups) { return ({
    channels: channels,
    groups: groups,
}); });
exports.leave = (0, core_1.createEffect)('LEAVE', function (channels, groups) { return ({
    channels: channels,
    groups: groups,
}); });
// TODO: Find out actual `status` type.
/* eslint-disable  @typescript-eslint/no-explicit-any */
exports.emitStatus = (0, core_1.createEffect)('EMIT_STATUS', function (status) { return status; });
exports.wait = (0, core_1.createManagedEffect)('WAIT', function () { return ({}); });
exports.delayedHeartbeat = (0, core_1.createManagedEffect)('DELAYED_HEARTBEAT', function (context) { return context; });
