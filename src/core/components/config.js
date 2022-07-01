/*       */
/* global location */

import uuidGenerator from './uuid';

const PRESENCE_TIMEOUT_MINIMUM = 20;
const PRESENCE_TIMEOUT_DEFAULT = 300;

const makeDefaultOrigins = () => Array.from({ length: 20 }, (_, i) => `ps${i + 1}.pndsn.com`);

export default class {
  subscribeKey;
  publishKey;
  secretKey;
  cipherKey;
  authKey;
  UUID;
  proxy;

  /*
    if _useInstanceId is true, this instanceId will be added to all requests
  */
  instanceId;

  /*
    If the SDK is running as part of another SDK built atop of it, allow a custom pnsdk with name and version.
   */
  sdkName;

  /*
    keep track of the SDK family for identifier generator
  */
  sdkFamily;

  /*
    If the SDK is operated by a partner, allow a custom pnsdk item for them.
  */
  partnerId;

  /*
    filter expression to pass along when subscribing.
  */
  filterExpression;

  /*
    configuration to supress leave events; when a presence leave is performed
    this configuration will disallow the leave event from happening
  */
  suppressLeaveEvents;

  /*
    use SSL for http requests?
  */
  secure;

  // Custom optional origin.
  origin;

  // log verbosity: true to output lots of info
  logVerbosity;

  // if instanceId config is true, the SDK will pass the unique instance identifier to the server as instanceId=<UUID>
  useInstanceId;

  // if requestId config is true, the SDK will pass a unique request identifier with each request as request_id=<UUID>
  useRequestId;

  // use connection keep-alive for http requests
  keepAlive;

  keepAliveSettings;

  // if autoNetworkDetection config is true, the SDK will emit NetworkUp and NetworkDown
  // when there changes in the networking
  autoNetworkDetection;

  // alert when a heartbeat works out.
  announceSuccessfulHeartbeats;

  announceFailedHeartbeats;

  /*
    how long the server will wait before declaring that the client is gone.
  */
  _presenceTimeout;

  /*
    how often (in seconds) the client should announce its presence to server
  */
  _heartbeatInterval;

  /*
    how long to wait for the server when running the subscribe loop
  */
  _subscribeRequestTimeout;

  /*
    how long to wait for the server when making transactional requests
  */
  _transactionalRequestTimeout;

  /*
    use send beacon API when unsubscribing.
    https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
  */
  _useSendBeacon;

  /*
    allow frameworks to append to the PNSDK parameter
    the key should be an identifier for the specific framework to prevent duplicates
  */
  _PNSDKSuffix;

  /*
    if set, the SDK will alert if more messages arrive in one subscribe than the theshold
  */
  requestMessageCountThreshold;

  /*
    Restore subscription list on disconnection.
   */
  restore;

  /*
    support for client deduping
  */
  dedupeOnSubscribe;

  maximumCacheSize;

  /*
    support customp encryption and decryption functions.
  */
  customEncrypt; // function to support custome encryption of messages

  customDecrypt; // function used to decrypt old version messages

  // File Upload

  // How many times the publish-file should be retried before giving up
  fileUploadPublishRetryLimit;
  useRandomIVs;
  enableSubscribeBeta;

