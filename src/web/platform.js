/* @flow */

import pubNubCore from '../core/pubnub-common.js';

let crypto_obj = require('../../vendor/umd_vendor/crypto-obj.js');
let CryptoJS = require('../../vendor/umd_vendor/hmac-sha256.js');

/**
 * LOCAL STORAGE
 */
var db = {
  get(key: string) {
    return localStorage.getItem(key);
  },

  set(key: string, data: any) {
    return localStorage.setItem(key, data);
  }
};

function get_hmac_SHA256(data, key) {
  var hash = CryptoJS['HmacSHA256'](data, key);
  return hash.toString(CryptoJS['enc']['Base64']);
}

// Test Connection State
function _is_online(): boolean {
  // if onLine is not supported, return true.
  if (!('onLine' in navigator)) {
    return true;
  }

  return navigator.onLine;
}


function sendBeacon(url: string) {
  if (navigator && ('sendBeacon' in navigator)) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

type webSetupType = {
  db: Object,
  _is_online: Function,
  error: Function,
  sendBeacon: Function,
  crypto_obj: Function,
  hmac_SHA256: Function
}

export default function (setup: webSetupType): Object {
  setup.db = db;
  setup.error = setup.error;
  setup.hmac_SHA256 = get_hmac_SHA256;
  setup.crypto_obj = crypto_obj();
  setup._is_online = _is_online;
  setup.sendBeacon = sendBeacon;

  let PN = pubNubCore(setup);

  window.addEventListener('beforeunload', PN.unloadTriggered());
  window.addEventListener('offline', PN.offlineTriggered());

  return PN;
}
