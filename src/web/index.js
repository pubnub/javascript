/* @flow */
/* global navigator, window */

import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import db from '../db/web';
import { del, get, post } from '../networking/modules/web-node';
import { InternalSetupStruct } from '../core/flow_interfaces';

function sendBeacon(url: string) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

export default class extends PubNubCore {
  constructor(setup: InternalSetupStruct) {
    // extract config.
    const { listenToBrowserNetworkEvents = true } = setup;

    setup.db = db;
    setup.sdkFamily = 'Web';
    setup.networking = new Networking({ del, get, post, sendBeacon });

    super(setup);

    if (listenToBrowserNetworkEvents) {
      // mount network events.
      window.addEventListener('offline', () => {
        this.networkDownDetected();
      });

      window.addEventListener('online', () => {
        this.networkUpDetected();
      });
    }
  }

}
