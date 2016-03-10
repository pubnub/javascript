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
    how long the server will wait before declaring that the client is gone.
  */
  _presenceTimeout: number;

  /*
    how often (in seconds) the client should announce its presence to server
  */
  _heartbeatInterval: number;

  /*
    configuration to supress leave events; when a presence leave is performed
    this configuration will disallow the leave event from happening
  */
  _suppressLeaveEvents: boolean;

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

  setHeartbeatInterval(configValue: number): this {
    this._heartbeatInterval = configValue;
    return this;
  }

  setPresenceTimeout(configValue: number): this {
    this._presenceTimeout = configValue;
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

  getHeartbeatInterval(): number {
    return this._heartbeatInterval;
  }

  getPresenceTimeout(): number {
    return this._presenceTimeout;
  }

}
