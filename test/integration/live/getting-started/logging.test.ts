import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
/* eslint-disable prettier/prettier */
// snippet.loggingImportLogger
import { Logger, LogMessage } from 'pubnub'

// snippet.end
/* eslint-enable prettier/prettier */
/* eslint-disable prettier/prettier */
// snippet.loggingImportPubNub
import PubNub from 'pubnub';

// snippet.end
/* eslint-enable prettier/prettier */
import { createClient, track, unreachable } from '../support/clients';
import { quietConsole } from '../support/console';
import { openKeys } from '../support/env';
import { eventually } from '../support/wait';

/**
 * Logging examples.
 * The samples show placeholder keys. Hidden lines spread the real keys of the open keyset over them.
 */
const LogLevel = PubNub.LogLevel;

describe('getting-started/logging', () => {
  type Payload = Record<string, unknown>;
  /** Records what a logger receives, per level and per message type. */
  const recorder = () => {
    const seen: Array<{ level: string; message: LogMessage }> = [];
    const logger: Logger = {
      trace: (m) => seen.push({ level: 'trace', message: m }),
      debug: (m) => seen.push({ level: 'debug', message: m }),
      info: (m) => seen.push({ level: 'info', message: m }),
      warn: (m) => seen.push({ level: 'warn', message: m }),
      error: (m) => seen.push({ level: 'error', message: m }),
    };
    return { seen, logger };
  };

  it('loggingBasicUsage: a client built with Debug level logging works and its logger output is captured', async () => {
    const quiet = quietConsole();
    try {
      /* eslint-disable prettier/prettier */
      // snippet.loggingBasicUsage
      // Initialize PubNub with debug-level logging
      const pubnub = new PubNub({
        subscribeKey: 'mySubscribeKey',
        publishKey: 'myPublishKey',
        userId: 'myUniqueUserId',
        // snippet.hide
        ...openKeys(),
        // snippet.show
        logLevel: PubNub.LogLevel.Debug
      });
      // snippet.end
      /* eslint-enable prettier/prettier */
      track(pubnub);
      assert.equal(pubnub.getUserId(), 'myUniqueUserId');
    } finally {
      quiet.restore();
    }
  });

  it('loggingCustomLoggerExample: a custom logger receives config, error, failed request and deprecation entries', async () => {
    // "The example assumes that monitoringService and analyticsService are objects in your application."
    const reported = {
      errors: [] as Payload[],
      failures: [] as Payload[],
      deprecations: [] as Payload[],
      configs: [] as Payload[],
    };
    const monitoringService = {
      reportError: (payload: Payload) => reported.errors.push(payload),
      reportNetworkFailure: (payload: Payload) => reported.failures.push(payload),
    };
    const analyticsService = {
      trackDeprecation: (payload: Payload) => reported.deprecations.push(payload),
      trackConfigChange: (payload: Payload) => reported.configs.push(payload),
    };
    const quiet = quietConsole();
    try {
      /* eslint-disable prettier/prettier */
      // snippet.loggingCustomLoggerExample
      class MonitoringLogger implements Logger {
        /**
         * Process error-level messages
         */
        error(logMessage: LogMessage) {
          const { timestamp, pubNubId, location, messageType } = logMessage;

          if (messageType === 'error') {
            // TypeScript narrows type to ErrorLogMessage
            // IDE provides autocomplete for PubNubError fields
            monitoringService.reportError({
              message: logMessage.message.message,
              name: logMessage.message.name,
              stack: logMessage.message.stack,
              category: logMessage.message.status?.category,
              operation: logMessage.message.status?.operation,
              instanceId: pubNubId,
              timestamp: timestamp.toISOString(),
              location
            });
          }
        }

        /**
         * Process warning messages and failed requests
         */
        warn(logMessage: LogMessage) {
          if (logMessage.messageType === 'text') {
            // TypeScript narrows type to TextLogMessage
            // IDE provides autocomplete for string methods on message
            if (logMessage.message.includes('deprecated')) {
              analyticsService.trackDeprecation({
                warning: logMessage.message,
                instanceId: logMessage.pubNubId,
                timestamp: logMessage.timestamp.toISOString()
              });
            }
          } else if (logMessage.messageType === 'network-request') {
            // TypeScript narrows type to NetworkRequestLogMessage
            // The SDK logs a failed request at the warn level
            if (logMessage.failed) {
              const url = `${logMessage.message.origin}${logMessage.message.path}`;

              monitoringService.reportNetworkFailure({
                url: url,
                method: logMessage.message.method,
                reason: logMessage.details,
                instanceId: logMessage.pubNubId,
                timestamp: logMessage.timestamp.toISOString()
              });
            }
          }
        }

        /**
         * Process debug messages for configuration tracking
         */
        debug(logMessage: LogMessage) {
          if (logMessage.messageType === 'object') {
            // TypeScript narrows type to ObjectLogMessage
            // IDE provides autocomplete for details and ignoredKeys fields
            if (logMessage.details?.includes('configuration')) {
              analyticsService.trackConfigChange({
                config: logMessage.message,
                instanceId: logMessage.pubNubId,
                timestamp: logMessage.timestamp.toISOString()
              });
            }
          }
        }

        // No-op implementations for other levels if not needed
        trace() {}
        info() {}
      }

      // Configure SDK with custom logger
      const pubnub = new PubNub({
        subscribeKey: 'mySubscribeKey',
        publishKey: 'myPublishKey',
        userId: 'myUniqueUserId',
        logLevel: PubNub.LogLevel.Debug,
        // snippet.hide
        ...openKeys(), ...unreachable,
        // snippet.show
        loggers: [new MonitoringLogger()]
      });
      // snippet.end
      /* eslint-enable prettier/prettier */
      track(pubnub);

      // Debug entry about the configuration reaches trackConfigChange.
      assert.ok(reported.configs.length > 0, 'trackConfigChange received the configuration entry');
      assert.ok(reported.configs[0].instanceId, 'instanceId (pubNubId) is set');
      assert.match(String(reported.configs[0].timestamp), /^\d{4}-\d{2}-\d{2}T/, 'timestamp is an ISO string');

      // The client points at a port where nothing listens, so a request fails. The failure reaches reportError (error entry)
      // and reportNetworkFailure (failed network-request entry). The deprecated stop() reaches trackDeprecation (warn entry).
      await assert.rejects(pubnub.publish({ channel: 'x', message: 'm' }));
      await eventually(() => assert.ok(reported.errors.length > 0, 'reportError received an error entry'), {
        label: 'error entry',
      });
      assert.equal(reported.errors[0].name, 'PubNubError');
      assert.ok(reported.errors[0].message);
      assert.equal(reported.errors[0].category, 'PNNetworkIssuesCategory');
      assert.equal(reported.errors[0].operation, 'PNPublishOperation');
      assert.ok(reported.errors[0].stack, 'stack is set');
      // The SDK logs a failed network-request at the warn level, and the sample handles it in warn(), so
      // reportNetworkFailure receives the failed publish request.
      await eventually(
        () => assert.ok(reported.failures.length > 0, 'reportNetworkFailure received a failed request'),
        { label: 'failed request entry' },
      );
      assert.ok(reported.failures[0].method, 'method is set');
      assert.match(String(reported.failures[0].url), /\/publish\//, 'the url names the publish path');
      assert.ok(reported.failures[0].reason, 'reason (details) is set');
      assert.ok(reported.failures[0].instanceId, 'instanceId (pubNubId) is set');
      pubnub.stop();
      assert.ok(reported.deprecations.length > 0, 'a deprecation warning reaches trackDeprecation');
      assert.match(String(reported.deprecations[0].warning), /deprecated/);
    } finally {
      quiet.restore();
    }
  });

  it('loggingMultipleLoggers: the SDK calls every logger in the loggers array', async () => {
    class MonitoringLogger implements Logger {
      trace() {}
      debug() {}
      info() {}
      warn() {}
      error() {}
    }
    class AnalyticsLogger implements Logger {
      trace() {}
      debug() {}
      info() {}
      warn() {}
      error() {}
    }
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pn-logging-'));
    const file = path.join(dir, 'multi.log');
    class FileLogger implements Logger {
      private readonly stream = fs.createWriteStream(file, { flags: 'a' });
      trace(m: LogMessage) {
        this.stream.write(`${m.level}\n`);
      }
      debug(m: LogMessage) {
        this.stream.write(`${m.level}\n`);
      }
      info(m: LogMessage) {
        this.stream.write(`${m.level}\n`);
      }
      warn(m: LogMessage) {
        this.stream.write(`${m.level}\n`);
      }
      error(m: LogMessage) {
        this.stream.write(`${m.level}\n`);
      }
    }
    const quiet = quietConsole();
    try {
      /* eslint-disable prettier/prettier */
      // snippet.loggingMultipleLoggers
      const pubnub = new PubNub({
        subscribeKey: 'mySubscribeKey',
        publishKey: 'myPublishKey',
        userId: 'myUniqueUserId',
        logLevel: PubNub.LogLevel.Debug,
        // snippet.hide
        ...openKeys(),
        // snippet.show
        loggers: [
          new MonitoringLogger(),  // Send errors to monitoring service
          new AnalyticsLogger(),   // Track usage patterns
          new FileLogger()         // Write detailed logs to file (Node.js)
        ]
      });
      // snippet.end
      /* eslint-enable prettier/prettier */
      track(pubnub);
      // Each custom logger is called next to the console logger: the file logger saw the initialization entries.
      await eventually(() => assert.ok(fs.readFileSync(file, 'utf8').length > 0), { label: 'file logger wrote' });
    } finally {
      quiet.restore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // ---- the prose and the LogMessage reference ------------------------------------------------------------------

  it('loggingLevels: each log level records only the entry levels it should, and the default level is None', async function () {
    this.timeout(60_000);
    // The same traffic at every level. A level records its own entries and those of the less verbose levels listed after it.
    const levels: Array<[string, PubNub.LogLevel, string[]]> = [
      ['trace', LogLevel.Trace, ['trace', 'debug', 'info', 'warn', 'error']],
      ['debug', LogLevel.Debug, ['debug', 'info', 'warn', 'error']],
      ['info', LogLevel.Info, ['info', 'warn', 'error']],
      ['warn', LogLevel.Warn, ['warn', 'error']],
      ['error', LogLevel.Error, ['error']],
      ['none', LogLevel.None, []],
    ];
    const seenByLevel = new Map<string, Set<string>>();
    for (const [name, logLevel, allowed] of levels) {
      const { logger, seen } = recorder();
      const quiet = quietConsole();
      try {
        const pubnub = createClient('open', `logging-${name}`, { logLevel, loggers: [logger] });
        await pubnub.time();
        await assert.rejects(
          pubnub.publish({ channel: '', message: 'x' } as unknown as PubNub.Publish.PublishParameters),
        );
        pubnub.stop(); // warn: deprecated
      } finally {
        quiet.restore();
      }
      const levelsSeen = new Set(seen.map((s) => s.level));
      for (const level of levelsSeen)
        assert.ok(allowed.includes(level), `logLevel ${name} must not record ${level} entries`);
      for (const level of ['error', 'warn', 'info', 'debug'].filter((l) => allowed.includes(l))) {
        assert.ok(levelsSeen.has(level), `logLevel ${name} records ${level} entries (saw ${[...levelsSeen]})`);
      }
      seenByLevel.set(name, levelsSeen);
    }
    assert.equal(seenByLevel.get('none')!.size, 0, 'LogLevel.None records nothing');
    // Default: logging is disabled.
    const { logger, seen } = recorder();
    createClient('open', 'logging-default', { loggers: [logger] });
    assert.equal(seen.length, 0, 'the default logLevel is None');
  });

  it('loggingConsoleLogger: the console logger writes each level to the matching console method, with Trace going to console.debug', async () => {
    // The built-in console logger runs next to custom loggers and prints ISO timestamp, PubNub-<id>, level, location, message.
    const lines: Array<{ method: string; text: string }> = [];
    const captures = (['log', 'info', 'debug', 'warn', 'error'] as const).map((method) => {
      const original = console[method];
      console[method] = (...args: unknown[]) => lines.push({ method, text: args.map(String).join(' ') });
      return () => {
        console[method] = original;
      };
    });
    try {
      const pubnub = createClient('open', 'logging-console', { logLevel: LogLevel.Trace });
      await pubnub.time();
      pubnub.stop();
    } finally {
      captures.forEach((restore) => restore());
    }
    assert.ok(lines.length > 0, 'the console logger printed');
    const format = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z PubNub-[0-9a-f]+ (Trace|Debug|Info|Warn|Error)\s+\S+ /;
    assert.ok(
      lines.some((l) => format.test(l.text)),
      `an entry matches the documented format. First: ${lines[0]?.text.slice(0, 120)}`,
    );
    assert.ok(
      lines.filter((l) => / Trace /.test(l.text)).every((l) => l.method === 'debug'),
      'Trace entries are written with console.debug',
    );
  });

  it('loggingMessageTypes: every log message type has the shape the page reference lists', async function () {
    this.timeout(60_000);
    const { logger, seen } = recorder();
    const quiet = quietConsole();
    try {
      const pubnub = createClient('open', 'logging-types', { logLevel: LogLevel.Trace, loggers: [logger] });
      await pubnub.time();
      const down = createClient('open', 'logging-types-down', {
        ...unreachable,
        logLevel: LogLevel.Trace,
        loggers: [logger],
      });
      await assert.rejects(down.publish({ channel: 'x', message: 'm' }));
    } finally {
      quiet.restore();
    }
    const byType = (type: string) => seen.map((s) => s.message).filter((m) => m.messageType === type);
    // Every entry carries the BaseLogMessage fields.
    for (const { message, level } of seen) {
      assert.ok(message.timestamp instanceof Date, 'timestamp is a Date');
      assert.match(message.pubNubId, /^[0-9a-f]+$/);
      assert.equal(typeof message.level, 'number');
      assert.equal(message.minimumLevel, LogLevel.Trace);
      assert.ok(['text', 'object', 'error', 'network-request', 'network-response'].includes(message.messageType));
      assert.ok(level);
    }
    const text = byType('text')[0] as Extract<LogMessage, { messageType: 'text' }>;
    assert.equal(typeof text.message, 'string');
    const object = byType('object')[0] as Extract<LogMessage, { messageType: 'object' }>;
    assert.ok(object.message !== undefined);
    const error = byType('error')[0] as Extract<LogMessage, { messageType: 'error' }>;
    assert.ok(error, 'an error entry from the failed publish');
    assert.ok(error.message.name && error.message.message, 'error entry has name and message');
    assert.ok(error.message.stack, 'error entry has a stack');
    assert.equal(error.message.status?.category, 'PNNetworkIssuesCategory', 'error entry has status.category');
    const failed = byType('network-request').find((m) => (m as { failed?: boolean }).failed) as
      | Extract<LogMessage, { messageType: 'network-request' }>
      | undefined;
    assert.ok(failed, 'a network-request entry with failed: true for the unreachable origin');
    assert.ok(!failed.canceled);
    const request = byType('network-request').find((m) =>
      /pndsn\.com/.test((m as { message: { origin?: string } }).message.origin ?? ''),
    ) as Extract<LogMessage, { messageType: 'network-request' }>;
    assert.ok(request, 'a network-request entry from time()');
    assert.equal(request.message.method, 'GET');
    assert.match(request.message.origin ?? '', /pndsn\.com/);
    assert.match(request.message.path, /\/time\//);
    assert.ok(request.message.queryParameters, 'queryParameters');
    const response = byType('network-response')[0] as Extract<LogMessage, { messageType: 'network-response' }>;
    assert.ok(response, 'a network-response entry from time()');
    assert.equal(response.message.status, 200);
    assert.match(response.message.url, /\/time\//);
    assert.ok(response.message.headers, 'headers');
    assert.ok(response.message.body instanceof ArrayBuffer, 'the body is an ArrayBuffer, as the page shows');
    // Node.js: the details field carries a protocol hint.
    assert.match(
      String(response.details ?? ''),
      /Negotiated protocol: \S+/,
      'network-response details carry the negotiated protocol on Node.js',
    );
  });

  it('loggingValidationErrorEntryShape: a logged validation failure is a plain status object and not a PubNubError', async () => {
    const { logger, seen } = recorder();
    const pubnub = createClient('open', 'logging-validation', { logLevel: LogLevel.Error, loggers: [logger] });
    const quiet = quietConsole();
    try {
      await assert.rejects(
        pubnub.publish({ channel: '', message: 'x' } as unknown as PubNub.Publish.PublishParameters),
      );
    } finally {
      quiet.restore();
    }
    const entry = seen.find((s) => s.message.messageType === 'error')!.message as Extract<
      LogMessage,
      { messageType: 'error' }
    >;
    const message = entry.message as unknown as Record<string, unknown>;
    assert.equal(message.message, "Missing 'channel'");
    assert.equal(message.category, 'PNValidationErrorCategory');
    assert.equal(message.name, undefined, 'no name on the logged validation failure');
    assert.equal(message.stack, undefined, 'no stack on the logged validation failure');
    assert.equal(message.status, undefined, 'category sits on the message itself, not under status');
  });

  // The sample reads failed and canceled requests in error(). Record the level at which the SDK logs them.
  it('loggingFailedRequestLevel: a failed request is logged at the warn level', async () => {
    const { logger, seen } = recorder();
    const quiet = quietConsole();
    try {
      const down = createClient('open', 'logging-failed', {
        ...unreachable,
        logLevel: LogLevel.Trace,
        loggers: [logger],
      });
      await assert.rejects(down.publish({ channel: 'x', message: 'm' }));
    } finally {
      quiet.restore();
    }
    const failed = seen.filter(
      (s) => s.message.messageType === 'network-request' && (s.message as { failed?: boolean }).failed,
    );
    assert.equal(failed.length, 1);
    assert.equal(failed[0].level, 'warn', 'a failed request is logged at the warn level, not error');
    assert.equal((failed[0].message as { details?: string }).details, 'Network error');
    assert.ok(
      !seen.some((s) => s.level === 'error' && s.message.messageType === 'network-request'),
      'error() receives no network-request entries',
    );
  });
});
