import assert from 'node:assert/strict';
import PubNub from 'pubnub';
import { fileURLToPath } from 'node:url';
import { granted } from '../support/access-manager';
import { assertTimetoken, rejectsWithCategory } from '../support/assertions';
import { track } from '../support/clients';
import { captureConsole } from '../support/console';
import { keysOf } from '../support/env';
import { withPlaceholders } from '../support/placeholders';
import { eventually } from '../support/wait';

/**
 *
 * Runs on the secured keyset: the token service signs and revokes tokens, the fan client only applies them.
 *
 * The state-store snippet starts with an `import`, which only exists at module level, so it sits at file level, before the
 * describe (the `lint: asserted-by` line after it names the test that asserts it), and the flow below reads its state file back. The sample keeps its state next to the script (`./fan-state.json`):
 * under the runner that is this folder, and the hooks below remove the file before and after.
 */
// snippet.fanBehaviorStateStore
import fs from 'node:fs';

// A real token service tracks issued tokens and each fan's status in a database.
// This tutorial persists the same information in a JSON file next to the script,
// so `grant`, `mute`, `unmute`, and `ban` share state across separate `node server.js`
// invocations without needing a database just to run the tutorial.
const stateFilePath = new URL('./fan-state.json', import.meta.url);

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveState(state = {}) {
  fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
}
// snippet.end
// lint: asserted-by a fan is granted, muted, banned and let back in

interface IssuedToken {
  token: string;
  write: boolean;
}
interface FanState {
  status: string;
  tokens: IssuedToken[];
}

