/* @flow */

import PublishQueue from '../components/publish_queue';
import Responders from '../presenters/responders';
import Logger from '../components/logger';

type publishConstruct = {
  publishQueue: PublishQueue
};

type publishArguments = {
  message: Object | string | number | boolean, // the contents of the dispatch
  channel: string, // the destination of our dispatch
  sendByPost: boolean | null, // use POST when dispatching the message
  storeInHistory: boolean | null, // store the published message in remote history
  meta: Object // psv2 supports filtering by metadata
}

export default class {
  _publishQueue: PublishQueue;
  _r: Responders;
  _l: Logger;

  constructor({ publishQueue }: publishConstruct) {
    this._publishQueue = publishQueue;
    this._r = new Responders('#endpoints/publish');
    this._l = Logger.getLogger('#endpoints/publish');
  }

  publish(args: publishArguments, callback: Function) {
    const { message, channel, meta, sendByPost = false, storeInHistory = true } = args;

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

    if (meta && typeof meta === 'object') {
      params.meta = JSON.stringify(meta);
    }

    publishItem.payload = message;
    publishItem.channel = channel;
    publishItem.params = params;
    publishItem.httpMethod = (sendByPost) ? 'POST' : 'GET';
    publishItem.callback = callback;

    // Queue Message Send
    this._publishQueue.queueItem(publishItem);
  }

}
