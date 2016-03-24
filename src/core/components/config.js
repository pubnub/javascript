/* @flow */

export default class {

  /*
    if instanceId config is true, the SDK will pass the unique instance
    identifier to the server as instanceId=<UUID>
  */
  _instanceId: boolean;


  /*
    if requestId config is true, the SDK will pass a unique request identifier
    with each request as request_id=<UUID>
  */
  _requestId: boolean;


  /*
    configuration to supress leave events; when a presence leave is performed
    this configuration will disallow the leave event from happening
  */
  _suppressLeaveEvents: boolean;

  /*
    how long to wait for the server when running the subscribe loop
  */
  subscribeRequestTimeout: number;

  /*
    how long to wait for the server when making transactional requests
  */
  transactionalRequestTimeout: number;

  /*
    use send beacon API when unsubscribing.
    https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
  */
  useSendBeacon: boolean;

  constructor() {
    this._instanceId = false;
    this._requestId = false;
  }

  setInstanceIdConfig(configValue: boolean): this {
    this._instanceId = configValue;
    return this;
  }

  setRequestIdConfig(configValue: boolean): this {
    this._requestId = configValue;
    return this;
  }

  setSupressLeaveEvents(configValue: boolean): this {
    this._suppressLeaveEvents = configValue;
    return this;
  }

  isInstanceIdEnabled(): boolean {
    return this._instanceId;
  }

  isRequestIdEnabled(): boolean {
    return this._requestId;
  }

  isSuppressingLeaveEvents(): boolean {
    return this._suppressLeaveEvents;
  }

}
