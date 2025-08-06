import type { ClientLogMessage } from '../subscription-worker-types';
import { LogLevel } from '../../../core/interfaces/logger';

/**
 * Custom {@link Logger} implementation to send logs to the core PubNub client module from the shared worker context.
 */
export class ClientLogger {
  /**
   * Create logger for specific PubNub client representation object.
   *
   * @param minLogLevel - Minimum messages log level to be logged.
   * @param port - Message port for two-way communication with core PunNub client module.
   */
  constructor(
    public minLogLevel: LogLevel,
    private readonly port: MessagePort,
  ) {}

  /**
   * Process a `debug` level message.
   *
   * @param message - Message which should be handled by custom logger implementation.
   */
  debug(message: string | ClientLogMessage | (() => ClientLogMessage)) {
    this.log(message, LogLevel.Debug);
  }

  /**
   * Process a `error` level message.
   *
   * @param message - Message which should be handled by custom logger implementation.
   */
  error(message: string | ClientLogMessage | (() => ClientLogMessage)): void {
    this.log(message, LogLevel.Error);
  }

  /**
   * Process an `info` level message.
   *
   * @param message - Message which should be handled by custom logger implementation.
   */
  info(message: string | ClientLogMessage | (() => ClientLogMessage)): void {
    this.log(message, LogLevel.Info);
  }

  /**
   * Process a `trace` level message.
   *
   * @param message - Message which should be handled by custom logger implementation.
   */
  trace(message: string | ClientLogMessage | (() => ClientLogMessage)): void {
    this.log(message, LogLevel.Trace);
  }

  /**
   * Process an `warn` level message.
   *
   * @param message - Message which should be handled by custom logger implementation.
   */
  warn(message: string | ClientLogMessage | (() => ClientLogMessage)): void {
    this.log(message, LogLevel.Warn);
  }

  /**
   * Send log entry to the core PubNub client module.
   *
   * @param message - Object which should be sent to the core PubNub client module.
   * @param level - Log entry level (will be handled by if core PunNub client module minimum log level matches).
   */
  private log(message: string | ClientLogMessage | (() => ClientLogMessage), level: LogLevel) {
    // Discard logged message if logger not enabled.
    if (level < this.minLogLevel) return;

    let entry: ClientLogMessage & { level?: LogLevel };
    if (typeof message === 'string') entry = { messageType: 'text', message };
    else if (typeof message === 'function') entry = message();
    else entry = message;
    entry.level = level;

    try {
      this.port.postMessage({ type: 'shared-worker-console-log', message: entry });
    } catch (error) {
      if (this.minLogLevel !== LogLevel.None)
        console.error(`[SharedWorker] Unable send message using message port: ${error}`);
    }
  }
}
