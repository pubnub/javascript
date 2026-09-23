import PubNub from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'fan-42',
});

// snippet.livePollsPublishPoll
const poll = {
  id: 'poll-1',
  title: 'Who will win the match?',
  durationSeconds: 60,
  options: [
    { id: 1, text: 'Home team' },
    { id: 2, text: 'Away team' },
    { id: 3, text: 'Draw' },
  ],
};

try {
  const response = await pubnub.publish({
    channel: 'game.new-poll',
    message: poll,
    customMessageType: 'poll-opened',
    storeInHistory: true,
  });
  console.log('poll published at timetoken:', response.timetoken);
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Publishing the poll failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.livePollsSubscribeToPolls
const pollChannel = pubnub.channel('game.new-poll');
const pollSubscription = pollChannel.subscription({ receivePresenceEvents: false });

pollSubscription.onMessage = (event) => {
  console.log('new poll:', event.message);
};

pollSubscription.subscribe();
// snippet.end

// snippet.livePollsFetchOpenPoll
try {
  const response = await pubnub.fetchMessages({
    channels: ['game.new-poll'],
    count: 1,
  });

  const entries = response.channels['game.new-poll'];

  if (entries && entries.length > 0) {
    console.log('poll that is already open:', entries[0].message);
  }
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Fetching the open poll failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.livePollsPublishVote
try {
  const response = await pubnub.publish({
    channel: 'game.poll-votes',
    message: { pollId: 'poll-1', optionId: 2 },
    customMessageType: 'poll-vote',
  });
  console.log('vote published at timetoken:', response.timetoken);
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Publishing the vote failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.livePollsPublishResults
try {
  const response = await pubnub.publish({
    channel: 'game.poll-results',
    message: {
      pollId: 'poll-1',
      totals: { 1: 812, 2: 1043, 3: 219 },
      closed: true,
    },
    customMessageType: 'poll-results',
    storeInHistory: true,
  });
  console.log('results published at timetoken:', response.timetoken);
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Publishing the results failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.livePollsSubscribeToResults
const resultsChannel = pubnub.channel('game.poll-results');
const resultsSubscription = resultsChannel.subscription({ receivePresenceEvents: false });

resultsSubscription.onMessage = (event) => {
  console.log('poll results:', event.message);
};

resultsSubscription.subscribe();
// snippet.end
