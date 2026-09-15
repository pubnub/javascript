import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'poll-service',
});

// snippet.automatedPollingReceiveTrigger
type PollTrigger = { reaction: string };

const triggerSubscription = pubnub.channel('game.poll-triggers').subscription({ receivePresenceEvents: false });

triggerSubscription.onMessage = (event) => {
  const trigger = event.message as PollTrigger;

  console.log('open a poll because fans keep tapping', trigger.reaction);
};

triggerSubscription.subscribe();
// snippet.end

// snippet.automatedPollingPublishTriggeredPoll
const pollsByReaction: Record<string, { title: string; options: { id: number; text: string }[] }> = {
  '\u{1F621}': {
    title: 'Which team is playing dirtiest?',
    options: [
      { id: 1, text: 'Home team' },
      { id: 2, text: 'Away team' },
    ],
  },
  '\u{1F389}': {
    title: 'Whose fans are celebrating hardest?',
    options: [
      { id: 1, text: 'Home team' },
      { id: 2, text: 'Away team' },
    ],
  },
};

async function openPollForReaction(reaction: string) {
  const template = pollsByReaction[reaction];

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
    console.error(
      `Publishing the triggered poll failed: ${error}.${
        (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
      }`,
    );
  }
}

await openPollForReaction('\u{1F621}');
// snippet.end

// snippet.automatedPollingThrottleTriggers
const minimumMillisecondsBetweenPolls = 60000;
let lastPollOpenedAt = 0;

function shouldOpenPoll() {
  const now = Date.now();

  if (now - lastPollOpenedAt < minimumMillisecondsBetweenPolls) {
    return false;
  }

  lastPollOpenedAt = now;
  return true;
}

console.log('open a poll now?', shouldOpenPoll());
// snippet.end
