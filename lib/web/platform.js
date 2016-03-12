'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (setup) {
  setup.db = db;
  setup.error = setup.error;
  setup.hmac_SHA256 = get_hmac_SHA256;
  setup.crypto_obj = crypto_obj();
  setup._is_online = _is_online;
  setup.sendBeacon = sendBeacon;

  var PN = (0, _pubnubCommon2.default)(setup);

  window.addEventListener('beforeunload', PN.unloadTriggered());
  window.addEventListener('offline', PN.offlineTriggered());

  return PN;
};

var _pubnubCommon = require('../core/pubnub-common.js');

var _pubnubCommon2 = _interopRequireDefault(_pubnubCommon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crypto_obj = require('../../vendor/umd_vendor/crypto-obj.js');
var CryptoJS = require('../../vendor/umd_vendor/hmac-sha256.js');

/**
 * LOCAL STORAGE
 */
var db = {
  get: function get(key) {
    return localStorage.getItem(key);
  },
  set: function set(key, data) {
    return localStorage.setItem(key, data);
  }
};

function get_hmac_SHA256(data, key) {
  var hash = CryptoJS['HmacSHA256'](data, key);
  return hash.toString(CryptoJS['enc']['Base64']);
}

// Test Connection State
function _is_online() {
  // if onLine is not supported, return true.
  if (!('onLine' in navigator)) {
    return true;
  }

  return navigator.onLine;
}

function sendBeacon(url) {
  if (navigator && 'sendBeacon' in navigator) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}