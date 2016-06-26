/* @flow */

import PubNubCore from '../core/pubnub-common.js';
import packageJSON from '../../package.json';
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

// Test Connection State
function navigatorOnlineCheck(): boolean | null {
  // if onLine is not supported, return nothing.
  if (!('onLine' in navigator)) {
    return null;
  }

  return navigator.onLine;
}


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
    setup.navigatorOnlineCheck = navigatorOnlineCheck;
    setup.sendBeacon = sendBeacon;
    setup.params = {
      pnsdk: 'PubNub-JS-Web/' + packageJSON.version
    };

    super(setup);
  }

}
