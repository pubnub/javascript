/* @flow */

import Networking from './networking';

type queueConstruct = {
  networking: Networking,
  parallelPublish: boolean, // disable one-at-a-time publishing queue and publish on call.
};

class PublishItem {
  params: Object;
  callback: Function;
  httpMethod: string;
  channel: string;
  payload: string;
}

export default class {

  _networking: Networking;
  _publishQueue: Array<PublishItem>;
  _isSending: boolean;
  _parallelPublish: boolean;

  constructor({ networking, parallelPublish = false }: queueConstruct) {
    this._publishQueue = [];
    this._networking = networking;
    this._parallelPublish = parallelPublish;
    this._isSending = false;
  }

  newQueueable(): PublishItem {
    return new PublishItem();
  }

  queueItem(publishItem: PublishItem) {
    this._publishQueue.push(publishItem);
    this._sendNext();
  }

  _sendNext() {
    // if we have nothing to send, return right away.
    if (this._publishQueue.length === 0) {
      return;
    }

    // if parallel publish is enabled, always send.
    if (this._parallelPublish) {
      return this.__publishNext();
    }

    // if something is sending, wait for it to finish up.
    if (this._isSending) {
      return;
    }

    this._isSending = true;
    this.__publishNext();
  }

  __publishNext() {
    let { channel, payload, params, httpMethod, callback } = this._publishQueue.shift();

    let onPublish = (err: Object, response: Object) => {
      this._isSending = false;
      this._sendNext();
      callback(err, response);
    };

    this._networking.performPublish(channel, payload, params, httpMethod, onPublish);
  }

}
