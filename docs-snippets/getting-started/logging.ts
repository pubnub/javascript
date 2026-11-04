// snippet.loggingImportLogger
import { Logger, LogMessage } from 'pubnub'

// snippet.end
import assert from '../harness/assert.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
// snippet.loggingImportPubNub
import PubNub from 'pubnub';

// snippet.end
import { page, step, check } from '../harness/step.js';
import { eventually } from '../harness/wait.js';

/**
 * docs/sdks/javascript/logging.md
 *
 * P0. Every sample of the page is hardcoded, so the ids below are proposed ids, the docs page does not embed them yet.
 * The docs samples start with import lines. A step body cannot hold an import, so `loggingImportPubNub` and
 * `loggingImportLogger` are module-level import-only snippets, and the page shows each sample as import snippet plus body.
 * The file logger sample has imports of its own and lives in getting-started/logging-file-logger.ts.
 *
 * Open keyset, phase P0. In the Sneaker Drop story this is how the shop's engineers watch the client in production. The four
 * steps run the page's samples (basic usage, custom logger, several loggers, file logger) and the checks prove the prose and
 * the `LogMessage` reference: level filtering, console format, the five message types and where failed requests are logged.
 * Deliberately not proven: logging in a browser, and the exact text of messages (it changes between SDK versions, so the
 * checks match shapes and levels).
 */
const LogLevel = PubNub.LogLevel;

