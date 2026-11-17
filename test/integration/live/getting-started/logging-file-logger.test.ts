import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
/* eslint-disable prettier/prettier */
// snippet.loggingFileLoggerImports
import PubNub, { Logger, LogMessage } from 'pubnub'
import * as fs from 'fs';

// snippet.end
/* eslint-enable prettier/prettier */
import { track } from '../support/clients';
import { quietConsole } from '../support/console';
import { openKeys } from '../support/env';
import { eventually } from '../support/wait';

/**
 * File logger example for Node.js.
 * It reads the level name from `PubNub.LogLevel` because the SDK is a CommonJS package.
 */
describe('getting-started/logging-file-logger', () => {
  // The sample writes `./pubnub.log`, so the test changes into a scratch directory under the OS temp dir and removes it afterwards.
  // The file is read back with `eventually` because the write stream flushes asynchronously.
  it('loggingFileLogger: a file logger writes the SDK log lines to the log file', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pn-logging-'));
    const previous = process.cwd();
    process.chdir(dir);
    // Debug level makes the console logger print the configuration, which holds the keys. Keep it out of the test output.
    const quiet = quietConsole();
    try {
      /* eslint-disable prettier/prettier */
      // snippet.loggingFileLogger
      class FileLogger implements Logger {
        private readonly stream: fs.WriteStream;

        constructor(private readonly logFilePath: string) {
          this.stream = fs.createWriteStream(logFilePath, { flags: 'a' });
        }

        log(logMessage: LogMessage) {
          const level = PubNub.LogLevel[logMessage.level];
          const timestamp = logMessage.timestamp.toISOString();
          const location = logMessage.location || 'Unknown';
          const message = this.formatMessage(logMessage);

          this.stream.write(
            `${timestamp} [${level.toUpperCase()}] ${location}: ${message}\n`
          );
        }

        formatMessage(logMessage: LogMessage) {
          if (logMessage.messageType === 'text') {
            return logMessage.message;
          } else if (logMessage.messageType === 'object') {
            return `${logMessage.details || ''}\n${JSON.stringify(logMessage.message, null, 2)}`;
          } else if (logMessage.messageType === 'error') {
            return `${logMessage.message.name}: ${logMessage.message.message}`;
          }
          // Handle other message types
          return JSON.stringify(logMessage.message);
        }

        trace(logMessage: LogMessage) { this.log(logMessage); }
        debug(logMessage: LogMessage) { this.log(logMessage); }
        info(logMessage: LogMessage) { this.log(logMessage); }
        warn(logMessage: LogMessage) { this.log(logMessage); }
        error(logMessage: LogMessage) { this.log(logMessage); }
      }

      // Use FileLogger with PubNub
      const pubnub = new PubNub({
        subscribeKey: 'mySubscribeKey',
        publishKey: 'myPublishKey',
        userId: 'myUniqueUserId',
        logLevel: PubNub.LogLevel.Debug,
        // snippet.hide
        ...openKeys(),
        // snippet.show
        loggers: [new FileLogger('./pubnub.log')]
      });
      // snippet.end
      /* eslint-enable prettier/prettier */
      track(pubnub);
      // The SDK returns the timetoken of time() as a number, so compare its digits.
      assert.match(String((await pubnub.time()).timetoken), /^\d{17}$/);
      const content = await eventually(
        () => {
          const text = fs.readFileSync(path.join(dir, 'pubnub.log'), 'utf8');
          assert.match(text, /\[DEBUG\]/, 'debug entries are in the file');
          return text;
        },
        { label: 'file has log entries' },
      );
      for (const line of content.split('\n').filter((l) => /^\d{4}-\d{2}-\d{2}T/.test(l))) {
        assert.match(line, /^\d{4}-\d{2}-\d{2}T[\d:.]+Z \[(TRACE|DEBUG|INFO|WARN|ERROR)\] \S+: /);
      }
      assert.ok(/network|GET|\/time\//i.test(content), 'the time() request appears in the log');
    } finally {
      quiet.restore();
      process.chdir(previous);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
