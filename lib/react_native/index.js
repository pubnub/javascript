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

var _cborSync = _interopRequireDefault(require("cbor-sync"));

var _buffer = require("buffer");

var _pubnubCommon = _interopRequireDefault(require("../core/pubnub-common"));

var _networking = _interopRequireDefault(require("../networking"));

var _common = _interopRequireDefault(require("../db/common"));

var _common2 = _interopRequireDefault(require("../cbor/common"));

var _webNode = require("../networking/modules/web-node");

var _react_native = require("../networking/modules/react_native");

var _flow_interfaces = require("../core/flow_interfaces");

var _reactNative = _interopRequireDefault(require("../file/modules/react-native"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

global.Buffer = global.Buffer || _buffer.Buffer;

var _default = function (_PubNubCore) {
  (0, _inherits2["default"])(_default, _PubNubCore);

  var _super = _createSuper(_default);

  function _default(setup) {
    (0, _classCallCheck2["default"])(this, _default);
    setup.db = new _common["default"]();
    setup.cbor = new _common2["default"](_cborSync["default"].decode, function (base64String) {
      return _buffer.Buffer.from(base64String, 'base64');
    });
    setup.PubNubFile = _reactNative["default"];
    setup.networking = new _networking["default"]({
      del: _webNode.del,
      get: _webNode.get,
      post: _webNode.post,
      patch: _webNode.patch,
      getfile: _react_native.getfile,
      postfile: _react_native.postfile
    });
    setup.sdkFamily = 'ReactNative';
    setup.ssl = true;
    return _super.call(this, setup);
  }

  return _default;
}(_pubnubCommon["default"]);

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
