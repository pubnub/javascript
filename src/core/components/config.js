/* @flow */

import uuidGenerator from 'uuid';
import { internalSetupStruct } from '../flow_interfaces';

export default class {

  /*
    if instanceId config is true, the SDK will pass the unique instance
    identifier to the server as instanceId=<UUID>
  */
  _useInstanceId: boolean;

  /*
    if requestId config is true, the SDK will pass a unique request identifier
    with each request as request_id=<UUID>
  */
  _useRequestId: boolean;

  /*
    configuration to supress leave events; when a presence leave is performed
    this configuration will disallow the leave event from happening
  */
  _suppressLeaveEvents: boolean;

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
    subsriber key provided by Portal to perform API calls
  */
  _subscribeKey: string;

  /*
    publish key provided by Portal to perform publish API calls
  */
  _publishKey: string;

  /*
    secret key provided by Portal to perform Auth (PAM) API calls. Only
    use on server (node) and do not expose it to customers.
  */
  _secretKey: string;

  /*
    auth key which will be passed on PAM secured endpoints
  */
  _authKey: string;

  /*
    if _useInstanceId is true, this instanceId will be added to all requests
  */
  _instanceId: string;

  /*
    if passed, all payloads will be encrypted using the cipher key and history
    fetches will be decrypted using this key.
  */
  _cipherKey: string;

  /*
    Unique identifier of this client, will be sent with all request to identify
    a unique device for presence and billing
  */
  _UUID: string;

  /*
    optionally avoid sending leave events for presence events.
  */
  _supressLeaveEvents: boolean;

  /*
    use SSL for http requests?
  */
  _sslEnabled: boolean;

  /*
    Custom optional origin.
  */
  _customOrigin: string;

  /*
    how long the server will wait before declaring that the client is gone.
  */
  _presenceTimeout: number;

  /*
    how often (in seconds) the client should announce its presence to server
  */
  _presenceAnnounceInterval: number;

  constructor(setup: internalSetupStruct) {
    this.setInstanceId(uuidGenerator.v4());
    this.setAuthKey(setup.authKey || '');
    this.setSecretKey(setup.secretKey || '');
    this.setSubscribeKey(setup.subscribeKey);
    this.setPublishKey(setup.publishKey);
    this.setCipherKey(setup.cipherKey);
    this.setRequestIdConfig(setup.useRequestId || false);
    this.setSupressLeaveEvents(setup.suppressLeaveEvents || false);
    this.setInstanceIdConfig(setup.useInstanceId || false);
    this.setSslConfig(setup.ssl || false);
    this.setOrigin(setup.origin || 'pubsub.pubnub.com');
    // set timeout to how long a transaction request will wait for the server (default 15 seconds)
    this.setTransactionTimeout(setup.transactionalRequestTimeout || 15 * 1000);
    // set timeout to how long a subscribe event loop will run (default 310 seconds)
    this.setSubscribeTimeout(setup.subscribeRequestTimeout || 310 * 1000);
    // set config on beacon (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) usage
    this.setSendBeaconConfig(setup.useSendBeacon || true);
    // how long the SDK will report the client to be alive before issuing a timeout
    this.setPresenceTimeout(setup.presenceTimeout || 300);
  }

  getSubscribeKey(): string { return this._subscribeKey; }
  setSubscribeKey(val: string): this { this._subscribeKey = val; return this; }

  getAuthKey(): string { return this._authKey; }
  setAuthKey(val: string): this { this._authKey = val; return this; }

  getPublishKey(): string { return this._publishKey; }
  setPublishKey(val: string): this { this._publishKey = val; return this; }

  getSecretKey(): string { return this._secretKey; }
  setSecretKey(val: string): this { this._secretKey = val; return this; }

  getCipherKey(): string { return this._cipherKey; }
  setCipherKey(val: string): this { this._cipherKey = val; return this; }

  getUUID(): string { return this._UUID; }
  setUUID(val: string): this { this._UUID = val; return this; }

  getInstanceId(): string { return this._instanceId; }
  setInstanceId(val: string): this { this._instanceId = val; return this; }

  isInstanceIdEnabled(): boolean { return this._useInstanceId; }
  setInstanceIdConfig(val: boolean): this { this._useInstanceId = val; return this; }

  isRequestIdEnabled(): boolean { return this._useRequestId; }
  setRequestIdConfig(val: boolean): this { this._useRequestId = val; return this; }

  getSubscribeTimeout(): number { return this._subscribeRequestTimeout; }
  setSubscribeTimeout(val: number): this { this._subscribeRequestTimeout = val; return this; }

  getTransactionTimeout(): number { return this._transactionalRequestTimeout; }
  setTransactionTimeout(val: number): this { this._transactionalRequestTimeout = val; return this; }

  isSuppressingLeaveEvents(): boolean { return this._suppressLeaveEvents; }
  setSupressLeaveEvents(val: boolean): this { this._suppressLeaveEvents = val; return this; }

  isSslEnabled(): boolean { return this._sslEnabled; }
  setSslConfig(val: boolean): this { this._sslEnabled = val; return this; }

  getOrigin(): string { return this._customOrigin; }
  setOrigin(val: string): this { this._customOrigin = val; return this; }

  isSendBeaconEnabled(): boolean { return this._useSendBeacon; }
  setSendBeaconConfig(val: boolean): this { this._useSendBeacon = val; return this; }

  getPresenceTimeout(): number { return this._presenceTimeout; }
  setPresenceTimeout(val: number): this {
    this._presenceTimeout = val;
    this._presenceAnnounceInterval = (this._presenceTimeout / 2) - 1;
    return this;
  }

  getPresenceAnnounceInterval(): number { return this._presenceAnnounceInterval; }
  setPresenceAnnounceInterval(val: number): this { this._presenceAnnounceInterval = val; return this; }

}
