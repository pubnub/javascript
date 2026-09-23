import PubNub from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'poll-service',
});

// snippet.automatedPollingPublishTriggeredPoll
const pollsByReaction = new Map([
  [
    '\u{1F621}',
    {
      title: 'Which team is playing dirtiest?',
      options: [
        { id: 1, text: 'Home team' },
        { id: 2, text: 'Away team' },
      ],
    },
  ],
  [
    '\u{1F389}',
    {
      title: 'Whose fans are celebrating hardest?',
      options: [
        { id: 1, text: 'Home team' },
        { id: 2, text: 'Away team' },
      ],
    },
  ],
]);

async function openPollForReaction(reaction = '') {
  const template = pollsByReaction.get(reaction);

  if (!template) {
    console.log('no poll is defined for', reaction);
    return;
  }

  try {
    const response = await pubnub.publish({
      channel: 'game.new-poll',
      message: {
        id: `poll-${Date.now()}`,
        title: template.title,
        durationSeconds: 30,
        options: template.options,
      },
      customMessageType: 'poll-opened',
      storeInHistory: true,
    });
    console.log('triggered poll published at timetoken:', response.timetoken);
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? error.status : undefined;
    console.error(
      `Publishing the triggered poll failed: ${error}${status ? ` Additional information: ${status}` : ''}`,
    );
  }
}
// snippet.end

// snippet.automatedPollingThrottleTriggers
const minimumMillisecondsBetweenPolls = 60000;
let lastPollOpenedAt = 0;

function shouldOpenPoll() {
  const now = Date.now();

  if (now - lastPollOpenedAt < minimumMillisecondsBetweenPolls) {
    console.log('that trigger arrived inside the cooldown window, so no new poll opened');
    return false;
  }

  lastPollOpenedAt = now;
  return true;
}
// snippet.end

// snippet.automatedPollingReceiveTrigger
const triggerSubscription = pubnub.channel('game.poll-triggers').subscription({ receivePresenceEvents: false });

triggerSubscription.onMessage = (event) => {
  const trigger = event.message;
  const rawReaction =
    typeof trigger === 'object' && trigger !== null && !Array.isArray(trigger) && 'reaction' in trigger
      ? trigger.reaction
      : undefined;

  if (typeof rawReaction !== 'string') return;

  const reaction = rawReaction;

  console.log('open a poll because fans keep tapping', reaction);

  if (shouldOpenPoll()) {
    void openPollForReaction(reaction);
  }
};

triggerSubscription.subscribe();
// snippet.end
