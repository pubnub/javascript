import { BaseLogMessage, LogLevelString, LogMessage, LogLevel, Logger } from '../interfaces/logger';

/**
 * Lazy log message composition closure type.
 *
 * @internal
 */
export type LogMessageFactory = () => Pick<LogMessage, 'messageType' | 'message'>;

/**
 * Logging module manager.
 *
 * Manager responsible for log requests handling and forwarding to the registered {@link Logger logger} implementations.
 */
export class LoggerManager {
  /**
   * Unique identifier of the PubNub instance which will use this logger.
   *
   * @internal
   */
  private readonly pubNubId: string;

  /**
   * Minimum messages log level to be logged.
   *
   * @internal
   */
  private readonly minLogLevel: LogLevel;

  /**
   * List of additional loggers which should be used along with user-provided custom loggers.
   *
   * @internal
   */
  private readonly loggers: Logger[];

  /**
   * Create and configure loggers' manager.
   *
   * @param pubNubId - Unique identifier of PubNub instance which will use this logger.
   * @param minLogLevel - Minimum messages log level to be logged.
   * @param loggers - List of additional loggers which should be used along with user-provided custom loggers.
   *
   * @internal
   */
  constructor(pubNubId: string, minLogLevel: LogLevel, loggers: Logger[]) {
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
  trace(location: string, messageFactory: LogMessageFactory | string) {
    this.log(LogLevel.Trace, location, messageFactory);
  }

  /**
   * Process a `debug` level message.
   *
   * @param location - Call site from which a log message has been sent.
   * @param messageFactory - Lazy message factory function or string for a text log message.
   *
   * @internal
   */
  debug(location: string, messageFactory: LogMessageFactory | string) {
    this.log(LogLevel.Debug, location, messageFactory);
  }

  /**
   * Process an `info` level message.
   *
   * @param location - Call site from which a log message has been sent.
   * @param messageFactory - Lazy message factory function or string for a text log message.
   *
   * @internal
   */
  info(location: string, messageFactory: LogMessageFactory | string) {
    this.log(LogLevel.Info, location, messageFactory);
  }

  /**
   * Process a `warn` level message.
   *
   * @param location - Call site from which a log message has been sent.
   * @param messageFactory - Lazy message factory function or string for a text log message.
   *
   * @internal
   */
  warn(location: string, messageFactory: LogMessageFactory | string) {
    this.log(LogLevel.Warn, location, messageFactory);
  }

  /**
   * Process an `error` level message.
   *
   * @param location - Call site from which a log message has been sent.
   * @param messageFactory - Lazy message factory function or string for a text log message.
   *
   * @internal
   */
  error(location: string, messageFactory: LogMessageFactory | string) {
    this.log(LogLevel.Error, location, messageFactory);
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
  private log(logLevel: LogLevel, location: string, messageFactory: LogMessageFactory | string) {
    // Check whether a log message should be handled at all or not.
    if (logLevel < this.minLogLevel || this.loggers.length === 0) return;

    const level = LogLevel[logLevel].toLowerCase() as LogLevelString;
    const message: BaseLogMessage = {
      timestamp: new Date(),
      pubNubId: this.pubNubId,
      level: logLevel,
      minimumLevel: this.minLogLevel,
      location,
      ...(typeof messageFactory === 'function' ? messageFactory() : { messageType: 'text', message: messageFactory }),
    };

    this.loggers.forEach((logger) => logger[level](message as unknown as LogMessage));
  }
}
