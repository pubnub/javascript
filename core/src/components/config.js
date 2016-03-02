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

  isInstanceIdEnabled(): boolean {
    return this._instanceId;
  }

  isRequestIdEnabled(): boolean {
    return this._requestId;
  }

}
