import PubNub from 'pubnub';

/**
 * SharedWorker example.
 */
// snippet.configurationBasicUsageSubscriptionWorkerUrl
const pubnub = new PubNub({
  subscribeKey: 'demo',
  publishKey: 'demo',
  userId: 'unique-user-id',
  // using PubNub JS SDK 14.0.0, make sure the versions match.
  // NOTE: 'subscriptionWorkerUrl' is only needed if you need to use SharedWorker.
  // snippet.hide
  // @ts-expect-error
  // snippet.show
  subscriptionWorkerUrl: 'https://www.my-domain.com/static/js/pubnub.worker.14.0.0.js',
});
// snippet.end

export { pubnub };
