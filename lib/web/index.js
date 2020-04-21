"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cborJs = _interopRequireDefault(require("cbor-js"));

var _pubnubCommon = _interopRequireDefault(require("../core/pubnub-common"));

var _networking = _interopRequireDefault(require("../networking"));

var _hmacSha = _interopRequireDefault(require("../core/components/cryptography/hmac-sha256"));

var _web = _interopRequireDefault(require("../db/web"));

var _common = _interopRequireDefault(require("../cbor/common"));

var _webNode = require("../networking/modules/web-node");

var _flow_interfaces = require("../core/flow_interfaces");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function sendBeacon(url) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

function base64ToBinary(base64String) {
  var parsedWordArray = _hmacSha["default"].enc.Base64.parse(base64String).words;

  var arrayBuffer = new ArrayBuffer(parsedWordArray.length * 4);
  var view = new Uint8Array(arrayBuffer);

  for (var wordIdx = 0; wordIdx < parsedWordArray.length; wordIdx += 1) {
    var word = parsedWordArray[wordIdx];
    var byteOffset = wordIdx * 4;
    view[byteOffset] = (word & 0xff000000) >> 24;
    view[byteOffset + 1] = (word & 0x00ff0000) >> 16;
    view[byteOffset + 2] = (word & 0x0000ff00) >> 8;
    view[byteOffset + 3] = word & 0x000000ff;
  }

  return view.buffer;
}

function stringifyBufferKeys(obj) {
  var isObject = function isObject(value) {
    return value && _typeof(value) === 'object' && value.constructor === Object;
  };

  var isString = function isString(value) {
    return typeof value === 'string' || value instanceof String;
  };

  var isNumber = function isNumber(value) {
    return typeof value === 'number' && isFinite(value);
  };

  if (!isObject(obj)) {
    return obj;
  }

  var normalizedObject = {};
  Object.keys(obj).forEach(function (key) {
    var keyIsString = isString(key);
    var stringifiedKey = key;
    var value = obj[key];

    if (Array.isArray(key) || keyIsString && key.indexOf(',') >= 0) {
      var bytes = keyIsString ? key.split(',') : key;
      stringifiedKey = bytes.reduce(function (string, _byte) {
        string += String.fromCharCode(_byte);
        return string;
      }, '');
    } else if (isNumber(key) || keyIsString && !isNaN(key)) {
      stringifiedKey = String.fromCharCode(keyIsString ? parseInt(key, 10) : 10);
    }

    normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
  });
  return normalizedObject;
}

var _default = function (_PubNubCore) {
  _inherits(_default, _PubNubCore);

  function _default(setup) {
    var _this;

    _classCallCheck(this, _default);

    var _setup$listenToBrowse = setup.listenToBrowserNetworkEvents,
        listenToBrowserNetworkEvents = _setup$listenToBrowse === void 0 ? true : _setup$listenToBrowse;
    setup.db = _web["default"];
    setup.sdkFamily = 'Web';
    setup.networking = new _networking["default"]({
      del: _webNode.del,
      get: _webNode.get,
      post: _webNode.post,
      patch: _webNode.patch,
      sendBeacon: sendBeacon
    });
    setup.cbor = new _common["default"](function (arrayBuffer) {
      return stringifyBufferKeys(_cborJs["default"].decode(arrayBuffer));
    }, base64ToBinary);
    _this = _possibleConstructorReturn(this, _getPrototypeOf(_default).call(this, setup));

    if (listenToBrowserNetworkEvents) {
      window.addEventListener('offline', function () {
        _this.networkDownDetected();
      });
      window.addEventListener('online', function () {
        _this.networkUpDetected();
      });
    }

    return _this;
  }

  return _default;
}(_pubnubCommon["default"]);

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
