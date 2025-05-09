"use strict";
/**
 * Event Engine module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createManagedEffect = exports.createEffect = exports.createEvent = exports.Dispatcher = exports.Engine = void 0;
/** @internal */
var engine_1 = require("./engine");
Object.defineProperty(exports, "Engine", { enumerable: true, get: function () { return engine_1.Engine; } });
/** @internal */
var dispatcher_1 = require("./dispatcher");
Object.defineProperty(exports, "Dispatcher", { enumerable: true, get: function () { return dispatcher_1.Dispatcher; } });
/** @internal */
var types_1 = require("./types");
Object.defineProperty(exports, "createEvent", { enumerable: true, get: function () { return types_1.createEvent; } });
Object.defineProperty(exports, "createEffect", { enumerable: true, get: function () { return types_1.createEffect; } });
Object.defineProperty(exports, "createManagedEffect", { enumerable: true, get: function () { return types_1.createManagedEffect; } });
/** @internal */
var handler_1 = require("./handler");
Object.defineProperty(exports, "asyncHandler", { enumerable: true, get: function () { return handler_1.asyncHandler; } });
