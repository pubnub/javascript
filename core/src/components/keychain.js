/* @flow */

export default class {

  _subscribeKey: string;
  _publishKey: string;
  _authKey: string;
  _instanceId: string;
  _secretKey: string;
  _UUID: string;

  setUUID(UUID: string): this {
    this._UUID = UUID;
    return this;
  }

  setSubscribeKey(subscribeKey: string): this {
    this._subscribeKey = subscribeKey;
    return this;
  }

  setPublishKey(publishkey: string): this {
    this._publishKey = publishkey;
    return this;
  }

  setAuthKey(authKey: string): this {
    this._authKey = authKey;
    return this;
  }

  setInstanceId(instanceId: string): this {
    this._instanceId = instanceId;
    return this;
  }

  setSecretKey(secretKey: string): this {
    this._secretKey = secretKey;
    return this;
  }

  //

  getSubscribeKey(): string {
    return this._subscribeKey;
  }

  getPublishKey(): string {
    return this._publishKey;
  }

  getAuthKey(): string {
    return this._authKey;
  }

  getInstanceId(): string {
    return this._instanceId;
  }

  getSecretKey(): string {
    return this._secretKey;
  }

  getUUID(): string {
    return this._UUID;
  }

}
