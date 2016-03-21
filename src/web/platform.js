/* @flow */

import pubNubCore from '../core/pubnub-common.js';

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

type webSetupType = {
  db: Function,
  navigatorOnlineCheck: Function,
  sendBeacon: ?Function,
}

let initFunction = function (setup: webSetupType): Object {
  console.log('setup', setup);

  setup.db = db;
  setup.navigatorOnlineCheck = navigatorOnlineCheck;
  setup.sendBeacon = sendBeacon;
  let PN = pubNubCore(setup);

  window.addEventListener('beforeunload', PN.unloadTriggered);
  window.addEventListener('offline', PN.offlineTriggered);

  return PN;
};

module.exports = initFunction;
