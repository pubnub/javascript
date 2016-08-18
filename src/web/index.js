/* @flow */

import PubNubCore from '../core/pubnub-common.js';
import { InternalSetupStruct } from '../core/flow_interfaces';

/**
 * LOCAL STORAGE
 */
let db = {
  get(key: string) {
    return localStorage.getItem(key);
  },

  set(key: string, data: any) {
    return localStorage.setItem(key, data);
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
      this.stop.bind(this);
    });

    window.addEventListener('online', () => {
      this._listenerManager.announceNetworkUp();
      this.reconnect.bind(this);
    });
  }

}
