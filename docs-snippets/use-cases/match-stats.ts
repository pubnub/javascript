import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'fan-42',
});

// snippet.matchStatsPublishOneStat
try {
  const response = await pubnub.publish({
    channel: 'game.match-stats.score',
    message: { value: '3-1' },
    customMessageType: 'match-stat',
    storeInHistory: true,
  });
  console.log('score published at timetoken:', response.timetoken);
} catch (error) {
  console.error(
    `Publishing the stat failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.matchStatsSubscribeToAllStats
const statsSubscription = pubnub.subscriptionSet({
  channels: ['game.match-stats.*'],
  subscriptionOptions: { receivePresenceEvents: false },
});

statsSubscription.onMessage = (event) => {
  const statName = event.channel.split('.').pop();
  console.log(`${statName} is now`, event.message);
};

statsSubscription.subscribe();
// snippet.end

// snippet.matchStatsFetchCurrentValues
const statNames = ['score', 'possession', 'shots', 'cards'];

try {
  const response = await pubnub.fetchMessages({
    channels: statNames.map((statName) => `game.match-stats.${statName}`),
    count: 1,
  });

  statNames.forEach((statName) => {
    const entries = response.channels[`game.match-stats.${statName}`];

    if (entries && entries.length > 0) {
      console.log(`${statName} is currently`, entries[0].message);
    }
  });
} catch (error) {
  console.error(
    `Fetching the current stats failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
