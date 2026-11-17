import assert from 'node:assert/strict';
import PubNub from 'pubnub';
import { createClient, track } from '../support/clients';
import { quietConsole } from '../support/console';
import { keysOf } from '../support/env';
import { unique } from '../support/util';
import { connected, eventually } from '../support/wait';

/**
 * Examples for the deprecated configuration parameters `uuid`, `logVerbosity`, `cipherKey` and `useRandomIVs`, and for the
 * deprecated `stop()` method. Port of docs-snippets/api-reference/configuration-legacy.ts. The page has no snippet markers.
 * The cipherKey and useRandomIVs tests read stored messages back, so Message Persistence must be on for the open keyset.
 */

// These tests build clients with raw (deprecated) configuration objects.
const keys = (): { publishKey: string; subscribeKey: string } => {
  const { publishKey, subscribeKey } = keysOf('open');
  return { publishKey, subscribeKey };
};

// The logger records what the SDK logs so the tests can assert deprecation warnings without parsing stdout.
/** A logger that records the levels it is asked to handle. */
const recorder = (): { logger: PubNub.Logger; seen: Array<{ level: string; text: string }> } => {
  const seen: Array<{ level: string; text: string }> = [];
  const handle = (level: string) => (m: PubNub.LogMessage) => {
    seen.push({ level, text: m.messageType === 'text' ? m.message : 'details' in m ? (m.details ?? '') : '' });
  };
  return {
    seen,
    logger: {
      trace: handle('trace'),
      debug: handle('debug'),
      info: handle('info'),
      warn: handle('warn'),
      error: handle('error'),
    },
  };
};

// Reads a stored message with a client that has no crypto, so the cipher text is visible as a string. History is
// eventually consistent after a publish, hence `eventually`.
/** Ciphertext of one message, read by a client that has no crypto at all. */
const rawMessage = async (channel: string, timetoken: string): Promise<string> => {
  const raw = createClient('open', 'legacy-raw');
  const history = await eventually(
    async () => {
      const response = await raw.fetchMessages({ channels: [channel], count: 25 });
      const found = response.channels[channel]?.find((m) => String(m.timetoken) === timetoken);
      assert.ok(found, 'message stored');
      return found;
    },
    { timeout: 30_000, label: 'encrypted message stored' },
  );
  assert.equal(
    typeof history.message,
    'string',
    'an encrypted message arrives as a string for a client without crypto',
  );
  return history.message as string;
};

