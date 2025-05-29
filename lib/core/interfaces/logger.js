"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
/**
 * Enum with available log levels.
 */
var LogLevel;
(function (LogLevel) {
    /**
     * Used to notify about every last detail:
     * - function calls,
     * - full payloads,
     * - internal variables,
     * - state-machine hops.
     */
    LogLevel[LogLevel["Trace"] = 0] = "Trace";
    /**
     * Used to notify about broad strokes of your SDK’s logic:
     * - inputs/outputs to public methods,
     * - network request
     * - network response
     * - decision branches.
     */
    LogLevel[LogLevel["Debug"] = 1] = "Debug";
    /**
     * Used to notify summary of what the SDK is doing under the hood:
     * - initialized,
     * - connected,
     * - entity created.
     */
    LogLevel[LogLevel["Info"] = 2] = "Info";
    /**
     * Used to notify about non-fatal events:
     * - deprecations,
     * - request retries.
     */
    LogLevel[LogLevel["Warn"] = 3] = "Warn";
    /**
     * Used to notify about:
     * - exceptions,
     * - HTTP failures,
     * - invalid states.
     */
    LogLevel[LogLevel["Error"] = 4] = "Error";
    /**
     * Logging disabled.
     */
    LogLevel[LogLevel["None"] = 5] = "None";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
