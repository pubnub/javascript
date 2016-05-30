'use strict';

var _pubnubCommon = require('../core/pubnub-common.js');

var _pubnubCommon2 = _interopRequireDefault(_pubnubCommon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = {
  get: function get(key) {
    return localStorage.getItem(key);
  },
  set: function set(key, data) {
    return localStorage.setItem(key, data);
  }
};

function navigatorOnlineCheck() {
  if (!('onLine' in navigator)) {
    return null;
  }

  return navigator.onLine;
}

function sendBeacon(url) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

var initFunction = function initFunction(setup) {
  console.log('setup', setup);

  setup.db = db;
  setup.navigatorOnlineCheck = navigatorOnlineCheck;
  setup.sendBeacon = sendBeacon;
  var PN = (0, _pubnubCommon2.default)(setup);

  window.addEventListener('beforeunload', PN.unloadTriggered);
  window.addEventListener('offline', PN.offlineTriggered);

  return PN;
};

module.exports = initFunction;