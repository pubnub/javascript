import assert from 'node:assert/strict';
import { addToTimetoken } from '../support/assertions';
import { friend, observer, shopper } from '../support/clients';
import { retryTransient } from '../support/retry';
import { withPlaceholders } from '../support/placeholders';
import { eventually, watch } from '../support/wait';

/**
 * Message action examples. Port of docs-snippets/api-reference/message-actions.ts. Message Persistence must be on for the open
 * keyset. The samples carry placeholder literals (`replace_with_message_timetoken` and so on): the client is wrapped with
 * `withPlaceholders`, so the sample text stays unchanged and the real timetokens reach the service. Every test publishes its
 * own message first, so the tests do not depend on each other.
 */
describe('api-reference/message-actions', () => {
  it('addMessageActionBasicUsage: addMessageAction returns the action and a subscriber receives an added event', async () => {
    const listening = await watch(observer(), ['channel_name']);
    const published = await retryTransient(
      () => friend().publish({ channel: 'channel_name', message: { text: 'react to me' } }),
      { label: 'seed message-actions publish' },
    );
    const pubnub = withPlaceholders(shopper(), { replace_with_message_timetoken: published.timetoken });

    // snippet.addMessageActionBasicUsage
    // first publish a message using publish() method to get the message timetoken
    const response = await pubnub.addMessageAction({
      channel: 'channel_name',
      messageTimetoken: 'replace_with_message_timetoken', // Replace with actual message timetoken
      action: {
        type: 'reaction',
        value: 'smiley_face',
      },
    });
    console.log('Message reaction added successfully:', response);

    // snippet.end
    assert.equal(response.data.type, 'reaction');
    assert.equal(response.data.value, 'smiley_face');
    assert.equal(response.data.messageTimetoken, published.timetoken);
    const event = await listening.next(
      'messageAction',
      (e) => e.data.actionTimetoken === response.data.actionTimetoken,
    );
    assert.equal(event.event, 'added');
    assert.equal(event.data.uuid, pubnub.getUserId());
    listening.stop();
    // Leave no action behind on the persistent message.
    await friend().removeMessageAction({
      channel: 'channel_name',
      messageTimetoken: published.timetoken,
      actionTimetoken: response.data.actionTimetoken,
    });
  });

  it('removeMessageActionBasicUsage: removeMessageAction emits a removed event and the action disappears from the stored list', async () => {
    const channel = 'channel_name';
    const published = await retryTransient(
      () => friend().publish({ channel, message: { text: 'remove my reaction' } }),
      { label: 'seed message-actions publish' },
    );
    const added = await friend().addMessageAction({
      channel,
      messageTimetoken: published.timetoken,
      action: { type: 'reaction', value: 'smiley_face' },
    });
    const actionTimetoken = added.data.actionTimetoken;
    const pubnub = withPlaceholders(shopper(), {
      replace_with_message_timetoken: published.timetoken,
      replace_with_action_timetoken: actionTimetoken,
    });
    const listening = await watch(observer(), [channel]);

    // snippet.removeMessageActionBasicUsage
    const response = await pubnub.removeMessageAction({
      channel: 'channel_name',
      messageTimetoken: 'replace_with_message_timetoken',
      actionTimetoken: 'replace_with_action_timetoken',
    });
    console.log('Message action removed successfully:', response);
    // snippet.end
    const event = await listening.next('messageAction', (e) => e.data.actionTimetoken === actionTimetoken);
    assert.equal(event.event, 'removed');
    await eventually(
      async () => {
        // Window of one action: start is the exclusive upper bound, end the inclusive lower bound.
        const left = await observer().getMessageActions({
          channel,
          start: addToTimetoken(actionTimetoken, 1),
          end: actionTimetoken,
        });
        assert.ok(!left.data.some((a) => a.actionTimetoken === actionTimetoken), 'action is gone');
      },
      { label: 'removed action is no longer listed' },
    );
    listening.stop();
  });

  it('getMessageActionsBasicUsage: getMessageActions returns the action added during setup with the right type, value and message timetoken', async () => {
    const channel = 'channel_name';
    const published = await retryTransient(
      () => friend().publish({ channel, message: { text: 'count my reactions' } }),
      { label: 'seed message-actions publish' },
    );
    const added = await friend().addMessageAction({
      channel,
      messageTimetoken: published.timetoken,
      action: { type: 'reaction', value: 'thumbs_up' },
    });
    // Actions are listed newest first: `start` is the exclusive upper bound, `end` the inclusive lower bound. The window
    // holds exactly this run's action, so the list can be compared in full although the channel is shared.
    const pubnub = withPlaceholders(shopper(), {
      replace_with_start_timetoken: addToTimetoken(added.data.actionTimetoken, 1),
      replace_with_end_timetoken: added.data.actionTimetoken,
    });

    // snippet.getMessageActionsBasicUsage
    // to get some data in response, first publish a message and then add a message action
    // using addMessageAction() method.
    const response = await pubnub.getMessageActions({
      channel: 'channel_name',
      start: 'replace_with_start_timetoken',
      end: 'replace_with_end_timetoken',
      limit: 100,
    });
    console.log('Message actions retrieved successfully:', response);
    // snippet.end
    assert.equal(response.data.length, 1);
    assert.equal(response.data[0].actionTimetoken, added.data.actionTimetoken);
    assert.equal(response.data[0].value, 'thumbs_up');
    assert.equal(response.data[0].messageTimetoken, published.timetoken);
    await friend().removeMessageAction({
      channel,
      messageTimetoken: published.timetoken,
      actionTimetoken: added.data.actionTimetoken,
    });
  });
});
