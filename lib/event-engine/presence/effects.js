"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayedHeartbeat = exports.wait = exports.emitStatus = exports.leave = exports.heartbeat = void 0;
const core_1 = require("../core");
exports.heartbeat = (0, core_1.createEffect)('HEARTBEAT', (channels, groups) => ({
    channels,
    groups,
}));
exports.leave = (0, core_1.createEffect)('LEAVE', (channels, groups) => ({
    channels,
    groups,
}));
/* eslint-disable  @typescript-eslint/no-explicit-any */
exports.emitStatus = (0, core_1.createEffect)('EMIT_STATUS', (status) => status);
exports.wait = (0, core_1.createManagedEffect)('WAIT', () => ({}));
exports.delayedHeartbeat = (0, core_1.createManagedEffect)('DELAYED_HEARTBEAT', (context) => context);
