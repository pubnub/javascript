/* @flow */
/* global localStorage, navigator, window */

import PubNubCore from '../core/pubnub-common';
import { InternalSetupStruct } from '../core/flow_interfaces';

/**
 * LOCAL STORAGE
 */
let db = {
  get(key: string) {
    // try catch for operating within iframes which disable localStorage
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },

  set(key: string, data: any) {
    // try catch for operating within iframes which disable localStorage
    try {
      return localStorage.setItem(key, data);
    } catch (e) {
      return null;
    }
  }
};

function sendBeacon(url: string) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}


export default class extends PubNubCore {

  constructor(setup: InternalSetupStruct) {
    setup.db = db;
    setup.sendBeacon = sendBeacon;
    setup.sdkFamily = 'Web';

    super(setup);

    // mount network events.
    window.addEventListener('offline', () => {
      this._listenerManager.announceNetworkDown();
      this.stop();
    });

    window.addEventListener('online', () => {
      this._listenerManager.announceNetworkUp();
      this.reconnect();
    });
  }

}
