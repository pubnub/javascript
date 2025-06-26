import PubNub, { PubNubError } from '../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.fetchMessagesWithMetaActions
try {
  const response = await pubnub.fetchMessages({
    channels: ['my_channel'],
    stringifiedTimeToken: true,
    includeMeta: true,
    includeMessageActions: true,
    includeCustomMessageType: true,
  });
  console.log('fetch messages response:', response);
} catch (error) {
  console.error(
    `fetch messages failed with error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.deleteSpecificMessages
try {
  const response = await pubnub.deleteMessages({
    channel: 'ch1',
    start: 'replace-with-start-timetoken',
    end: 'replace-with-end-timetoken',
  });
  console.log('delete messages response:', response);
} catch (error) {
  console.error(
    `delete messages failed with error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.messageCountTimetokensForChannels
try {
  const response = await pubnub.messageCounts({
    channels: ['ch1', 'ch2', 'ch3'],
    channelTimetokens: [
      'replace-with-channel-timetoken-ch1', // timetoken for channel ch1
      'replace-with-channel-timetoken-ch2', // timetoken for channel ch2
      'replace-with-channel-timetoken-ch3', // timetoken for channel ch3
    ],
  });
  console.log('message count response:', response);
} catch (error) {
  console.error(
    `message count failed with error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
