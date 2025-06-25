import PubNub from '../lib/types';

// snippet.configurationCryptoModule
// encrypts using 256-bit AES-CBC cipher (recommended)
// decrypts data encrypted with the legacy and the 256 bit AES-CBC ciphers
const pubnub = new PubNub({
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
  cryptoModule: PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'pubnubenigma' }),
});

// encrypts with 128-bit cipher key entropy (legacy)
// decrypts data encrypted with the legacy and the 256-bit AES-CBC ciphers
const pubnubLegacy = new PubNub({
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
  cryptoModule: PubNub.CryptoModule.legacyCryptoModule({ cipherKey: 'pubnubenigma' }),
});
// snippet.end

// snippet.configurationServerOpertaion
const pubnubServer = new PubNub({
  subscribeKey: 'mySubscribeKey',
  publishKey: 'myPublishKey',
  userId: 'myUniqueUserId',
  secretKey: 'secretKey',
  heartbeatInterval: 0,
});
// snippet.end

// snippet.configurationRealOnlyClient
// Initialize for Read Only Client

const pubnubReadOnly = new PubNub({
  subscribeKey: 'mySubscribeKey',
  userId: 'myUniqueUserId',
});
// snippet.end

// snippet.configurationSSLEnabled
const pubnubSSL = new PubNub({
  subscribeKey: 'mySubscribeKey',
  publishKey: 'myPublishKey',
  cryptoModule: PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'pubnubenigma' }),
  authKey: 'myAuthKey',
  logLevel: PubNub.LogLevel.Debug,
  userId: 'myUniqueUserId',
  ssl: true,
});
// snippet.end

// snippet.generateUUIDdeprected
const uuid = PubNub.generateUUID();
// snippet.end
