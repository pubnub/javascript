import PubNub from '../../src/web/index';

// snippet.configurationBasicUsageSubscriptionWorkerUrl
var pubnub = new PubNub({
  subscribeKey: 'demo',
  publishKey: 'demo',
  userId: 'unique-user-id',
  // using PubNub JS SDK v9.6.0, make sure the versions match.
  // NOTE: 'subscriptionWorkerUrl' is only needed if you need to use SharedWorker.
  subscriptionWorkerUrl: 'https://www.my-domain.com/static/js/pubnub.worker.9.6.0.js',
});
// snippet.end

// snippet.setAuthKeyBasicUsage
pubnub.setAuthKey('my_authkey');
// snippet.end

// snippet.setFilterExpressionBasicUsage
pubnub.setFilterExpression('such=wow');
// snippet.end

// snippet.getFilterExpressionBasicUsage
pubnub.getFilterExpression();
// snippet.end

// snippet.generateUUIDBasicUsage(deprecated)
PubNub.generateUUID();
// snippet.end

// snippet.configurationBasicUsage
// Initialize PubNub with your keys
var pubnub = new PubNub({
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  publishKey: 'YOUR_PUBLISH_KEY',
  userId: 'YOUR_USER_ID',
  cryptoModule: PubNub.CryptoModule?.aesCbcCryptoModule({ cipherKey: 'YOUR_CIPHER_KEY' }),
  authKey: 'accessMangerToken',
  logLevel: PubNub.LogLevel.Debug,
  ssl: true,
  presenceTimeout: 130,
});

// snippet.end
