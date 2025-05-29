import { TransportResponse } from '../types/transport-response';
import { TransportRequest } from '../types/transport-request';
import { PubNubError } from '../../errors/pubnub-error';

/**
 * Enum with available log levels.
 */
export enum LogLevel {
  /**
   * Used to notify about every last detail:
   * - function calls,
   * - full payloads,
   * - internal variables,
   * - state-machine hops.
   */
  Trace,

  /**
   * Used to notify about broad strokes of your SDK’s logic:
   * - inputs/outputs to public methods,
   * - network request
   * - network response
   * - decision branches.
   */
  Debug,

  /**
   * Used to notify summary of what the SDK is doing under the hood:
   * - initialized,
   * - connected,
   * - entity created.
   */
  Info,

  /**
   * Used to notify about non-fatal events:
   * - deprecations,
   * - request retries.
   */
  Warn,

  /**
   * Used to notify about:
   * - exceptions,
   * - HTTP failures,
   * - invalid states.
   */
  Error,

  /**
   * Logging disabled.
   */
  None,
}

/**
 * Stringified log levels presentation.
 */
export type LogLevelString = Exclude<Lowercase<keyof typeof LogLevel>, 'none'>;

/**
 * Basic content of a logged message.
 */
export type BaseLogMessage = {
  /**
   * Date and time when the log message has been generated.
   */
  timestamp: Date;

  /**
   * Unique identifier of the PubNub client instance which generated the log message.
   */
  pubNubId: string;

  /**
   * Target log message level.
   */
  level: LogLevel;

  /**
   * Minimum log level which can be notified by {@link LoggerManager}.
   *
   * **Note:** This information can be used by {@link Logger logger} implementation show more information from a log
   * message.
   */
  minimumLevel: LogLevel;

  /**
   * The call site from which a log message has been sent.
   */
  location?: string;
};

/**
 * Plain text log message type.
 *
 * This type contains a pre-processed message.
 */
export type TextLogMessage = BaseLogMessage & {
  /**
   * Data type which `message` represents.
   */
  messageType: 'text';

  /**
   * Textual message which has been logged.
   */
  message: string;
};

/**
 * Dictionary log message type.
 *
 * This type contains a dictionary which should be serialized for output.
 */
export type ObjectLogMessage = BaseLogMessage & {
  /**
   * Data type which `message` represents.
   */
  messageType: 'object';

  /**
   * Object which has been logged.
   */
  message: Record<string, unknown> | unknown[] | unknown;

  /**
   * Additional details which describe data in a provided object.
   *
   * **Note:** Will usually be used to prepend serialized dictionary if provided.
   */
  details?: string;

  /**
   * List of keys which should be filtered from a serialized object.
   */
  ignoredKeys?: string[] | ((key: string, object: Record<string, unknown>) => boolean);
};

/**
 * Error log message type.
 *
 * This type contains an error type.
 */
export type ErrorLogMessage = BaseLogMessage & {
  /**
   * Data type which `message` represents.
   */
  messageType: 'error';

  /**
   * Error with information about an exception or validation error.
   */
  message: PubNubError;
};

/**
 * Network request message type.
 *
 * This type contains a type that represents data to be sent using the transport layer.
 */
export type NetworkRequestLogMessage = BaseLogMessage & {
  /**
   * Data type which `message` represents.
   */
  messageType: 'network-request';

  /**
   * Object which is used to construct a transport-specific request object.
   */
  message: TransportRequest;

  /**
   * Additional information which can be useful when {@link NetworkRequestLogMessage.canceled canceled} is set to
   * `true`.
   */
  details?: string;

  /**
   * Whether the request has been canceled or not.
   */
  canceled?: boolean;

  /**
   * Whether the request processing failed or not.
   */
  failed?: boolean;
};

/**
 * Network response message type.
 *
 * This type contains a type that represents a service response for a previously sent request.
 */
export type NetworkResponseLogMessage = BaseLogMessage & {
  /**
   * Data type which `message` represents.
   */
  messageType: 'network-response';

  /**
   * Object with data received from a transport-specific response object.
   */
  message: TransportResponse;
};

/**
 * Logged message type.
 */
export type LogMessage =
  | TextLogMessage
  | ObjectLogMessage
  | ErrorLogMessage
  | NetworkRequestLogMessage
  | NetworkResponseLogMessage;

/**
 * This interface is used by {@link LoggerManager logger manager} to handle log messages.
 *
 * You can implement this interface for your own needs or use built-in {@link ConsoleLogger console} logger.
 *
 * **Important:** Function that corresponds to the logged message level will be called only if
 * {@link LoggerManager logger manager} configured to use high enough log level.
 */
export interface Logger {
  /**
   * Process a `trace` level message.
   *
   * @param message - Message which should be handled by custom logger implementation.
   */
  trace(message: LogMessage): void;

  /**
   * Process a `debug` level message.
   *
   * @param message - Message which should be handled by custom logger implementation.
   */
  debug(message: LogMessage): void;

  /**
   * Process an `info` level message.
   *
   * @param message - Message which should be handled by custom logger implementation.
   */
  info(message: LogMessage): void;

  /**
   * Process a `warn` level message.
   *
   * @param message - Message which should be handled by custom logger implementation.
   */
  warn(message: LogMessage): void;

  /**
   * Process an `error` level message.
   *
   * @param message - Message which should be handled by custom logger implementation.
   */
  error(message: LogMessage): void;
}
