/**
 * Real-network counterpart of test/integration/endpoints/history.test.ts: the one test that publishes to the service and reads
 * the history back (the nock-mocked tests of that file stay there). Not a documentation sample.
 *
 * Needs the `open` keyset with Message Persistence (SUBSCRIBE_KEY, PUBLISH_KEY). The channel is named after a fresh UUID, so runs
 * on a shared, persistent keyset never see each other's messages. The read is polled with `eventually`, because history is
 * eventually consistent.
 */
import type PubNub from 'pubnub';

import assert from 'node:assert';
import { randomUUID } from 'node:crypto';

import { createClient } from '../support/clients';
import { seedOnFreshChannel } from '../support/retry';
import { eventually } from '../support/wait';

/** Published test message shape. */
type TestMessage = { messageIdx: string; time: number };

/** Publishes `count` messages one after another (even indexes carry metadata), returns them sorted by timetoken. */
async function publishMessagesToChannel(
  client: PubNub,
  count: number,
  channel: string,
): Promise<{ message: TestMessage; timetoken: string }[]> {
  const messages: { message: TestMessage; timetoken: string }[] = [];

  for (let messageIdx = 0; messageIdx < count; messageIdx += 1) {
    const message: TestMessage = { messageIdx: [channel, messageIdx].join(': '), time: Date.now() };
    const payload: { channel: string; message: TestMessage; meta?: PubNub.Payload } = { message, channel };

    if (messageIdx % 2 === 0) payload.meta = { time: message.time };

    const response = await client.publish(payload);
    messages.push({ message, timetoken: response.timetoken });
  }

  return messages.sort((left, right) => parseInt(left.timetoken, 10) - parseInt(right.timetoken, 10));
}

describe('endpoints/history: history against the service', function () {
  this.timeout(60000);

  let pubnub: PubNub;

  beforeEach(() => {
    // The root hook destroys the client after the test.
    pubnub = createClient('open', 'myUUID');
  });

  it('supports metadata', async () => {
    // A transient publish failure discards the channel and seeds a new one (nothing else depends on its name), so the read
    // below never sees a channel that a lost-answer publish left with an extra message.
    const { channel, result: messages } = await seedOnFreshChannel(
      () => `history-${randomUUID()}`,
      (name) => publishMessagesToChannel(pubnub, 10, name),
      { label: 'history seed' },
    );

    await eventually(
      async () => {
        const response = await pubnub.history({ channel, includeMeta: true });

        assert.deepEqual(response.messages[0].meta, { time: messages[0].message.time });
        assert(!response.messages[1].meta);
      },
      { timeout: 30_000, label: 'history with includeMeta' },
    );
  });
});
