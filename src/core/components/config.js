/* @flow */
/* global location */

import uuidGenerator from './uuid';
import { InternalSetupStruct, DatabaseInterface, KeepAliveStruct, ProxyStruct } from '../flow_interfaces';

const PRESENCE_TIMEOUT_MINIMUM: number = 20;
const PRESENCE_TIMEOUT_DEFAULT: number = 300;

const makeDefaultOrigins = () => Array.from({ length: 20 }, (_, i) => `ps${i + 1}.pndsn.com`);

type ConfigConstructArgs = {
  setup: InternalSetupStruct,
  db: DatabaseInterface,
};

export default class {
  _db: DatabaseInterface;

  subscribeKey: string;
  publishKey: string;
  secretKey: string;
  cipherKey: string;
  authKey: string;
  UUID: string;

  proxy: ProxyStruct;

  /*
    if _useInstanceId is true, this instanceId will be added to all requests
  */
  instanceId: string;

  /*
    If the SDK is running as part of another SDK built atop of it, allow a custom pnsdk with name and version.
   */
  sdkName: string;

  /*
    keep track of the SDK family for identifier generator
  */
  sdkFamily: string;

  /*
    If the SDK is operated by a partner, allow a custom pnsdk item for them.
  */
  partnerId: string;

  /*
    filter expression to pass along when subscribing.
  */
  filterExpression: string;
  /*
    configuration to supress leave events; when a presence leave is performed
    this configuration will disallow the leave event from happening
  */
  suppressLeaveEvents: boolean;

  /*
    use SSL for http requests?
  */
  secure: boolean;

  // Custom optional origin.
  origin: string | string[];

  // log verbosity: true to output lots of info
  logVerbosity: boolean;

  // if instanceId config is true, the SDK will pass the unique instance identifier to the server as instanceId=<UUID>
  useInstanceId: boolean;

  // if requestId config is true, the SDK will pass a unique request identifier with each request as request_id=<UUID>
  useRequestId: boolean;

  // use connection keep-alive for http requests
  keepAlive: ?boolean;

  keepAliveSettings: ?KeepAliveStruct;

  // if autoNetworkDetection config is true, the SDK will emit NetworkUp and NetworkDown when there changes in the networking
  autoNetworkDetection: ?boolean;

  // alert when a heartbeat works out.
  announceSuccessfulHeartbeats: boolean;
  announceFailedHeartbeats: boolean;

  /*
    how long the server will wait before declaring that the client is gone.
  */
  _presenceTimeout: number;

  /*
    how often (in seconds) the client should announce its presence to server
  */
  _heartbeatInterval: number;

  /*
    how long to wait for the server when running the subscribe loop
  */
  _subscribeRequestTimeout: number;
  /*
    how long to wait for the server when making transactional requests
  */
  _transactionalRequestTimeout: number;
  /*
    use send beacon API when unsubscribing.
    https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
  */
  _useSendBeacon: boolean;

  /*
    allow frameworks to append to the PNSDK parameter
    the key should be an identifier for the specific framework to prevent duplicates
  */
  _PNSDKSuffix: { [key: string]: string };

  /*
    if set, the SDK will alert if more messages arrive in one subscribe than the theshold
  */
  requestMessageCountThreshold: number;

  /*
    Restore subscription list on disconnection.
   */
  restore: boolean;

  /*
    support for client deduping
  */
  dedupeOnSubscribe: boolean;

  maximumCacheSize: number;

  /*
    support customp encryption and decryption functions.
  */
  customEncrypt: Function; // function to support custome encryption of messages

  customDecrypt: Function; // function used to decrypt old version messages

  // File Upload

  // How many times the publish-file should be retried before giving up
  fileUploadPublishRetryLimit: number;
  useRandomIVs: boolean;

  constructor({ setup, db }: ConfigConstructArgs) {
    this._PNSDKSuffix = {};
    this._db = db;

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

    this.setUUID(this._decideUUID(setup.uuid)); // UUID decision depends on subKey.
  }

  // exposed setters
  getAuthKey(): string {
    return this.authKey;
  }

  setAuthKey(val: string): this {
    this.authKey = val;
    return this;
  }

  setCipherKey(val: string): this {
    this.cipherKey = val;
    return this;
  }

  getUUID(): string {
    return this.UUID;
  }

  setUUID(val: string): this {
    if (this._db && this._db.set) this._db.set(`${this.subscribeKey}uuid`, val);
    this.UUID = val;
    return this;
  }

  getFilterExpression(): string {
    return this.filterExpression;
  }

  setFilterExpression(val: string): this {
    this.filterExpression = val;
    return this;
  }

  getPresenceTimeout(): number {
    return this._presenceTimeout;
  }

  setPresenceTimeout(val: number): this {
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

  setProxy(proxy: ProxyStruct) {
    this.proxy = proxy;
  }

  getHeartbeatInterval(): number {
    return this._heartbeatInterval;
  }

  setHeartbeatInterval(val: number): this {
    this._heartbeatInterval = val;
    return this;
  }

  // deprecated setters.
  getSubscribeTimeout(): number {
    return this._subscribeRequestTimeout;
  }

  setSubscribeTimeout(val: number): this {
    this._subscribeRequestTimeout = val;
    return this;
  }

  getTransactionTimeout(): number {
    return this._transactionalRequestTimeout;
  }

  setTransactionTimeout(val: number): this {
    this._transactionalRequestTimeout = val;
    return this;
  }

  isSendBeaconEnabled(): boolean {
    return this._useSendBeacon;
  }

  setSendBeaconConfig(val: boolean): this {
    this._useSendBeacon = val;
    return this;
  }

  getVersion(): string {
    return '4.37.0';
  }

  _addPnsdkSuffix(name: string, suffix: string) {
    this._PNSDKSuffix[name] = suffix;
  }

  _getPnsdkSuffix(separator: string): string {
    return Object.keys(this._PNSDKSuffix).reduce((result, key) => result + separator + this._PNSDKSuffix[key], '');
  }

  _decideUUID(providedUUID: string): string {
    // if the uuid was provided by setup, use this UUID.
    if (providedUUID) {
      return providedUUID;
    }

    // if the database module is enabled and we have something saved, use this.
    if (this._db && this._db.get && this._db.get(`${this.subscribeKey}uuid`)) {
      return this._db.get(`${this.subscribeKey}uuid`);
    }

    // randomize the UUID and push to storage
    return `pn-${uuidGenerator.createUUID()}`;
  }
}