describe('use-cases/fan-behavior-management', () => {
  const FAN = 'fan-42';
  const removeState = (): void => fs.rmSync(stateFilePath, { force: true });
  const readState = (): Record<string, FanState> => JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
  const originalArgv = process.argv;
  before(removeState);
  after(() => {
    process.argv = originalArgv;
    removeState();
  });

  it('fanBehaviorStateStore, fanBehaviorGrantChatAccess, fanBehaviorHandleAccessDenied, fanBehaviorApplyToken, fanBehaviorSubscribeAndPublish, fanBehaviorMuteFan, fanBehaviorBanFan, fanBehaviorUnmuteFan, fanBehaviorServerDispatch, fanBehaviorInspectToken: a fan is granted, muted, banned and let back in, and the fan client sees each change', async function () {
    // Revoking a token takes up to about a minute to reach every server, and the ban step waits for it.
    this.timeout(400_000);
    const { publishKey, subscribeKey, secretKey } = keysOf('pam');
    const log = captureConsole('log');
    const errors = captureConsole('error');
    try {
      const server = track(
        new PubNub({ publishKey, subscribeKey, secretKey, userId: 'moderation-service', heartbeatInterval: 0 }),
      );
      const reset = (): void => {
        log.lines.length = 0;
        errors.lines.length = 0;
      };

      // snippet.fanBehaviorGrantChatAccess
      async function grantChatAccess(userId = '') {
        const state = loadState();
        const entry = state[userId] ?? { status: 'active', tokens: [] };

        if (entry.status === 'banned') {
          console.log(`${userId} is banned, so no token was issued`);
          return;
        }

        const canWrite = entry.status !== 'muted';

        try {
          const token = await server.grantToken({
            ttl: 60,
            authorizedUserId: userId,
            resources: {
              channels: {
                'game.chat': { read: true, write: canWrite },
              },
            },
          });

          entry.status = entry.status ?? 'active';
          entry.tokens = [...entry.tokens, { token, write: canWrite }];
          state[userId] = entry;
          saveState(state);

          console.log(`token that allows ${canWrite ? 'reading and writing' : 'reading'} chat:`, token);
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Granting chat access failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
      }
      // snippet.end

      /* eslint-disable prettier/prettier */
      // snippet.fanBehaviorMuteFan
      async function muteFan(userId = '') {
        const state = loadState();
        const entry = state[userId] ?? { status: 'active', tokens: [] };

        if (entry.status === 'banned') {
          console.log(`${userId} is already banned, so there is nothing left to mute`);
          return;
        }

        const writableTokens = entry.tokens.filter((issued = { token: '', write: false }) => issued.write);
        const stillValid = [];

        for (const issued of writableTokens) {
          try {
            await server.revokeToken(issued.token);
            console.log('revoked an outstanding writable token');
          } catch (error) {
            const status = error instanceof Error && 'status' in error ? error.status : undefined;
            console.error(`Revoking a writable token failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
            // Keep tracking a token you couldn't revoke, so the next mute or ban retries it.
            stillValid.push(issued);
          }
        }

        // Record the mute before issuing anything new, so a later grant can't hand out write access.
        entry.status = 'muted';
        entry.tokens = [...entry.tokens.filter((issued = { token: '', write: false }) => !issued.write), ...stillValid];
        state[userId] = entry;
        saveState(state);

        if (stillValid.length > 0) {
          console.error(`${stillValid.length} writable token(s) are still valid. Run mute again to retry revoking them.`);
        }

        try {
          const token = await server.grantToken({
            ttl: 15,
            authorizedUserId: userId,
            resources: {
              channels: {
                'game.chat': { read: true },
              },
            },
          });

          entry.tokens = [...entry.tokens, { token, write: false }];
          state[userId] = entry;
          saveState(state);

          console.log('token that allows reading chat but not writing to it:', token);
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Muting the fan failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
      }
      // snippet.end
      /* eslint-enable prettier/prettier */

      // snippet.fanBehaviorUnmuteFan
      async function unmuteFan(userId = '') {
        const state = loadState();
        const entry = state[userId] ?? { status: 'active', tokens: [] };

        // This is the one command that clears a ban as well as a mute. Calling it is always
        // a deliberate decision by whoever operates server.js, never a side effect of anything
        // else in this tutorial.
        try {
          const token = await server.grantToken({
            ttl: 60,
            authorizedUserId: userId,
            resources: {
              channels: {
                'game.chat': { read: true, write: true },
              },
            },
          });

          entry.status = 'active';
          entry.tokens = [...entry.tokens, { token, write: true }];
          state[userId] = entry;
          saveState(state);

          console.log('token that allows reading and writing chat again:', token);
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Unmuting the fan failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
      }
      // snippet.end

      // snippet.fanBehaviorBanFan
      async function banFan(userId = '') {
        const state = loadState();
        const entry = state[userId] ?? { status: 'active', tokens: [] };

        const stillValid = [];

        for (const issued of entry.tokens) {
          try {
            await server.revokeToken(issued.token);
            console.log('revoked an outstanding token');
          } catch (error) {
            const status = error instanceof Error && 'status' in error ? error.status : undefined;
            console.error(`Revoking a token failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
            // Keep tracking a token you couldn't revoke, so the next ban retries it.
            stillValid.push(issued);
          }
        }

        entry.status = 'banned';
        entry.tokens = stillValid;
        state[userId] = entry;
        saveState(state);

        if (stillValid.length > 0) {
          console.error(
            `${userId} is banned, but ${stillValid.length} token(s) are still valid. Run ban again to retry revoking them.`,
          );
        } else {
          console.log(`${userId} is banned. Every outstanding token, read-only and writable, is now revoked.`);
        }
      }
      // snippet.end

      // The page runs `node server.js <command> <userId>`: the same snippet runs once per command with that argv.
      const runServer = async (argument: string, userId = FAN): Promise<void> => {
        process.argv = [originalArgv[0], 'server.js', argument, userId];
        // snippet.fanBehaviorServerDispatch
        const [, , command, userIdArgument] = process.argv;
        const targetUserId = userIdArgument ?? 'fan-42';

        if (command === 'grant') {
          await grantChatAccess(targetUserId);
        } else if (command === 'mute') {
          await muteFan(targetUserId);
        } else if (command === 'unmute') {
          await unmuteFan(targetUserId);
        } else if (command === 'ban') {
          await banFan(targetUserId);
        } else {
          console.log('usage: node server.js <grant|mute|unmute|ban> [userId]');
        }
        // snippet.end
      };

      // The page runs `node fan.js <token>`: listener first, then the token, then subscribe and publish.
      const startFan = async (token: string, extra: Partial<PubNub.PubNubConfiguration> = {}): Promise<PubNub> => {
        const fanClient = track(new PubNub({ publishKey, subscribeKey, userId: FAN, ...extra }));
        process.argv = [originalArgv[0], 'fan.js', token];

        // snippet.fanBehaviorHandleAccessDenied
        fanClient.addListener({
          status: (event) => {
            if (event.category === 'PNConnectedCategory') {
              console.log('connected to game.chat');
            } else if (event.category === 'PNAccessDeniedCategory' || event.error === 'PNAccessDeniedCategory') {
              // A revoked token arrives as the category, or as the error of an unexpected disconnect, depending on the subscribe loop.
              console.log('this fan may no longer write to game.chat');
            }
          },
        });
        // snippet.end

        // snippet.fanBehaviorApplyToken
        const suppliedToken = process.argv[2];

        if (!suppliedToken) {
          console.error('usage: node fan.js <token>');
          process.exit(1);
        }

        fanClient.setToken(suppliedToken);
        // snippet.end

        /* eslint-disable prettier/prettier */
        // snippet.fanBehaviorSubscribeAndPublish
        const subscription = fanClient.channel('game.chat').subscription();
        subscription.subscribe();

        try {
          const response = await fanClient.publish({
            channel: 'game.chat',
            message: { text: 'Come on!' },
          });
          console.log('chat message published at timetoken:', response.timetoken);
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Publishing to game.chat failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
        // snippet.end
        /* eslint-enable prettier/prettier */
        return fanClient;
      };

      const lastToken = (): string => {
        const tokens = readState()[FAN].tokens;
        return tokens[tokens.length - 1].token;
      };
      const parsedOf = (token: string): NonNullable<ReturnType<PubNub['parseToken']>> => {
        const parsed = server.parseToken(token);
        assert.ok(parsed, 'the token parses');
        return parsed;
      };
      const grantedChat = (token: string): Record<string, boolean> =>
        granted(parsedOf(token).resources?.channels?.['game.chat']);
      const publishWith = (token: string): Promise<unknown> => {
        const other = track(new PubNub({ publishKey, subscribeKey, userId: FAN }));
        other.setToken(token);
        return other.publish({ channel: 'game.chat', message: { text: 'probe' } });
      };

      // 1. grant: the dispatch snippet routes `grant` to grantChatAccess.
      await runServer('grant');
      assert.deepEqual(errors.lines, [], 'grant took no error path');
      const grantLine = log.lines.find((line) => line.startsWith('token that allows reading and writing chat:'));
      assert.ok(grantLine, `grant logged its token. Logged: ${log.lines.join(' | ')}`);
      let state = readState();
      assert.equal(state[FAN].status, 'active');
      assert.equal(state[FAN].tokens.length, 1);
      assert.equal(state[FAN].tokens[0].write, true);
      const readWriteToken = lastToken();
      assert.ok(grantLine.endsWith(readWriteToken), 'the logged token is the stored token');
      assert.deepEqual(grantedChat(readWriteToken), { read: true, write: true });
      assert.equal(parsedOf(readWriteToken).authorized_uuid, FAN, 'the token is bound to the fan');
      assert.equal(parsedOf(readWriteToken).ttl, 60);

      // 2. the fan applies the token, subscribes and publishes.
      reset();
      const fan = await startFan(readWriteToken);
      await eventually(() => assert.ok(log.lines.includes('connected to game.chat'), `log: ${log.lines.join(' | ')}`));
      assert.deepEqual(errors.lines, [], 'neither applying the token nor publishing took the error path');
      const published = log.lines.find((line) => line.startsWith('chat message published at timetoken: '));
      assert.ok(published, `the publish was accepted. Logged: ${log.lines.join(' | ')}`);
      assertTimetoken(published.split(': ')[1]);

      // 3. inspect the token the fan holds (placeholder token of the page swapped for the real one).
      reset();
      {
        const fanClient = withPlaceholders(track(new PubNub({ publishKey, subscribeKey, userId: FAN })), {
          'replace-with-the-token-to-inspect': readWriteToken,
        });
        // snippet.fanBehaviorInspectToken
        const parsed = fanClient.parseToken('replace-with-the-token-to-inspect');

        if (parsed) {
          console.log('token expires in', parsed.ttl, 'minutes');
          console.log('channel permissions:', parsed.resources?.channels);
        }
        // snippet.end
      }
      assert.ok(log.lines.includes('token expires in 60 minutes'), `log: ${log.lines.join(' | ')}`);
      const permissionsLine = log.lines.find((line) => line.startsWith('channel permissions:'));
      assert.ok(permissionsLine?.includes('"game.chat"'), `permissions line: ${permissionsLine}`);
      assert.ok(permissionsLine);
      assert.match(permissionsLine, /"read":true,"write":true/, 'the printed permissions carry read and write');

      // 4. mute: every writable token is revoked, a read-only one is issued, the state records the mute.
      reset();
      await runServer('mute');
      assert.deepEqual(errors.lines, [], 'mute took no error path (revoke must be enabled on the keyset)');
      assert.deepEqual(
        log.lines.filter((line) => line === 'revoked an outstanding writable token'),
        ['revoked an outstanding writable token'],
        'the one writable token was revoked',
      );
      state = readState();
      assert.equal(state[FAN].status, 'muted');
      assert.equal(state[FAN].tokens.length, 1, 'the revoked writable token left the tracked list');
      assert.equal(state[FAN].tokens[0].write, false);
      const mutedToken = lastToken();
      assert.notEqual(mutedToken, readWriteToken);
      assert.ok(
        log.lines.some((line) => line === `token that allows reading chat but not writing to it: ${mutedToken}`),
        `log: ${log.lines.join(' | ')}`,
      );
      assert.deepEqual(grantedChat(mutedToken), { read: true });
      assert.equal(parsedOf(mutedToken).ttl, 15);

      // The revoke reaches the old token: a fresh client holding it is refused (propagation takes up to about a minute).
      await eventually(() => rejectsWithCategory(publishWith(readWriteToken), 'PNAccessDeniedCategory'), {
        label: 'the revoked writable token is refused',
        timeout: 120_000,
        interval: 3000,
      });

      // A grant while muted can only hand out a read-only token.
      reset();
      await runServer('grant');
      assert.deepEqual(errors.lines, []);
      assert.ok(
        log.lines.some((line) => line.startsWith('token that allows reading chat: ')),
        log.lines.join(' | '),
      );
      assert.equal(readState()[FAN].tokens.length, 2);
      assert.equal(readState()[FAN].tokens[1].write, false, 'a muted fan is not granted write');

      // 5. the fan restarts with the muted token: connect works, the publish is refused and caught at the call site.
      fan.destroy();
      reset();
      const mutedFan = await startFan(mutedToken);
      // Records every status of the running fan, with the error category the status carries (outside the sample).
      const mutedFanStatuses: Array<{ category: string; error: string }> = [];
      mutedFan.addListener({
        status: (status) =>
          mutedFanStatuses.push({
            category: String(status.category),
            error: String((status as { error?: unknown }).error ?? ''),
          }),
      });
      await eventually(() => assert.ok(log.lines.includes('connected to game.chat'), `log: ${log.lines.join(' | ')}`));
      assert.equal(errors.lines.length, 1, `exactly one error line. Logged: ${errors.lines.join(' | ')}`);
      assert.ok((errors.lines as string[])[0].startsWith('Publishing to game.chat failed: '), errors.lines[0]);
      assert.ok(!log.lines.some((line) => line.startsWith('chat message published')), 'the publish was not accepted');
      await rejectsWithCategory(publishWith(mutedToken), 'PNAccessDeniedCategory');

      // 6. ban with the muted fan still running: all tokens are revoked and the running client reports access denied.
      reset();
      await runServer('ban');
      assert.deepEqual(errors.lines, [], 'ban took no error path');
      assert.equal(
        log.lines.filter((line) => line === 'revoked an outstanding token').length,
        2,
        'both tracked tokens (the muted one and the read-only grant) were revoked',
      );
      assert.ok(
        log.lines.includes(`${FAN} is banned. Every outstanding token, read-only and writable, is now revoked.`),
      );
      state = readState();
      assert.equal(state[FAN].status, 'banned');
      assert.deepEqual(state[FAN].tokens, []);
      // With the default subscribe loop (event engine) a revoked token ends the running subscription with status category
      // PNDisconnectedUnexpectedlyCategory and `error: 'PNAccessDeniedCategory'`; only the legacy loop uses the category itself.
      // The sample handles both shapes, so its log line must appear on the default loop.
      const deniedStatus = (): boolean =>
        mutedFanStatuses.some(
          (s) => s.category === 'PNDisconnectedUnexpectedlyCategory' && s.error === 'PNAccessDeniedCategory',
        );
      // First without any traffic (the page says "shortly after"), then with messages on the channel, which end the long poll.
      const banStart = Date.now();
      try {
        await eventually(() => assert.ok(deniedStatus(), JSON.stringify(mutedFanStatuses)), {
          timeout: 75_000,
          interval: 3000,
        });
        process.stdout.write(
          `      [fan-behavior-management] access denied seen after ${Date.now() - banStart} ms without traffic\n`,
        );
      } catch {
        await eventually(
          async () => {
            await server.publish({ channel: 'game.chat', message: { text: 'nudge' } });
            assert.ok(deniedStatus(), JSON.stringify(mutedFanStatuses));
          },
          { label: 'running fan learns about the ban', timeout: 120_000, interval: 5000 },
        );
        process.stdout.write(
          `      [fan-behavior-management] access denied seen only with traffic, after ${Date.now() - banStart} ms\n`,
        );
      }
      assert.ok(
        log.lines.includes('this fan may no longer write to game.chat'),
        `the sample's access denied branch ran on the default subscribe loop. Log: ${log.lines.join(' | ')}`,
      );
      mutedFan.destroy();

      // The sample's branch does work with the legacy subscription manager: a fan with a revoked token is told at once.
      reset();
      await startFan(mutedToken, { enableEventEngine: false });
      await eventually(
        () => assert.ok(log.lines.includes('this fan may no longer write to game.chat'), log.lines.join(' | ')),
        { label: 'legacy subscribe loop reports PNAccessDeniedCategory', timeout: 60_000 },
      );

      // A banned fan gets no token at all, even from a fresh grant.
      reset();
      await runServer('grant');
      assert.deepEqual(log.lines, [`${FAN} is banned, so no token was issued`]);
      assert.deepEqual(readState()[FAN].tokens, []);

      // 7. unmute lifts the ban: the fan is active again and a fresh read-and-write token works.
      reset();
      await runServer('unmute');
      assert.deepEqual(errors.lines, []);
      state = readState();
      assert.equal(state[FAN].status, 'active');
      assert.equal(state[FAN].tokens.length, 1);
      const backToken = lastToken();
      assert.ok(
        log.lines.includes(`token that allows reading and writing chat again: ${backToken}`),
        log.lines.join(' | '),
      );
      assert.deepEqual(grantedChat(backToken), { read: true, write: true });
      reset();
      await startFan(backToken);
      assert.deepEqual(errors.lines, [], 'the fan publishes again with the new token');
      assert.ok(
        log.lines.some((line) => line.startsWith('chat message published at timetoken: ')),
        log.lines.join(' | '),
      );
    } finally {
      log.restore();
      errors.restore();
      process.argv = originalArgv;
    }
  });
});
