import PubNub from '../lib/types';

// Initialize PubNub with demo keys
const pubnub = new PubNub({
    publishKey: 'demo',
    subscribeKey: 'demo',
    userId: 'myUniqueUserId'
  });

// snippet.fetchMessagesWithMetaActions
  try {
  const response = await pubnub.fetchMessages(
    {
        channels: ['my_channel'],
        stringifiedTimeToken: true,
        includeMeta: true,
        includeMessageActions: true,
        includeCustomMessageType: true
    });
    console.log(`fetch messages response: ${response}`);
  } catch (status) {
    console.log(`fetch messages failed with error: ${status}`);
  }
// snippet.end
  
// snippet.deleteSpecificMessages
  try {
    const response = await pubnub.deleteMessages(
    {
        channel: 'ch1',
        start: '15526611838554309',
        end: '15526611838554310'
    });
    console.log(`delete messages response: ${response}`);
  } catch (error) {
    console.log(`delete messages failed with error: ${error}`);
  }
// snippet.end

// snippet.messageCountTimetokensForChannels
try {
    const response = await pubnub.messageCounts({
        channels: ['ch1', 'ch2', 'ch3'],
        channelTimetokens: [
            'replace-with-channel-timetoken-ch1',  // timetoken for channel ch1
            'replace-with-channel-timetoken-ch2',  // timetoken for channel ch2
            'replace-with-channel-timetoken-ch3',  // timetoken for channel ch3
        ],
    });
    console.log(`message count response: ${response}`);
} catch (status) {
    console.log(`message count failed with error: ${status}`);
}
// snippet.end