describe('api-reference/configuration-legacy', () => {
  // Row `uuid`: still read when `userId` is missing, and both together are an error.
  it('configurationLegacyUuid: the deprecated uuid option is still read when userId is missing, and passing both is an error', () => {
    // "The SDK reads uuid when userId is not set."
    const client = track(new PubNub({ ...keys(), uuid: 'legacy-uuid' } as unknown as PubNub.PubNubConfiguration));
    assert.equal(client.getUserId(), 'legacy-uuid');
    // "Setting both throws a PubNubError."
    assert.throws(
      () => new PubNub({ ...keys(), userId: 'a', uuid: 'b' } as unknown as PubNub.PubNubConfiguration),
      (error: unknown) => (error as Error).name === 'PubNubError' && /use only 'userId'/.test((error as Error).message),
    );
  });

  // Row `logVerbosity`. The logger is injected, so no real log output and no timing is involved.
  it('configurationLegacyLogVerbosity: logVerbosity true switches on debug logging and logs a deprecation warning, and logLevel Debug does it without the warning', () => {
    // Debug level makes the console logger print the configuration, which holds the keys. Keep it out of the test output.
    const quiet = quietConsole();
    try {
      // "true sets logLevel to LogLevel.Debug", also when a different logLevel is passed, and logs a deprecation warning.
      const { logger, seen } = recorder();
      const client = track(
        new PubNub({
          ...keys(),
          userId: 'legacy-verbosity',
          logVerbosity: true,
          logLevel: PubNub.LogLevel.Error,
          loggers: [logger],
        } as PubNub.PubNubConfiguration),
      );
      assert.ok(client);
      assert.ok(
        seen.some((s) => s.level === 'warn' && /logVerbosity/.test(s.text) && /deprecated/.test(s.text)),
        `deprecation warning logged. Saw: ${JSON.stringify(seen)}`,
      );
      assert.ok(
        seen.some((s) => s.level === 'debug'),
        'logVerbosity: true turns on debug logging although logLevel is Error',
      );

      // The replacement: logLevel Debug records debug entries without the deprecation warning.
      const replacement = recorder();
      track(
        new PubNub({
          ...keys(),
          userId: 'legacy-verbosity-new',
          logLevel: PubNub.LogLevel.Debug,
          loggers: [replacement.logger],
        }),
      );
      assert.ok(replacement.seen.some((s) => s.level === 'debug'));
      assert.ok(!replacement.seen.some((s) => /logVerbosity/.test(s.text)));
    } finally {
      quiet.restore();
    }
  });

  // Row `cipherKey`. Needs persistence because the cipher text is read back from history. The PNED header (base64
  // `UE5FRA`) tells the AES-CBC format apart from the legacy one.
  it('configurationLegacyCipherKey: the deprecated cipherKey option encrypts messages in the legacy format, and the AES-CBC module writes the PNED header', async function () {
    this.timeout(60_000);
    const channel = unique('legacy_cipher');
    const cipherKey = 'legacy-cipher-key';
    const legacyClient = createClient('open', 'legacy-cipher', { cipherKey } as Partial<PubNub.PubNubConfiguration>);
    const published = await legacyClient.publish({ channel, message: { secret: 'legacy' } });
    const cipherText = await rawMessage(channel, published.timetoken);
    // "Defaults to legacy 128-bit encryption." The legacy format has no PNED header, the AES-CBC format has one.
    assert.ok(
      !cipherText.startsWith('UE5FRA'),
      'cipherKey without a crypto module produces the legacy format (no PNED header)',
    );
    // "Pass the key to cryptoModule instead": the legacy crypto module reads it back, and so does the cipherKey client.
    const viaModule = createClient('open', 'legacy-cipher-module', {
      cryptoModule: PubNub.CryptoModule.legacyCryptoModule({ cipherKey }),
    });
    const read = await viaModule.fetchMessages({ channels: [channel], count: 25 });
    const item = read.channels[channel]?.find((m) => String(m.timetoken) === published.timetoken);
    assert.deepEqual(item?.message, { secret: 'legacy' });

    // The AES-CBC module opt-in produces the PNED format.
    const aes = createClient('open', 'legacy-aes', {
      cryptoModule: PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey }),
    });
    const aesPublished = await aes.publish({ channel, message: { secret: 'aes' } });
    assert.ok(
      (await rawMessage(channel, aesPublished.timetoken)).startsWith('UE5FRA'),
      'aesCbcCryptoModule writes the PNED header',
    );
  });

  // Row `useRandomIVs`. Equal cipher text for equal input is only possible with a fixed IV, which is what makes the
  // comparison a proof and not a guess.
  it('configurationLegacyUseRandomIVs: useRandomIVs false gives equal cipher text for equal input and true gives different cipher text', async function () {
    this.timeout(60_000);
    const channel = unique('legacy_ivs');
    const cipherKey = 'legacy-cipher-key';
    const send = async (client: PubNub): Promise<string> =>
      rawMessage(channel, (await client.publish({ channel, message: { same: 'message' } })).timetoken);

    // Default (true): the initialization vector is random, so the same message encrypts differently each time.
    const random = createClient('open', 'legacy-iv-random', { cipherKey } as Partial<PubNub.PubNubConfiguration>);
    const [r1, r2] = [await send(random), await send(random)];
    assert.notEqual(r1, r2, 'random IVs make the cipher text differ');

    // useRandomIVs: false: a fixed IV, so the cipher text repeats.
    const fixed = createClient('open', 'legacy-iv-fixed', {
      cipherKey,
      useRandomIVs: false,
    } as Partial<PubNub.PubNubConfiguration>);
    const [f1, f2] = [await send(fixed), await send(fixed)];
    assert.equal(f1, f2, 'useRandomIVs: false repeats the cipher text');

    // The replacement: useRandomIVs on legacyCryptoModule() behaves the same.
    const replacement = createClient('open', 'legacy-iv-module', {
      cryptoModule: PubNub.CryptoModule.legacyCryptoModule({ cipherKey, useRandomIVs: false }),
    });
    const [m1, m2] = [await send(replacement), await send(replacement)];
    assert.equal(m1, m2);
    assert.equal(m1, f1, 'the module option gives the same cipher text as the deprecated parameter');
  });

  it('configurationLegacyStop: stop() unsubscribes the client and logs a deprecation warning', async () => {
    const channel = unique('ch1');
    const { logger, seen } = recorder();
    // The same client both subscribes and is stopped, and it logs the warning.
    const client = createClient('open', 'legacy-stop', { logLevel: PubNub.LogLevel.Warn, loggers: [logger] });
    const ready = connected(client, { channels: [channel] });
    const subscription = client.channel(channel).subscription();
    subscription.subscribe();
    await ready;

    // "stop() is an alias of destroy()": it invalidates subscriptions and unsubscribes from everything.
    client.stop();
    await eventually(() => assert.deepEqual(client.getSubscribedChannels(), []), { label: 'stop unsubscribes' });

    assert.ok(
      seen.some((s) => s.level === 'warn' && /stop/.test(s.text) && /deprecated/.test(s.text)),
      `stop() logs a deprecation warning. Saw: ${JSON.stringify(seen)}`,
    );
  });
});
