import PubNub from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'fan-42',
});

// snippet.liveCommentaryPublishRemark
try {
  const response = await pubnub.publish({
    channel: 'game.commentary',
    message: {
      text: 'Long ball over the top, and the striker is clean through.',
      clock: '48:07',
    },
    customMessageType: 'commentary',
    storeInHistory: true,
  });
  console.log('commentary published at timetoken:', response.timetoken);
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Publishing the commentary failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.liveCommentarySubscribe
const commentaryChannel = pubnub.channel('game.commentary');
const commentarySubscription = commentaryChannel.subscription({ receivePresenceEvents: false });

commentarySubscription.onMessage = (event) => {
  console.log(`[${event.timetoken}] ${JSON.stringify(event.message)}`);
};

pubnub.addListener({
  status: (event) => {
    if (event.category === 'PNConnectedCategory') {
      console.log('connected and ready to receive commentary');
    }
  },
});

commentarySubscription.subscribe();
// snippet.end

// snippet.liveCommentaryLoadBacklog
try {
  const response = await pubnub.fetchMessages({
    channels: ['game.commentary'],
    count: 25,
  });

  const entries = response.channels['game.commentary'] ?? [];

  entries.forEach((entry) => {
    console.log(entry.timetoken, entry.message);
  });
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Loading the commentary backlog failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.liveCommentaryUnsubscribe
process.on('SIGINT', () => {
  console.log('viewer shutting down, closing the commentary subscription');
  commentarySubscription.unsubscribe();
  process.exit(0);
});
// snippet.end
