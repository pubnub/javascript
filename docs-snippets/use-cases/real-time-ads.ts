import PubNub from '../../lib/types';

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
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Publishing the reaction failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.realTimeAdsReceiveAdDecision
const adSubscription = pubnub.channel('game.ad-decisions').subscription({ receivePresenceEvents: false });

adSubscription.onMessage = (event) => {
  const decision = event.message;
  const adId =
    typeof decision === 'object' && decision !== null && !Array.isArray(decision) && 'adId' in decision
      ? decision.adId
      : undefined;
  const clickPoints =
    typeof decision === 'object' && decision !== null && !Array.isArray(decision) && 'clickPoints' in decision
      ? decision.clickPoints
      : undefined;

  if (adId) {
    console.log(`show ad ${adId}, worth ${clickPoints} points`);
  } else {
    console.log('no ad to show, so clear the ad slot');
  }
};

adSubscription.subscribe();
// snippet.end

// snippet.realTimeAdsReceiveReactionUpgrade
const upgradeSubscription = pubnub.channel('game.reaction-upgrades').subscription({ receivePresenceEvents: false });

upgradeSubscription.onMessage = (event) => {
  const upgrade = event.message;
  const reaction =
    typeof upgrade === 'object' && upgrade !== null && !Array.isArray(upgrade) && 'reaction' in upgrade
      ? upgrade.reaction
      : undefined;
  const replacement =
    typeof upgrade === 'object' && upgrade !== null && !Array.isArray(upgrade) && 'replacement' in upgrade
      ? upgrade.replacement
      : undefined;

  console.log(`render ${reaction} as ${replacement} from now on`);
};

upgradeSubscription.subscribe();
// snippet.end
