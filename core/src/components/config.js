/* @flow */

export default class {

  _instanceId: boolean;
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
