/* @flow */

import Networking from './networking';

type queueConstruct = {
  networking: Networking,
};

class PublishItem {
  params: Object;
  onFail: Function;
  onSuccess: Function;
  httpMethod: string;
  channel: string;
  payload: string;
}

export default class {

  _networking: Networking;
  _publishQueue: Array<PublishItem>;
  _isSending: boolean;

  constructor({ networking }: queueConstruct) {
    this._publishQueue = [];
    this._networking = networking;
  }

  createQueueable(): PublishItem {
    return new PublishItem();
  }

  queuePublishItem(publishItem: PublishItem) {
    this._publishQueue.push(publishItem);
  }

  sendOneMessage() {
    let publish = this._publishQueue.shift();

    this._networking.performPublish(publish.channel, publish.payload, {
      mode: publish.httpMethod,
      success: publish.onSuccess,
      fail: publish.onFail,
      data: this._networking.prepareParams(publish.params),
    });
  }

  //

  getQueueLength(): number {
    return this._publishQueue.length;
  }

  setIsSending(sendingValue: boolean): this {
    this._isSending = sendingValue;
    return this;
  }

  isSending(): boolean {
    return this._isSending;
  }

}
