import PubNub from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'moderator-7',
});

// Removing a message from Message Persistence, and granting the token that lets
// moderator.js write hide decisions to the control channel, are both server-side
// operations, so this client is configured with the keyset's secret key and runs
// on your own infrastructure.
const server = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  secretKey: 'demo',
  userId: 'moderation-service',
});

// snippet.chatModerationGrantControlChannelAccess
try {
  const token = await server.grantToken({
    ttl: 60,
    authorizedUserId: 'moderator-7',
    resources: {
      channels: {
        'game.chat': { read: true },
        'game.chat.moderation': { read: true, write: true },
      },
    },
  });
  console.log('token that lets moderator-7 publish hide decisions:', token);
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Granting moderator access failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.chatModerationApplyModeratorToken
pubnub.setToken('replace-with-the-token-server-js-printed');
// snippet.end

// snippet.chatModerationFlagMessage
try {
  const response = await pubnub.publish({
    channel: 'game.chat.moderation',
    message: {
      action: 'hide',
      messageTimetoken: 'replace-with-message-timetoken',
    },
    customMessageType: 'moderation-hide',
    storeInHistory: true,
  });
  console.log('message flagged at timetoken:', response.timetoken);
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Flagging the message failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.chatModerationReceiveModerationDecisions
const hiddenTimetokens = new Set();

const moderationSubscription = pubnub.channel('game.chat.moderation').subscription();

moderationSubscription.onMessage = (event) => {
  const decision = event.message;
  const action =
    typeof decision === 'object' && decision !== null && !Array.isArray(decision) && 'action' in decision
      ? decision.action
      : undefined;
  const messageTimetoken =
    typeof decision === 'object' && decision !== null && !Array.isArray(decision) && 'messageTimetoken' in decision
      ? decision.messageTimetoken
      : undefined;

  if (action === 'hide' && typeof messageTimetoken === 'string') {
    hiddenTimetokens.add(messageTimetoken);
    console.log('hide the message published at', messageTimetoken);
  }
};

moderationSubscription.subscribe();
// snippet.end

// snippet.chatModerationLoadHistoryWithFlags
try {
  const response = await pubnub.fetchMessages({
    channels: ['game.chat', 'game.chat.moderation'],
    count: 25,
  });

  const moderationEntries = response.channels['game.chat.moderation'] ?? [];

  moderationEntries.forEach((entry) => {
    const decision = entry.message;
    const action =
      typeof decision === 'object' && decision !== null && !Array.isArray(decision) && 'action' in decision
        ? decision.action
        : undefined;
    const messageTimetoken =
      typeof decision === 'object' && decision !== null && !Array.isArray(decision) && 'messageTimetoken' in decision
        ? decision.messageTimetoken
        : undefined;

    if (action === 'hide' && typeof messageTimetoken === 'string') {
      hiddenTimetokens.add(messageTimetoken);
    }
  });

  const chatEntries = response.channels['game.chat'] ?? [];

  chatEntries.forEach((entry) => {
    const hidden = hiddenTimetokens.has(entry.timetoken.toString());
    console.log(entry.timetoken, hidden ? '[hidden by a moderator]' : entry.message);
  });
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Loading the moderated history failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.chatModerationDeleteMessage
try {
  const messageTimetoken = 'replace-with-message-timetoken';
  const start = (BigInt(messageTimetoken) - BigInt(1)).toString();
  const end = messageTimetoken;

  const response = await server.deleteMessages({
    channel: 'game.chat',
    start,
    end,
  });
  console.log('message deleted from Message Persistence:', response);
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Deleting the message failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end
