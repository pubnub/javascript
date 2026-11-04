import PubNub from 'pubnub';

/**
 * docs/sdks/javascript/set-up-your-environment.md, the SharedWorker sample.
 *
 * Type checked here by tsconfig.browser.json. A separate test project runs it live in headless Chromium. That test takes the lines between the markers (what the
 * page shows), fills the keys, the user id and the worker URL (a same-origin copy of the SDK's pubnub.worker.js, which a
 * SharedWorker requires), strips the TypeScript and runs them in a page. Then it proves that subscribe goes through the
 * shared worker. The hidden `@ts-expect-error` records an SDK typing bug: the shipped types lack `subscriptionWorkerUrl`.
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
