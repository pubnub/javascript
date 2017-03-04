/* @flow */
/* global navigator */

import Networking from './base';

function agentKeepAlive(superagentConstruct) {
  return superagentConstruct.set('Connection', 'keep-alive');
}

function sendBeacon(url: string) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

export default class extends Networking {

  constructor() {
    super();
    this._agentKeepAlive = agentKeepAlive;
    this._sendBeacon = sendBeacon;
  }
}
