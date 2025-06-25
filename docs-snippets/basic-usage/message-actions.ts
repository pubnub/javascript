import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.addMessageActionBasicUsage
// first publish a message using publish() method to get the message timetoken
try {
  const response = await pubnub.addMessageAction({
    channel: 'channel_name',
    messageTimetoken: 'replace_with_message_timetoken', // Replace with actual message timetoken
    action: {
      type: 'reaction',
      value: 'smiley_face',
    },
  });
  console.log('Message reaction added successfully:', response);
} catch (error) {
  console.error(
    `Error adding reaction: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// snippet.end

// snippet.removeMessageActionBasicUsage
try {
  const response = await pubnub.removeMessageAction({
    channel: 'channel_name',
    messageTimetoken: 'replace_with_message_timetoken',
    actionTimetoken: 'replace_with_action_timetoken',
  });
  console.log('Message action removed successfully:', response);
} catch (error) {
  console.error(
    `Error removing message action: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getMessageActionsBasicUsage
// to get some data in response, first publish a message and then add a message action
// using addMessageAction() method.
try {
  const response = await pubnub.getMessageActions({
    channel: 'channel_name',
    start: 'replace_with_start_timetoken',
    end: 'replace_with_end_timetoken',
    limit: 100,
  });
  console.log('Message actions retrieved successfully:', response);
} catch (error) {
  console.error(
    `Error retrieving message actions: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
