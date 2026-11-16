import assert from '../harness/assert.js';
import { page, step } from '../harness/step.js';
import { eventually, watch } from '../harness/wait.js';
import { addToTimetoken } from '../harness/assertions.js';

/**
 * Message action examples.
 */
export default page('api-reference/message-actions', 'P4', (world) => {
  step('addMessageActionBasicUsage', { needs: ['preflightPersistence'], proves: 'addMessageAction returns the action and a subscriber receives an added event.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('channel_name');
    const listening = await watch(world.fresh('observer'), [channel]);
    const published = await world.friend.publish({ channel, message: { text: 'react to me' } });
    world.setPh('messageTimetoken', published.timetoken);

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
    world.setPh('actionTimetoken', response.data.actionTimetoken);
    assert.equal(response.data.type, 'reaction');
    assert.equal(response.data.value, 'smiley_face');
    assert.equal(response.data.messageTimetoken, published.timetoken);
    const event = await listening.next('messageAction', (e) => e.data.actionTimetoken === response.data.actionTimetoken);
    assert.equal(event.event, 'added');
    assert.equal(event.data.uuid, pubnub.getUserId());
    listening.stop();
  });

  step('removeMessageActionBasicUsage', { needs: ['addMessageActionBasicUsage', 'preflightPersistence'], proves: 'removeMessageAction emits a removed event and the action disappears from the stored list.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('channel_name');
    const listening = await watch(world.fresh('observer'), [channel]);
    const actionTimetoken = world.ph('actionTimetoken');

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
    await eventually(async () => {
      const left = await world.observer.getMessageActions({ channel });
      assert.ok(!left.data.some((a) => a.actionTimetoken === actionTimetoken), 'action is gone');
    }, { label: 'removed action is no longer listed' });
    listening.stop();
  });

  step('getMessageActionsBasicUsage', { needs: ['preflightPersistence'], proves: 'getMessageActions returns the one action added during setup with the right type, value and message timetoken.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('channel_name');
    const published = await world.friend.publish({ channel, message: { text: 'count my reactions' } });
    const added = await world.friend.addMessageAction({
      channel,
      messageTimetoken: published.timetoken,
      action: { type: 'reaction', value: 'thumbs_up' },
    });
    // Actions are listed newest first: `start` is the exclusive upper bound, `end` the inclusive lower bound.
    world.setPh('actionsStart', addToTimetoken(added.data.actionTimetoken, 1));
    world.setPh('actionsEnd', added.data.actionTimetoken);

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
  });
});
