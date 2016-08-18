'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pubnubCommon = require('../core/pubnub-common.js');

var _pubnubCommon2 = _interopRequireDefault(_pubnubCommon);

var _flow_interfaces = require('../core/flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var db = {
  get: function get(key) {
    return localStorage.getItem(key);
  },
  set: function set(key, data) {
    return localStorage.setItem(key, data);
  }
};

function sendBeacon(url) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

var _class = function (_PubNubCore) {
  _inherits(_class, _PubNubCore);

  function _class(setup) {
    _classCallCheck(this, _class);

    setup.db = db;
    setup.sendBeacon = sendBeacon;
    setup.sdkFamily = 'Web';

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, setup));

    window.addEventListener('offline', function () {
      _this._listenerManager.announceNetworkDown();
      _this.stop.bind(_this);
    });

    window.addEventListener('online', function () {
      _this._listenerManager.announceNetworkUp();
      _this.reconnect.bind(_this);
    });
    return _this;
  }

  return _class;
}(_pubnubCommon2.default);

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
