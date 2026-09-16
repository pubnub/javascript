import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'fan-42',
});

// snippet.fanChatCreateChannelMetadata
try {
  const response = await pubnub.objects.setChannelMetadata({
    channel: 'game.chat',
    data: {
      name: 'Match chat',
      description: 'Open chat for everyone watching the match',
    },
  });
  console.log('channel metadata set:', response.data);
} catch (error) {
  console.error(
    `Setting the channel metadata failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.fanChatSetFanProfile
try {
  const response = await pubnub.objects.setUUIDMetadata({
    uuid: 'fan-42',
    data: {
      name: 'Alex Moreau',
      profileUrl: 'https://example.com/avatars/fan-42.png',
      custom: { supports: 'home' },
    },
  });
  console.log('fan profile set:', response.data);
} catch (error) {
  console.error(
    `Setting the fan profile failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.fanChatSubscribeWithPresence
const chatChannel = pubnub.channel('game.chat');
const chatSubscription = chatChannel.subscription({ receivePresenceEvents: true });

chatSubscription.onMessage = (event) => {
  console.log(`${event.publisher}: ${JSON.stringify(event.message)}`);
};

chatSubscription.onPresence = (event) => {
  if (event.action === 'interval' || event.action === 'join' || event.action === 'leave') {
    console.log('fans in this chat:', event.occupancy);
  }
};

chatSubscription.subscribe();
// snippet.end

// snippet.fanChatSendMessage
try {
  const response = await pubnub.publish({
    channel: 'game.chat',
    message: { text: 'What a save!' },
    customMessageType: 'text-message',
    storeInHistory: true,
  });
  console.log('chat message published at timetoken:', response.timetoken);
} catch (error) {
  console.error(
    `Publishing the chat message failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.fanChatLoadRecentMessages
try {
  const response = await pubnub.fetchMessages({
    channels: ['game.chat'],
    count: 25,
    includeMessageActions: true,
  });

  const entries = response.channels['game.chat'] ?? [];

  entries.forEach((entry) => {
    console.log(entry.timetoken, entry.message);
  });
} catch (error) {
  console.error(
    `Loading recent messages failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.fanChatCountFansOnline
try {
  const response = await pubnub.hereNow({
    channels: ['game.chat'],
    includeUUIDs: false,
  });
  console.log('fans in the chat:', response.totalOccupancy);
} catch (error) {
  console.error(
    `Counting the fans online failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.fanChatAddReaction
try {
  const response = await pubnub.addMessageAction({
    channel: 'game.chat',
    messageTimetoken: 'replace-with-message-timetoken',
    action: {
      type: 'reaction',
      value: '\u{1F44F}',
    },
  });
  console.log('reaction added at timetoken:', response.data.actionTimetoken);
} catch (error) {
  console.error(
    `Adding the reaction failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.fanChatReceiveReactions
const reactionsSubscription = pubnub.channel('game.chat').subscription();

reactionsSubscription.onMessageAction = (event) => {
  console.log(`${event.publisher} reacted with ${event.data.value} to the message at ${event.data.messageTimetoken}`);
};

reactionsSubscription.subscribe();
// snippet.end