  constructor({ setup }) {
    this._PNSDKSuffix = {};

    this.instanceId = `pn-${uuidGenerator.createUUID()}`;
    this.secretKey = setup.secretKey || setup.secret_key;
    this.subscribeKey = setup.subscribeKey || setup.subscribe_key;
    this.publishKey = setup.publishKey || setup.publish_key;
    this.sdkName = setup.sdkName;
    this.sdkFamily = setup.sdkFamily;
    this.partnerId = setup.partnerId;
    this.setAuthKey(setup.authKey);
    this.setCipherKey(setup.cipherKey);

    this.setFilterExpression(setup.filterExpression);

    if (typeof setup.origin !== 'string' && !Array.isArray(setup.origin) && setup.origin !== undefined) {
      throw new Error('Origin must be either undefined, a string or a list of strings.');
    }

    this.origin = setup.origin || makeDefaultOrigins();
    this.secure = setup.ssl || false;
    this.restore = setup.restore || false;
    this.proxy = setup.proxy;
    this.keepAlive = setup.keepAlive;
    this.keepAliveSettings = setup.keepAliveSettings;
    this.autoNetworkDetection = setup.autoNetworkDetection || false;

    this.dedupeOnSubscribe = setup.dedupeOnSubscribe || false;
    this.maximumCacheSize = setup.maximumCacheSize || 100;

    this.customEncrypt = setup.customEncrypt;
    this.customDecrypt = setup.customDecrypt;

    this.fileUploadPublishRetryLimit = setup.fileUploadPublishRetryLimit ?? 5;
    this.useRandomIVs = setup.useRandomIVs ?? true;

    // flag for beta subscribe feature enablement
    this.enableSubscribeBeta = setup.enableSubscribeBeta ?? false;

    // if location config exist and we are in https, force secure to true.
    if (typeof location !== 'undefined' && location.protocol === 'https:') {
      this.secure = true;
    }

    this.logVerbosity = setup.logVerbosity || false;
    this.suppressLeaveEvents = setup.suppressLeaveEvents || false;

    this.announceFailedHeartbeats = setup.announceFailedHeartbeats || true;
    this.announceSuccessfulHeartbeats = setup.announceSuccessfulHeartbeats || false;

    this.useInstanceId = setup.useInstanceId || false;
    this.useRequestId = setup.useRequestId || false;

    this.requestMessageCountThreshold = setup.requestMessageCountThreshold;

    // set timeout to how long a transaction request will wait for the server (default 15 seconds)
    this.setTransactionTimeout(setup.transactionalRequestTimeout || 15 * 1000);
    // set timeout to how long a subscribe event loop will run (default 310 seconds)
    this.setSubscribeTimeout(setup.subscribeRequestTimeout || 310 * 1000);
    // set config on beacon (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) usage
    this.setSendBeaconConfig(setup.useSendBeacon || true);
    // how long the SDK will report the client to be alive before issuing a timeout
    if (setup.presenceTimeout) {
      this.setPresenceTimeout(setup.presenceTimeout);
    } else {
      this._presenceTimeout = PRESENCE_TIMEOUT_DEFAULT;
    }

    if (setup.heartbeatInterval != null) {
      this.setHeartbeatInterval(setup.heartbeatInterval);
    }

    if (typeof setup.userId === 'string') {
      if (typeof setup.uuid === 'string') {
        throw new Error('Only one of the following configuration options has to be provided: `uuid` or `userId`');
      }

      this.setUserId(setup.userId);
    } else {
      if (typeof setup.uuid !== 'string') {
        throw new Error('One of the following configuration options has to be provided: `uuid` or `userId`');
      }

      this.setUUID(setup.uuid);
    }
  }

  // exposed setters
  getAuthKey() {
    return this.authKey;
  }

  setAuthKey(val) {
    this.authKey = val;
    return this;
  }

  setCipherKey(val) {
    this.cipherKey = val;
    return this;
  }

  getUUID() {
    return this.UUID;
  }

  setUUID(val) {
    if (!val || typeof val !== 'string' || val.trim().length === 0) {
      throw new Error('Missing uuid parameter. Provide a valid string uuid');
    }
    this.UUID = val;
    return this;
  }

  getUserId() {
    return this.UUID;
  }

  setUserId(value) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
    }

    this.UUID = value;
    return this;
  }

  getFilterExpression() {
    return this.filterExpression;
  }

  setFilterExpression(val) {
    this.filterExpression = val;
    return this;
  }

  getPresenceTimeout() {
    return this._presenceTimeout;
  }

  setPresenceTimeout(val) {
    if (val >= PRESENCE_TIMEOUT_MINIMUM) {
      this._presenceTimeout = val;
    } else {
      this._presenceTimeout = PRESENCE_TIMEOUT_MINIMUM;

      // eslint-disable-next-line no-console
      console.log('WARNING: Presence timeout is less than the minimum. Using minimum value: ', this._presenceTimeout);
    }

    this.setHeartbeatInterval(this._presenceTimeout / 2 - 1);

    return this;
  }

  setProxy(proxy) {
    this.proxy = proxy;
  }

  getHeartbeatInterval() {
    return this._heartbeatInterval;
  }

  setHeartbeatInterval(val) {
    this._heartbeatInterval = val;
    return this;
  }

  // deprecated setters.
  getSubscribeTimeout() {
    return this._subscribeRequestTimeout;
  }

  setSubscribeTimeout(val) {
    this._subscribeRequestTimeout = val;
    return this;
  }

  getTransactionTimeout() {
    return this._transactionalRequestTimeout;
  }

  setTransactionTimeout(val) {
    this._transactionalRequestTimeout = val;
    return this;
  }

  isSendBeaconEnabled() {
    return this._useSendBeacon;
  }

  setSendBeaconConfig(val) {
    this._useSendBeacon = val;
    return this;
  }

  getVersion() {
    return '7.2.0';
  }

  _addPnsdkSuffix(name, suffix) {
    this._PNSDKSuffix[name] = suffix;
  }

  _getPnsdkSuffix(separator) {
    return Object.keys(this._PNSDKSuffix).reduce((result, key) => result + separator + this._PNSDKSuffix[key], '');
  }
}
