/* @flow */
/* global navigator, window */

import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import db from '../db/web';
import { get, post } from '../networking/modules/web-node';
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
    setup.db = db;
    setup.sdkFamily = 'Web';
    setup.networking = new Networking({ get, post, sendBeacon });

    super(setup);

    // mount network events.
    window.addEventListener('offline', () => {
      this.__networkDownDetected();
    });

    window.addEventListener('online', () => {
      this.__networkUpDetected();
    });
  }

}
