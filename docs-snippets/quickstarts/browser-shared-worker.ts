import PubNub from 'pubnub';

/**
 * docs/sdks/javascript/set-up-your-environment.md, the SharedWorker sample.
 *
 * Type checked here by tsconfig.browser.json. It cannot be run in this repository, which has no browser. The hidden
 * `@ts-expect-error` records an SDK typing bug: the shipped types lack `subscriptionWorkerUrl`.
 */
// snippet.configurationBasicUsageSubscriptionWorkerUrl
const pubnub = new PubNub({
  subscribeKey: 'demo',
  publishKey: 'demo',
  userId: 'unique-user-id',
  // using PubNub JS SDK v9.6.0, make sure the versions match.
  // NOTE: 'subscriptionWorkerUrl' is only needed if you need to use SharedWorker.
  // snippet.hide
  // @ts-expect-error the shipped types lack subscriptionWorkerUrl (SDK bug, STATUS.md)
  // snippet.show
  subscriptionWorkerUrl: 'https://www.my-domain.com/static/js/pubnub.worker.9.6.0.js',
});
// snippet.end

export { pubnub };
