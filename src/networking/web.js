/* @flow */
/* global navigator */

import Networking from './base';

function sendBeacon(url: string) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

export default class extends Networking {

  constructor() {
    super({ sendBeaconModule: sendBeacon });
  }
}
