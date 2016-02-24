/* @flow */

export default class {

  subscribeKey: string;
  publishKey: string;

  constructor(subscribeKey: string, publishKey: string) {
    this.subscribeKey = subscribeKey;
    this.publishKey = publishKey;
  }

  getSubscribeKey(): string {
    return this.subscribeKey;
  }

  getPublishKey(): string {
    return this.publishKey;
  }
}
