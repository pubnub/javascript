/* @flow */

export default class {

  _subscribeKey: string;
  _publishKey: string;
  _authKey: string;

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

  getSubscribeKey(): string {
    return this._subscribeKey;
  }

  getPublishKey(): string {
    return this._publishKey;
  }

  getAuthKey(): string {
    return this._authKey;
  }

}
