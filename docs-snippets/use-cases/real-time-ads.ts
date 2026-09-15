import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'fan-42',
});

// snippet.realTimeAdsPublishReaction
try {
  const response = await pubnub.publish({
    channel: 'game.stream-reactions',
    message: { reaction: '\u{1F525}' },
    customMessageType: 'reaction',
  });
  console.log('reaction published at timetoken:', response.timetoken);
} catch (error) {
  console.error(
    `Publishing the reaction failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.realTimeAdsReceiveAdDecision
type AdDecision = { adId: number; clickPoints: number };

const adSubscription = pubnub.channel('game.ad-decisions').subscription({ receivePresenceEvents: false });

adSubscription.onMessage = (event) => {
  const decision = event.message as AdDecision;

  if (decision.adId) {
    console.log(`show ad ${decision.adId}, worth ${decision.clickPoints} points`);
  } else {
    console.log('no ad to show, so clear the ad slot');
  }
};

adSubscription.subscribe();
// snippet.end

// snippet.realTimeAdsReceiveReactionUpgrade
type ReactionUpgrade = { reaction: string; replacement: string };

const upgradeSubscription = pubnub.channel('game.reaction-upgrades').subscription({ receivePresenceEvents: false });

upgradeSubscription.onMessage = (event) => {
  const upgrade = event.message as ReactionUpgrade;

  console.log(`render ${upgrade.reaction} as ${upgrade.replacement} from now on`);
};

upgradeSubscription.subscribe();
// snippet.end
