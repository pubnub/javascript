"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _cborJs = _interopRequireDefault(require("cbor-js"));

var _pubnubCommon = _interopRequireDefault(require("../core/pubnub-common"));

var _networking = _interopRequireDefault(require("../networking"));

var _hmacSha = _interopRequireDefault(require("../core/components/cryptography/hmac-sha256"));

var _web = _interopRequireDefault(require("../db/web"));

var _common = _interopRequireDefault(require("../cbor/common"));

var _webNode = require("../networking/modules/web-node");

var _flow_interfaces = require("../core/flow_interfaces");

var _web2 = _interopRequireDefault(require("../crypto/modules/web"));

var _web3 = _interopRequireDefault(require("../file/modules/web"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

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
  var filledArrayBuffer = null;
  var zeroBytesCount = 0;
  var byteOffset = 0;

  for (var wordIdx = 0; wordIdx < parsedWordArray.length; wordIdx += 1) {
    var word = parsedWordArray[wordIdx];
    byteOffset = wordIdx * 4;
    view[byteOffset] = (word & 0xff000000) >> 24;
    view[byteOffset + 1] = (word & 0x00ff0000) >> 16;
    view[byteOffset + 2] = (word & 0x0000ff00) >> 8;
    view[byteOffset + 3] = word & 0x000000ff;
  }

  for (var byteIdx = byteOffset + 3; byteIdx >= byteOffset; byteIdx -= 1) {
    if (view[byteIdx] === 0) {
      zeroBytesCount += 1;
    }
  }

  if (zeroBytesCount > 0) {
    filledArrayBuffer = view.buffer.slice(0, view.byteLength - zeroBytesCount);
  } else {
    filledArrayBuffer = view.buffer;
  }

  return filledArrayBuffer;
}

function stringifyBufferKeys(obj) {
  var isObject = function isObject(value) {
    return value && (0, _typeof2["default"])(value) === 'object' && value.constructor === Object;
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
  (0, _inherits2["default"])(_default, _PubNubCore);

  var _super = _createSuper(_default);

  function _default(setup) {
    var _this;

    (0, _classCallCheck2["default"])(this, _default);
    var _setup$listenToBrowse = setup.listenToBrowserNetworkEvents,
        listenToBrowserNetworkEvents = _setup$listenToBrowse === void 0 ? true : _setup$listenToBrowse;
    setup.db = _web["default"];
    setup.sdkFamily = 'Web';
    setup.networking = new _networking["default"]({
      del: _webNode.del,
      get: _webNode.get,
      post: _webNode.post,
      patch: _webNode.patch,
      sendBeacon: sendBeacon,
      getfile: _webNode.getfile,
      postfile: _webNode.postfile
    });
    setup.cbor = new _common["default"](function (arrayBuffer) {
      return stringifyBufferKeys(_cborJs["default"].decode(arrayBuffer));
    }, base64ToBinary);
    setup.PubNubFile = _web3["default"];
    setup.cryptography = new _web2["default"]();
    _this = _super.call(this, setup);

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
