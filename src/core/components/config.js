/* @flow */
/* global location */

import uuidGenerator from './uuid';
import { InternalSetupStruct, DatabaseInterface, KeepAliveStruct, ProxyStruct } from '../flow_interfaces';

type ConfigConstructArgs = {
  setup: InternalSetupStruct,
  db: DatabaseInterface
}

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
  origin: string;

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
  dedupeOnSubscribe: boolean
  maximumCacheSize: number

  /*
    support customp encryption and decryption functions.
  */
  customEncrypt: Function // function to support custome encryption of messages
  customDecrypt: Function // function used to decrypt old version messages

  constructor({ setup, db } : ConfigConstructArgs) {
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

    this.origin = setup.origin || 'pubsub.pndsn.com';
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
    this.setPresenceTimeout(setup.presenceTimeout || 300);

    if (setup.heartbeatInterval != null) {
      this.setHeartbeatInterval(setup.heartbeatInterval);
    }

    this.setUUID(this._decideUUID(setup.uuid)); // UUID decision depends on subKey.
  }

  // exposed setters
  getAuthKey(): string { return this.authKey; }
  setAuthKey(val: string): this { this.authKey = val; return this; }
  setCipherKey(val: string): this { this.cipherKey = val; return this; }
  getUUID(): string { return this.UUID; }
  setUUID(val: string): this {
    if (this._db && this._db.set) this._db.set(`${this.subscribeKey}uuid`, val);
    this.UUID = val;
    return this;
  }

  getFilterExpression(): string { return this.filterExpression; }
  setFilterExpression(val: string): this { this.filterExpression = val; return this; }

  getPresenceTimeout(): number { return this._presenceTimeout; }
  setPresenceTimeout(val: number): this {
    this._presenceTimeout = val;
    this.setHeartbeatInterval((this._presenceTimeout / 2) - 1);
    return this;
  }

  setProxy(proxy: ProxyStruct) {
    this.proxy = proxy;
  }

  getHeartbeatInterval(): number { return this._heartbeatInterval; }
  setHeartbeatInterval(val: number): this { this._heartbeatInterval = val; return this; }

  // deprecated setters.
  getSubscribeTimeout(): number { return this._subscribeRequestTimeout; }
  setSubscribeTimeout(val: number): this { this._subscribeRequestTimeout = val; return this; }

  getTransactionTimeout(): number { return this._transactionalRequestTimeout; }
  setTransactionTimeout(val: number): this { this._transactionalRequestTimeout = val; return this; }

  isSendBeaconEnabled(): boolean { return this._useSendBeacon; }
  setSendBeaconConfig(val: boolean): this { this._useSendBeacon = val; return this; }

  getVersion(): string {
    return '4.21.6';
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
