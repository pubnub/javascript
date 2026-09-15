import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'moderator-7',
});

// Removing a message from Message Persistence is a server-side operation, so this
// client is configured with the keyset's secret key and runs on your own infrastructure.
const server = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  secretKey: 'demo',
  userId: 'moderation-service',
});

// snippet.chatModerationFlagMessage
try {
  const response = await pubnub.addMessageAction({
    channel: 'game.chat',
    messageTimetoken: 'replace-with-message-timetoken',
    action: {
      type: 'moderation',
      value: 'hidden',
    },
  });
  console.log('message flagged at timetoken:', response.data.actionTimetoken);
} catch (error) {
  console.error(
    `Flagging the message failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.chatModerationReceiveModerationDecisions
const moderationSubscription = pubnub.channel('game.chat').subscription();

moderationSubscription.onMessageAction = (event) => {
  if (event.data.type === 'moderation' && event.data.value === 'hidden') {
    console.log('hide the message published at', event.data.messageTimetoken);
  }
};

moderationSubscription.subscribe();
// snippet.end

// snippet.chatModerationLoadHistoryWithFlags
// Requesting message actions alongside the messages adds an `actions` map to each
// entry, keyed by action type and then by action value.
type ModeratedEntry = {
  timetoken: string | number;
  message: unknown;
  actions?: Record<string, Record<string, unknown>>;
};

try {
  const response = await pubnub.fetchMessages({
    channels: ['game.chat'],
    count: 25,
    includeMessageActions: true,
  });

  const entries = (response.channels['game.chat'] ?? []) as ModeratedEntry[];

  entries.forEach((entry) => {
    const hidden = entry.actions?.moderation?.hidden !== undefined;
    console.log(entry.timetoken, hidden ? '[hidden by a moderator]' : entry.message);
  });
} catch (error) {
  console.error(
    `Loading the moderated history failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.chatModerationDeleteMessage
try {
  const messageTimetoken = 17000000000000000;

  const response = await server.deleteMessages({
    channel: 'game.chat',
    start: (messageTimetoken - 1).toString(),
    end: messageTimetoken.toString(),
  });
  console.log('message deleted from Message Persistence:', response);
} catch (error) {
  console.error(
    `Deleting the message failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
