import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'fan-42',
});

// snippet.rateLimitingReadShardOccupancy
try {
  const response = await pubnub.hereNow({
    channels: ['game.chat.shard-0', 'game.chat.shard-1', 'game.chat.shard-2'],
    includeUUIDs: false,
  });

  Object.entries(response.channels).forEach(([channel, data]) => {
    console.log(`${channel} holds ${data.occupancy} fans`);
  });
} catch (error) {
  console.error(
    `Reading the shard occupancy failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.rateLimitingPickShardForFan
async function pickShardForFan(shardCount: number, maxFansPerShard: number) {
  const channels = Array.from({ length: shardCount }, (_, index) => `game.chat.shard-${index}`);

  const response = await pubnub.hereNow({ channels, includeUUIDs: false });

  const openShard = channels.find((channel) => (response.channels[channel]?.occupancy ?? 0) < maxFansPerShard);

  if (!openShard) {
    throw new Error('every shard is full, so add more shards before the next match');
  }

  return openShard;
}

const shard = await pickShardForFan(10, 1000);

console.log('this fan joins', shard);
// snippet.end

// snippet.rateLimitingThrottleFanPublishes
const minimumMillisecondsBetweenMessages = 2000;
let lastPublishedAt = 0;

async function sendChatMessage(text: string) {
  const now = Date.now();

  if (now - lastPublishedAt < minimumMillisecondsBetweenMessages) {
    console.log('too soon, so this message is dropped before it reaches the network');
    return;
  }

  lastPublishedAt = now;

  await pubnub.publish({
    channel: shard,
    message: { text },
    customMessageType: 'text-message',
  });
}

await sendChatMessage('Offside, surely?');
// snippet.end
