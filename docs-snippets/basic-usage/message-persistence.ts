import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.fetchMessagesBasicUsage
// Function to fetch message history
try {
  const result = await pubnub.fetchMessages({
    channels: ['my-channel'],
    count: 1, // Number of messages to retrieve
    includeCustomMessageType: true, // if you want to include custom message type in the response
    start: 'replace-with-start-timetoken', // start timetoken
    end: 'replace-with-end-timetoken', // end timetoken
  });
  console.log('Fetched Messages:', result);
} catch (error) {
  console.error(
    `Messages fetch failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.deleteMessagesBasicUsage
try {
  const result = await pubnub.deleteMessages({
    channel: 'ch1',
    start: 'replace-with-start-timetoken',
    end: 'replace-with-end-timetoken',
  });
  console.log('Messages deleted successfully:', result);
} catch (error) {
  console.error(
    `Messages delete failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.messageCountBasicUsage
try {
  const result = await pubnub.messageCounts({
    channels: ['chats.room1', 'chats.room2'],
    channelTimetokens: ['replace-with-channel-timetoken-(optional)'],
  });
  console.log('Message counts retrieved successfully:', result);
} catch (error) {
  console.error(
    `Message counts retrieval failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
