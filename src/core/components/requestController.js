/** @flow */

import { EventEmitter } from 'events';

export default class RequestController extends EventEmitter {
  constructor() {
    super();
    this.signal = this;
  }
  abort() {
    this.emit('abort');
  }
}
