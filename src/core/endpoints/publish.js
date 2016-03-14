/* @flow */

import PublishQueue from '../components/publish_queue';
import Responders from '../presenters/responders';
import Logger from '../components/logger';

type publishConstruct = {
  encrypt: Function,
  publishQueue: PublishQueue
};

type publishArguments = {
  message: Object | string | number | boolean, // the contents of the dispatch
  channel: string, // the destination of our dispatch
  cipherKey: string, // if the message is to be encrypted, use this key.
  sendByPost: boolean | null, // use POST when dispatching the message
  storeInHistory: boolean | null // store the published message in remote history
}

export default class {
  _encrypt: Function;
  _publishQueue: PublishQueue;
  _r: Responders;
  _l: Logger;

  constructor({ encrypt, publishQueue }: publishConstruct) {
    this._encrypt = encrypt;
    this._publishQueue = publishQueue;
    this._r = new Responders('#endpoints/publish');
    this._l = Logger.getLogger('#endpoints/publish');
  }

  publish(args: publishArguments, callback: Function) {
    const { message, channel, cipherKey, sendByPost = false, storeInHistory = true } = args;

    if (!message) {
      return callback(this._r.validationError('Missing Message'));
    }

    if (!channel) {
      return callback(this._r.validationError('Missing Channel'));
    }

    let params: Object = {};
    let publishItem = this._publishQueue.newQueueable();

    if (!storeInHistory) {
      params.store = '0';
    }

    publishItem.payload = JSON.stringify(this._encrypt(message, cipherKey));
    publishItem.channel = channel;
    publishItem.params = params;
    publishItem.httpMethod = (sendByPost) ? 'POST' : 'GET';
    publishItem.callback = callback;

    // Queue Message Send
    this._publishQueue.queueItem(publishItem);
  }

}