export default page('logging', 'P0', (world) => {
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

  // Debug level makes the SDK's console logger print its configuration, which holds the keys. The capture swallows that output
  // while the client is built and is restored right after. redact.cjs masks keys in the run log as a second line of defense.
  step('loggingBasicUsage', { proves: 'A client built with Debug level logging works, and its logger output is captured.' }, async () => {
    const quiet = world.captureConsole('info');
    // snippet.loggingBasicUsage
    // Initialize PubNub with debug-level logging
    const pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      userId: 'myUniqueUserId',
      // snippet.hide
      ...world.live.openKeys,
      // snippet.show
      logLevel: PubNub.LogLevel.Debug
    });
    // snippet.end
    world.track(pubnub);
    quiet.restore();
    assert.equal(pubnub.getUserId(), world.n('myUniqueUserId'));
    assert.ok(quiet.lines.length >= 0);
  });

  // The page assumes `monitoringService` and `analyticsService` exist. They are stand-ins that collect the payloads so the step can
  // assert what the sample would report. Runs the sample against an unreachable origin to force an error entry.
  // `reportNetworkFailure` fires because the sample handles `network-request` in `warn()` (the SDK logs a failed request at warn).
  step('loggingCustomLoggerExample', { proves: 'A custom logger receives the error entry and the sample reports it to the stand-in services.' }, async () => {
    // "The example assumes that monitoringService and analyticsService are objects in your application."
    const reported = { errors: [] as any[], failures: [] as any[], deprecations: [] as any[], configs: [] as any[] };
    const monitoringService = {
      reportError: (payload: any) => reported.errors.push(payload),
      reportNetworkFailure: (payload: any) => reported.failures.push(payload),
    };
    const analyticsService = {
      trackDeprecation: (payload: any) => reported.deprecations.push(payload),
      trackConfigChange: (payload: any) => reported.configs.push(payload),
    };
    const quiet = world.captureConsole('log');
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
      ...world.live.openKeys, ...world.unreachable,
      // snippet.show
      loggers: [new MonitoringLogger()]
    });
    // snippet.end
    world.track(pubnub);
    quiet.restore();

    // Debug entry about the configuration reaches trackConfigChange.
    assert.ok(reported.configs.length > 0, 'trackConfigChange received the configuration entry');
    assert.ok(reported.configs[0].instanceId, 'instanceId (pubNubId) is set');
    assert.match(reported.configs[0].timestamp, /^\d{4}-\d{2}-\d{2}T/, 'timestamp is an ISO string');

    // The client points at a port where nothing listens, so a request fails. The failure reaches reportError (error entry)
    // and reportNetworkFailure (failed network-request entry). The deprecated stop() reaches trackDeprecation (warn entry).
    await assert.rejects(pubnub.publish({ channel: 'x', message: 'm' }));
    await eventually(() => assert.ok(reported.errors.length > 0, 'reportError received an error entry'), { label: 'error entry' });
    assert.equal(reported.errors[0].name, 'PubNubError');
    assert.ok(reported.errors[0].message);
    assert.equal(reported.errors[0].category, 'PNNetworkIssuesCategory');
    assert.equal(reported.errors[0].operation, 'PNPublishOperation');
    assert.ok(reported.errors[0].stack, 'stack is set');
    // The SDK logs a failed network-request at the warn level, and the sample handles it in warn(), so
    // reportNetworkFailure receives the failed publish request.
    await eventually(() => assert.ok(reported.failures.length > 0, 'reportNetworkFailure received a failed request'), { label: 'failed request entry' });
    assert.ok(reported.failures[0].method, 'method is set');
    assert.match(reported.failures[0].url, /\/publish\//, 'the url names the publish path');
    assert.ok(reported.failures[0].reason, 'reason (details) is set');
    assert.ok(reported.failures[0].instanceId, 'instanceId (pubNubId) is set');
    pubnub.stop();
    assert.ok(reported.deprecations.length > 0, 'a deprecation warning reaches trackDeprecation');
    assert.match(reported.deprecations[0].warning, /deprecated/);
  });

  // The sample refers to loggers defined elsewhere on the page, so the step defines empty ones plus a small file logger to prove
  // the SDK calls every logger in the array.
  step('loggingMultipleLoggers', { proves: 'The SDK calls every logger in the loggers array.' }, async () => {
    // The page defines MonitoringLogger, AnalyticsLogger and FileLogger in the samples before this one.
    class MonitoringLogger implements Logger { trace() {} debug() {} info() {} warn() {} error() {} }
    class AnalyticsLogger implements Logger { trace() {} debug() {} info() {} warn() {} error() {} }
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pn-logging-'));
    const file = path.join(dir, 'multi.log');
    class FileLogger implements Logger {
      private readonly stream = fs.createWriteStream(file, { flags: 'a' });
      trace(m: LogMessage) { this.stream.write(`${m.level}\n`); }
      debug(m: LogMessage) { this.stream.write(`${m.level}\n`); }
      info(m: LogMessage) { this.stream.write(`${m.level}\n`); }
      warn(m: LogMessage) { this.stream.write(`${m.level}\n`); }
      error(m: LogMessage) { this.stream.write(`${m.level}\n`); }
    }
    const quiet = world.captureConsole('log');
    // snippet.loggingMultipleLoggers
    const pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      userId: 'myUniqueUserId',
      logLevel: PubNub.LogLevel.Debug,
      // snippet.hide
      ...world.live.openKeys,
      // snippet.show
      loggers: [
        new MonitoringLogger(),  // Send errors to monitoring service
        new AnalyticsLogger(),   // Track usage patterns
        new FileLogger()         // Write detailed logs to file (Node.js)
      ]
    });
    // snippet.end
    world.track(pubnub);
    quiet.restore();
    try {
      // Each custom logger is called next to the console logger: the file logger saw the initialization entries.
      await eventually(() => assert.ok(fs.readFileSync(file, 'utf8').length > 0), { label: 'file logger wrote' });
    } finally {
      pubnub.destroy();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // The file logger sample lives in getting-started/logging-file-logger.ts: its imports (`import * as fs`, the Logger types)
  // clash with this module's, and an import cannot sit inside a step.

  // ---- the prose and the LogMessage reference ------------------------------------------------------------------

  // Table-driven: for each level the set of entry levels a recorder logger sees must be a subset of the allowed ones, and every
  // allowed level up to debug must appear. The `publish` with an empty channel forces an error entry, `stop()` forces a warn
  // (deprecated). Also proves the default level is None.
  check('loggingLevels', { timeout: 60_000, proves: 'Each log level records only the entry levels it should, and the default level is None.' }, async () => {
    const open = world.env.open!;
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
      const quiet = world.captureConsole('log');
      const infoQuiet = world.captureConsole('info');
      const warnQuiet = world.captureConsole('warn');
      try {
        const pubnub = world.track(new PubNub({ ...open, userId: world.n(`logging-${name}`), logLevel, loggers: [logger] }));
        await pubnub.time();
        await assert.rejects(pubnub.publish({ channel: '', message: 'x' } as unknown as PubNub.Publish.PublishParameters));
        pubnub.stop(); // warn: deprecated
      } finally {
        quiet.restore();
        infoQuiet.restore();
        warnQuiet.restore();
      }
      const levelsSeen = new Set(seen.map((s) => s.level));
      for (const level of levelsSeen) assert.ok(allowed.includes(level), `logLevel ${name} must not record ${level} entries`);
      for (const level of ['error', 'warn', 'info', 'debug'].filter((l) => allowed.includes(l))) {
        assert.ok(levelsSeen.has(level), `logLevel ${name} records ${level} entries (saw ${[...levelsSeen]})`);
      }
      seenByLevel.set(name, levelsSeen);
    }
    assert.equal(seenByLevel.get('none')!.size, 0, 'LogLevel.None records nothing');
    // Default: logging is disabled.
    const { logger, seen } = recorder();
    world.track(new PubNub({ ...open, userId: world.n('logging-default'), loggers: [logger] }));
    assert.equal(seen.length, 0, 'the default logLevel is None');
  });

  // Replaces the console methods by hand (not `captureConsole`) because the check needs all five at once to prove Trace goes to `console.debug`.
  check('loggingConsoleLogger', { proves: 'The console logger writes each level to the matching console method, with Trace going to console.debug.' }, async () => {
    // The built-in console logger runs next to custom loggers and prints ISO timestamp, PubNub-<id>, level, location, message.
    const original = { log: console.log, info: console.info, debug: console.debug, warn: console.warn, error: console.error };
    const lines: Array<{ method: string; text: string }> = [];
    for (const method of ['log', 'info', 'debug', 'warn', 'error'] as const) {
      console[method] = (...args: unknown[]) => lines.push({ method, text: args.map(String).join(' ') });
    }
    try {
      const open = world.env.open!;
      const pubnub = world.track(new PubNub({ ...open, userId: world.n('logging-console'), logLevel: LogLevel.Trace }));
      await pubnub.time();
      pubnub.stop();
    } finally {
      Object.assign(console, original);
    }
    assert.ok(lines.length > 0, 'the console logger printed');
    const format = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z PubNub-[0-9a-f]+ (Trace|Debug|Info|Warn|Error)\s+\S+ /;
    assert.ok(lines.some((l) => format.test(l.text)), `an entry matches the documented format. First: ${lines[0]?.text.slice(0, 120)}`);
    assert.ok(lines.filter((l) => / Trace /.test(l.text)).every((l) => l.method === 'debug'), 'Trace entries are written with console.debug');
  });

  // Asserts the shape of every `LogMessage` type from the page's reference. Uses an unreachable client as well to get a failed
  // `network-request` entry.
  check('loggingMessageTypes', { timeout: 60_000, proves: 'Every log message type has the shape the page reference lists.' }, async () => {
    const { logger, seen } = recorder();
    const quiet = world.captureConsole('log');
    const debugQuiet = world.captureConsole('info');
    try {
      const pubnub = world.track(new PubNub({ ...world.env.open!, userId: world.n('logging-types'), logLevel: LogLevel.Trace, loggers: [logger] }));
      await pubnub.time();
      // Validation failures are logged as a plain status object (live finding), so use an unreachable origin to get a PubNubError.
      const unreachable = world.track(new PubNub({ ...world.env.open!, ...world.unreachable, userId: world.n('logging-types-down'), logLevel: LogLevel.Trace, loggers: [logger] }));
      await assert.rejects(unreachable.publish({ channel: 'x', message: 'm' }));
    } finally {
      quiet.restore();
      debugQuiet.restore();
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
    const failed = byType('network-request').find((m) => (m as { failed?: boolean }).failed) as Extract<LogMessage, { messageType: 'network-request' }> | undefined;
    assert.ok(failed, 'a network-request entry with failed: true for the unreachable origin');
    assert.ok(!failed.canceled);
    const request = byType('network-request').find((m) => /pndsn\.com/.test((m as { message: { origin?: string } }).message.origin ?? '')) as Extract<LogMessage, { messageType: 'network-request' }>;
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
    assert.match(String(response.details ?? ''), /Negotiated protocol: \S+/, 'network-response details carry the negotiated protocol on Node.js');
    console.log(`first error entry: ${JSON.stringify({ ...error, timestamp: undefined }).slice(0, 300)}`);
  });

  // The page shows ErrorLogMessage.message as a PubNubError (name, message, stack, status). A validation failure is logged
  // as a plain status object instead (live finding). This check records the current shape.
  check('loggingValidationErrorEntryShape', { proves: 'Records the shape of a logged validation failure, a plain status object and not a PubNubError.' }, () => {
    const { logger, seen } = recorder();
    const pubnub = world.track(new PubNub({ ...world.env.open!, userId: world.n('logging-validation'), logLevel: LogLevel.Error, loggers: [logger] }));
    return assert.rejects(pubnub.publish({ channel: '', message: 'x' } as unknown as PubNub.Publish.PublishParameters)).then(() => {
      const entry = seen.find((s) => s.message.messageType === 'error')!.message as Extract<LogMessage, { messageType: 'error' }>;
      const message = entry.message as unknown as Record<string, unknown>;
      assert.equal(message.message, "Missing 'channel'");
      assert.equal(message.category, 'PNValidationErrorCategory');
      assert.equal(message.name, undefined, 'no name on the logged validation failure');
      assert.equal(message.stack, undefined, 'no stack on the logged validation failure');
      assert.equal(message.status, undefined, 'category sits on the message itself, not under status');
    });
  });

  // The sample reads failed and canceled requests in error(). Record the level at which the SDK logs them.
  check('loggingFailedRequestLevel', { proves: 'Records the log level of a failed request, which is warn.' }, async () => {
    const { logger, seen } = recorder();
    const quiet = world.captureConsole('log');
    try {
      const down = world.track(new PubNub({ ...world.env.open!, ...world.unreachable, userId: world.n('logging-failed'), logLevel: LogLevel.Trace, loggers: [logger] }));
      await assert.rejects(down.publish({ channel: 'x', message: 'm' }));
    } finally {
      quiet.restore();
    }
    const failed = seen.filter((s) => s.message.messageType === 'network-request' && (s.message as { failed?: boolean }).failed);
    assert.equal(failed.length, 1);
    assert.equal(failed[0].level, 'warn', 'a failed request is logged at the warn level, not error');
    assert.equal((failed[0].message as { details?: string }).details, 'Network error');
    assert.ok(!seen.some((s) => s.level === 'error' && s.message.messageType === 'network-request'), 'error() receives no network-request entries');
  });
});
