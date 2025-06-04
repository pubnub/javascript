"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerManager = void 0;
const logger_1 = require("../interfaces/logger");
/**
 * Logging module manager.
 *
 * Manager responsible for log requests handling and forwarding to the registered {@link Logger logger} implementations.
 */
class LoggerManager {
    /**
     * Create and configure loggers' manager.
     *
     * @param pubNubId - Unique identifier of PubNub instance which will use this logger.
     * @param minLogLevel - Minimum messages log level to be logged.
     * @param loggers - List of additional loggers which should be used along with user-provided custom loggers.
     *
     * @internal
     */
    constructor(pubNubId, minLogLevel, loggers) {
        this.pubNubId = pubNubId;
        this.minLogLevel = minLogLevel;
        this.loggers = loggers;
    }
    /**
     * Get current log level.
     *
     * @returns Current log level.
     *
     * @internal
     */
    get logLevel() {
        return this.minLogLevel;
    }
    /**
     * Process a `trace` level message.
     *
     * @param location - Call site from which a log message has been sent.
     * @param messageFactory - Lazy message factory function or string for a text log message.
     *
     * @internal
     */
    trace(location, messageFactory) {
        this.log(logger_1.LogLevel.Trace, location, messageFactory);
    }
    /**
     * Process a `debug` level message.
     *
     * @param location - Call site from which a log message has been sent.
     * @param messageFactory - Lazy message factory function or string for a text log message.
     *
     * @internal
     */
    debug(location, messageFactory) {
        this.log(logger_1.LogLevel.Debug, location, messageFactory);
    }
    /**
     * Process an `info` level message.
     *
     * @param location - Call site from which a log message has been sent.
     * @param messageFactory - Lazy message factory function or string for a text log message.
     *
     * @internal
     */
    info(location, messageFactory) {
        this.log(logger_1.LogLevel.Info, location, messageFactory);
    }
    /**
     * Process a `warn` level message.
     *
     * @param location - Call site from which a log message has been sent.
     * @param messageFactory - Lazy message factory function or string for a text log message.
     *
     * @internal
     */
    warn(location, messageFactory) {
        this.log(logger_1.LogLevel.Warn, location, messageFactory);
    }
    /**
     * Process an `error` level message.
     *
     * @param location - Call site from which a log message has been sent.
     * @param messageFactory - Lazy message factory function or string for a text log message.
     *
     * @internal
     */
    error(location, messageFactory) {
        this.log(logger_1.LogLevel.Error, location, messageFactory);
    }
    /**
     * Process log message.
     *
     * @param logLevel - Logged message level.
     * @param location - Call site from which a log message has been sent.
     * @param messageFactory - Lazy message factory function or string for a text log message.
     *
     * @internal
     */
    log(logLevel, location, messageFactory) {
        // Check whether a log message should be handled at all or not.
        if (logLevel < this.minLogLevel || this.loggers.length === 0)
            return;
        const level = logger_1.LogLevel[logLevel].toLowerCase();
        const message = Object.assign({ timestamp: new Date(), pubNubId: this.pubNubId, level: logLevel, minimumLevel: this.minLogLevel, location }, (typeof messageFactory === 'function' ? messageFactory() : { messageType: 'text', message: messageFactory }));
        this.loggers.forEach((logger) => logger[level](message));
    }
}
exports.LoggerManager = LoggerManager;
