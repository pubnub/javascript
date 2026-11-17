/* eslint-disable prettier/prettier, max-len -- sample text must stay character for character, so its long lines cannot be re-wrapped */
import assert from 'node:assert/strict';
import { assertTimetoken } from '../support/assertions';
import { createClient, observer } from '../support/clients';
import { captureConsole } from '../support/console';
import { connected, eventually, watch } from '../support/wait';

/**
 * Real-time ads and reaction upgrades.
 * The ad decisions and reaction upgrades come from Illuminate Business Rules on the real service. The keyset used by the tier
 * has no such rule, so the test publishes the decisions itself, with the payload shape the page describes, and verifies the
 * client side: what the fan publishes and how the client reacts to a decision.
 */
describe('use-cases/real-time-ads', () => {
  it('realTimeAdsPublishReaction, realTimeAdsReceiveAdDecision, realTimeAdsReceiveReactionUpgrade: a fan publishes a reaction, then shows an ad, clears the slot and renders an upgraded reaction on decisions', async function () {
    this.timeout(60_000);
    const pubnub = createClient('open', 'fan-42');
    const logs = captureConsole('log');
    const errors = captureConsole('error');
    try {
      const reactions = await watch(observer(), ['game.stream-reactions']);

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

      const line = logs.lines.find((l) => l.startsWith('reaction published at timetoken: '));
      assert.ok(line, 'the sample reported the publish');
      const timetoken = line.slice('reaction published at timetoken: '.length);
      assertTimetoken(timetoken);
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      const received = await reactions.next('message', (m) => m.timetoken === timetoken);
      assert.deepEqual(received.message, { reaction: '\u{1F525}' });
      assert.equal(received.publisher, 'fan-42');
      assert.equal(received.customMessageType, 'reaction');
      reactions.stop();

      const adReady = connected(pubnub, { channels: ['game.ad-decisions'] });
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

      await adReady;
      // Stand-in for the Illuminate action: another client publishes the decisions.
      const decider = createClient('open', 'illuminate-stand-in');
      const adId = `ad-${Date.now()}`;
      await decider.publish({ channel: 'game.ad-decisions', message: { adId, clickPoints: 25 } });
      await eventually(() => assert.ok(logs.lines.includes(`show ad ${adId}, worth 25 points`)), {
        label: 'ad shown',
      });
      assert.ok(!logs.lines.includes('no ad to show, so clear the ad slot'), 'no clear before the empty decision');
      await decider.publish({ channel: 'game.ad-decisions', message: {} });
      await eventually(() => assert.ok(logs.lines.includes('no ad to show, so clear the ad slot')), {
        label: 'ad slot cleared',
      });

      const upgradeReady = connected(pubnub, { channels: ['game.reaction-upgrades'] });
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

      await upgradeReady;
      await decider.publish({
        channel: 'game.reaction-upgrades',
        message: { reaction: '\u{1F525}', replacement: '\u{1F680}' },
      });
      await eventually(
        () => assert.ok(logs.lines.includes('render \u{1F525} as \u{1F680} from now on'), 'upgrade rendered'),
        { label: 'reaction upgrade printed' },
      );
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
    } finally {
      logs.restore();
      errors.restore();
    }
  });
});
