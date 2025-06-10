// snippet.fetchMessagesBasicUsage
import PubNub from '../../lib/types';

// Initialize PubNub with demo keys
const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId'
});

// Function to fetch message history
async function fetchHistory() {
  try {
    const result = await pubnub.fetchMessages({
      channels: ['my-channel'],
      count: 1,  // Number of messages to retrieve
      includeCustomMessageType: true,   // if you want to include custom message type in the response
      start: 'replace-with-start-timetoken',  // start timetoken
      end: 'replace-with-end-timetoken'  // end timetoken
    });
    console.log('Fetched Messages:', result);
  } catch (error) {
    console.log('Fetch Failed:', error);
  }
}

// Execute the function to fetch message history
fetchHistory();
// snippet.end

// snippet.deleteMessagesBasicUsage
try {
    const result = await pubnub.deleteMessages({
        channel: 'ch1',
        start: 'replace-with-start-timetoken',
        end: 'replace-with-end-timetoken',
    });
} catch (status) {
    console.log(status);
}
// snippet.end

// snippet.messageCountBasicUsage
try {
    const result = await pubnub.messageCounts({
        channels: ["chats.room1", "chats.room2"],
        channelTimetokens: ['replace-with-channel-timetoken-(optional)'],
    });
} catch (status) {
    console.log(status);
}
// snippet.end

