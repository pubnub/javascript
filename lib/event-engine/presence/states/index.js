"use strict";
/**
 * Presence Event Engine states.
 *
 * Side-effect imports register transition handlers on the shared state instances.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatFailedState = exports.HeartbeatStoppedState = exports.HeartbeatCooldownState = exports.HeartbeatingState = exports.HeartbeatInactiveState = void 0;
require("./heartbeat_inactive");
require("./heartbeating");
require("./heartbeat_cooldown");
require("./heartbeat_stopped");
require("./heartbeat_failed");
var instances_1 = require("./instances");
Object.defineProperty(exports, "HeartbeatInactiveState", { enumerable: true, get: function () { return instances_1.HeartbeatInactiveState; } });
Object.defineProperty(exports, "HeartbeatingState", { enumerable: true, get: function () { return instances_1.HeartbeatingState; } });
Object.defineProperty(exports, "HeartbeatCooldownState", { enumerable: true, get: function () { return instances_1.HeartbeatCooldownState; } });
Object.defineProperty(exports, "HeartbeatStoppedState", { enumerable: true, get: function () { return instances_1.HeartbeatStoppedState; } });
Object.defineProperty(exports, "HeartbeatFailedState", { enumerable: true, get: function () { return instances_1.HeartbeatFailedState; } });
