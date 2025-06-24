import PubNub, { PubNubError } from '../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.iterativelyUpdateExistingMetadata
const channel = 'team.red';
const name = 'Red Team';
const description = 'The channel for Red team.';
const customField = { visible: 'team' };

// Function to set and then update channel metadata
try {
  let response = await pubnub.objects.setChannelMetadata({
    channel: channel,
    data: {
      name: name,
      description: description,
      custom: customField,
    },
  });
  console.log('The channel has been created with name and description.\n');

  // Fetch current object with custom fields
  let currentObjectResponse = await pubnub.objects.getChannelMetadata({
    channel: channel,
    include: {
      customFields: true,
    },
  });
  let currentObject = currentObjectResponse.data;

  // Initialize the custom field object
  let custom = currentObject.custom || {};

  // Add or update the field
  custom['edit'] = 'admin';

  // Writing the updated object back to the server
  let setResponse = await pubnub.objects.setChannelMetadata({
    channel: channel,
    data: {
      name: currentObject.name || '',
      description: currentObject.description || '',
      custom: custom,
    },
  });
  console.log('Object has been updated', setResponse);
} catch (error) {
  console.error(
    `Set channel metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
