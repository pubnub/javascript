import assert from 'assert';

import { EventDispatcher } from '../../src/core/components/event-dispatcher';
import { BaseSubscribeRequest, PubNubEventType } from '../../src/core/endpoints/subscribe';
import type { ICryptoModule } from '../../src/core/interfaces/crypto-module';
import type * as Subscription from '../../src/core/types/api/subscription';
import type { TransportResponse } from '../../src/core/types/transport-response';

// --------------------------------------------------------
// --------------------- Test harness ---------------------
// --------------------------------------------------------

/** Minimal wire envelope: only the fields the parser reads. */
type WireEnvelope = {
  a?: string;
  f?: number;
  e?: number;
  p: { t: string; r?: number };
  c: string;
  b?: string;
  d: unknown;
};

const TIMETOKEN = '17200339136465528';

function transportResponse(body: unknown): TransportResponse {
  return {
    url: 'https://ps.pndsn.com/v2/subscribe/sub-key/channel/0',
    status: 200,
    headers: {},
    body: new TextEncoder().encode(JSON.stringify(body)).buffer as ArrayBuffer,
  };
}

const RESPONSE_TIMETOKEN = '17865925322526025';

/**
 * Feed `envelopes` through the real subscribe response parser and return the whole parsed response.
 *
 * The parser drops envelopes whose channel (or subscription pattern) isn't one the request asked for, so the
 * request is built to subscribe to every `envelope.b ?? envelope.c`.
 */
async function parseResponse(envelopes: WireEnvelope[], crypto?: ICryptoModule) {
  const request = new BaseSubscribeRequest({
    channels: envelopes.map((envelope) => (envelope.b === undefined ? envelope.c : envelope.b)),
    keySet: { subscribeKey: 'sub-key' },
    getFileUrl: () => '',
    ...(crypto ? { crypto } : {}),
  });

  return request.parse(
    transportResponse({
      t: { t: RESPONSE_TIMETOKEN, r: 21 },
      m: envelopes.map((envelope) => ({ a: '5', f: 0, ...envelope })),
    }),
  );
}

/** Feed a single `envelope` through the parser and return the single parsed event. */
async function parseEnvelope(envelope: WireEnvelope, crypto?: ICryptoModule) {
  const response = await parseResponse([envelope], crypto);

  assert.strictEqual(response.messages.length, 1, 'exactly one parsed event');
  return response.messages[0];
}

/** Parse and assert the envelope came out as a presence event, returning the presence payload. */
async function parsePresence(envelope: WireEnvelope, crypto?: ICryptoModule): Promise<Subscription.Presence> {
  const event = await parseEnvelope(envelope, crypto);
  assert.strictEqual(event.type, PubNubEventType.Presence, `dispatched as presence (e: ${String(envelope.e)})`);
  return event.data as Subscription.Presence;
}

/** Presence envelope on `ch1-pnpres` with the given event type and payload. */
function presenceEnvelope(e: number | undefined, d: unknown = JOIN_PAYLOAD): WireEnvelope {
  return { ...(e !== undefined ? { e } : {}), p: { t: TIMETOKEN, r: 41 }, c: 'ch1-pnpres', d };
}

const JOIN_PAYLOAD = { action: 'join', uuid: 'bob', timestamp: 1461451222, occupancy: 1 };

/** Event fields the parser always sets, with no payload contribution. */
const ENVELOPE_ONLY_PRESENCE = {
  channel: 'ch1',
  subscription: 'ch1-pnpres',
  actualChannel: 'ch1',
  subscribedChannel: 'ch1-pnpres',
  timetoken: TIMETOKEN,
};

// --------------------------------------------------------
// ------------------------ Tests -------------------------
// --------------------------------------------------------

