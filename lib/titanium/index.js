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

var _pubnubCommon = _interopRequireDefault(require("../core/pubnub-common"));

var _networking = _interopRequireDefault(require("../networking"));

var _common = _interopRequireDefault(require("../db/common"));

var _common2 = _interopRequireDefault(require("../cbor/common"));

var _titanium = require("../networking/modules/titanium");

var _flow_interfaces = require("../core/flow_interfaces");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var PubNub = function (_PubNubCore) {
  (0, _inherits2["default"])(PubNub, _PubNubCore);

  var _super = _createSuper(PubNub);

  function PubNub(setup) {
    (0, _classCallCheck2["default"])(this, PubNub);
    setup.db = new _common["default"]();
    setup.cbor = new _common2["default"](_cborSync["default"].decode, function (base64String) {
      return new Buffer.from(base64String, 'base64');
    });
    setup.sdkFamily = 'TitaniumSDK';
    setup.networking = new _networking["default"]({
      del: _titanium.del,
      get: _titanium.get,
      post: _titanium.post,
      patch: _titanium.patch
    });
    return _super.call(this, setup);
  }

  return PubNub;
}(_pubnubCommon["default"]);

exports["default"] = PubNub;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