describe('subscribe event categorisation', () => {
  describe('`-pnpres` channel with an object payload', () => {
    it('parses an envelope without `e` as presence', async () => {
      const presence = await parsePresence(presenceEnvelope(undefined));

      assert.strictEqual(presence.channel, 'ch1', 'suffix trimmed from channel');
      assert.strictEqual(presence.subscription, 'ch1-pnpres', 'subscription keeps the suffix');
      assert.strictEqual(presence.action, 'join', 'action');
    });

    it('parses an envelope with the presence event type as presence', async () => {
      const presence = await parsePresence(presenceEnvelope(PubNubEventType.Presence));

      assert.strictEqual(presence.action, 'join', 'action');
    });

    it('overrides the message event type', async () => {
      await parsePresence(presenceEnvelope(PubNubEventType.Message));
    });

    it('overrides the signal event type', async () => {
      await parsePresence(presenceEnvelope(PubNubEventType.Signal));
    });

    it('overrides the App Context event type', async () => {
      await parsePresence(
        presenceEnvelope(PubNubEventType.AppContext, {
          source: 'objects',
          version: '2.0',
          event: 'set',
          type: 'uuid',
          data: { id: 'user-1', updated: '2026-08-13T03:42:05.796378Z', eTag: 'tag' },
        }),
      );
    });

    it('overrides the message action event type', async () => {
      await parsePresence(
        presenceEnvelope(PubNubEventType.MessageAction, {
          source: 'actions',
          version: '1.0',
          event: 'added',
          data: { type: 'reaction', value: '🙂', messageTimetoken: '1', actionTimetoken: '2' },
        }),
      );
    });

    it('overrides the file event type', async () => {
      await parsePresence(
        presenceEnvelope(PubNubEventType.Files, { message: 'Hello', file: { id: 'file-id', name: 'file-name' } }),
      );
    });

    it('overrides the DataSync event type, bypassing the DataSync payload guard', async () => {
      await parsePresence(
        presenceEnvelope(PubNubEventType.DataSync, {
          version: '1.0',
          metadata: {
            event: 'create',
            source: 'data-sync',
            type: 'user',
            className: 'User',
            classLevel: 'Global',
            classVersion: 1,
          },
          data: { id: 'u.1' },
        }),
      );
    });

    // Also the guard for the interaction with unknown-`e` handling: on a regular channel an unrecognised `e`
    // is ignored, but the presence suffix still wins here.
    it('overrides an unknown numeric event type instead of ignoring the event', async () => {
      await parsePresence(presenceEnvelope(0));
      await parsePresence(presenceEnvelope(99));
    });

    it('still normalises `data` to `state` for a state-change payload arriving with an explicit `e`', async () => {
      const presence = await parsePresence(
        presenceEnvelope(PubNubEventType.Signal, { action: 'state-change', uuid: 'bob', data: { mood: 'happy' } }),
      );

      assert.strictEqual(presence.action, 'state-change', 'action');
      assert.deepStrictEqual((presence as Record<string, unknown>).state, { mood: 'happy' }, 'state');
      assert.ok(!('data' in presence), 'wire `data` key removed');
    });

    it('still normalises `here_now_refresh` for an interval payload arriving with an explicit `e`', async () => {
      const presence = await parsePresence(
        presenceEnvelope(PubNubEventType.Signal, {
          action: 'interval',
          timestamp: 1720033913,
          occupancy: 0,
          here_now_refresh: true,
        }),
      );

      assert.strictEqual(presence.action, 'interval', 'action');
      assert.strictEqual((presence as Record<string, unknown>).hereNowRefresh, true, 'hereNowRefresh');
      assert.ok(!('here_now_refresh' in presence), 'wire `here_now_refresh` key removed');
    });
  });

  describe('`-pnpres` channel with a string payload', () => {
    it('reads a JSON object string as the presence payload', async () => {
      const presence = await parsePresence(
        presenceEnvelope(PubNubEventType.Signal, '{"action":"join","uuid":"bob","occupancy":1}'),
      );

      assert.strictEqual(presence.action, 'join', 'action');
      assert.strictEqual((presence as Record<string, unknown>).uuid, 'bob', 'uuid');
      assert.strictEqual(presence.channel, 'ch1', 'suffix trimmed from channel');
    });

    it('emits presence without character-indexed keys for a non-JSON string', async () => {
      const presence = await parsePresence(presenceEnvelope(PubNubEventType.Signal, 'typing:start'));

      assert.deepStrictEqual({ ...presence }, ENVELOPE_ONLY_PRESENCE, 'only envelope-level fields');
    });

    it('emits presence without payload fields for a JSON array string', async () => {
      const presence = await parsePresence(presenceEnvelope(PubNubEventType.Signal, '[1,2]'));

      assert.deepStrictEqual({ ...presence }, ENVELOPE_ONLY_PRESENCE, 'only envelope-level fields');
    });

    it('overrides the missing and message event types instead of falling back to file / message', async () => {
      await parsePresence(presenceEnvelope(undefined, 'typing:start'));
      await parsePresence(presenceEnvelope(PubNubEventType.Message, 'typing:start'));
    });

    it('never decrypts a presence payload', async () => {
      let decryptCalls = 0;
      const crypto = {
        decrypt: () => {
          decryptCalls += 1;
          return 'decrypted';
        },
      } as unknown as ICryptoModule;

      const presence = await parsePresence(presenceEnvelope(PubNubEventType.Message, 'aGVsbG8='), crypto);

      assert.strictEqual(decryptCalls, 0, 'crypto module not consulted');
      assert.ok(!('error' in presence), 'no decryption error attached');
      assert.deepStrictEqual({ ...presence }, ENVELOPE_ONLY_PRESENCE, 'only envelope-level fields');
    });
  });

  describe('presence delivered through a channel group', () => {
    it('parses as presence and trims the channel while keeping the group as subscription', async () => {
      const presence = await parsePresence({
        e: PubNubEventType.Signal,
        p: { t: TIMETOKEN, r: 41 },
        c: 'ch1-pnpres',
        b: 'cg1-pnpres',
        d: JOIN_PAYLOAD,
      });

      assert.strictEqual(presence.channel, 'ch1', 'channel');
      assert.strictEqual(presence.subscription, 'cg1-pnpres', 'subscription');
    });
  });

  describe('unknown event types on a regular channel', () => {
    const regular = (e: number | undefined, d: unknown = { text: 'hello' }): WireEnvelope => ({
      ...(e !== undefined ? { e } : {}),
      p: { t: TIMETOKEN, r: 41 },
      c: 'ch1',
      d,
    });

    it('ignores an event with an unknown `e` instead of announcing it as a file', async () => {
      const response = await parseResponse([regular(0)]);

      assert.strictEqual(response.messages.length, 0, 'event ignored');
    });

    it('ignores unknown `e` values with both object and string payloads', async () => {
      for (const e of [6, 99, -3]) {
        const objectResponse = await parseResponse([regular(e)]);
        assert.strictEqual(objectResponse.messages.length, 0, `object payload ignored (e: ${e})`);

        const stringResponse = await parseResponse([regular(e, 'typing:start')]);
        assert.strictEqual(stringResponse.messages.length, 0, `string payload ignored (e: ${e})`);
      }
    });

    it('still delivers every known event type', async () => {
      const known: [WireEnvelope, PubNubEventType][] = [
        [regular(undefined), PubNubEventType.Message],
        [regular(PubNubEventType.Message), PubNubEventType.Message],
        [regular(PubNubEventType.Presence, JOIN_PAYLOAD), PubNubEventType.Presence],
        [regular(PubNubEventType.Signal), PubNubEventType.Signal],
        [
          regular(PubNubEventType.AppContext, {
            source: 'objects',
            version: '2.0',
            event: 'set',
            type: 'uuid',
            data: { id: 'user-1', updated: '2026-08-13T03:42:05.796378Z', eTag: 'tag' },
          }),
          PubNubEventType.AppContext,
        ],
        [
          regular(PubNubEventType.MessageAction, {
            source: 'actions',
            version: '1.0',
            event: 'added',
            data: { type: 'reaction', value: '🙂', messageTimetoken: '1', actionTimetoken: '2' },
          }),
          PubNubEventType.MessageAction,
        ],
        [
          regular(PubNubEventType.Files, { message: 'Hello', file: { id: 'file-id', name: 'file-name' } }),
          PubNubEventType.Files,
        ],
        [
          regular(PubNubEventType.DataSync, {
            version: '1.0',
            metadata: {
              event: 'create',
              source: 'data-sync',
              type: 'user',
              className: 'User',
              classLevel: 'Global',
              classVersion: 1,
            },
            data: { id: 'u.1' },
          }),
          PubNubEventType.DataSync,
        ],
      ];

      for (const [envelope, expectedType] of known) {
        const event = await parseEnvelope(envelope);
        assert.strictEqual(event.type, expectedType, `e: ${String(envelope.e)}`);
      }
    });

    it('keeps the known events of a mixed batch and the response cursor', async () => {
      const response = await parseResponse([regular(99), regular(PubNubEventType.Signal)]);

      assert.strictEqual(response.messages.length, 1, 'only the known event survives');
      assert.strictEqual(response.messages[0].type, PubNubEventType.Signal, 'signal delivered');
      assert.strictEqual(response.cursor.timetoken, RESPONSE_TIMETOKEN, 'cursor unaffected');
    });
  });

  describe('listener routing', () => {
    it('delivers a signal-typed `-pnpres` event to the presence listener only', async () => {
      const event = await parseEnvelope(presenceEnvelope(PubNubEventType.Signal));
      const dispatcher = new EventDispatcher();
      let presenceEvent: Subscription.Presence | undefined;
      let signalReceived = false;

      dispatcher.addListener({
        presence: (p) => (presenceEvent = p),
        signal: () => (signalReceived = true),
      });
      dispatcher.handleEvent(event);

      assert.ok(!signalReceived, 'signal listener not called');
      assert.ok(presenceEvent, 'presence listener called');
      assert.strictEqual(presenceEvent!.channel, 'ch1', 'channel');
      assert.strictEqual(presenceEvent!.subscription, 'ch1-pnpres', 'subscription');
      assert.strictEqual(presenceEvent!.action, 'join', 'action');
    });
  });
});
